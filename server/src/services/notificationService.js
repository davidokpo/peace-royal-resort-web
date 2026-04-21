import logger from '../utils/logger.js';
import { getBookingStatusKey, getBookingTypeConfig, getPaidDisplay, getPaymentMethod } from './bookingCatalog.js';

const getAdminRecipients = () =>
  (process.env.NOTIFICATION_EMAIL_TO || process.env.BOOKING_NOTIFICATION_EMAIL || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

const getTransportConfig = () => ({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth:
    process.env.SMTP_USER && process.env.SMTP_PASS
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
});

const hasNotificationConfig = () => {
  const recipients = getAdminRecipients();
  const transportConfig = getTransportConfig();

  return recipients.length > 0 && transportConfig.host;
};

const loadNodemailer = async () => {
  try {
    const mod = await import('nodemailer');
    return mod.default || mod;
  } catch (error) {
    logger.warn('Nodemailer is not installed. Email notifications are disabled:', error.message);
    return null;
  }
};

const formatCurrency = (value) => {
  const numeric = Number(value || 0);
  return `NGN ${numeric.toLocaleString('en-NG')}`;
};

const getPrimaryName = (booking = {}) =>
  booking.guest_name ||
  booking.customer_name ||
  booking.customerName ||
  booking.participant_name ||
  'Unknown guest';

const getPrimaryEmail = (booking = {}) =>
  booking.email || booking.customer_email || booking.customerEmail || 'N/A';

const getPrimaryPhone = (booking = {}) =>
  booking.phone || booking.customer_phone || booking.customerPhone || 'N/A';

const getGuestRecipient = (booking = {}) =>
  booking.email || booking.customer_email || booking.customerEmail || null;

const buildSummaryLines = (booking = {}) => {
  const config = getBookingTypeConfig(booking);
  const statusKey = getBookingStatusKey(booking);

  const commonLines = [
    `Type: ${config.label}`,
    `Booking ID: ${booking.clientBookingRef || booking.id || 'N/A'}`,
    `Name: ${getPrimaryName(booking)}`,
    `Email: ${getPrimaryEmail(booking)}`,
    `Phone: ${getPrimaryPhone(booking)}`,
    `Total: ${formatCurrency(booking.total_price || booking.totalPrice)}`,
    `Payment Method: ${getPaymentMethod(booking)}`,
    `Paid Column: ${getPaidDisplay(booking)}`,
    `Payment Status: ${booking.payment_status || 'pending'}`,
    `${statusKey === 'order_status' ? 'Order Status' : 'Booking Status'}: ${booking[statusKey] || 'pending'}`,
  ];

  switch (config.type) {
    case 'room':
      return [
        ...commonLines,
        `Room Type: ${booking.room_type || 'N/A'}`,
        `Check-in: ${booking.check_in_date || 'N/A'}`,
        `Check-out: ${booking.check_out_date || 'N/A'}`,
        `Special Requests: ${booking.special_requests || 'None'}`,
      ];
    case 'garden':
      return [
        ...commonLines,
        `Event Type: ${booking.eventType || booking.event_type || 'N/A'}`,
        `Guest Count: ${booking.guestCount || booking.guest_count || 'N/A'}`,
        `Date: ${booking.preferredDate || booking.preferred_date || 'N/A'}`,
        `Time: ${booking.preferredTime || booking.preferred_time || 'N/A'}`,
        `Catering: ${
          Object.entries(booking.catering || {})
            .filter(([, enabled]) => Boolean(enabled))
            .map(([name]) => name.replace(/([A-Z])/g, ' $1').trim())
            .join(', ') || 'None'
        }`,
        `Special Requests: ${booking.specialRequests || booking.special_requests || 'None'}`,
      ];
    case 'wellness':
      return [
        ...commonLines,
        `Package: ${booking.class_type || 'N/A'}`,
        `Date: ${booking.booking_date || 'N/A'}`,
        `Time: ${booking.booking_time || 'N/A'}`,
        `Guests: ${booking.participants_count || 'N/A'}`,
        `Special Requests: ${booking.special_requests || 'None'}`,
      ];
    case 'balcony':
      return [
        ...commonLines,
        `Breakfast Package: ${booking.breakfast_package || 'N/A'}`,
        `Date: ${booking.booking_date || 'N/A'}`,
        `Time: ${booking.booking_time || 'N/A'}`,
        `Guests: ${booking.guest_count || 'N/A'}`,
        `Special Requests: ${booking.special_requests || 'None'}`,
      ];
    case 'restaurant':
      return [
        ...commonLines,
        `Delivery Type: ${booking.delivery_type || 'N/A'}`,
        `Delivery Address: ${booking.delivery_address || 'N/A'}`,
        `Menu Items: ${
          (booking.menu_items || [])
            .map((item) => `${item.name} x${item.quantity}`)
            .join(', ') || 'None'
        }`,
        `Allergies: ${booking.allergies || 'None'}`,
        `Dietary Requirements: ${booking.dietary_requirements || 'None'}`,
      ];
    case 'cafe':
      return [
        ...commonLines,
        `Delivery Type: ${booking.delivery_type || 'N/A'}`,
        `Beverages: ${
          (booking.beverage_items || [])
            .map((item) => `${item.name} x${item.quantity}`)
            .join(', ') || 'None'
        }`,
        `Friday Game Night: ${booking.friday_game_night ? 'Yes' : 'No'}`,
        `Game Selection: ${booking.board_game_selection || 'N/A'}`,
        `Players: ${booking.player_count || 'N/A'}`,
        `Time Slot: ${booking.game_time_slot || 'N/A'}`,
        `Reserved Table: ${booking.reserved_table_number || 'N/A'}`,
      ];
    default:
      return commonLines;
  }
};

const createTransporter = async () => {
  if (!hasNotificationConfig()) {
    logger.info('Email notifications are not configured. Skipping email send.');
    return null;
  }

  const nodemailer = await loadNodemailer();
  if (!nodemailer) {
    return null;
  }

  return nodemailer.createTransport(getTransportConfig());
};

const getFromAddress = () =>
  process.env.NOTIFICATION_EMAIL_FROM ||
  process.env.SMTP_FROM ||
  process.env.SMTP_USER;

const getFromLabel = () => process.env.NOTIFICATION_EMAIL_NAME || 'Peace Royal Resort';

const sendMail = async ({ to, subject, text }) => {
  const transporter = await createTransporter();
  const fromAddress =
    getFromAddress();
  const fromLabel = getFromLabel();

  if (!transporter || !fromAddress || !to) {
    logger.warn('Notification sender address is not configured. Skipping email send.');
    return false;
  }

  await transporter.sendMail({
    from: `${fromLabel} <${fromAddress}>`,
    to,
    subject,
    text,
  });

  return true;
};

const buildGuestBookingCreatedMessage = (booking = {}) => {
  const config = getBookingTypeConfig(booking);
  const statusKey = getBookingStatusKey(booking);
  const reference = booking.clientBookingRef || booking.id || 'N/A';
  const name = getPrimaryName(booking);
  const paymentMethod = getPaymentMethod(booking);
  const statusLabel = statusKey === 'order_status' ? 'Order Status' : 'Booking Status';

  return [
    `Hello ${name},`,
    '',
    `Your ${config.label.toLowerCase()} request has been received by Peace Royal Resort.`,
    `Reference: ${reference}`,
    `Payment Method: ${paymentMethod}`,
    `${statusLabel}: ${booking[statusKey] || 'pending'}`,
    `Paid: ${getPaidDisplay(booking)}`,
    '',
    paymentMethod === 'pay_on_ground'
      ? 'You selected pay on ground. Our team will contact you to confirm the next step.'
      : 'If you completed online payment, your confirmation will be updated after payment verification.',
    '',
    'Thank you,',
    'Peace Royal Resort',
  ].join('\n');
};

const buildGuestPaymentConfirmedMessage = (booking = {}) => {
  const config = getBookingTypeConfig(booking);
  const reference = booking.clientBookingRef || booking.id || 'N/A';
  const name = getPrimaryName(booking);

  return [
    `Hello ${name},`,
    '',
    `Your payment for ${config.label.toLowerCase()} has been confirmed successfully.`,
    `Reference: ${reference}`,
    `Payment Reference: ${booking.payment_reference || 'N/A'}`,
    `Paid: ${getPaidDisplay(booking)}`,
    '',
    'Our team will reach out if any further coordination is needed.',
    '',
    'Thank you,',
    'Peace Royal Resort',
  ].join('\n');
};

export const sendBookingCreatedNotification = async (booking) => {
  const config = getBookingTypeConfig(booking);
  const adminRecipients = getAdminRecipients();
  const guestRecipient = getGuestRecipient(booking);
  let sent = false;

  try {
    if (adminRecipients.length > 0) {
      sent =
        (await sendMail({
          to: adminRecipients.join(', '),
          subject: `New ${config.label} - ${booking.clientBookingRef || booking.id || 'N/A'}`,
          text: buildSummaryLines(booking).join('\n'),
        })) || sent;
    }

    if (guestRecipient) {
      sent =
        (await sendMail({
          to: guestRecipient,
          subject: `Peace Royal Resort: ${config.label} received`,
          text: buildGuestBookingCreatedMessage(booking),
        })) || sent;
    }

    return sent;
  } catch (error) {
    logger.error('Booking notification email failed:', error.message);
    return false;
  }
};

export const sendBookingPaidNotification = async (booking) => {
  const config = getBookingTypeConfig(booking);
  const adminRecipients = getAdminRecipients();
  const guestRecipient = getGuestRecipient(booking);
  let sent = false;

  try {
    if (adminRecipients.length > 0) {
      sent =
        (await sendMail({
          to: adminRecipients.join(', '),
          subject: `Payment confirmed for ${config.label} - ${booking.clientBookingRef || booking.id || 'N/A'}`,
          text: buildSummaryLines(booking).join('\n'),
        })) || sent;
    }

    if (guestRecipient) {
      sent =
        (await sendMail({
          to: guestRecipient,
          subject: `Peace Royal Resort: payment confirmed`,
          text: buildGuestPaymentConfirmedMessage(booking),
        })) || sent;
    }

    return sent;
  } catch (error) {
    logger.error('Payment confirmation email failed:', error.message);
    return false;
  }
};
