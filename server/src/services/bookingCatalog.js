const ORDER_TYPES = new Set(['restaurant', 'cafe']);

const typeAliases = {
  room: 'room',
  rooms: 'room',
  garden: 'garden',
  wellness: 'wellness',
  balcony: 'balcony',
  restaurant: 'restaurant',
  cafe: 'cafe',
  general: 'general',
};

const normalizeBookingType = (value = '') => {
  const normalized = String(value || '').trim().toLowerCase();
  return typeAliases[normalized] || 'general';
};

const toListString = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return '';
  }

  return items
    .map((item) => {
      if (typeof item === 'string') {
        return item;
      }

      if (!item || typeof item !== 'object') {
        return '';
      }

      const parts = [item.name || item.id || 'Item'];

      if (item.quantity) {
        parts.push(`x${item.quantity}`);
      }

      if (item.price) {
        parts.push(`N${Number(item.price).toLocaleString('en-NG')}`);
      }

      return parts.join(' ');
    })
    .filter(Boolean)
    .join('; ');
};

const toCateringString = (catering = {}) => {
  const selected = Object.entries(catering)
    .filter(([, enabled]) => Boolean(enabled))
    .map(([name]) => name.replace(/([A-Z])/g, ' $1').trim());

  return selected.length > 0 ? selected.join(', ') : 'None';
};

const getNightCount = (booking = {}) => {
  if (!booking.check_in_date || !booking.check_out_date) {
    return '';
  }

  const checkIn = new Date(booking.check_in_date);
  const checkOut = new Date(booking.check_out_date);
  const diff = checkOut - checkIn;

  if (Number.isNaN(diff) || diff <= 0) {
    return '';
  }

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const getPaymentMethod = (booking = {}) => booking.payment_method || 'pay_on_ground';

const getPaidDisplay = (booking = {}) => {
  const paymentMethod = getPaymentMethod(booking);

  if (booking.payment_status === 'paid' && paymentMethod === 'pay_online') {
    return 'Paid online (Paystack)';
  }

  if (paymentMethod === 'pay_on_ground') {
    return 'Pay on ground';
  }

  if (paymentMethod === 'pay_online') {
    return 'Awaiting online payment';
  }

  return 'Pending';
};

const bookingConfigs = {
  room: {
    type: 'room',
    label: 'Room Booking',
    sheetName: 'Room Bookings',
    statusKey: 'booking_status',
    headers: [
      'created_at',
      'booking_id',
      'guest_name',
      'email',
      'phone',
      'room_type',
      'check_in_date',
      'check_out_date',
      'nights',
      'subtotal_price',
      'tax_rate',
      'tax_amount',
      'total_price',
      'complimentary_breakfast',
      'identity_document_name',
      'special_requests',
      'payment_method',
      'paid',
      'payment_status',
      'booking_status',
      'payment_reference',
    ],
    rowBuilder: (booking) => [
      booking.createdAt || '',
      booking.clientBookingRef || booking.id || '',
      booking.guest_name || '',
      booking.email || '',
      booking.phone || '',
      booking.room_type || '',
      booking.check_in_date || '',
      booking.check_out_date || '',
      getNightCount(booking),
      booking.subtotal_price || '',
      booking.tax_rate || '',
      booking.tax_amount || '',
      booking.total_price || '',
      booking.complimentary_breakfast ? 'Yes' : 'No',
      booking.identity_document_name || '',
      booking.special_requests || '',
      getPaymentMethod(booking),
      getPaidDisplay(booking),
      booking.payment_status || 'pending',
      booking.booking_status || 'pending',
      booking.payment_reference || '',
    ],
  },
  garden: {
    type: 'garden',
    label: 'Garden Booking',
    sheetName: 'Garden Bookings',
    statusKey: 'booking_status',
    headers: [
      'created_at',
      'booking_id',
      'customer_name',
      'email',
      'phone',
      'event_type',
      'guest_count',
      'preferred_date',
      'preferred_time',
      'catering',
      'special_requests',
      'payment_method',
      'paid',
      'total_price',
      'payment_status',
      'booking_status',
      'payment_reference',
    ],
    rowBuilder: (booking) => [
      booking.createdAt || '',
      booking.clientBookingRef || booking.id || '',
      booking.customerName || booking.customer_name || '',
      booking.customerEmail || booking.customer_email || '',
      booking.customerPhone || booking.customer_phone || '',
      booking.eventType || booking.event_type || '',
      booking.guestCount || booking.guest_count || '',
      booking.preferredDate || booking.preferred_date || '',
      booking.preferredTime || booking.preferred_time || '',
      toCateringString(booking.catering),
      booking.specialRequests || booking.special_requests || '',
      getPaymentMethod(booking),
      getPaidDisplay(booking),
      booking.totalPrice || booking.total_price || '',
      booking.payment_status || 'pending',
      booking.booking_status || 'pending',
      booking.payment_reference || '',
    ],
  },
  wellness: {
    type: 'wellness',
    label: 'Wellness Booking',
    sheetName: 'Wellness Bookings',
    statusKey: 'booking_status',
    headers: [
      'created_at',
      'booking_id',
      'participant_name',
      'email',
      'phone',
      'package_name',
      'booking_date',
      'booking_time',
      'participants_count',
      'special_requests',
      'payment_method',
      'paid',
      'total_price',
      'payment_status',
      'booking_status',
      'payment_reference',
    ],
    rowBuilder: (booking) => [
      booking.createdAt || '',
      booking.clientBookingRef || booking.id || '',
      booking.participant_name || '',
      booking.email || '',
      booking.phone || '',
      booking.class_type || '',
      booking.booking_date || '',
      booking.booking_time || '',
      booking.participants_count || '',
      booking.special_requests || '',
      getPaymentMethod(booking),
      getPaidDisplay(booking),
      booking.total_price || '',
      booking.payment_status || 'pending',
      booking.booking_status || 'pending',
      booking.payment_reference || '',
    ],
  },
  balcony: {
    type: 'balcony',
    label: 'Balcony Booking',
    sheetName: 'Balcony Bookings',
    statusKey: 'booking_status',
    headers: [
      'created_at',
      'booking_id',
      'guest_name',
      'email',
      'phone',
      'booking_date',
      'booking_time',
      'breakfast_package',
      'guest_count',
      'special_requests',
      'payment_method',
      'paid',
      'total_price',
      'payment_status',
      'booking_status',
      'payment_reference',
    ],
    rowBuilder: (booking) => [
      booking.createdAt || '',
      booking.clientBookingRef || booking.id || '',
      booking.guest_name || '',
      booking.email || '',
      booking.phone || '',
      booking.booking_date || '',
      booking.booking_time || '',
      booking.breakfast_package || '',
      booking.guest_count || '',
      booking.special_requests || '',
      getPaymentMethod(booking),
      getPaidDisplay(booking),
      booking.total_price || '',
      booking.payment_status || 'pending',
      booking.booking_status || 'pending',
      booking.payment_reference || '',
    ],
  },
  restaurant: {
    type: 'restaurant',
    label: 'Restaurant Order',
    sheetName: 'Restaurant Orders',
    statusKey: 'order_status',
    headers: [
      'created_at',
      'booking_id',
      'customer_name',
      'email',
      'phone',
      'delivery_type',
      'delivery_address',
      'menu_items',
      'allergies',
      'dietary_requirements',
      'payment_method',
      'paid',
      'total_price',
      'payment_status',
      'order_status',
      'payment_reference',
    ],
    rowBuilder: (booking) => [
      booking.createdAt || '',
      booking.clientBookingRef || booking.id || '',
      booking.customer_name || '',
      booking.email || '',
      booking.phone || '',
      booking.delivery_type || '',
      booking.delivery_address || '',
      toListString(booking.menu_items),
      booking.allergies || '',
      booking.dietary_requirements || '',
      getPaymentMethod(booking),
      getPaidDisplay(booking),
      booking.total_price || '',
      booking.payment_status || 'pending',
      booking.order_status || 'pending',
      booking.payment_reference || '',
    ],
  },
  cafe: {
    type: 'cafe',
    label: 'Cafe Order',
    sheetName: 'Cafe Orders',
    statusKey: 'order_status',
    headers: [
      'created_at',
      'booking_id',
      'customer_name',
      'email',
      'phone',
      'delivery_type',
      'beverage_items',
      'allergies',
      'special_requests',
      'friday_game_night',
      'board_game_selection',
      'player_count',
      'game_time_slot',
      'reserved_table_number',
      'payment_method',
      'paid',
      'total_price',
      'payment_status',
      'order_status',
      'payment_reference',
    ],
    rowBuilder: (booking) => [
      booking.createdAt || '',
      booking.clientBookingRef || booking.id || '',
      booking.customer_name || '',
      booking.email || '',
      booking.phone || '',
      booking.delivery_type || '',
      toListString(booking.beverage_items),
      booking.allergies || '',
      booking.special_requests || '',
      booking.friday_game_night ? 'Yes' : 'No',
      booking.board_game_selection || '',
      booking.player_count || '',
      booking.game_time_slot || '',
      booking.reserved_table_number || '',
      getPaymentMethod(booking),
      getPaidDisplay(booking),
      booking.total_price || '',
      booking.payment_status || 'pending',
      booking.order_status || 'pending',
      booking.payment_reference || '',
    ],
  },
  general: {
    type: 'general',
    label: 'General Booking',
    sheetName: process.env.GOOGLE_SHEETS_TAB_NAME || 'Bookings_Raw',
    statusKey: 'booking_status',
    headers: [
      'created_at',
      'booking_id',
      'booking_type',
      'name',
      'email',
      'phone',
      'preferred_date',
      'preferred_time',
      'payment_method',
      'paid',
      'total_price',
      'payment_status',
      'booking_status',
      'payment_reference',
      'raw_payload',
    ],
    rowBuilder: (booking) => [
      booking.createdAt || '',
      booking.clientBookingRef || booking.id || '',
      booking.type || '',
      booking.guest_name ||
        booking.customer_name ||
        booking.customerName ||
        booking.participant_name ||
        '',
      booking.email || booking.customer_email || booking.customerEmail || '',
      booking.phone || booking.customer_phone || booking.customerPhone || '',
      booking.preferredDate || booking.preferred_date || booking.booking_date || booking.check_in_date || '',
      booking.preferredTime || booking.preferred_time || booking.booking_time || '',
      getPaymentMethod(booking),
      getPaidDisplay(booking),
      booking.total_price || booking.totalPrice || '',
      booking.payment_status || 'pending',
      booking.booking_status || booking.order_status || 'pending',
      booking.payment_reference || '',
      JSON.stringify(booking),
    ],
  },
};

export const getBookingTypeConfig = (bookingOrType) => {
  const type =
    typeof bookingOrType === 'string'
      ? normalizeBookingType(bookingOrType)
      : normalizeBookingType(bookingOrType?.type || bookingOrType?.booking_type);

  return bookingConfigs[type] || bookingConfigs.general;
};

export const getAllBookingTypeConfigs = () => Object.values(bookingConfigs);

export const getBookingStatusKey = (bookingOrType) => getBookingTypeConfig(bookingOrType).statusKey;

export const isOrderType = (bookingOrType) => {
  const type =
    typeof bookingOrType === 'string'
      ? normalizeBookingType(bookingOrType)
      : normalizeBookingType(bookingOrType?.type || bookingOrType?.booking_type);

  return ORDER_TYPES.has(type);
};

export { getPaidDisplay, getPaymentMethod, normalizeBookingType };
