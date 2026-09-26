const { parseReceiptText } = require("../routes/ocr");
const assert = require("assert");

console.log("Running OCR Normalization Unit Tests...");

// Test Case 1: Standard Grocery Receipt
const sampleGroceryReceipt = `
DMART RETAIL LTD
Store #402, Main Highway
Date: 10/09/2026

Items:
Organic Milk  1 x 60.00  60.00
Whole Wheat Bread 2 x 45.00 90.00
Fresh Apples 150.00

SUBTOTAL: 300.00
GST (5%): 15.00
TOTAL: 315.00
THANK YOU FOR SHOPPING!
`;

const parsedGrocery = parseReceiptText(sampleGroceryReceipt, 0.90);
assert.strictEqual(parsedGrocery.merchant, "DMART RETAIL LTD", "Merchant extraction failed");
assert.strictEqual(parsedGrocery.total, 315.00, "Total extraction failed");
assert.strictEqual(parsedGrocery.subtotal, 300.00, "Subtotal extraction failed");
assert.strictEqual(parsedGrocery.tax, 15.00, "Tax extraction failed");
assert(parsedGrocery.lineItems.length >= 2, "Line items extraction failed");
assert(parsedGrocery.confidence.total >= 0.70, "Confidence score low");

console.log("✅ Test 1 Passed: Standard Grocery Receipt");

// Test Case 2: Minimalist Cafe Receipt with $ Currency
const sampleCafeReceipt = `
STARBUCKS CAFE
09/05/2026

Iced Latte $5.50
Blueberry Muffin $4.00

Total: $9.50
`;

const parsedCafe = parseReceiptText(sampleCafeReceipt, 0.88);
assert.strictEqual(parsedCafe.merchant, "STARBUCKS CAFE");
assert.strictEqual(parsedCafe.currency, "$");
assert.strictEqual(parsedCafe.total, 9.50);

console.log("✅ Test 2 Passed: Cafe Receipt");

// Test Case 3: Messy OCR text with missing subtotal
const sampleMessyReceipt = `
TAX INVOICE
WALMART SUPERCENTER
Date: 2026-08-20

Batteries 12.99
Snacks 8.50

GRAND TOTAL: 21.49
`;

const parsedMessy = parseReceiptText(sampleMessyReceipt, 0.75);
assert.strictEqual(parsedMessy.merchant, "WALMART SUPERCENTER");
assert.strictEqual(parsedMessy.total, 21.49);
assert.strictEqual(parsedMessy.confidence.merchant > 0.5, true);

console.log("✅ Test 3 Passed: Messy Receipt");

console.log("🎉 All OCR Normalization Unit Tests Passed!");
process.exit(0);

