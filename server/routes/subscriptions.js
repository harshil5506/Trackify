const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Subscription = require("../models/Subscription");
const Expense = require("../models/Expense");

// Helper to normalize amount to monthly equivalent
const toMonthlyAmount = (amount, cycle) => {
  const num = Number(amount) || 0;
  switch (cycle) {
    case "yearly":
      return num / 12;
    case "quarterly":
      return num / 3;
    case "weekly":
      return num * 4.333;
    case "monthly":
    default:
      return num;
  }
};

// @route   GET /api/subscriptions
// @desc    Get all user subscriptions with analytics & burn rate
router.get("/", auth, async (req, res) => {
  try {
    const subs = await Subscription.find({ user: req.user.id }).sort({
      nextBillingDate: 1,
    });

    const now = new Date();
    let totalMonthlyBurn = 0;
    let dueThisWeekCount = 0;
    let dueSoonItems = [];

    const decorated = subs.map((s) => {
      const obj = s.toObject();
      const billingDate = new Date(obj.nextBillingDate);
      const diffTime = billingDate.getTime() - now.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const monthlyCost = toMonthlyAmount(obj.amount, obj.billingCycle);

      if (obj.status === "active") {
        totalMonthlyBurn += monthlyCost;
        if (daysLeft >= 0 && daysLeft <= 7) {
          dueThisWeekCount++;
          dueSoonItems.push(obj);
        }
      }

      return {
        ...obj,
        daysLeft,
        isOverdue: daysLeft < 0,
        isDueSoon: daysLeft >= 0 && daysLeft <= 3,
        monthlyNormalized: Math.round(monthlyCost * 100) / 100,
      };
    });

    res.json({
      subscriptions: decorated,
      summary: {
        totalSubscriptions: subs.length,
        activeCount: subs.filter((s) => s.status === "active").length,
        totalMonthlyBurn: Math.round(totalMonthlyBurn * 100) / 100,
        totalYearlyBurn: Math.round(totalMonthlyBurn * 12 * 100) / 100,
        dueThisWeekCount,
        dueSoonItems,
      },
    });
  } catch (err) {
    console.error("Error fetching subscriptions:", err);
    res.status(500).json({ error: "Failed to load subscriptions" });
  }
});

// @route   POST /api/subscriptions
// @desc    Create a new subscription
router.post("/", auth, async (req, res) => {
  try {
    const {
      name,
      amount,
      billingCycle,
      category,
      nextBillingDate,
      paymentMethod,
      icon,
      color,
      notes,
    } = req.body;

    if (!name || !amount || !nextBillingDate) {
      return res.status(400).json({
        error: "Subscription name, amount, and next billing date are required",
      });
    }

    const newSub = new Subscription({
      user: req.user.id,
      name: name.trim(),
      amount: Number(amount),
      billingCycle: billingCycle || "monthly",
      category: category || "Entertainment",
      nextBillingDate: new Date(nextBillingDate),
      paymentMethod: paymentMethod || "Card / UPI",
      icon: icon || "📱",
      color: color || "#1a2ea8",
      notes: notes ? notes.trim() : "",
      status: "active",
    });

    const saved = await newSub.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Error creating subscription:", err);
    res.status(500).json({ error: "Failed to create subscription" });
  }
});

// @route   PUT /api/subscriptions/:id
// @desc    Update a subscription
router.put("/:id", auth, async (req, res) => {
  try {
    const sub = await Subscription.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!sub) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    const {
      name,
      amount,
      billingCycle,
      category,
      nextBillingDate,
      status,
      paymentMethod,
      icon,
      color,
      notes,
    } = req.body;

    if (name) sub.name = name.trim();
    if (amount !== undefined) sub.amount = Number(amount);
    if (billingCycle) sub.billingCycle = billingCycle;
    if (category) sub.category = category;
    if (nextBillingDate) sub.nextBillingDate = new Date(nextBillingDate);
    if (status) sub.status = status;
    if (paymentMethod) sub.paymentMethod = paymentMethod;
    if (icon) sub.icon = icon;
    if (color) sub.color = color;
    if (notes !== undefined) sub.notes = notes.trim();

    const updated = await sub.save();
    res.json(updated);
  } catch (err) {
    console.error("Error updating subscription:", err);
    res.status(500).json({ error: "Failed to update subscription" });
  }
});

// @route   DELETE /api/subscriptions/:id
// @desc    Delete a subscription
router.delete("/:id", auth, async (req, res) => {
  try {
    const sub = await Subscription.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!sub) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    res.json({ message: "Subscription deleted successfully" });
  } catch (err) {
    console.error("Error deleting subscription:", err);
    res.status(500).json({ error: "Failed to delete subscription" });
  }
});

// @route   POST /api/subscriptions/:id/renew
// @desc    Mark subscription as paid, advance next billing date, and optionally record expense
router.post("/:id/renew", auth, async (req, res) => {
  try {
    const sub = await Subscription.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!sub) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    const { recordExpense = true } = req.body;

    // Optional: create expense record so user ledger is in sync
    if (recordExpense) {
      await Expense.create({
        user: req.user.id,
        title: `${sub.name} (Subscription)`,
        amount: sub.amount,
        category: sub.category === "Entertainment" ? "Entertainment" : "Bills & Utilities",
        paymentMethod: sub.paymentMethod || "Card / UPI",
        merchant: sub.name,
        type: "expense",
        date: new Date(),
        note: `Automatic renewal for ${sub.billingCycle} cycle`,
      });
    }

    // Advance next billing date
    const nextDate = new Date(sub.nextBillingDate);
    if (sub.billingCycle === "yearly") {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    } else if (sub.billingCycle === "quarterly") {
      nextDate.setMonth(nextDate.getMonth() + 3);
    } else if (sub.billingCycle === "weekly") {
      nextDate.setDate(nextDate.getDate() + 7);
    } else {
      // Monthly default
      nextDate.setMonth(nextDate.getMonth() + 1);
    }

    sub.nextBillingDate = nextDate;
    const updated = await sub.save();

    res.json({
      message: "Subscription renewed and billing date advanced! 🎉",
      subscription: updated,
    });
  } catch (err) {
    console.error("Error renewing subscription:", err);
    res.status(500).json({ error: "Failed to renew subscription" });
  }
});

// Known service matching table
const KNOWN_SERVICES = [
  { match: /netflix/i, name: "Netflix", icon: "🎬", category: "Entertainment", color: "#e50914" },
  { match: /spotify/i, name: "Spotify", icon: "🎵", category: "Entertainment", color: "#1db954" },
  { match: /prime|amazon prime/i, name: "Amazon Prime", icon: "📦", category: "Entertainment", color: "#00a8e1" },
  { match: /hotstar|disney/i, name: "Disney+ Hotstar", icon: "✨", category: "Entertainment", color: "#113ccf" },
  { match: /youtube/i, name: "YouTube Premium", icon: "▶️", category: "Entertainment", color: "#ff0000" },
  { match: /gym|fitness|cult\.fit|workout/i, name: "Gym & Fitness", icon: "💪", category: "Healthcare", color: "#f97316" },
  { match: /rent|flat|pg rent/i, name: "House Rent", icon: "🏠", category: "Rent", color: "#6366f1" },
  { match: /wi-?fi|fiber|broadband|airtel xstream|jiofiber/i, name: "Wi-Fi & Broadband", icon: "🌐", category: "Bills & Utilities", color: "#06b6d4" },
  { match: /electricity|power bill|bijli/i, name: "Electricity Bill", icon: "⚡", category: "Bills & Utilities", color: "#eab308" },
  { match: /recharge|jio|airtel|vi mobile/i, name: "Mobile Plan", icon: "📱", category: "Bills & Utilities", color: "#10b981" },
  { match: /icloud|apple/i, name: "Apple iCloud", icon: "☁️", category: "Bills & Utilities", color: "#64748b" },
  { match: /google one|drive/i, name: "Google One", icon: "💾", category: "Bills & Utilities", color: "#4285f4" },
  { match: /chatgpt|openai/i, name: "ChatGPT Plus", icon: "🤖", category: "Bills & Utilities", color: "#10a37f" },
  { match: /github/i, name: "GitHub Copilot", icon: "🐙", category: "Bills & Utilities", color: "#24292e" },
  { match: /canva/i, name: "Canva Pro", icon: "🎨", category: "Bills & Utilities", color: "#00c4cc" },
];

// @route   GET /api/subscriptions/detect
// @desc    Scan user expenses to automatically detect recurring subscriptions & bills
router.get("/detect", auth, async (req, res) => {
  try {
    // 1. Fetch user existing subscriptions so we don't suggest ones already tracked
    const existing = await Subscription.find({ user: req.user.id }).select("name");
    const existingNames = new Set(
      existing.map((s) => s.name.toLowerCase().trim())
    );

    // 2. Fetch past expenses
    const expenses = await Expense.find({
      user: req.user.id,
      type: "expense",
    }).sort({ date: -1 });

    const detected = [];
    const seenDetectedNames = new Set();

    // Group expenses by title / merchant / note keywords
    const groupedByTitle = {};

    for (const exp of expenses) {
      const rawText = `${exp.title || ""} ${exp.merchant || ""} ${exp.note || ""}`.trim();
      const normText = rawText.toLowerCase();

      // Check if matches known subscription services
      for (const service of KNOWN_SERVICES) {
        if (service.match.test(rawText)) {
          const serviceNameLower = service.name.toLowerCase();
          if (!existingNames.has(serviceNameLower) && !seenDetectedNames.has(serviceNameLower)) {
            seenDetectedNames.add(serviceNameLower);
            detected.push({
              name: service.name,
              amount: exp.amount,
              billingCycle: "monthly",
              category: service.category,
              icon: service.icon,
              color: service.color,
              confidence: "High",
              reason: `Matched known recurring subscription from recent expense "${exp.title || service.name}"`,
              lastDetectedDate: exp.date,
              suggestedNextBilling: new Date(new Date(exp.date).getTime() + 30 * 24 * 60 * 60 * 1000),
            });
          }
        }
      }

      // Group by normalized title to detect repeating payments
      const cleanTitle = (exp.title || "Expense").trim();
      if (!groupedByTitle[cleanTitle]) {
        groupedByTitle[cleanTitle] = [];
      }
      groupedByTitle[cleanTitle].push(exp);
    }

    // Check repeating transactions across different dates
    for (const [title, txns] of Object.entries(groupedByTitle)) {
      if (txns.length >= 2) {
        const titleLower = title.toLowerCase();
        if (!existingNames.has(titleLower) && !seenDetectedNames.has(titleLower)) {
          // Check if amounts are similar (within 20%)
          const amounts = txns.map((t) => t.amount);
          const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
          const isConsistent = amounts.every(
            (a) => Math.abs(a - avgAmount) / avgAmount <= 0.25
          );

          if (isConsistent) {
            seenDetectedNames.add(titleLower);
            const latestTxn = txns[0];
            detected.push({
              name: title,
              amount: Math.round(avgAmount),
              billingCycle: "monthly",
              category: latestTxn.category || "Bills & Utilities",
              icon: "🔄",
              color: "#6366f1",
              confidence: "Medium",
              reason: `Detected ${txns.length} repeated payments of ~₹${Math.round(avgAmount)} across previous records`,
              lastDetectedDate: latestTxn.date,
              suggestedNextBilling: new Date(
                new Date(latestTxn.date).getTime() + 30 * 24 * 60 * 60 * 1000
              ),
            });
          }
        }
      }
    }

    res.json({
      detectedCount: detected.length,
      detectedSubscriptions: detected,
    });
  } catch (err) {
    console.error("Error in detector:", err);
    res.status(500).json({ error: "Failed to detect subscriptions" });
  }
});

// @route   POST /api/subscriptions/import-detected
// @desc    1-Click import detected subscriptions
router.post("/import-detected", auth, async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No items provided for import" });
    }

    const createdList = [];
    for (const item of items) {
      const sub = new Subscription({
        user: req.user.id,
        name: item.name,
        amount: Number(item.amount) || 0,
        billingCycle: item.billingCycle || "monthly",
        category: item.category || "Bills & Utilities",
        nextBillingDate: item.suggestedNextBilling
          ? new Date(item.suggestedNextBilling)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        icon: item.icon || "📱",
        color: item.color || "#1a2ea8",
        status: "active",
        autoDetected: true,
      });
      await sub.save();
      createdList.push(sub);
    }

    res.status(201).json({
      message: `Successfully imported ${createdList.length} subscription(s)! 🚀`,
      imported: createdList,
    });
  } catch (err) {
    console.error("Error importing detected subscriptions:", err);
    res.status(500).json({ error: "Failed to import subscriptions" });
  }
});

module.exports = router;
