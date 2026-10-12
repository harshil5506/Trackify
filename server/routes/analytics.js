const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const Budget = require("../models/Budget");
const Group = require("../models/Group");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const { predictSpending } = require("../services/spendingPredictor");

// GET overall summary
router.get("/summary", authMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find({
      user: req.user.id,
      type: "expense",
    });
    const incomes = await Expense.find({
      user: req.user.id,
      type: "income",
    });

    const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
    const totalIncome = incomes.reduce((s, e) => s + e.amount, 0);

    res.json({
      totalExpense,
      totalIncome,
      balance: totalIncome - totalExpense,
      totalTransactions: expenses.length + incomes.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET monthly data (last 6 months)
router.get("/monthly", authMiddleware, async (req, res) => {
  try {
    const results = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0,
        23,
        59,
        59,
      );

      const label = date.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });

      const expenses = await Expense.find({
        user: req.user.id,
        type: "expense",
        date: { $gte: start, $lte: end },
      });
      const incomes = await Expense.find({
        user: req.user.id,
        type: "income",
        date: { $gte: start, $lte: end },
      });

      results.push({
        month: label,
        expense: expenses.reduce((s, e) => s + e.amount, 0),
        income: incomes.reduce((s, e) => s + e.amount, 0),
      });
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET breakdown by category
router.get("/by-category", authMiddleware, async (req, res) => {
  try {
    const data = await Expense.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user.id),
          type: "expense",
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.json(data.map((d) => ({ category: d._id, total: d.total })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET activity heatmap data (last 365 days)
router.get("/heatmap", authMiddleware, async (req, res) => {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);
    oneYearAgo.setHours(0, 0, 0, 0);

    const items = await Expense.find({
      user: req.user.id,
      date: { $gte: oneYearAgo },
    });

    const activityMap = {};

    items.forEach((item) => {
      const dateKey = new Date(item.date).toISOString().split("T")[0];
      if (!activityMap[dateKey]) {
        activityMap[dateKey] = { count: 0, totalExpense: 0, totalIncome: 0 };
      }
      activityMap[dateKey].count += 1;
      if (item.type === "income") {
        activityMap[dateKey].totalIncome += item.amount;
      } else {
        activityMap[dateKey].totalExpense += item.amount;
      }
    });

    res.json({
      startDate: oneYearAgo.toISOString().split("T")[0],
      totalItems: items.length,
      activity: activityMap,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET — AI Spending Prediction & Forecast (ML Model)
router.get("/predictions", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id ? req.user._id : req.user.id;

    const [expenses, budgets, user] = await Promise.all([
      Expense.find({ user: userId, type: "expense" }).sort({ date: 1 }),
      Budget.find({ user: userId }),
      User.findById(userId).select("monthlySpendingThreshold"),
    ]);

    const threshold =
      user?.monthlySpendingThreshold?.enabled &&
      user.monthlySpendingThreshold.limit > 0
        ? user.monthlySpendingThreshold.limit
        : 0;

    const prediction = await predictSpending(expenses, budgets, threshold);
    res.json(prediction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET — Financial Health Index (0-100 Score & 4 Pillars)
router.get("/financial-health", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id ? req.user._id : req.user.id;

    const [allExpenses, budgets, groups] = await Promise.all([
      Expense.find({ user: userId }),
      Budget.find({ user: userId }),
      Group.find({ members: userId }),
    ]);

    const expenses = allExpenses.filter((e) => e.type === "expense");
    const incomes = allExpenses.filter((e) => e.type === "income");

    const totalExpense = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    const totalIncome = incomes.reduce((s, e) => s + Number(e.amount || 0), 0);
    const netBalance = totalIncome - totalExpense;

    // --- 1. Pillar 1: Savings Discipline (Max 30 pts) ---
    let savingsScore = 0;
    let savingsDetails = "";
    if (totalIncome > 0) {
      const rate = ((totalIncome - totalExpense) / totalIncome) * 100;
      if (rate >= 30) {
        savingsScore = 30;
        savingsDetails = `Excellent savings rate of ${rate.toFixed(1)}%`;
      } else if (rate >= 20) {
        savingsScore = 24;
        savingsDetails = `Healthy savings rate of ${rate.toFixed(1)}%`;
      } else if (rate >= 10) {
        savingsScore = 18;
        savingsDetails = `Moderate savings rate of ${rate.toFixed(1)}%`;
      } else if (rate >= 0) {
        savingsScore = 12;
        savingsDetails = `Tight savings margin (${rate.toFixed(1)}%)`;
      } else {
        savingsScore = 5;
        savingsDetails = `Deficit: spending exceeds income by ${Math.abs(rate).toFixed(1)}%`;
      }
    } else {
      savingsScore = totalExpense > 0 ? 14 : 20;
      savingsDetails = "Log monthly income to unlock complete savings score";
    }

    // --- 2. Pillar 2: Budget Control (Max 25 pts) ---
    let budgetScore = 0;
    let budgetDetails = "";
    if (budgets.length > 0) {
      const withinBudgetCount = budgets.filter((b) => (b.spent || 0) <= b.limit).length;
      const complianceRatio = withinBudgetCount / budgets.length;
      if (complianceRatio === 1) {
        budgetScore = 25;
        budgetDetails = `All ${budgets.length} category budgets respected`;
      } else if (complianceRatio >= 0.75) {
        budgetScore = 19;
        budgetDetails = `${withinBudgetCount} of ${budgets.length} budgets on track`;
      } else if (complianceRatio >= 0.5) {
        budgetScore = 13;
        budgetDetails = `${budgets.length - withinBudgetCount} budgets exceeded`;
      } else {
        budgetScore = 6;
        budgetDetails = `Multiple budgets exceeded limits`;
      }
    } else {
      budgetScore = 16;
      budgetDetails = "No category budgets configured yet";
    }

    // --- 3. Pillar 3: Debt & Group Safety (Max 25 pts) ---
    let netGroupDebt = 0;
    groups.forEach((g) => {
      (g.expenses || []).forEach((exp) => {
        if (exp.isSettlement) return;
        const paidByMe = exp.paidBy?.toString() === userId.toString();
        const mySplit = (exp.splitBetween || []).find(
          (s) => s.user?.toString() === userId.toString()
        );
        if (paidByMe) {
          const othersOwe = exp.amount - (mySplit?.share || 0);
          netGroupDebt -= othersOwe;
        } else if (mySplit && !mySplit.settled) {
          const unpaid = mySplit.share - (mySplit.settledAmount || 0);
          netGroupDebt += Math.max(0, unpaid);
        }
      });
    });

    let debtScore = 0;
    let debtDetails = "";
    if (netGroupDebt <= 0) {
      debtScore = 25;
      debtDetails = netGroupDebt < 0 ? "Friends owe you in group splits" : "Zero pending group debts";
    } else if (netGroupDebt <= 1000) {
      debtScore = 20;
      debtDetails = `Low group debt (₹${Math.round(netGroupDebt)} pending)`;
    } else if (netGroupDebt <= 5000) {
      debtScore = 14;
      debtDetails = `Moderate group debt (₹${Math.round(netGroupDebt)} pending)`;
    } else {
      debtScore = 7;
      debtDetails = `High group debt (₹${Math.round(netGroupDebt)} pending)`;
    }

    // --- 4. Pillar 4: Cash Buffer Runway (Max 20 pts) ---
    let runwayScore = 0;
    let runwayDetails = "";
    const monthlyBurn = totalExpense > 0 ? totalExpense / 2 : 5000;
    const runwayMonths = monthlyBurn > 0 ? netBalance / monthlyBurn : 1;

    if (runwayMonths >= 3) {
      runwayScore = 20;
      runwayDetails = `Over 3 months of expense runway available`;
    } else if (runwayMonths >= 1.5) {
      runwayScore = 16;
      runwayDetails = `${runwayMonths.toFixed(1)} months of emergency buffer`;
    } else if (runwayMonths >= 0.5) {
      runwayScore = 11;
      runwayDetails = `${(runwayMonths * 30).toFixed(0)} days of expense buffer`;
    } else {
      runwayScore = 5;
      runwayDetails = "Low cash buffer reserves";
    }

    const totalScore = Math.min(
      100,
      Math.max(0, Math.round(savingsScore + budgetScore + debtScore + runwayScore))
    );

    let grade = "C";
    let tier = "Needs Attention";
    let color = "#ef4444";
    if (totalScore >= 85) {
      grade = "A+";
      tier = "Excellent";
      color = "#10b981";
    } else if (totalScore >= 70) {
      grade = "A";
      tier = "Strong";
      color = "#3b82f6";
    } else if (totalScore >= 55) {
      grade = "B";
      tier = "Moderate";
      color = "#f59e0b";
    }

    const actionableTips = [];
    if (savingsScore < 24) {
      actionableTips.push("Increase your savings buffer by keeping total spending under 75% of income.");
    }
    if (budgets.length === 0) {
      actionableTips.push("Configure monthly category limits under Budget to gain up to +9 points.");
    } else if (budgetScore < 20) {
      actionableTips.push("Bring over-budget categories back under their limits to boost your score.");
    }
    if (debtScore < 20) {
      actionableTips.push("Settle outstanding group balances using Simplify Debts to gain +6 to +11 points.");
    }
    if (runwayScore < 15) {
      actionableTips.push("Build a 2-month cash cushion to protect against unexpected expenses.");
    }
    if (actionableTips.length === 0) {
      actionableTips.push("Outstanding financial discipline! Maintain your current savings and budget pacing.");
    }

    res.json({
      score: totalScore,
      grade,
      tier,
      color,
      pillars: {
        savings: { score: savingsScore, max: 30, label: "Savings Discipline", details: savingsDetails },
        budget: { score: budgetScore, max: 25, label: "Budget Control", details: budgetDetails },
        debt: { score: debtScore, max: 25, label: "Debt Safety", details: debtDetails },
        runway: { score: runwayScore, max: 20, label: "Cash Buffer", details: runwayDetails },
      },
      actionableTips: actionableTips.slice(0, 3),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET Emotional & Mood-Driven Spending Intelligence
router.get("/mood-spending", authMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find({
      user: req.user.id,
      type: "expense",
    }).sort({ date: -1 });

    const MOOD_CONFIG = {
      Calm: { emoji: "🧘", label: "Calm & Mindful", color: "#10b981", isTrigger: false },
      Happy: { emoji: "😊", label: "Happy & Rewarding", color: "#3b82f6", isTrigger: false },
      Social: { emoji: "🥳", label: "Social & Gatherings", color: "#8b5cf6", isTrigger: false },
      Bored: { emoji: "🥱", label: "Boredom Shopping", color: "#f59e0b", isTrigger: true },
      Stressed: { emoji: "😫", label: "Stress Retail Therapy", color: "#f97316", isTrigger: true },
      Impulsive: { emoji: "⚡", label: "Impulse & Unplanned", color: "#ef4444", isTrigger: true },
      Other: { emoji: "📦", label: "Routine & Other", color: "#64748b", isTrigger: false },
    };

    const totalSpent = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    // Group by mood
    const grouped = {};
    Object.keys(MOOD_CONFIG).forEach((m) => {
      grouped[m] = {
        mood: m,
        emoji: MOOD_CONFIG[m].emoji,
        label: MOOD_CONFIG[m].label,
        color: MOOD_CONFIG[m].color,
        isTrigger: MOOD_CONFIG[m].isTrigger,
        count: 0,
        totalAmount: 0,
        percentage: 0,
      };
    });

    expenses.forEach((e) => {
      const moodKey = MOOD_CONFIG[e.mood] ? e.mood : "Calm";
      grouped[moodKey].count += 1;
      grouped[moodKey].totalAmount += Number(e.amount) || 0;
    });

    // Compute percentages
    let triggerSpendingAmount = 0;
    const moodList = Object.values(grouped).map((item) => {
      const pct = totalSpent > 0 ? (item.totalAmount / totalSpent) * 100 : 0;
      if (item.isTrigger) {
        triggerSpendingAmount += item.totalAmount;
      }
      return {
        ...item,
        totalAmount: Math.round(item.totalAmount),
        percentage: Math.round(pct * 10) / 10,
        averageAmount: item.count > 0 ? Math.round(item.totalAmount / item.count) : 0,
      };
    }).sort((a, b) => b.totalAmount - a.totalAmount);

    const triggerPercentage = totalSpent > 0
      ? Math.round((triggerSpendingAmount / totalSpent) * 100)
      : 0;

    // Behavioral Insights
    const insights = [];
    const impulsiveData = grouped["Impulsive"];
    const stressedData = grouped["Stressed"];
    const boredData = grouped["Bored"];
    const calmData = grouped["Calm"];

    if (impulsiveData.totalAmount > 0) {
      insights.push({
        type: "warning",
        title: "Impulse Buying Alert",
        text: `₹${impulsiveData.totalAmount.toLocaleString()} (${Math.round((impulsiveData.totalAmount / (totalSpent || 1)) * 100)}% of spending) was made on spontaneous impulse. A 24-hour waiting rule can curb this.`,
      });
    }

    if (stressedData.totalAmount > 0) {
      insights.push({
        type: "caution",
        title: "Stress Retail Therapy",
        text: `You've spent ₹${stressedData.totalAmount.toLocaleString()} across ${stressedData.count} purchase(s) while feeling stressed. Notice when tough days trigger shopping habits.`,
      });
    }

    if (boredData.totalAmount > 0) {
      insights.push({
        type: "info",
        title: "Boredom Purchases",
        text: `₹${boredData.totalAmount.toLocaleString()} occurred while bored. Keeping delivery and shopping apps off your home screen can reduce mindless browsing.`,
      });
    }

    if (calmData.totalAmount / (totalSpent || 1) >= 0.5) {
      insights.push({
        type: "success",
        title: "Mindful Spending Champion",
        text: `Over 50% of your expenses were made with a calm, planned mindset. Excellent behavioral control!`,
      });
    }

    if (insights.length === 0) {
      insights.push({
        type: "info",
        title: "Start Tracking Your Spending Moods",
        text: "Select how you feel whenever you log an expense (Happy, Stressed, Impulsive) to see deep psychological spending patterns.",
      });
    }

    res.json({
      totalSpent: Math.round(totalSpent),
      triggerSpendingAmount: Math.round(triggerSpendingAmount),
      triggerPercentage,
      moodBreakdown: moodList,
      insights,
      recentTagged: expenses.slice(0, 10).map((e) => ({
        id: e._id,
        title: e.title,
        amount: e.amount,
        category: e.category,
        date: e.date,
        mood: e.mood || "Calm",
        emoji: MOOD_CONFIG[e.mood]?.emoji || "🧘",
        color: MOOD_CONFIG[e.mood]?.color || "#10b981",
      })),
    });
  } catch (err) {
    console.error("Mood spending error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

