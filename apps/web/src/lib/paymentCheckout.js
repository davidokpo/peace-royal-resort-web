import apiServerClient from './apiServerClient';

const PENDING_PAYMENT_KEY = 'peace-royal-resort-pending-payment';

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
