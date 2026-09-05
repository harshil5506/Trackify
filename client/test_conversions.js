import {
  convertCurrency,
  convertForeignToBase,
  convertBaseToTarget,
  formatNativeAmount,
  FALLBACK_INR_RATES,
} from "./src/utils/currency.js";

console.log("==================================================================");
console.log("       MULTI-CURRENCY BIDIRECTIONAL & CROSS-CURRENCY TESTS       ");
console.log("==================================================================\n");

let allPassed = true;

function assertClose(actual, expected, tolerance = 0.05, label = "") {
  const diff = Math.abs(actual - expected);
  const pass = diff <= tolerance;
  if (!pass) allPassed = false;
  console.log(
    `[${pass ? "PASS ✅" : "FAIL ❌"}] ${label}: got ${actual.toFixed(2)}, expected ~${expected.toFixed(2)}`
  );
  return pass;
}

// 1. INR -> USD
// 1000 INR * 0.012 = 12.00 USD
const r1 = convertCurrency(1000, "INR", "USD", FALLBACK_INR_RATES);
assertClose(r1, 12.0, 0.01, "1. INR -> USD (1000 INR)");

// 2. USD -> INR
// 100 USD / 0.012 = 8333.33 INR
const r2 = convertCurrency(100, "USD", "INR", FALLBACK_INR_RATES);
assertClose(r2, 8333.33, 0.05, "2. USD -> INR (100 USD)");

// 3. INR -> AED
// 1000 INR * 0.044 = 44.00 AED
const r3 = convertCurrency(1000, "INR", "AED", FALLBACK_INR_RATES);
assertClose(r3, 44.0, 0.01, "3. INR -> AED (1000 INR)");

// 4. AED -> INR
// 456 AED / 0.044 = 10363.64 INR
const r4 = convertCurrency(456, "AED", "INR", FALLBACK_INR_RATES);
assertClose(r4, 10363.64, 0.05, "4. AED -> INR (456 AED)");

// 5. USD -> AED
// (100 / 0.012) * 0.044 = 8333.33 * 0.044 = 366.67 AED
const r5 = convertCurrency(100, "USD", "AED", FALLBACK_INR_RATES);
assertClose(r5, 366.67, 0.05, "5. USD -> AED (100 USD)");

// 6. AED -> USD
// (100 / 0.044) * 0.012 = 2272.73 * 0.012 = 27.27 USD
const r6 = convertCurrency(100, "AED", "USD", FALLBACK_INR_RATES);
assertClose(r6, 27.27, 0.05, "6. AED -> USD (100 AED)");

// 7. USD -> USD (Same currency)
const r7 = convertCurrency(100, "USD", "USD", FALLBACK_INR_RATES);
assertClose(r7, 100.0, 0.001, "7. USD -> USD (Same Currency)");

// 8. INR -> INR (Same currency)
const r8 = convertCurrency(1000, "INR", "INR", FALLBACK_INR_RATES);
assertClose(r8, 1000.0, 0.001, "8. INR -> INR (Same Currency)");

// 9. Existing 456 AED transaction base conversion check
const r9 = convertForeignToBase(456, "AED", FALLBACK_INR_RATES);
assertClose(r9, 10363.64, 0.05, "9. Existing convertForeignToBase (456 AED -> INR)");

// 10. Legacy INR transaction check (no currency, no rate)
const r10 = convertForeignToBase(1500, "INR", FALLBACK_INR_RATES);
assertClose(r10, 1500.0, 0.001, "10. Legacy convertForeignToBase (1500 INR)");

// 11. Edge Cases: zero amount, negative amount, undefined currency
const rZero = convertCurrency(0, "USD", "EUR", FALLBACK_INR_RATES);
assertClose(rZero, 0, 0.001, "11a. Zero amount check");

const rInvalid = convertCurrency(100, null, "USD", FALLBACK_INR_RATES);
assertClose(rInvalid, 1.2, 0.05, "11b. Null fromCurrency fallback to INR");

console.log("\n==================================================================");
if (allPassed) {
  console.log("   🎉 ALL 11 TESTS PASSED PERFECTLY!");
} else {
  console.log("   ❌ SOME TESTS FAILED!");
  process.exit(1);
}
console.log("==================================================================\n");
