const Expense = require("../models/Expense");

/**
 * Clean & normalize titles or merchant names
 * e.g. "Netflix Subscription - Jan" -> "netflix subscription"
 */
function normalizeName(str = "") {
  return String(str || "")
    .toLowerCase()
    .replace(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)\b/gi, "")
    .replace(/\b(month|m-\d|\d{4})\b/gi, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Classify frequency based on average interval between consecutive transactions (in days)
 */
function classifyFrequency(intervals) {
  if (!intervals || intervals.length === 0) return null;

  const sum = intervals.reduce((a, b) => a + b, 0);
  const avg = sum / intervals.length;

  // Compute standard deviation
  const variance =
    intervals.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) /
    intervals.length;
  const stdDev = Math.sqrt(variance);

  // Weekly: ~7 days (5 to 9 days)
  if (avg >= 5 && avg <= 9 && stdDev <= 3.5) {
    return { frequency: "Weekly", avgDays: 7, stdDev };
  }

  // Biweekly: ~14 days (12 to 17 days)
  if (avg >= 12 && avg <= 17 && stdDev <= 4.5) {
    return { frequency: "Biweekly", avgDays: 14, stdDev };
  }

  // Monthly: ~30 days (25 to 35 days, accommodating 28, 30, 31 day months and minor billing delays)
  if (avg >= 25 && avg <= 35 && stdDev <= 7.0) {
    return { frequency: "Monthly", avgDays: 30, stdDev };
  }

  // Quarterly: ~90 days (80 to 100 days)
  if (avg >= 80 && avg <= 100 && stdDev <= 12.0) {
    return { frequency: "Quarterly", avgDays: 91, stdDev };
  }

  // Yearly: ~365 days (350 to 380 days)
  if (avg >= 350 && avg <= 380 && stdDev <= 18.0) {
    return { frequency: "Yearly", avgDays: 365, stdDev };
  }

  return null;
}

/**
 * Calculate the next expected payment date projected into the future
 */
function calculateNextDate(lastDate, frequency) {
  const next = new Date(lastDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Project forward until next >= today
  while (next < today) {
    if (frequency === "Weekly") {
      next.setDate(next.getDate() + 7);
    } else if (frequency === "Biweekly") {
      next.setDate(next.getDate() + 14);
    } else if (frequency === "Monthly") {
      next.setMonth(next.getMonth() + 1);
    } else if (frequency === "Quarterly") {
      next.setMonth(next.getMonth() + 3);
    } else if (frequency === "Yearly") {
      next.setFullYear(next.getFullYear() + 1);
    } else {
      next.setDate(next.getDate() + 30);
    }
  }

  return next;
}

/**
 * Main Detection Algorithm
 * Analyzes a user's expense history and returns detected recurring payments
 */
async function detectRecurringPayments(userId, reminderDaysBefore = 3) {
  // Fetch only this user's expenses
  const expenses = await Expense.find({
    user: userId,
    type: "expense",
  }).sort({ date: 1 });

  if (!expenses || expenses.length < 2) {
    return { recurring: [], upcoming: [] };
  }

  // 1. Group / Cluster transactions by normalized identity
  const clusters = {};

  expenses.forEach((item) => {
    const normMerchant = normalizeName(item.merchant);
    const normTitle = normalizeName(item.title);
    const clusterName = normMerchant || normTitle || "other";

    // Combine with category to avoid grouping different services with identical generic names
    const key = `${clusterName}__${item.category}`;

    if (!clusters[key]) {
      clusters[key] = {
        name: item.merchant || item.title,
        merchant: item.merchant || "",
        category: item.category,
        currency: item.currency || "INR",
        items: [],
      };
    }

    clusters[key].items.push(item);
  });

  const recurring = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 2. Evaluate each cluster
  for (const key of Object.keys(clusters)) {
    const cluster = clusters[key];
    // Sort chronologically
    const sortedItems = [...cluster.items].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    // Filter out multiple transactions belonging to the same billing cycle (within 4 days)
    // to protect cadence detection from duplicate clicks, retry charges, or same-cycle tests
    const items = [];
    for (const item of sortedItems) {
      if (items.length === 0) {
        items.push(item);
      } else {
        const prev = items[items.length - 1];
        const dayDiff = Math.round(
          (new Date(item.date) - new Date(prev.date)) / (1000 * 60 * 60 * 24)
        );
        if (dayDiff >= 4) {
          items.push(item);
        }
      }
    }

    // Must have at least 2 distinct cycle occurrences
    if (items.length < 2) continue;

    // Calculate intervals between consecutive transactions in days
    const intervals = [];
    for (let i = 1; i < items.length; i++) {
      const d1 = new Date(items[i - 1].date);
      const d2 = new Date(items[i].date);
      const diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        intervals.push(diffDays);
      }
    }

    if (intervals.length === 0) continue;

    const classification = classifyFrequency(intervals);
    if (!classification) continue; // Not a recognized recurrence cadence

    // Check amount consistency
    const amounts = items.map((it) => it.amount);
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const baseAmounts = items.map((it) =>
      it.baseAmount != null ? it.baseAmount : it.amount
    );
    const avgBaseAmount =
      baseAmounts.reduce((a, b) => a + b, 0) / baseAmounts.length;

    // Check maximum relative amount deviation
    const maxDev = Math.max(...amounts.map((a) => Math.abs(a - avgAmount) / avgAmount));
    // Allow up to 25% fluctuation for recurring bills (utility bills, groceries, etc.)
    if (maxDev > 0.25) continue;

    // Calculate confidence
    let confidence = 0.65;
    if (items.length >= 3) confidence += 0.15;
    if (items.length >= 5) confidence += 0.1;
    if (maxDev <= 0.05) confidence += 0.1; // exact or nearly exact amount
    confidence = Math.min(Math.round(confidence * 100) / 100, 0.99);

    const latestItem = items[items.length - 1];
    const lastPaymentDate = new Date(latestItem.date);
    const nextExpectedDate = calculateNextDate(lastPaymentDate, classification.frequency);

    // Days until due
    const msDiff = nextExpectedDate.getTime() - today.getTime();
    const daysUntilDue = Math.ceil(msDiff / (1000 * 60 * 60 * 24));

    const isUpcoming = daysUntilDue >= 0 && daysUntilDue <= reminderDaysBefore;

    const itemCurrency = latestItem.currency || cluster.currency || "INR";

    recurring.push({
      recurringKey: `${normalizeName(cluster.name)}_${classification.frequency.toLowerCase()}`,
      title: cluster.name,
      merchant: cluster.merchant || "",
      category: cluster.category,
      typicalAmount: Math.round(avgAmount * 100) / 100,
      typicalBaseAmount: Math.round(avgBaseAmount * 100) / 100,
      currency: itemCurrency,
      frequency: classification.frequency,
      confidence,
      occurrenceCount: items.length,
      lastPaymentDate,
      nextExpectedDate,
      daysUntilDue,
      isUpcoming,
      transactionIds: items.map((it) => it._id),
    });
  }

  // Sort recurring by next expected date
  recurring.sort((a, b) => new Date(a.nextExpectedDate) - new Date(b.nextExpectedDate));

  // Upcoming items filtered within reminder window
  const upcoming = recurring.filter((r) => r.isUpcoming);

  return { recurring, upcoming };
}

module.exports = {
  normalizeName,
  classifyFrequency,
  calculateNextDate,
  detectRecurringPayments,
};
