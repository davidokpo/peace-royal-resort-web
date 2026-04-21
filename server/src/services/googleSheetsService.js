import { google } from 'googleapis';
import logger from '../utils/logger.js';

const SHEET_HEADERS = [
  'createdAt',
  'bookingId',
  'clientBookingRef',
  'customerName',
  'customerEmail',
  'customerPhone',
  'eventType',
  'guestCount',
  'preferredDate',
  'preferredTime',
  'specialRequests',
  'totalPrice',
  'paymentStatus',
  'bookingStatus',
  'paymentReference',
];

const getGoogleClient = async () => {
  const privateKeyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '';
  const private_key = privateKeyRaw.replace(/\\n/g, '\n');

  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !private_key) {
    return null;
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
};

const getSheetConfig = () => ({
  spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
  sheetName: process.env.GOOGLE_SHEETS_TAB_NAME || 'bookings',
});

export const ensureSheetHeader = async () => {
  const sheets = await getGoogleClient();
  const { spreadsheetId, sheetName } = getSheetConfig();
  if (!sheets || !spreadsheetId) {
    return;
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A1:O1`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [SHEET_HEADERS],
    },
  });
};

export const appendBookingRow = async (booking) => {
  const sheets = await getGoogleClient();
  const { spreadsheetId, sheetName } = getSheetConfig();

  if (!sheets || !spreadsheetId) {
    logger.info('Google Sheets is not configured. Skipping sync.');
    return;
  }

  await ensureSheetHeader();

  const row = [
    booking.createdAt,
    booking.id,
    booking.clientBookingRef,
    booking.customerName,
    booking.customerEmail,
    booking.customerPhone,
    booking.eventType,
    booking.guestCount,
    booking.preferredDate,
    booking.preferredTime,
    booking.specialRequests,
    booking.totalPrice,
    booking.paymentStatus,
    booking.bookingStatus,
    booking.paymentReference || '',
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:O`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [row],
    },
  });
};
