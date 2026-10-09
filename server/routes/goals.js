const express = require("express");
const router = express.Router();
const Goal = require("../models/Goal");
const authMiddleware = require("../middleware/authMiddleware");

// Helper to decorate goal with smart progress metrics
function decorateGoal(goal) {
  const g = goal.toObject ? goal.toObject() : goal;
  const target = Number(g.targetAmount) || 1;
  const current = Number(g.currentAmount) || 0;
  const percentage = Math.min(100, Math.round((current / target) * 100));
  const remaining = Math.max(0, target - current);

  const now = new Date();
  const targetDate = new Date(g.targetDate);
  const diffTime = targetDate - now;
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const monthsLeft = Math.max(0.1, daysLeft / 30);
  const requiredMonthlySaving = daysLeft > 0 && remaining > 0 ? Math.round(remaining / monthsLeft) : 0;

  let status = "On Track";
  if (percentage >= 100) {
    status = "Completed";
  } else if (daysLeft < 0) {
    status = "Overdue";
  } else if (daysLeft < 30 && percentage < 50) {
    status = "Behind Schedule";
  }

  return {
    ...g,
    percentage,
    remainingAmount: remaining,
    daysLeft,
    requiredMonthlySaving,
    status,
  };
}

// GET all goals for logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ isCompleted: 1, targetDate: 1 });
    res.json(goals.map(decorateGoal));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create new goal
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, targetAmount, currentAmount = 0, category, targetDate, color, icon } = req.body;

    if (!title || !targetAmount || !targetDate) {
      return res.status(400).json({ message: "Title, target amount, and target date are required" });
    }

    const goal = await Goal.create({
      user: req.user.id,
      title: title.trim(),
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount) || 0,
      category: category || "General",
      targetDate: new Date(targetDate),
      color: color || "#1a2ea8",
      icon: icon || "🎯",
      isCompleted: Number(currentAmount) >= Number(targetAmount),
    });

    res.status(201).json(decorateGoal(goal));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST deposit contribution into goal
router.post("/:id/deposit", authMiddleware, async (req, res) => {
  try {
    const { amount, note } = req.body;
    const depositAmount = Number(amount);

    if (!depositAmount || depositAmount <= 0) {
      return res.status(400).json({ message: "Deposit amount must be greater than 0" });
    }

    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
    if (!goal) {
      return res.status(404).json({ message: "Savings goal not found" });
    }

    goal.currentAmount += depositAmount;
    goal.contributions.push({
      amount: depositAmount,
      date: new Date(),
      note: note || "Savings Deposit",
    });

    if (goal.currentAmount >= goal.targetAmount) {
      goal.isCompleted = true;
    }

    await goal.save();
    res.json(decorateGoal(goal));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update goal
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { title, targetAmount, category, targetDate, color, icon } = req.body;
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
    if (!goal) {
      return res.status(404).json({ message: "Savings goal not found" });
    }

    if (title) goal.title = title.trim();
    if (targetAmount) goal.targetAmount = Number(targetAmount);
    if (category) goal.category = category;
    if (targetDate) goal.targetDate = new Date(targetDate);
    if (color) goal.color = color;
    if (icon) goal.icon = icon;
    goal.isCompleted = goal.currentAmount >= goal.targetAmount;

    await goal.save();
    res.json(decorateGoal(goal));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE goal
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!goal) {
      return res.status(404).json({ message: "Savings goal not found" });
    }
    res.json({ message: "Savings goal deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
