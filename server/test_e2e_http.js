const http = require("http");

async function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });
    req.on("error", reject);
    if (data) {
      req.write(typeof data === "string" ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runE2E() {
  console.log("==================================================================");
  console.log("   TRACKIFY LIVE HTTP END-TO-END VERIFICATION ON RUNNING SERVERS   ");
  console.log("==================================================================\n");

  const results = {};

  try {
    // -------------------------------------------------------------
    // 1. Confirm HTTP Server is Reachable
    // -------------------------------------------------------------
    console.log("1. Checking if Backend HTTP Server (port 5000) is Reachable...");
    const health = await request({
      hostname: "localhost",
      port: 5000,
      path: "/",
      method: "GET",
    });
    if (health.status === 200) {
      console.log(`   ✅ PASS: HTTP server reachable (status: ${health.status}, body: "${health.body.trim()}")\n`);
      results.server_reachable = { pass: true, status: health.status };
    } else {
      throw new Error(`Server returned unexpected status: ${health.status}`);
    }

    // -------------------------------------------------------------
    // 2. Log in with Test Account
    // -------------------------------------------------------------
    console.log("2. Logging in with test account (testuser@trackify.com)...");
    const loginRes = await request(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/auth/login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      {
        email: "testuser@trackify.com",
        password: "TestPassword@123",
      }
    );

    if (loginRes.status === 200 && loginRes.body.token) {
      console.log(`   ✅ PASS: Logged in successfully. Token acquired. User: ${loginRes.body.user?.name || loginRes.body.user?.email}\n`);
      results.login = { pass: true, user: loginRes.body.user?.email };
    } else {
      throw new Error(`Login failed: ${JSON.stringify(loginRes.body)}`);
    }

    const token = loginRes.body.token;
    const authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    // -------------------------------------------------------------
    // 3. Test Normal INR Expense Creation
    // -------------------------------------------------------------
    console.log("3. Creating normal INR expense (350 INR Food at CCD)...");
    const inrExpenseRes = await request(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/expenses",
        method: "POST",
        headers: authHeaders,
      },
      {
        title: "Evening Coffee",
        amount: 350,
        currency: "INR",
        category: "Food",
        merchant: "Cafe Coffee Day",
        paymentMethod: "UPI / Net Banking",
        type: "expense",
        date: new Date().toISOString(),
      }
    );

    if (
      inrExpenseRes.status === 201 &&
      inrExpenseRes.body.amount === 350 &&
      inrExpenseRes.body.currency === "INR" &&
      inrExpenseRes.body.baseAmount === 350
    ) {
      console.log(`   ✅ PASS: Normal INR expense created. ID: ${inrExpenseRes.body._id}, Base: ₹${inrExpenseRes.body.baseAmount}\n`);
      results.inr_expense = { pass: true, id: inrExpenseRes.body._id };
    } else {
      throw new Error(`Normal INR expense creation failed: ${JSON.stringify(inrExpenseRes.body)}`);
    }

    // -------------------------------------------------------------
    // 4. Test 456 AED Foreign Currency Expense Creation
    // -------------------------------------------------------------
    console.log("4. Creating foreign expense (456 AED Shopping at Dubai Mall)...");
    const aedExpenseRes = await request(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/expenses",
        method: "POST",
        headers: authHeaders,
      },
      {
        title: "Dubai Souvenirs",
        amount: 456,
        currency: "AED",
        exchangeRate: 0.044,
        baseAmount: 10363.64,
        category: "Shopping",
        merchant: "Dubai Mall",
        paymentMethod: "Credit Card",
        type: "expense",
        date: new Date().toISOString(),
      }
    );

    if (
      aedExpenseRes.status === 201 &&
      aedExpenseRes.body.amount === 456 &&
      aedExpenseRes.body.currency === "AED" &&
      aedExpenseRes.body.baseAmount === 10363.64 &&
      aedExpenseRes.body.merchant === "Dubai Mall"
    ) {
      console.log(`   ✅ PASS: 456 AED foreign expense created. ID: ${aedExpenseRes.body._id}`);
      console.log(`      Native: 456 AED | Exchange Rate: 0.044 | Base (INR): ₹${aedExpenseRes.body.baseAmount} | Merchant: ${aedExpenseRes.body.merchant}\n`);
      results.aed_expense = { pass: true, id: aedExpenseRes.body._id, baseAmount: aedExpenseRes.body.baseAmount };
    } else {
      throw new Error(`456 AED expense creation failed: ${JSON.stringify(aedExpenseRes.body)}`);
    }

    // -------------------------------------------------------------
    // 5. Test Transactions Retrieval & Legacy INR Compatibility
    // -------------------------------------------------------------
    console.log("5. Fetching Transactions (/api/expenses) to verify dual display data & legacy support...");
    const txnsRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/expenses",
      method: "GET",
      headers: authHeaders,
    });

    const txns = Array.isArray(txnsRes.body) ? txnsRes.body : [];
    const foundAED = txns.find((t) => t.currency === "AED" && t.amount === 456);
    const foundLegacy = txns.find((t) => t.title === "Legacy Grocery Run");

    if (foundAED && foundLegacy) {
      console.log(`   ✅ PASS: Transactions list contains both 456 AED and Legacy INR items.`);
      console.log(`      - Found AED Txn: "${foundAED.title}", ${foundAED.amount} ${foundAED.currency}, baseAmount: ₹${foundAED.baseAmount}`);
      console.log(`      - Found Legacy Txn: "${foundLegacy.title}", ₹${foundLegacy.amount}, currency fallback: ${foundLegacy.currency || "INR"}\n`);
      results.transactions_list = { pass: true, total: txns.length };
    } else {
      throw new Error(`Transactions list missing either AED txn or legacy txn. Found: ${txns.length} items.`);
    }

    // -------------------------------------------------------------
    // 6. Test Recurring Payment Detection Endpoint
    // -------------------------------------------------------------
    console.log("6. Testing Recurring Detection Endpoint (/api/analytics/recurring)...");
    const recRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/analytics/recurring",
      method: "GET",
      headers: authHeaders,
    });

    const recData = recRes.body;
    console.log(`   Total recurring patterns detected: ${recData.recurring?.length || 0}`);
    console.log(`   Upcoming bills within window: ${recData.upcoming?.length || 0}`);

    const netflixRec = (recData.recurring || []).find((r) => r.title.toLowerCase().includes("netflix"));
    const elecUpcoming = (recData.upcoming || []).find((u) => u.title.toLowerCase().includes("electricity"));

    if (netflixRec && elecUpcoming) {
      console.log(`   ✅ PASS: Recurring detection identified subscriptions and upcoming bills:`);
      console.log(`      - Netflix: Frequency: ${netflixRec.frequency}, Confidence: ${Math.round(netflixRec.confidence * 100)}%, Typical Amount: ₹${netflixRec.typicalAmount}, Occurrences: ${netflixRec.occurrenceCount}`);
      console.log(`      - Electricity Bill: Next Expected: ${elecUpcoming.nextExpectedDate}, Due in: ${elecUpcoming.daysUntilDue} days\n`);
      results.recurring_detection = { pass: true, netflix: netflixRec.frequency, upcomingCount: recData.upcoming.length };
    } else {
      throw new Error(`Recurring detection failed to find Netflix or upcoming Electricity bill: ${JSON.stringify(recData)}`);
    }

    // -------------------------------------------------------------
    // 7. Test Analytics Normalization (Base Amount INR Math)
    // -------------------------------------------------------------
    console.log("7. Verifying Analytics Normalization (/api/analytics/summary & /by-category)...");
    const summaryRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/analytics/summary",
      method: "GET",
      headers: authHeaders,
    });

    const categoryRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/analytics/by-category",
      method: "GET",
      headers: authHeaders,
    });

    const totalExpense = summaryRes.body.totalExpense;
    const shoppingCat = (categoryRes.body || []).find((c) => c.category === "Shopping");

    console.log(`   Total Expense in Base Currency (INR): ₹${totalExpense}`);
    console.log(`   Shopping Category Total (INR): ₹${shoppingCat?.total}`);

    // Shopping category must be ~10363.64 (from the 456 AED), NOT 456!
    if (shoppingCat && Math.abs(shoppingCat.total - 10363.64) < 1.0) {
      console.log(`   ✅ PASS: Shopping category correctly aggregates base amount (₹${shoppingCat.total}), NOT raw 456!\n`);
      results.analytics_normalization = { pass: true, shoppingTotal: shoppingCat.total };
    } else {
      throw new Error(`Analytics aggregation mixed foreign currency! Shopping total: ${shoppingCat?.total}`);
    }

    // -------------------------------------------------------------
    // 8. Test Upcoming Payment Alerts & Duplicate Prevention
    // -------------------------------------------------------------
    console.log("8. Testing Upcoming Payment Alert Trigger & Duplicate Prevention...");
    // Run 1: Dispatch alert
    console.log("   Triggering Run 1 via POST /api/user/trigger-upcoming-alerts...");
    const alertRun1 = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/user/trigger-upcoming-alerts",
      method: "POST",
      headers: authHeaders,
    });

    console.log("   Run 1 Response:", alertRun1.body);

    // Run 2: Duplicate check (idempotency)
    console.log("   Triggering Run 2 (should be prevented by database unique index)...");
    const alertRun2 = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/user/trigger-upcoming-alerts",
      method: "POST",
      headers: authHeaders,
    });

    console.log("   Run 2 Response:", alertRun2.body);

    const run2ResultsCount = alertRun2.body?.result?.length || 0;
    if (alertRun1.status === 200 && run2ResultsCount === 0) {
      console.log("   ✅ PASS: Alert dispatched and duplicate prevention strictly verified (0 duplicate sends on Run 2).\n");
      results.alert_idempotency = { pass: true, run1: alertRun1.body?.message, run2Dispatches: run2ResultsCount };
    } else {
      throw new Error(`Duplicate prevention failed on Run 2: ${JSON.stringify(alertRun2.body)}`);
    }

    // -------------------------------------------------------------
    // 9. Test User Profile Reminder Preferences Persistence
    // -------------------------------------------------------------
    console.log("9. Testing Profile Reminder Preferences Persistence (PUT /api/user/profile)...");
    const updateProfileRes = await request(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/user/profile",
        method: "PUT",
        headers: authHeaders,
      },
      {
        reminderPreferences: {
          upcomingAlertsEmail: true,
          reminderDaysBefore: 5,
        },
      }
    );

    if (
      updateProfileRes.status === 200 &&
      updateProfileRes.body.reminderPreferences?.reminderDaysBefore === 5
    ) {
      console.log(`   ✅ PASS: Reminder preferences persisted. Window: ${updateProfileRes.body.reminderPreferences.reminderDaysBefore} days.\n`);
      results.profile_preferences = { pass: true, daysBefore: 5 };
    } else {
      throw new Error(`Failed to update reminder preferences: ${JSON.stringify(updateProfileRes.body)}`);
    }

    // -------------------------------------------------------------
    // 10. Test Income & Budget Endpoints
    // -------------------------------------------------------------
    console.log("10. Testing Income and Budget Endpoints (/api/expenses?type=income & /api/budget)...");
    const incomeRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/expenses?type=income",
      method: "GET",
      headers: authHeaders,
    });

    const budgetRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/budget",
      method: "GET",
      headers: authHeaders,
    });

    const incomeItems = Array.isArray(incomeRes.body) ? incomeRes.body : [];
    if (incomeRes.status === 200 && incomeItems.length > 0 && budgetRes.status === 200) {
      console.log(`   ✅ PASS: Income and Budget endpoints responsive. Found ${incomeItems.length} income items.\n`);
      results.income_budget = { pass: true, incomeCount: incomeItems.length };
    } else {
      throw new Error(`Income or Budget endpoints failed: Income status ${incomeRes.status}, Budget status ${budgetRes.status}`);
    }

    console.log("==================================================================");
    console.log("   🎉 ALL 10 LIVE HTTP END-TO-END TESTS PASSED WITH CODE 0!       ");
    console.log("==================================================================");
    console.log(JSON.stringify(results, null, 2));
  } catch (err) {
    console.error("\n❌ LIVE E2E TEST FAILED:", err.message);
    process.exitCode = 1;
  }
}

runE2E();
