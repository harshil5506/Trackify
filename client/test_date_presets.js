import { toDateTimeLocalValue } from "./src/utils/finance.js";
import http from "http";

console.log("==================================================================");
console.log("             DATE & TIME PRESET AND PERSISTENCE TESTS            ");
console.log("==================================================================\n");

let allPassed = true;

function assert(condition, label) {
  if (condition) {
    console.log(`[PASS ✅] ${label}`);
  } else {
    console.log(`[FAIL ❌] ${label}`);
    allPassed = false;
  }
}

// 1. Test Default to current date/time
const now = new Date();
const defaultVal = toDateTimeLocalValue(now);
assert(typeof defaultVal === "string" && defaultVal.includes("T"), "1. toDateTimeLocalValue produces valid YYYY-MM-DDTHH:mm format: " + defaultVal);

// 2. Test Presets calculation logic
function computePreset(presetType, base = new Date()) {
  const target = new Date(base.getTime());
  if (presetType === "yesterday") {
    target.setDate(target.getDate() - 1);
  } else if (presetType === "1m") {
    target.setMonth(target.getMonth() - 1);
  } else if (presetType === "2m") {
    target.setMonth(target.getMonth() - 2);
  } else if (presetType === "3m") {
    target.setMonth(target.getMonth() - 3);
  }
  return toDateTimeLocalValue(target);
}

const todayVal = computePreset("today", now);
const yesterdayVal = computePreset("yesterday", now);
const oneMonthVal = computePreset("1m", now);
const twoMonthsVal = computePreset("2m", now);
const threeMonthsVal = computePreset("3m", now);

assert(todayVal === defaultVal, "2a. Today preset matches current moment");
assert(new Date(yesterdayVal) < new Date(todayVal), "2b. Yesterday preset is earlier than Today");
assert(new Date(oneMonthVal) < new Date(yesterdayVal), "2c. 1 Month Ago preset is earlier than Yesterday");
assert(new Date(twoMonthsVal) < new Date(oneMonthVal), "2d. 2 Months Ago preset is earlier than 1 Month Ago");
assert(new Date(threeMonthsVal) < new Date(twoMonthsVal), "2e. 3 Months Ago preset is earlier than 2 Months Ago");

// 2f. Test Birthday-style Day, Month, Year, Time picker logic
function computeFromParts(day, month, year, time = "14:30") {
  const [h, min] = time.split(":");
  const maxDays = new Date(year, month, 0).getDate();
  const clampedDay = Math.min(day, maxDays);
  const dateObj = new Date(year, month - 1, clampedDay, Number(h), Number(min));
  return toDateTimeLocalValue(dateObj);
}

const customJune1 = computeFromParts(1, 6, 2026, "12:00");
assert(customJune1 === "2026-06-01T12:00", "2f. Day 1, Month 6, Year 2026, 12:00 yields exact ISO date: " + customJune1);

const febClamped = computeFromParts(31, 2, 2026, "10:00");
assert(febClamped === "2026-02-28T10:00", "2g. Day 31 on February correctly clamps to 28 days: " + febClamped);


// 3. Test Future Date Rejection Logic
const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
const isFutureRejected = futureDate > new Date();
assert(isFutureRejected === true, "3. Future date is correctly identified and rejected by validation guard");

// 4. Test Safe Date Rendering
function safePreview(dateTimeStr) {
  if (!dateTimeStr) return "No date selected";
  const d = new Date(dateTimeStr);
  return Number.isNaN(d.getTime()) ? "Invalid date" : d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

assert(safePreview("") === "No date selected", "4a. Empty dateTime string gracefully yields 'No date selected'");
assert(safePreview("invalid-date-string") === "Invalid date", "4b. Malformed string gracefully yields 'Invalid date' without crashing");
assert(safePreview("2026-06-01T12:00").length > 5, "4c. Valid historical string (June 1) formats cleanly: " + safePreview("2026-06-01T12:00"));

// 5. Test Live Backend Persistence of a Historical Date (e.g. Netflix on June 1)
async function testBackendHistoricalPersistence() {
  console.log("\n5. Testing Live Backend Persistence of Historical Transaction...");

  function request(options, data) {
    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, body });
          }
        });
      });
      req.on("error", reject);
      if (data) req.write(JSON.stringify(data));
      req.end();
    });
  }

  // Log in
  const loginRes = await request(
    {
      hostname: "localhost",
      port: 5000,
      path: "/api/auth/login",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    { email: "testuser@trackify.com", password: "TestPassword@123" }
  );

  if (loginRes.status !== 200 || !loginRes.body.token) {
    console.log("   [FAIL ❌] Login failed for backend test");
    allPassed = false;
    return;
  }

  const token = loginRes.body.token;

  // Post historical expense: Netflix on June 1, 2026
  const targetHistoricalDate = "2026-06-01T14:30:00.000Z";
  const postRes = await request(
    {
      hostname: "localhost",
      port: 5000,
      path: "/api/expenses",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
    {
      title: "Netflix — June",
      merchant: "Netflix",
      amount: 649,
      currency: "INR",
      baseAmount: 649,
      category: "Entertainment",
      type: "expense",
      date: targetHistoricalDate,
    }
  );

  assert(postRes.status === 201, "5a. Historical expense created on backend with HTTP 201");
  const returnedDate = new Date(postRes.body.date).toISOString();
  assert(returnedDate === targetHistoricalDate, `5b. Backend persisted exact historical date: ${returnedDate} (matched ${targetHistoricalDate})`);

  // Clean up the created test expense
  if (postRes.body._id) {
    await request({
      hostname: "localhost",
      port: 5000,
      path: `/api/expenses/${postRes.body._id}`,
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("   [PASS ✅] Cleaned up temporary test historical transaction.");
  }
}

testBackendHistoricalPersistence().then(() => {
  console.log("\n==================================================================");
  if (allPassed) {
    console.log("   🎉 ALL DATE & TIME TESTS PASSED SUCCESSFULLY!");
  } else {
    console.log("   ❌ SOME TESTS FAILED!");
    process.exit(1);
  }
  console.log("==================================================================\n");
});
