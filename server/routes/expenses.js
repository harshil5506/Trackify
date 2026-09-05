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
    const {
      title,
      amount,
      category,
      type,
      date,
      note,
      merchant,
      paymentMethod,
      currency,
      exchangeRate,
      baseAmount,
    } = req.body;
    const normalizedAmount = Number(amount);

    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    const txnCurrency = (currency || "INR").toUpperCase();
    const rate = Number(exchangeRate) > 0 ? Number(exchangeRate) : 1.0;

    // Calculate baseAmount (in INR)
    let calculatedBaseAmount = normalizedAmount;
    if (baseAmount != null && Number.isFinite(Number(baseAmount)) && Number(baseAmount) > 0) {
      calculatedBaseAmount = Number(baseAmount);
    } else if (txnCurrency !== "INR") {
      calculatedBaseAmount = rate > 0 ? normalizedAmount / rate : normalizedAmount;
    }

    const expense = await Expense.create({
      user: req.user.id,
      title,
      amount: normalizedAmount,
      category,
      type,
      date,
      note,
      merchant: merchant || "",
      paymentMethod: paymentMethod || "Cash",
      currency: txnCurrency,
      exchangeRate: rate,
      baseAmount: Math.round(calculatedBaseAmount * 100) / 100,
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

    const payload = { ...req.body };

    if (Object.prototype.hasOwnProperty.call(payload, "amount")) {
      const normalizedAmount = Number(payload.amount);
      if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
        return res
          .status(400)
          .json({ message: "Amount must be greater than 0" });
      }
      payload.amount = normalizedAmount;
    }

    const effectiveAmount =
      payload.amount !== undefined ? payload.amount : expense.amount;
    const effectiveCurrency = (
      payload.currency ||
      expense.currency ||
      "INR"
    ).toUpperCase();
    const effectiveRate = Number(
      payload.exchangeRate || expense.exchangeRate || 1.0,
    );

    if (payload.baseAmount != null && Number.isFinite(Number(payload.baseAmount))) {
      payload.baseAmount = Number(payload.baseAmount);
    } else if (
      payload.amount !== undefined ||
      payload.currency !== undefined ||
      payload.exchangeRate !== undefined
    ) {
      if (effectiveCurrency === "INR") {
        payload.baseAmount = effectiveAmount;
      } else {
        payload.baseAmount =
          effectiveRate > 0
            ? Math.round((effectiveAmount / effectiveRate) * 100) / 100
            : effectiveAmount;
      }
    }

    const updated = await Expense.findByIdAndUpdate(req.params.id, payload, {
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
