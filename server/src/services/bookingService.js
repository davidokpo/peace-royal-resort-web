import { google } from 'googleapis';
import logger from '../utils/logger.js';
import { createStoredRecord, updateStoredRecord } from './localBookingStore.js';
import {
  getAllBookingTypeConfigs,
  getBookingStatusKey,
  getBookingTypeConfig,
  getPaidDisplay,
  getPaymentMethod,
  normalizeBookingType,
} from './bookingCatalog.js';
import {
  sendBookingCreatedNotification,
  sendBookingPaidNotification,
} from './notificationService.js';

const getPrivateKey = () =>
  (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '')
    .replace(/\\n/g, '\n')
    .replace(/"/g, '')
    .trim();

const getSheetsClient = async () => {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = getPrivateKey();

  if (!clientEmail || !privateKey) {
    return null;
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
};

const getSpreadsheetIdForType = (bookingOrType) => {
  const type =
    typeof bookingOrType === 'string'
      ? bookingOrType
      : bookingOrType?.type || bookingOrType?.booking_type;

  const normalizedType = normalizeBookingType(type);

  if (normalizedType === 'cafe') {
    return process.env.GOOGLE_SHEETS_CAFE_SPREADSHEET_ID || process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  }

  if (normalizedType === 'restaurant') {
    return process.env.GOOGLE_SHEETS_RESTAURANT_SPREADSHEET_ID || process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  }

  return process.env.GOOGLE_SHEETS_FRONTDESK_SPREADSHEET_ID || process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
};

const toColumnLetter = (columnNumber) => {
  let value = columnNumber;
  let label = '';

  while (value > 0) {
    const remainder = (value - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    value = Math.floor((value - 1) / 26);
  }

  return label;
};

const sanitizeSpreadsheetCell = (value) => {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  const stringValue = String(value);
  return /^[=+\-@]/.test(stringValue.trimStart()) ? `'${stringValue}` : stringValue;
};

const getSheetTitles = async (sheets, spreadsheetId) => {
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets.properties.title',
  });

  return new Set(
    (metadata.data.sheets || [])
      .map((sheet) => sheet.properties?.title)
      .filter(Boolean),
  );
};

const ensureSheetExists = async (sheets, spreadsheetId, sheetName) => {
  const titles = await getSheetTitles(sheets, spreadsheetId);

  if (titles.has(sheetName)) {
    return;
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          addSheet: {
            properties: {
              title: sheetName,
            },
          },
        },
      ],
    },
  });
};

const ensureSheetHeader = async (sheets, spreadsheetId, config) => {
  await ensureSheetExists(sheets, spreadsheetId, config.sheetName);

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${config.sheetName}!A1:${toColumnLetter(config.headers.length)}1`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [config.headers],
    },
  });
};

const buildStoredBooking = (payload = {}) => {
  const normalizedType = normalizeBookingType(payload.type || payload.booking_type);
  const bookingId = payload.clientBookingRef || payload.id || `PR-${Date.now()}`;
  const now = new Date().toISOString();
  const statusKey = getBookingStatusKey(normalizedType);
  const paymentMethod = payload.payment_method || 'pay_on_ground';

  const booking = {
    ...payload,
    id: bookingId,
    createdAt: payload.createdAt || now,
    updatedAt: now,
    type: normalizedType,
    payment_method: paymentMethod,
    payment_status: payload.payment_status || 'pending',
    payment_reference: payload.payment_reference || '',
    clientBookingRef: payload.clientBookingRef || bookingId,
  };

  booking.booking_status =
    payload.booking_status ||
    (statusKey === 'booking_status' ? 'pending' : booking.booking_status || '');

  booking.order_status =
    payload.order_status ||
    (statusKey === 'order_status' ? 'pending' : booking.order_status || '');

  booking.paid = payload.paid || getPaidDisplay(booking);

  return booking;
};

const appendBookingToSheet = async (booking) => {
  const sheets = await getSheetsClient();
  const spreadsheetId = getSpreadsheetIdForType(booking);

  if (!sheets || !spreadsheetId) {
    logger.info('Google Sheets is not configured. Skipping sync.');
    return;
  }

  const config = getBookingTypeConfig(booking);
  await ensureSheetHeader(sheets, spreadsheetId, config);

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${config.sheetName}!A:${toColumnLetter(config.headers.length)}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [config.rowBuilder(booking).map(sanitizeSpreadsheetCell)],
    },
  });
};

const updateSheetPaymentState = async (booking) => {
  const sheets = await getSheetsClient();
  const currentConfig = getBookingTypeConfig(booking);
  const currentSpreadsheetId = getSpreadsheetIdForType(booking);

  if (!sheets || !currentSpreadsheetId) {
    return;
  }

  const configuredSpreadsheets = new Map();
  const registerSpreadsheet = (spreadsheetId, config) => {
    if (!spreadsheetId) {
      return;
    }

    const entry = configuredSpreadsheets.get(spreadsheetId) || [];
    entry.push(config);
    configuredSpreadsheets.set(spreadsheetId, entry);
  };

  registerSpreadsheet(currentSpreadsheetId, currentConfig);

  for (const config of getAllBookingTypeConfigs()) {
    const spreadsheetId = getSpreadsheetIdForType(config.type);
    registerSpreadsheet(spreadsheetId, config);
  }

  for (const [spreadsheetId, configs] of configuredSpreadsheets.entries()) {
    const existingSheetTitles = await getSheetTitles(sheets, spreadsheetId);
    const candidateConfigs = configs.filter((config) => existingSheetTitles.has(config.sheetName));

    for (const config of candidateConfigs) {
      const lookupResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${config.sheetName}!B:B`,
      });

      const rows = lookupResponse.data.values || [];
      const rowIndex = rows.findIndex(([value]) => value === booking.id);

      if (rowIndex === -1) {
        continue;
      }

      const rowNumber = rowIndex + 1;
      const data = ['payment_method', 'paid', 'payment_status', config.statusKey, 'payment_reference'].map(
        (header) => ({
          range: `${config.sheetName}!${toColumnLetter(config.headers.indexOf(header) + 1)}${rowNumber}`,
          values: [[
            header === 'payment_method'
              ? getPaymentMethod(booking)
              : header === 'paid'
                ? getPaidDisplay(booking)
                : header === config.statusKey
                  ? booking[config.statusKey] || ''
                  : booking[header] || '',
          ]],
        }),
      );

      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: 'USER_ENTERED',
          data,
        },
      });

      return;
    }
  }

  logger.warn(`Google Sheets row not found for booking ${booking.id}`);
};

const syncLocalBooking = async (booking) => {
  try {
    await createStoredRecord(booking);
    return true;
  } catch (error) {
    logger.warn('Local booking store unavailable:', error.message);
    return false;
  }
};

export const createBooking = async (payload) => {
  logger.info('Incoming booking data received.');

  const booking = buildStoredBooking(payload);
  const localBackupSaved = await syncLocalBooking(booking);
  let googleSheetsSaved = false;
  let emailSent = false;

  try {
    await appendBookingToSheet(booking);
    googleSheetsSaved = true;
  } catch (error) {
    logger.error(
      `Google Sheets sync failed for ${booking.type} -> ${getSpreadsheetIdForType(booking)}:`,
      error.message,
    );
  }

  if (!googleSheetsSaved && !localBackupSaved) {
    throw new Error('Booking could not be stored in Google Sheets or the local backup.');
  }

  try {
    emailSent = await sendBookingCreatedNotification(booking);
  } catch (error) {
    logger.error('Booking notification dispatch failed:', error.message);
  }

  return {
    success: true,
    message: googleSheetsSaved ? 'Booking confirmed' : 'Booking saved with local backup',
    booking: {
      ...booking,
      status: booking[getBookingStatusKey(booking)] || 'pending',
      sync: {
        googleSheets: googleSheetsSaved,
        localBackup: localBackupSaved,
        email: emailSent,
      },
    },
  };
};

export const markBookingPaid = async (bookingId, paymentReference) => {
  const paymentUpdate = {
    payment_method: 'pay_online',
    paid: 'Paid online (Paystack)',
    payment_status: 'paid',
    booking_status: 'confirmed',
    order_status: 'confirmed',
    payment_reference: paymentReference || '',
    updatedAt: new Date().toISOString(),
  };

  let updatedBooking = null;

  try {
    updatedBooking = await updateStoredRecord(bookingId, paymentUpdate);
    if (!updatedBooking) {
      logger.warn(`Local booking ${bookingId} not found during payment confirmation.`);
    }
  } catch (error) {
    logger.warn(`Local booking store update failed for ${bookingId}:`, error.message);
  }

  const bookingSnapshot = updatedBooking || {
    id: bookingId,
    type: 'general',
    ...paymentUpdate,
  };

  try {
    await updateSheetPaymentState(bookingSnapshot);
  } catch (error) {
    logger.error(`Failed to sync payment update for ${bookingId}:`, error.message);
  }

  try {
    await sendBookingPaidNotification(bookingSnapshot);
  } catch (error) {
    logger.error(`Failed to send payment confirmation notification for ${bookingId}:`, error.message);
  }

  return bookingSnapshot;
};
