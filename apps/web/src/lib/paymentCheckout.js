import apiServerClient from './apiServerClient';

const PENDING_PAYMENT_KEY = 'peace-royal-resort-pending-payment';
const PAYMENTS_ENABLED = import.meta.env.VITE_ENABLE_PAYMENTS === 'true';

export const storePendingPayment = (state) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(state));
};

export const readPendingPayment = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return JSON.parse(window.sessionStorage.getItem(PENDING_PAYMENT_KEY) || 'null');
  } catch {
    return null;
  }
};

export const redirectToCheckout = async ({
  amount,
  bookingId,
  productName,
  customerEmail,
  state,
}) => {
  const successUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/payment-success`
      : '/payment-success';

  const response = await apiServerClient.fetch('/stripe/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount,
      productName,
      successUrl,
      bookingId,
      customerEmail,
    }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result?.url) {
    throw new Error(result?.error || result?.message || 'Payment initialization failed');
  }

  storePendingPayment({
    ...state,
    paymentReference: result.reference,
  });

  window.location.assign(result.url);
};

export const startCheckoutOrShowPending = async ({
  navigate,
  pendingPath = '/payment-success',
  ...checkoutArgs
}) => {
  if (!PAYMENTS_ENABLED) {
    const successState = {
      ...checkoutArgs.state,
      checkoutStatus: 'disabled',
    };

    storePendingPayment(successState);
    navigate(pendingPath, { state: successState });

    return {
      started: true,
      skipped: true,
    };
  }

  try {
    await redirectToCheckout(checkoutArgs);
    return { started: true };
  } catch (error) {
    const pendingState = {
      ...checkoutArgs.state,
      checkoutStatus: 'pending',
      checkoutError: error.message || 'Payment initialization failed',
    };

    storePendingPayment(pendingState);
    navigate(pendingPath, { state: pendingState });

    return {
      started: false,
      error,
    };
  }
};
