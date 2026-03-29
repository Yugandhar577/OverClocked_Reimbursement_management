import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildReceiptWarnings,
  calculateReceiptConfidence,
  extractReceiptAmount,
  extractReceiptCurrency,
  extractReceiptDate,
  extractReceiptTotals,
  extractReceiptVendor,
} from './ocr-parsing.js';

test('extracts structured fields from a labelled receipt', () => {
  const receiptText = `STARBUCKS COFFEE
MG ROAD BENGALURU
Date: 29/03/2026
Subtotal: INR 450.00
Tax: INR 40.50
Grand Total: INR 490.50`;

  assert.equal(extractReceiptVendor(receiptText), 'Starbucks Coffee');
  assert.equal(extractReceiptCurrency(receiptText), 'INR');
  assert.equal(extractReceiptAmount(receiptText), 490.5);
  assert.deepEqual(extractReceiptTotals(receiptText), {
    subtotal: 450,
    tax: 40.5,
    total: 490.5,
  });
  assert.equal(extractReceiptDate(receiptText), '2026-03-29T00:00:00.000Z');
  assert.deepEqual(buildReceiptWarnings(receiptText), []);
  assert.ok(calculateReceiptConfidence(receiptText) >= 0.8);
});

test('derives subtotal when only tax and total are available', () => {
  const receiptText = `THE CORNER BISTRO
Invoice Date 2026-03-15
Tax 18.00
Total 118.00
Paid by Card`;

  assert.equal(extractReceiptVendor(receiptText), 'The Corner Bistro');
  assert.deepEqual(extractReceiptTotals(receiptText), {
    subtotal: 100,
    tax: 18,
    total: 118,
  });
});

test('returns warnings when important fields are missing', () => {
  const receiptText = `Receipt Copy
Thank you for your purchase`;

  const warnings = buildReceiptWarnings(receiptText);

  assert.ok(warnings.length >= 3);
  assert.equal(extractReceiptVendor(receiptText), null);
  assert.equal(extractReceiptAmount(receiptText), null);
  assert.equal(extractReceiptCurrency(receiptText), null);
});
