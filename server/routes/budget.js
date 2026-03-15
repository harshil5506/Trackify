const express = require("express");
const router = express.Router();
const Budget = require("../models/Budget");
const Expense = require("../models/Expense");
const auth = require("../middleware/authMiddleware");

router.use(auth);

router.get("/", async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0,7);
    const budgets = await Budget.find({ userId: req.user._id, month });
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth()+1, 0);
    const budgetsWithSpent = await Promise.all(budgets.map(async (b) => {
      const expenses = await Expense.find({ userId: req.user._id, category: b.category, type:"expense", date: { $gte: monthStart, $lte: monthEnd } });
      const spent = expenses.reduce((s,e) => s+e.amount, 0);
      return { ...b.toObject(), spent };
    }));
    res.json(budgetsWithSpent);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

router.post("/", async (req, res) => {
  try {
    const { category, limit, month } = req.body;
    const currentMonth = month || new Date().toISOString().slice(0,7);
    const existing = await Budget.findOne({ userId: req.user._id, category, month: currentMonth });
    if (existing) { existing.limit = limit; await existing.save(); return res.json(existing); }
    const budget = await Budget.create({ userId: req.user._id, category, limit, month: currentMonth });
    res.status(201).json(budget);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

router.put("/:id", async (req, res) => {
  try {
    const budget = await Budget.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, { new: true });
    if (!budget) return res.status(404).json({ message: "Not found" });
    res.json(budget);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

router.delete("/:id", async (req, res) => {
  try {
    await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

module.exports = router;
