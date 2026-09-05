const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const User = require("./models/User");
const Expense = require("./models/Expense");
const PaymentAlert = require("./models/PaymentAlert");
const { detectRecurringPayments } = require("./services/recurringDetector");
const { checkAndSendUpcomingPaymentAlerts } = require("./services/reportScheduler");

async function runTests() {
  console.log("🚀 Starting Feature Verification Tests...\n");

  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/trackify";
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB ✅\n");

  let testUser = null;
  try {
    // 1. Setup Test User
    const testEmail = `test_verification_${Date.now()}@example.com`;
    testUser = await User.create({
      name: "Feature Tester",
      email: testEmail,
      currency: "INR",
      reminderPreferences: {
        upcomingAlertsEmail: true,
        reminderDaysBefore: 5,
      },
    });
    console.log(`Created test user: ${testUser.email} (ID: ${testUser._id})`);

    // -------------------------------------------------------------
    // TEST 1: Multi-Currency & Foreign Currency Storage
    // -------------------------------------------------------------
    console.log("\n--- TEST 1: Multi-Currency & Foreign Currency Storage ---");
    
    // Create foreign expense (456 AED)
    const foreignExpense = await Expense.create({
      user: testUser._id,
      title: "Dubai Mall Shopping",
      merchant: "Dubai Mall",
      amount: 456,
      currency: "AED",
      exchangeRate: 0.044,
      baseAmount: 10363.64,
      category: "Shopping",
      type: "expense",
      date: new Date(),
    });

    // Create legacy expense (no currency, no baseAmount)
    const legacyExpense = await Expense.create({
      user: testUser._id,
      title: "Local Indian Grocery",
      amount: 2000,
      category: "Food",
      type: "expense",
      date: new Date(),
    });

    console.log("Foreign Expense Saved:", {
      id: foreignExpense._id,
      title: foreignExpense.title,
      amount: foreignExpense.amount,
      currency: foreignExpense.currency,
      baseAmount: foreignExpense.baseAmount,
      merchant: foreignExpense.merchant,
    });

    if (foreignExpense.amount === 456 && foreignExpense.currency === "AED" && foreignExpense.baseAmount === 10363.64 && foreignExpense.merchant === "Dubai Mall") {
      console.log("✅ Multi-currency storage test PASSED: 456 AED and merchant preserved with baseAmount in INR.");
    } else {
      throw new Error("Multi-currency storage verification failed.");
    }

    // Verify analytics aggregation math
    const allExpenses = await Expense.find({ user: testUser._id, type: "expense" });
    const totalNormalized = allExpenses.reduce((s, e) => s + (e.baseAmount != null ? e.baseAmount : e.amount), 0);
    console.log(`Normalized Total (INR): ₹${totalNormalized.toFixed(2)} (Expected ~₹12363.64, NOT 456 + 2000 = 2456)`);
    if (Math.abs(totalNormalized - 12363.64) < 0.1) {
      console.log("✅ Multi-currency analytics normalization test PASSED.");
    } else {
      throw new Error(`Analytics normalization mismatch: got ${totalNormalized}`);
    }

    // -------------------------------------------------------------
    // TEST 2: Recurring Payment Detection
    // -------------------------------------------------------------
    console.log("\n--- TEST 2: Recurring Payment Detection ---");

    // Seed 4 consecutive monthly Netflix subscriptions for test user
    const netflixDates = [
      new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // ~3 months ago
      new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // ~2 months ago
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // ~1 month ago
      new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),  // yesterday
    ];

    for (const d of netflixDates) {
      await Expense.create({
        user: testUser._id,
        title: "Netflix Subscription",
        merchant: "Netflix",
        amount: 799,
        currency: "INR",
        category: "Entertainment",
        type: "expense",
        date: d,
      });
    }

    // Seed non-recurring one-off expense
    await Expense.create({
      user: testUser._id,
      title: "Random Restaurant Dinner",
      amount: 1450,
      currency: "INR",
      category: "Food",
      type: "expense",
      date: new Date(),
    });

    const detectionResult = await detectRecurringPayments(testUser._id, 5);
    console.log("Recurring Detection Result:", {
      totalFound: detectionResult.recurring.length,
      items: detectionResult.recurring.map(r => ({
        title: r.title,
        frequency: r.frequency,
        typicalAmount: r.typicalAmount,
        confidence: r.confidence,
        occurrences: r.occurrenceCount,
        nextDate: r.nextExpectedDate,
        daysUntilDue: r.daysUntilDue,
      })),
    });

    const netflixRec = detectionResult.recurring.find(r => r.title.toLowerCase().includes("netflix"));
    if (netflixRec && netflixRec.frequency === "Monthly" && netflixRec.typicalAmount === 799 && netflixRec.confidence >= 0.8) {
      console.log("✅ Recurring payment detection test PASSED: Netflix monthly subscription detected with high confidence.");
    } else {
      throw new Error("Recurring payment detection failed for Netflix.");
    }

    // Verify non-recurring item was NOT detected
    const randomRec = detectionResult.recurring.find(r => r.title.toLowerCase().includes("random restaurant"));
    if (!randomRec) {
      console.log("✅ Single one-off transaction correctly excluded from recurring detections.");
    } else {
      throw new Error("One-off transaction was incorrectly classified as recurring.");
    }

    // -------------------------------------------------------------
    // TEST 3: Upcoming Alerts & Duplicate Prevention
    // -------------------------------------------------------------
    console.log("\n--- TEST 3: Upcoming Payment Alerts & Duplicate Prevention ---");

    // Add a recurring bill specifically due in 2 days (within 5-day window)
    const billDates = [
      new Date(Date.now() - 58 * 24 * 60 * 60 * 1000),
      new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), // Next cycle due in ~2 days
    ];

    for (const d of billDates) {
      await Expense.create({
        user: testUser._id,
        title: "Fiber Broadband Bill",
        merchant: "Airtel Fiber",
        amount: 999,
        currency: "INR",
        category: "Bills & Utilities",
        type: "expense",
        date: d,
      });
    }

    // First Run of upcoming alert checker
    console.log("Executing Run 1 of checkAndSendUpcomingPaymentAlerts()...");
    const run1Results = await checkAndSendUpcomingPaymentAlerts(testUser._id);
    console.log("Run 1 Result:", run1Results);

    const alertsAfterRun1 = await PaymentAlert.find({ user: testUser._id });
    console.log(`Alerts recorded in PaymentAlert table: ${alertsAfterRun1.length}`);

    if (alertsAfterRun1.length > 0) {
      console.log("✅ Run 1 PASSED: Alert generated and tracked in PaymentAlert collection.");
    } else {
      throw new Error("Run 1 failed to record alert in PaymentAlert.");
    }

    // Second Run of upcoming alert checker (Simulating repeated scheduler execution)
    console.log("\nExecuting Run 2 of checkAndSendUpcomingPaymentAlerts() (idempotency check)...");
    const run2Results = await checkAndSendUpcomingPaymentAlerts(testUser._id);
    console.log("Run 2 Result:", run2Results);

    if (run2Results.length === 0) {
      console.log("✅ Run 2 PASSED: Duplicate alert prevented! Zero duplicate emails sent.");
    } else {
      throw new Error("Duplicate alert prevention failed: Run 2 dispatched alerts again.");
    }

    console.log("\n🎉 ALL 3 FEATURE VERIFICATION TESTS PASSED SUCCESSFULLY!");
  } catch (err) {
    console.error("\n❌ TEST FAILED:", err.message);
    process.exitCode = 1;
  } finally {
    if (testUser) {
      console.log("\nCleaning up test data...");
      await Expense.deleteMany({ user: testUser._id });
      await PaymentAlert.deleteMany({ user: testUser._id });
      await User.findByIdAndDelete(testUser._id);
      console.log("Test cleanup completed.");
    }
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

runTests();
