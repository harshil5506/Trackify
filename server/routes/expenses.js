const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const authMiddleware = require("../middleware/authMiddleware");

// GET all expenses for logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { type, category, startDate, endDate, limit } = req.query;
    let filter = { user: req.user.id };

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    let query = Expense.find(filter).sort({ date: -1 });
    if (limit && !isNaN(Number(limit))) {
      query = query.limit(Number(limit));
    }

    const expenses = await query;
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST add new expense/income
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, amount, category, type, date, note, paymentMethod, merchant } = req.body;
    const normalizedAmount = Number(amount);

    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    const expense = await Expense.create({
      user: req.user.id,
      title: title || note || merchant || category || "Transaction",
      amount: normalizedAmount,
      category: category || "Other",
      type: type || "expense",
      date: date || new Date(),
      note: note || "",
      paymentMethod: paymentMethod || "Cash",
      merchant: merchant || "",
    });

    res.status(201).json(expense);
  } catch (err) {
    console.error("Expense creation error:", err);
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
