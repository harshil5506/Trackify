const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const authMiddleware = require("../middleware/authMiddleware");

// GET all expenses for logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { type, category, startDate, endDate } = req.query;
    let filter = { user: req.user.id };

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST add new expense/income
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, amount, category, type, date, note } = req.body;
    const normalizedAmount = Number(amount);

    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    const expense = await Expense.create({
      user: req.user.id,
      title,
      amount: normalizedAmount,
      category,
      type,
      date,
      note,
    });

    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update expense
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    if (expense.user.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    if (Object.prototype.hasOwnProperty.call(req.body, "amount")) {
      const normalizedAmount = Number(req.body.amount);
      if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
        return res
          .status(400)
          .json({ message: "Amount must be greater than 0" });
      }
      req.body.amount = normalizedAmount;
    }

    const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE expense
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    if (expense.user.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    await expense.deleteOne();
    res.json({ message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
