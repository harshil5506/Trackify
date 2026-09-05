const User = require("../models/User");
const Expense = require("../models/Expense");
const { sendFinancialReportEmail } = require("../utils/emailTemplates");

async function generateAndSendUserReport(userId, reportType = "Monthly", customDateRange = null) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const now = new Date();
  let startDate, endDate, monthYearLabel;

  if (customDateRange && customDateRange.startDate && customDateRange.endDate) {
    startDate = new Date(customDateRange.startDate);
    endDate = new Date(customDateRange.endDate);
    monthYearLabel = `${startDate.toLocaleString('default', { month: 'short' })} - ${endDate.toLocaleString('default', { month: 'short', year: 'numeric' })}`;
  } else if (reportType === "Annual") {
    const year = now.getFullYear();
    startDate = new Date(year, 0, 1);
    endDate = new Date(year, 11, 31, 23, 59, 59);
    monthYearLabel = `Year ${year}`;
  } else {
    // Default Monthly (current or previous month)
    const year = now.getFullYear();
    const month = now.getMonth();
    startDate = new Date(year, month, 1);
    endDate = new Date(year, month + 1, 0, 23, 59, 59);
    monthYearLabel = startDate.toLocaleString("default", { month: "long", year: "numeric" });
  }

  // Fetch expenses & income for user in date range
  const items = await Expense.find({
    user: userId,
    date: { $gte: startDate, $lte: endDate },
  });

  let totalIncome = 0;
  let totalExpense = 0;
  const categoryTotals = {};

  items.forEach((item) => {
    if (item.type === "income") {
      totalIncome += item.amount;
    } else {
      totalExpense += item.amount;
      categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.amount;
    }
  });

  const netSavings = totalIncome - totalExpense;

  const topCategories = Object.keys(categoryTotals)
    .map((cat) => ({ category: cat, total: categoryTotals[cat] }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Symbol mapping
  const symbols = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    AED: "AED ",
    CAD: "$",
    AUD: "$",
  };
  const currencySymbol = symbols[user.currency] || "₹";

  const emailResult = await sendFinancialReportEmail(user.email, {
    userName: user.name || "Trackify User",
    reportType,
    monthYear: monthYearLabel,
    totalIncome,
    totalExpense,
    netSavings,
    topCategories,
    currencySymbol,
  });

  return {
    success: true,
    user: user.email,
    summary: { totalIncome, totalExpense, netSavings, count: items.length },
    emailResult,
  };
}

const PaymentAlert = require("../models/PaymentAlert");
const { detectRecurringPayments } = require("./recurringDetector");
const { sendUpcomingPaymentAlertEmail } = require("../utils/emailTemplates");

// Checks for upcoming recurring payments and dispatches reminders with duplicate prevention
async function checkAndSendUpcomingPaymentAlerts(targetUserId = null) {
  try {
    const userQuery = targetUserId
      ? { _id: targetUserId }
      : { "reminderPreferences.upcomingAlertsEmail": { $ne: false } };

    const users = await User.find(userQuery);
    const results = [];

    for (const user of users) {
      const reminderDays = user.reminderPreferences?.reminderDaysBefore || 3;
      const { upcoming } = await detectRecurringPayments(user._id, reminderDays);

      if (!upcoming || upcoming.length === 0) continue;

      const alertsToSend = [];

      for (const item of upcoming) {
        const dueDateObj = new Date(item.nextExpectedDate);
        const dueDateString = dueDateObj.toISOString().split("T")[0]; // YYYY-MM-DD

        // Check if an alert was ALREADY sent for this recurring payment and due cycle
        const existingAlert = await PaymentAlert.findOne({
          user: user._id,
          recurringKey: item.recurringKey,
          dueDateString,
        });

        if (!existingAlert) {
          alertsToSend.push({
            ...item,
            dueDateString,
          });
        }
      }

      if (alertsToSend.length > 0) {
        // Dispatch email
        const emailResult = await sendUpcomingPaymentAlertEmail(user.email, {
          userName: user.name || "Trackify User",
          alerts: alertsToSend,
        });

        // Persist records to prevent duplicate sends
        for (const alert of alertsToSend) {
          await PaymentAlert.create({
            user: user._id,
            recurringKey: alert.recurringKey,
            title: alert.title,
            amount: alert.typicalAmount,
            currency: alert.currency,
            dueDate: alert.nextExpectedDate,
            dueDateString: alert.dueDateString,
            channel: "email",
          }).catch((err) => {
            // In case of race condition unique index catch
            console.warn("Duplicate PaymentAlert insert prevented:", err.message);
          });
        }

        results.push({
          user: user.email,
          alertsSent: alertsToSend.length,
          emailResult,
        });
      }
    }

    return results;
  } catch (err) {
    console.error("Error in checkAndSendUpcomingPaymentAlerts:", err.message);
    return [];
  }
}

// Background Cron Scheduler (Runs every 1st day of month for reports and daily for upcoming alerts)
function initReportScheduler() {
  console.log("📅 Auto-Report & Alert Scheduler Service Initialized ✅");

  // Check upcoming payment alerts immediately on server start
  setTimeout(() => {
    checkAndSendUpcomingPaymentAlerts().catch((err) =>
      console.error("Initial upcoming payment alert check failed:", err.message)
    );
  }, 5000);

  // Set up periodic check interval (every 24 hours)
  const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

  setInterval(async () => {
    const today = new Date();

    // 1. Run daily upcoming payment alerts check
    try {
      await checkAndSendUpcomingPaymentAlerts();
    } catch (alertErr) {
      console.error("Daily payment alerts check error:", alertErr.message);
    }

    // 2. If today is 1st day of the month, run monthly report dispatch
    if (today.getDate() === 1) {
      console.log("⏳ Running 1st of month automated email report dispatch...");
      try {
        const users = await User.find({ "reportPreferences.monthlyEmail": true });
        for (const user of users) {
          try {
            await generateAndSendUserReport(user._id, "Monthly");
          } catch (e) {
            console.error(`Failed to send monthly report to ${user.email}:`, e.message);
          }
        }
      } catch (err) {
        console.error("Cron auto-report execution error:", err.message);
      }
    }
  }, CHECK_INTERVAL);
}

module.exports = {
  generateAndSendUserReport,
  checkAndSendUpcomingPaymentAlerts,
  initReportScheduler,
};

