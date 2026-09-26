const { parseVoiceTranscript } = require("../routes/parseExpense");
const assert = require("assert");

console.log("Running Voice Transcript Parsing Unit Tests...");

// Test Case 1: Standard Spoken Expense with Amount & Merchant & Relative Date
const transcript1 = "Add 250 for groceries at Walmart yesterday";
const refDate = new Date("2026-09-11T12:00:00.000Z");
const res1 = parseVoiceTranscript(transcript1, refDate);

assert.strictEqual(res1.amount, 250, "Amount extraction failed");
assert.strictEqual(res1.category, "Food", "Category mapping failed");
assert.strictEqual(res1.merchant, "Walmart", "Merchant extraction failed");
assert.strictEqual(new Date(res1.date).toISOString().slice(0, 10), "2026-09-10", "Yesterday date resolution failed");
assert(res1.confidence.overall >= 0.85, "Confidence score low");

console.log("✅ Test 1 Passed: 'Add 250 for groceries at Walmart yesterday'");

// Test Case 2: Spoken sentence with Rupees & Cab category
const transcript2 = "Spent 500 rupees on cab to airport today";
const res2 = parseVoiceTranscript(transcript2, refDate);

assert.strictEqual(res2.amount, 500);
assert.strictEqual(res2.category, "Transportation");
assert.strictEqual(res2.currency, "₹");

console.log("✅ Test 2 Passed: 'Spent 500 rupees on cab to airport today'");

// Test Case 3: Word-based numbers ("fifty dollars on dinner at Starbucks")
const transcript3 = "Spent fifty dollars on dinner at Starbucks";
const res3 = parseVoiceTranscript(transcript3, refDate);

assert.strictEqual(res3.amount, 50);
assert.strictEqual(res3.category, "Food");
assert.strictEqual(res3.currency, "$");
assert.strictEqual(res3.merchant, "Starbucks");

console.log("✅ Test 3 Passed: 'Spent fifty dollars on dinner at Starbucks'");

// Test Case 4: Ambiguous/Missing Amount
const transcript4 = "Bought some coffee this morning";
const res4 = parseVoiceTranscript(transcript4, refDate);

assert.strictEqual(res4.amount, null, "Amount should be null when not specified");
assert.strictEqual(res4.category, "Food");
assert(res4.confidence.overall < 0.70, "Confidence should be low when amount is missing");

console.log("✅ Test 4 Passed: Missing Amount Handling");

console.log("🎉 All Voice Parsing Unit Tests Passed!");
process.exit(0);

