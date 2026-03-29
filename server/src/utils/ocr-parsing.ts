const RECEIPT_LABEL_PATTERN =
  /^(?:total|grand total|subtotal|tax|receipt|invoice|thank you|amount|balance due|cash|card|change|qty|quantity|price|item|date|time|table|server|cashier)\b/i;

const CURRENCY_MATCHERS = [
  { pattern: /\bUSD\b|US\$/i, code: 'USD' },
  { pattern: /\bEUR\b|€/i, code: 'EUR' },
  { pattern: /\bGBP\b|£/i, code: 'GBP' },
  { pattern: /\bINR\b|Rs\.?|₹/i, code: 'INR' },
  { pattern: /\bJPY\b|¥/i, code: 'JPY' },
  { pattern: /\bAUD\b/i, code: 'AUD' },
  { pattern: /\bCAD\b/i, code: 'CAD' },
  { pattern: /\bCHF\b/i, code: 'CHF' },
  { pattern: /\bCNY\b|RMB/i, code: 'CNY' },
  { pattern: /\bSGD\b/i, code: 'SGD' },
];

const AMOUNT_CAPTURE =
  '([0-9]{1,3}(?:,[0-9]{3})*(?:\\.\\d{2})|[0-9]+(?:\\.\\d{2}))';

const LABELLED_AMOUNT_REGEXES = {
  total: new RegExp(
    `\\b(?:grand\\s*total|total(?:\\s*due)?|amount(?:\\s*due)?|net\\s*amount|balance(?:\\s*due)?|amount\\s*payable)\\b[:\\s-]*(?:USD|EUR|GBP|INR|JPY|AUD|CAD|CHF|CNY|SGD|[$\\u20AC\\u00A3\\u00A5\\u20B9])?\\s*${AMOUNT_CAPTURE}`,
    'gim'
  ),
  subtotal: new RegExp(
    `\\b(?:subtotal|sub\\s*total|net\\s*sales|taxable\\s*amount)\\b[:\\s-]*(?:USD|EUR|GBP|INR|JPY|AUD|CAD|CHF|CNY|SGD|[$\\u20AC\\u00A3\\u00A5\\u20B9])?\\s*${AMOUNT_CAPTURE}`,
    'gim'
  ),
  tax: new RegExp(
    `\\b(?:tax|vat|gst|cgst|sgst|service\\s*tax)\\b[:\\s-]*(?:USD|EUR|GBP|INR|JPY|AUD|CAD|CHF|CNY|SGD|[$\\u20AC\\u00A3\\u00A5\\u20B9])?\\s*${AMOUNT_CAPTURE}`,
    'gim'
  ),
};

const AMOUNT_PATTERN = new RegExp(
  `(?:^|[\\s:])(?:USD|EUR|GBP|INR|JPY|AUD|CAD|CHF|CNY|SGD|[$\\u20AC\\u00A3\\u00A5\\u20B9])?\\s*${AMOUNT_CAPTURE}(?!\\d)`,
  'gim'
);

const ISO_DATE_PATTERN = /\b(\d{4})[-/](\d{1,2})[-/](\d{1,2})\b/g;
const SLASH_DATE_PATTERN = /\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/g;
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

type MonetaryField = 'subtotal' | 'tax' | 'total';

export interface ReceiptTotals {
  subtotal?: number;
  tax?: number;
  total?: number;
}

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

const collectAmounts = (text: string, pattern: RegExp): number[] => {
  const amounts: number[] = [];

  pattern.lastIndex = 0;
  for (const match of text.matchAll(pattern)) {
    const amount = parseAmount(match[1]);

    if (amount !== null) {
      amounts.push(amount);
    }
  }

  return amounts;
};

const extractMonetaryField = (text: string, field: MonetaryField): number | null => {
  const matches = collectAmounts(text, LABELLED_AMOUNT_REGEXES[field]);

  if (matches.length === 0) {
    return null;
  }

  if (field === 'tax') {
    return Number(matches.reduce((sum, value) => sum + value, 0).toFixed(2));
  }

  return Math.max(...matches);
};

const looksLikeAddress = (line: string): boolean =>
  /\b(?:street|st\.?|road|rd\.?|avenue|ave\.?|lane|ln\.?|floor|building|tower|mall|city|state|india|usa)\b/i.test(
    line
  );

export const extractReceiptCurrency = (text: string): string | null => {
  for (const matcher of CURRENCY_MATCHERS) {
    if (matcher.pattern.test(text)) {
      return matcher.code;
    }
  }

  return null;
};

export const extractReceiptTotals = (text: string): ReceiptTotals => {
  const subtotal = extractMonetaryField(text, 'subtotal') ?? undefined;
  const tax = extractMonetaryField(text, 'tax') ?? undefined;
  const labelledTotal = extractMonetaryField(text, 'total');

  let total = labelledTotal ?? undefined;

  if (total === undefined) {
    const allAmounts = collectAmounts(text, AMOUNT_PATTERN);
    if (allAmounts.length > 0) {
      total = Math.max(...allAmounts);
    }
  }

  if (subtotal === undefined && total !== undefined && tax !== undefined && total >= tax) {
    return {
      subtotal: Number((total - tax).toFixed(2)),
      tax,
      total,
    };
  }

  return {
    subtotal,
    tax,
    total,
  };
};

export const extractReceiptAmount = (text: string): number | null =>
  extractReceiptTotals(text).total ?? null;

export const extractReceiptDate = (text: string): string | null => {
  ISO_DATE_PATTERN.lastIndex = 0;
  for (const match of text.matchAll(ISO_DATE_PATTERN)) {
    const isoDate = toIsoDate(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    if (isoDate) {
      return isoDate;
    }
  }

  SLASH_DATE_PATTERN.lastIndex = 0;
  for (const match of text.matchAll(SLASH_DATE_PATTERN)) {
    const first = Number(match[1]);
    const second = Number(match[2]);
    const year = normalizeYear(Number(match[3]));

    const dayFirst = toIsoDate(year, second - 1, first);
    const monthFirst = toIsoDate(year, first - 1, second);

    if (first > 12 && dayFirst) {
      return dayFirst;
    }

    if (second > 12 && monthFirst) {
      return monthFirst;
    }

    if (dayFirst) {
      return dayFirst;
    }

    if (monthFirst) {
      return monthFirst;
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
    .filter(Boolean)
    .slice(0, 8);

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

    if (looksLikeAddress(line)) {
      continue;
    }

    if (line.length < 3 || line.length > 60) {
      continue;
    }

    return toTitleCase(line);
  }

  return null;
};

export const buildReceiptWarnings = (text: string): string[] => {
  const warnings: string[] = [];
  const totals = extractReceiptTotals(text);

  if (!extractReceiptVendor(text)) {
    warnings.push('Vendor name could not be extracted confidently.');
  }

  if (!extractReceiptDate(text)) {
    warnings.push('Receipt date could not be extracted confidently.');
  }

  if (totals.total === undefined) {
    warnings.push('Total amount could not be extracted confidently.');
  }

  if (!extractReceiptCurrency(text)) {
    warnings.push('Currency could not be detected from the receipt text.');
  }

  return warnings;
};

export const calculateReceiptConfidence = (text: string): number => {
  const totals = extractReceiptTotals(text);
  let score = 0.2;

  if (extractReceiptVendor(text)) {
    score += 0.2;
  }

  if (extractReceiptDate(text)) {
    score += 0.2;
  }

  if (totals.total !== undefined) {
    score += 0.25;
  }

  if (extractReceiptCurrency(text)) {
    score += 0.15;
  }

  if (totals.subtotal !== undefined || totals.tax !== undefined) {
    score += 0.1;
  }

  return Number(Math.min(score, 0.95).toFixed(2));
};
