import crypto from 'node:crypto';
import express from 'express';
import logger from '../utils/logger.js';
import { markBookingPaid } from '../services/bookingService.js';

const router = express.Router();
const PAYSTACK_BASE_URL = 'https://api.paystack.co';
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
const TRANSFER_RECIPIENT_CODE =
  process.env.PAYSTACK_TRANSFER_RECIPIENT_CODE ||
  process.env.PAYSTACK_MONIEPOINT_RECIPIENT_CODE ||
  process.env.PAYSTACK_OPAY_RECIPIENT_CODE;
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

const requireAdminKey = (req, res, next) => {
  const supplied = req.headers['x-admin-key'];
  if (!ADMIN_API_KEY || supplied !== ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return next();
};

const triggerSettlementTransfer = async ({ amount, bookingId, customerName }) => {
  if (!TRANSFER_RECIPIENT_CODE || !PAYSTACK_SECRET_KEY) {
    return;
  }

  const transferResponse = await fetch(`${PAYSTACK_BASE_URL}/transfer`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source: 'balance',
      amount,
      recipient: TRANSFER_RECIPIENT_CODE,
      reason: `Hotel booking payout for ${customerName || bookingId}`,
    }),
  });

  const transferPayload = await transferResponse.json();
  if (!transferResponse.ok || !transferPayload?.status) {
    logger.error('Paystack settlement transfer failed:', transferPayload);
  }
};

const createTransferRecipient = async (req, res) => {
  const { accountNumber, bankCode, accountName } = req.body;

  if (!accountNumber || !bankCode) {
    return res.status(400).json({ error: 'accountNumber and bankCode are required' });
  }

  if (!PAYSTACK_SECRET_KEY) {
    return res.status(500).json({ error: 'Paystack secret key is not configured on the server' });
  }

  const resolveResponse = await fetch(
    `${PAYSTACK_BASE_URL}/bank/resolve?account_number=${encodeURIComponent(accountNumber)}&bank_code=${encodeURIComponent(bankCode)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    },
  );

  const resolvePayload = await resolveResponse.json();
  if (!resolveResponse.ok || !resolvePayload?.status) {
    logger.error('Paystack account resolve failed:', resolvePayload);
    return res.status(400).json({ error: resolvePayload?.message || 'Failed to resolve bank account' });
  }

  const finalAccountName = accountName || resolvePayload?.data?.account_name;
  const createRecipientResponse = await fetch(`${PAYSTACK_BASE_URL}/transferrecipient`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'nuban',
      name: finalAccountName,
      account_number: accountNumber,
      bank_code: bankCode,
      currency: 'NGN',
    }),
  });

  const recipientPayload = await createRecipientResponse.json();
  if (!createRecipientResponse.ok || !recipientPayload?.status) {
    logger.error('Paystack recipient creation failed:', recipientPayload);
    return res.status(400).json({ error: recipientPayload?.message || 'Failed to create transfer recipient' });
  }

  return res.json({
    message: 'Recipient created successfully',
    recipientCode: recipientPayload?.data?.recipient_code,
    accountName: finalAccountName,
    accountNumber,
    bankCode,
  });
};

router.post('/transfer-recipient', requireAdminKey, createTransferRecipient);
router.post('/opay-recipient', requireAdminKey, createTransferRecipient);

router.post('/create-checkout', async (req, res) => {
  try {
    const { amount, productName, successUrl, bookingId, customerEmail } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    if (!productName || !successUrl || !bookingId || !customerEmail) {
      return res.status(400).json({ error: 'productName, successUrl, bookingId and customerEmail are required' });
    }

    if (!PAYSTACK_SECRET_KEY) {
      return res.status(500).json({ error: 'Paystack secret key is not configured on the server' });
    }

    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        email: customerEmail,
        currency: 'NGN',
        callback_url: successUrl,
        metadata: {
          bookingId,
          productName,
        },
      }),
    });

    const payload = await response.json();
    if (!response.ok || !payload?.status || !payload?.data?.authorization_url) {
      logger.error('Paystack initialization failed:', payload);
      return res.status(400).json({ error: payload?.message || 'Failed to initialize Paystack checkout' });
    }

    return res.json({
      url: payload.data.authorization_url,
      reference: payload.data.reference,
    });
  } catch (error) {
    logger.error('Paystack checkout request crashed:', error.message);
    return res.status(500).json({
      error: 'Unable to reach Paystack checkout service',
      detail: error.message,
    });
  }
});

router.post('/webhook', async (req, res) => {
  const signature = req.headers['x-paystack-signature'];
  if (!signature || !PAYSTACK_SECRET_KEY) {
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  try {
    const expectedHash = crypto
      .createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(req.rawBody)
      .digest('hex');

    if (expectedHash !== signature) {
      return res.status(401).json({ error: 'Webhook signature mismatch' });
    }
  } catch (err) {
    logger.error('Paystack webhook signature error:', err.message);
    return res.status(400).json({ error: 'Webhook verification failed' });
  }

  const event = req.body;
  const eventType = event?.event;
  const transaction = event?.data;

  logger.info(`Processing Paystack webhook event: ${eventType}`);

  if (eventType === 'charge.success') {
    const bookingId = transaction?.metadata?.bookingId;
    if (bookingId) {
      try {
        await markBookingPaid(bookingId, transaction.reference);
        await triggerSettlementTransfer({
          amount: transaction.amount,
          bookingId,
          customerName: transaction.customer?.first_name,
        });
        logger.info(`Booking ${bookingId} confirmed`);
      } catch (err) {
        logger.error(`Failed to mark booking ${bookingId} as paid:`, err.message);
        throw err;
      }
    }
  }

  res.json({ received: true });
});

export default router;
