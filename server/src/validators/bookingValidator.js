const REQUIRED_FIELDS = ['eventType', 'guestCount', 'preferredDate', 'preferredTime', 'customerName', 'customerEmail', 'totalPrice'];

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const validateBookingPayload = (payload) => {
  const missing = REQUIRED_FIELDS.filter((field) => !payload?.[field]);
  if (missing.length) {
    return { valid: false, error: `Missing required fields: ${missing.join(', ')}` };
  }

  const guestCount = Number(payload.guestCount);
  if (!Number.isFinite(guestCount) || guestCount <= 0) {
    return { valid: false, error: 'guestCount must be a positive number' };
  }

  if (!isValidEmail(payload.customerEmail)) {
    return { valid: false, error: 'customerEmail is not valid' };
  }

  const totalPrice = Number(payload.totalPrice);
  if (!Number.isFinite(totalPrice) || totalPrice <= 0) {
    return { valid: false, error: 'totalPrice must be a positive number' };
  }

  return { valid: true };
};
