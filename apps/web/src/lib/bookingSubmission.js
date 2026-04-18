const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '');

const rawApiBase =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  '/api';

const apiBaseUrl = trimTrailingSlash(rawApiBase);
const hasReachableApiBase =
  apiBaseUrl &&
  !/localhost|127\.0\.0\.1/i.test(apiBaseUrl);

const createReference = () => {
  const uniquePart =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 8).toUpperCase()
      : Math.random().toString(36).slice(2, 10).toUpperCase();

  return `PRR-${uniquePart}`;
};

const storeFallbackSubmission = (entry) => {
  if (typeof window === 'undefined') {
    return;
  }

  const key = 'peace-royal-resort-submissions';
  const existingEntries = JSON.parse(window.localStorage.getItem(key) || '[]');

  existingEntries.unshift({
    ...entry,
    createdAt: new Date().toISOString(),
  });

  window.localStorage.setItem(key, JSON.stringify(existingEntries.slice(0, 20)));
};

export const submitBookingRequest = async ({
  endpoint,
  payload,
  fallbackRecord,
}) => {
  if (hasReachableApiBase) {
    try {
      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      const record = result?.booking || result?.order;

      if (!response.ok || !record?.id) {
        throw new Error(result?.error || result?.message || 'Unable to save request');
      }

      return {
        mode: 'api',
        record,
      };
    } catch (error) {
      console.error('Booking API unavailable, storing local backup instead.', error);
    }
  }

  const localRecord = {
    id: createReference(),
    ...fallbackRecord,
    submissionMode: 'local_backup',
  };

  storeFallbackSubmission({
    endpoint,
    payload,
    record: localRecord,
  });

  return {
    mode: 'local_backup',
    record: localRecord,
  };
};
