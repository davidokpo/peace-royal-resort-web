import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '../../data');
const dataFile = path.join(dataDir, 'bookings.json');

const ensureStore = async () => {
  await mkdir(dataDir, { recursive: true });
  try {
    await readFile(dataFile, 'utf8');
  } catch {
    await writeFile(dataFile, JSON.stringify({ bookings: [] }, null, 2), 'utf8');
  }
};

const readStore = async () => {
  await ensureStore();
  const raw = await readFile(dataFile, 'utf8');
  return JSON.parse(raw);
};

const writeStore = async (store) => {
  await writeFile(dataFile, JSON.stringify(store, null, 2), 'utf8');
};

const createId = (prefix = 'BK') =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

export const createStoredRecord = async (record) => {
  const store = await readStore();
  store.bookings.push(record);
  await writeStore(store);
  return record;
};

export const createGenericBooking = async ({ bookingType, data }) => {
  const prefixMap = {
    room: 'ROOM',
    wellness: 'WELL',
    cafe: 'CAFE',
    restaurant: 'FOOD',
    garden: 'GARDEN',
  };

  const record = {
    id: createId(prefixMap[bookingType] || 'BOOK'),
    createdAt: new Date().toISOString(),
    booking_type: bookingType,
    ...data,
  };

  return createStoredRecord(record);
};

export const updateStoredRecord = async (bookingId, updates) => {
  const store = await readStore();
  const index = store.bookings.findIndex((item) => item.id === bookingId);
  if (index === -1) {
    return null;
  }

  store.bookings[index] = {
    ...store.bookings[index],
    ...updates,
  };

  await writeStore(store);
  return store.bookings[index];
};
