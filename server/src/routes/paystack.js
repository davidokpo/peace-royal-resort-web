import '../env.js';
import crypto from 'node:crypto';
import express from 'express';
import logger from '../utils/logger.js';
import { markBookingPaid } from '../services/bookingService.js';

const router = express.Router();
const PAYSTACK_BASE_URL = 'https://api.paystack.co';
const getPaystackSecretKey = () => process.env.PAYSTACK_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
const getTransferRecipientCode = () =>
  process.env.PAYSTACK_TRANSFER_RECIPIENT_CODE ||
  process.env.PAYSTACK_MONIEPOINT_RECIPIENT_CODE ||
  process.env.PAYSTACK_OPAY_RECIPIENT_CODE;
const getAdminApiKey = () => process.env.ADMIN_API_KEY;

const requireAdminKey = (req, res, next) => {
  const supplied = req.headers['x-admin-key'];
  const adminApiKey = getAdminApiKey();

  if (!adminApiKey || supplied !== adminApiKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return next();
};

const triggerSettlementTransfer = async ({ amount, bookingId, customerName }) => {
  const paystackSecretKey = getPaystackSecretKey();
  const transferRecipientCode = getTransferRecipientCode();

  if (!transferRecipientCode || !paystackSecretKey) {
    return;
  }

  const transferResponse = await fetch(`${PAYSTACK_BASE_URL}/transfer`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${paystackSecretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source: 'balance',
      amount,
      recipient: transferRecipientCode,
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

  const paystackSecretKey = getPaystackSecretKey();

  if (!paystackSecretKey) {
    return res.status(500).json({ error: 'Paystack secret key is not configured on the server' });
  }

  const resolveResponse = await fetch(
    `${PAYSTACK_BASE_URL}/bank/resolve?account_number=${encodeURIComponent(accountNumber)}&bank_code=${encodeURIComponent(bankCode)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
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
      Authorization: `Bearer ${paystackSecretKey}`,
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

    const paystackSecretKey = getPaystackSecretKey();

    if (!paystackSecretKey) {
      return res.status(500).json({ error: 'Paystack secret key is not configured on the server' });
    }

    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
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

    const responseText = await response.text();
    let payload = null;

    try {
      payload = responseText ? JSON.parse(responseText) : null;
    } catch (parseError) {
      logger.error('Paystack initialization returned non-JSON:', responseText);
      return res.status(502).json({
        error: 'Invalid response from Paystack',
        detail: responseText?.slice(0, 300) || parseError.message,
      });
    }

    if (!response.ok || !payload?.status || !payload?.data?.authorization_url) {
      logger.error('Paystack initialization failed:', payload);
      return res.status(400).json({
        error: payload?.message || 'Failed to initialize Paystack checkout',
        detail: payload,
      });
    }

    return res.json({
      url: payload.data.authorization_url,
      reference: payload.data.reference,
    });
  } catch (error) {
    logger.error('Paystack checkout request crashed:', error.message, error.stack);
    return res.status(500).json({
      error: 'Unable to reach Paystack checkout service',
      detail: error.message,
    });
  }
});

router.get('/verify/:reference', async (req, res) => {
  try {
    const { reference } = req.params;
    const paystackSecretKey = getPaystackSecretKey();

    if (!reference) {
      return res.status(400).json({ error: 'Transaction reference is required' });
    }

    if (!paystackSecretKey) {
      return res.status(500).json({ error: 'Paystack secret key is not configured on the server' });
    }

    const response = await fetch(
      `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        },
      },
    );

    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload?.status || !payload?.data) {
      logger.error('Paystack verification failed:', payload);
      return res.status(400).json({
        error: payload?.message || 'Failed to verify Paystack transaction',
        detail: payload,
      });
    }

    const transaction = payload.data;
    const bookingId = transaction?.metadata?.bookingId;
    let booking = null;

    if (transaction.status === 'success' && bookingId) {
      booking = await markBookingPaid(bookingId, transaction.reference);
    }

    return res.json({
      verified: transaction.status === 'success',
      status: transaction.status,
      reference: transaction.reference,
      bookingId,
      booking,
      gatewayResponse: transaction.gateway_response,
    });
  } catch (error) {
    logger.error('Paystack verification request crashed:', error.message, error.stack);
    return res.status(500).json({
      error: 'Unable to verify Paystack transaction',
      detail: error.message,
    });
  }
});

router.post('/webhook', async (req, res) => {
  const signature = req.headers['x-paystack-signature'];
  const paystackSecretKey = getPaystackSecretKey();

  if (!signature || !paystackSecretKey) {
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  try {
    const expectedHash = crypto
      .createHmac('sha512', paystackSecretKey)
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
