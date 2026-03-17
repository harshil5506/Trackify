const express = require("express");
const router = express.Router();
const Budget = require("../models/Budget");
const Expense = require("../models/Expense");
const authMiddleware = require("../middleware/authMiddleware");

// GET all budgets with spent calculation
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { month } = req.query; // e.g. "2024-06"
    const filter = { user: req.user.id };
    if (month) filter.month = month;

    const budgets = await Budget.find(filter);

    // For each budget, calculate how much has been spent
    const result = await Promise.all(
      budgets.map(async (b) => {
        const [year, mon] = b.month.split("-");
        const start = new Date(year, mon - 1, 1);
        const end = new Date(year, mon, 0, 23, 59, 59);

        const expenses = await Expense.find({
          user: req.user.id,
          category: b.category,
          type: "expense",
          date: { $gte: start, $lte: end },
        });

        const spent = expenses.reduce((sum, e) => sum + e.amount, 0);

        return {
          ...b._doc,
          spent,
          remaining: b.limit - spent,
          percentage: Math.min(Math.round((spent / b.limit) * 100), 100),
        };
      }),
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create budget
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { category, limit, month } = req.body;

    // Prevent duplicate budget for same category + month
    const existing = await Budget.findOne({
      user: req.user.id,
      category,
      month,
    });
    if (existing)
      return res.status(400).json({
        message: "Budget for this category and month already exists",
      });

    const budget = await Budget.create({
      user: req.user.id,
      category,
      limit,
      month,
    });

    res.status(201).json(budget);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update budget
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) return res.status(404).json({ message: "Budget not found" });

    if (budget.user.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    const updated = await Budget.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE budget
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) return res.status(404).json({ message: "Budget not found" });

    if (budget.user.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    await budget.deleteOne();
    res.json({ message: "Budget deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
