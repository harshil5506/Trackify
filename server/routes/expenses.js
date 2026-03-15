const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const auth = require("../middleware/authMiddleware");

router.use(auth);

router.post("/", async (req, res) => {
  try {
    const { amount, category, type, date, note, merchant, paymentMethod } = req.body;
    const expense = await Expense.create({ userId: req.user._id, amount, category, type, date: date||Date.now(), note, merchant, paymentMethod });
    res.status(201).json(expense);
  } catch (err) { res.status(500).json({ message: "Server error", error: err.message }); }
});

router.get("/", async (req, res) => {
  try {
    const { category, type, startDate, endDate, limit } = req.query;
    const filter = { userId: req.user._id };
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (startDate || endDate) { filter.date = {}; if (startDate) filter.date.$gte = new Date(startDate); if (endDate) filter.date.$lte = new Date(endDate); }
    const expenses = await Expense.find(filter).sort({ date: -1 }).limit(limit ? parseInt(limit) : 100);
    const all = await Expense.find({ userId: req.user._id });
    const totalIncome = all.filter(e => e.type==="income").reduce((s,e) => s+e.amount, 0);
    const totalExpense = all.filter(e => e.type==="expense").reduce((s,e) => s+e.amount, 0);
    res.json({ expenses, totalIncome, totalExpense });
  } catch (err) { res.status(500).json({ message: "Server error", error: err.message }); }
});

router.put("/:id", async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, { new: true });
    if (!expense) return res.status(404).json({ message: "Not found" });
    res.json(expense);
  } catch (err) { res.status(500).json({ message: "Server error", error: err.message }); }
});

router.delete("/:id", async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!expense) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ message: "Server error", error: err.message }); }
});

module.exports = router;
