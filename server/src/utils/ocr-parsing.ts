const RECEIPT_LABEL_PATTERN =
  /^(?:total|grand total|subtotal|tax|receipt|invoice|thank you|amount|balance due|cash|card|change|qty|quantity|price|item|date)\b/i;
const CURRENCY_PREFIX_PATTERN =
  /(?:USD|EUR|GBP|INR|JPY|AUD|CAD|CHF|CNY|SEK|NZD|MXN|SGD|HKD|NOK|KRW|TRY|RUB|BRL|ZAR|[$\u20AC\u00A3\u00A5\u20B9])/i;
const AMOUNT_PATTERN =
  /(?:^|[\s:])(?:USD|EUR|GBP|INR|JPY|AUD|CAD|CHF|CNY|SEK|NZD|MXN|SGD|HKD|NOK|KRW|TRY|RUB|BRL|ZAR|[$\u20AC\u00A3\u00A5\u20B9])?\s*([0-9]{1,3}(?:,[0-9]{3})+(?:\.\d{2})|[0-9]+\.\d{2})(?!\d)/gim;
const LABELLED_AMOUNT_PATTERN =
  /\b(?:grand\s*total|total|amount(?:\s*due)?|subtotal|tax|balance(?:\s*due)?)\b[:\s-]*(?:USD|EUR|GBP|INR|JPY|AUD|CAD|CHF|CNY|SEK|NZD|MXN|SGD|HKD|NOK|KRW|TRY|RUB|BRL|ZAR|[$\u20AC\u00A3\u00A5\u20B9])?\s*([0-9]{1,3}(?:,[0-9]{3})+(?:\.\d{2})|[0-9]+\.\d{2})/gim;
const ISO_DATE_PATTERN = /\b(\d{4})[-/](\d{1,2})[-/](\d{1,2})\b/g;
const US_DATE_PATTERN = /\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/g;
const MONTH_NAME_DATE_PATTERN =
  /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2}),?\s+(\d{4})\b/gi;
const DAY_FIRST_MONTH_NAME_PATTERN =
  /\b(\d{1,2})\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{4})\b/gi;

const MONTHS: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

const toIsoDate = (year: number, month: number, day: number): string | null => {
  const date = new Date(Date.UTC(year, month, day));

  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date.toISOString();
};

const normalizeYear = (year: number): number => {
  if (year >= 100) {
    return year;
  }

  return year >= 70 ? 1900 + year : 2000 + year;
};

const parseAmount = (value: string): number | null => {
  const normalized = value.replace(/[$\u20AC\u00A3\u00A5\u20B9\s]/g, '').replace(/,/g, '');
  const parsed = Number.parseFloat(normalized);

  return Number.isFinite(parsed) ? parsed : null;
};

const cleanVendorLine = (line: string): string =>
  line
    .replace(/\s+/g, ' ')
    .replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, '')
    .trim();

const toTitleCase = (value: string): string =>
  value
    .toLowerCase()
    .replace(/\b([a-z])/g, (_match, letter: string) => letter.toUpperCase());

export const extractReceiptAmount = (text: string): number | null => {
  const amounts: number[] = [];

  for (const pattern of [LABELLED_AMOUNT_PATTERN, AMOUNT_PATTERN]) {
    pattern.lastIndex = 0;

    for (const match of text.matchAll(pattern)) {
      const amount = parseAmount(match[1]);

      if (amount !== null) {
        amounts.push(amount);
      }
    }
  }

  if (amounts.length === 0) {
    return null;
  }

  return Math.max(...amounts);
};

export const extractReceiptDate = (text: string): string | null => {
  ISO_DATE_PATTERN.lastIndex = 0;
  for (const match of text.matchAll(ISO_DATE_PATTERN)) {
    const isoDate = toIsoDate(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    if (isoDate) {
      return isoDate;
    }
  }

  US_DATE_PATTERN.lastIndex = 0;
  for (const match of text.matchAll(US_DATE_PATTERN)) {
    const isoDate = toIsoDate(
      normalizeYear(Number(match[3])),
      Number(match[1]) - 1,
      Number(match[2])
    );
    if (isoDate) {
      return isoDate;
    }
  }

  MONTH_NAME_DATE_PATTERN.lastIndex = 0;
  for (const match of text.matchAll(MONTH_NAME_DATE_PATTERN)) {
    const month = MONTHS[match[1].toLowerCase()];
    const isoDate = toIsoDate(Number(match[3]), month, Number(match[2]));
    if (isoDate) {
      return isoDate;
    }
  }

  DAY_FIRST_MONTH_NAME_PATTERN.lastIndex = 0;
  for (const match of text.matchAll(DAY_FIRST_MONTH_NAME_PATTERN)) {
    const month = MONTHS[match[2].toLowerCase()];
    const isoDate = toIsoDate(Number(match[3]), month, Number(match[1]));
    if (isoDate) {
      return isoDate;
    }
  }

  return null;
};

export const extractReceiptVendor = (text: string): string | null => {
  const lines = text
    .split(/\r?\n/)
    .map(cleanVendorLine)
    .filter(Boolean);

  for (const line of lines) {
    if (RECEIPT_LABEL_PATTERN.test(line)) {
      continue;
    }

    if (extractReceiptDate(line)) {
      continue;
    }

    if (extractReceiptAmount(line) !== null) {
      continue;
    }

    if (!/[A-Za-z]/.test(line) || /^[\d\s.,:/-]+$/.test(line)) {
      continue;
    }

    if (CURRENCY_PREFIX_PATTERN.test(line) && !/[A-Za-z]{3,}/.test(line)) {
      continue;
    }

    return toTitleCase(line);
  }

  return null;
};
