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

// Background Cron Scheduler (Runs every 1st day of month at midnight or on call)
function initReportScheduler() {
  console.log("📅 Auto-Report Scheduler Service Initialized ✅");
  
  // Set up periodic check interval (e.g. check daily if it's the 1st of the month)
  const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  
  setInterval(async () => {
    const today = new Date();
    // If today is 1st day of the month at midnight run
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
  initReportScheduler,
};
