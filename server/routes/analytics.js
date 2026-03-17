const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const authMiddleware = require("../middleware/authMiddleware");

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

module.exports = router;
