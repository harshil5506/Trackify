const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Expense = require("../models/Expense");
const auth = require("../middleware/authMiddleware");

router.use(auth);

router.get("/profile", async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/profile", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      city,
      state,
      zip,
      country,
      currency,
      language,
      timezone,
      avatar,
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (email && email !== user.email) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email.toLowerCase();
    }

    if (typeof name === "string") user.name = name.trim();
    if (typeof phone === "string") user.phone = phone.trim();
    if (typeof address === "string") user.address = address.trim();
    if (typeof city === "string") user.city = city.trim();
    if (typeof state === "string") user.state = state.trim();
    if (typeof zip === "string") user.zip = zip.trim();
    if (typeof country === "string") user.country = country.trim();
    if (typeof currency === "string") user.currency = currency.trim();
    if (typeof language === "string") user.language = language.trim();
    if (typeof timezone === "string") user.timezone = timezone.trim();
    if (typeof avatar === "string") user.avatar = avatar.trim();

    await user.save();

    const profile = await User.findById(req.user.id).select("-password");
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET quiz result
router.get("/quiz-result", async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("spendingPersonality");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.spendingPersonality || {});
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST quiz result
router.post("/quiz-result", async (req, res) => {
  try {
    const payload = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (payload.dimensions && payload.dualityAnalysis) {
      user.spendingPersonality = {
        ...payload,
        completedAt: new Date(),
      };
    } else {
      user.spendingPersonality = {
        ...(user.spendingPersonality || {}),
        archetype: payload.archetype || "",
        title: payload.title || "",
        badge: payload.badge || "",
        score: Number(payload.score || 0),
        completedAt: new Date(),
      };
    }

    user.markModified("spendingPersonality");
    await user.save();
    res.json({ message: "Quiz result saved", spendingPersonality: user.spendingPersonality });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── Monthly Spending Threshold Routes ──
router.get("/spending-threshold", async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const thresholdStatus = await computeThresholdStatus(user);
    res.json(thresholdStatus);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.put("/spending-threshold", async (req, res) => {
  try {
    const { limit, warningThresholdPct, enabled } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.monthlySpendingThreshold) {
      user.monthlySpendingThreshold = { limit: 50000, warningThresholdPct: 80, enabled: true };
    }

    if (limit !== undefined && !isNaN(Number(limit)) && Number(limit) > 0) {
      user.monthlySpendingThreshold.limit = Number(limit);
    }
    if (
      warningThresholdPct !== undefined &&
      !isNaN(Number(warningThresholdPct)) &&
      Number(warningThresholdPct) > 0 &&
      Number(warningThresholdPct) <= 100
    ) {
      user.monthlySpendingThreshold.warningThresholdPct = Number(warningThresholdPct);
    }
    if (enabled !== undefined) {
      user.monthlySpendingThreshold.enabled = Boolean(enabled);
    }

    user.markModified("monthlySpendingThreshold");
    await user.save();

    const thresholdStatus = await computeThresholdStatus(user);
    res.json({
      message: "Monthly spending threshold updated successfully",
      threshold: thresholdStatus,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

async function computeThresholdStatus(user) {
  const threshold = user.monthlySpendingThreshold || {
    limit: 50000,
    warningThresholdPct: 80,
    enabled: true,
  };

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const expenses = await Expense.find({
    user: user._id,
    type: "expense",
    date: { $gte: startOfMonth, $lte: endOfMonth },
  }).lean();

  const currentMonthSpent = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const limit = Number(threshold.limit) || 50000;
  const warningPct = Number(threshold.warningThresholdPct) || 80;
  const percentage = limit > 0 ? (currentMonthSpent / limit) * 100 : 0;
  const remaining = Math.max(0, limit - currentMonthSpent);

  const totalDays = endOfMonth.getDate();
  const daysPassed = now.getDate();
  const daysRemaining = Math.max(1, totalDays - daysPassed);
  const dailySafeVelocity = Math.round((remaining / daysRemaining) * 10) / 10;

  let status = "safe";
  if (percentage >= 100) {
    status = "breached";
  } else if (percentage >= warningPct) {
    status = "warning";
  }

  return {
    limit,
    warningThresholdPct: warningPct,
    enabled: threshold.enabled !== false,
    spent: Math.round(currentMonthSpent * 100) / 100,
    remaining: Math.round(remaining * 100) / 100,
    percentage: Math.round(percentage * 10) / 10,
    status,
    daysRemaining,
    dailySafeVelocity,
    monthName: now.toLocaleString("default", { month: "long", year: "numeric" }),
  };
}

module.exports = router;
