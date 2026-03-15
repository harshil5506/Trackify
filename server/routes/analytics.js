const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const auth = require("../middleware/authMiddleware");

router.use(auth);

router.get("/summary", async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id });
    const totalIncome = expenses.filter(e=>e.type==="income").reduce((s,e)=>s+e.amount,0);
    const totalExpense = expenses.filter(e=>e.type==="expense").reduce((s,e)=>s+e.amount,0);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthly = expenses.filter(e=>new Date(e.date)>=monthStart);
    const monthlyIncome = monthly.filter(e=>e.type==="income").reduce((s,e)=>s+e.amount,0);
    const monthlyExpense = monthly.filter(e=>e.type==="expense").reduce((s,e)=>s+e.amount,0);
    res.json({ totalIncome, totalExpense, netBalance: totalIncome-totalExpense, monthlyIncome, monthlyExpense, monthlySavings: monthlyIncome-monthlyExpense });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

router.get("/monthly", async (req, res) => {
  try {
    const months = [];
    for (let i=5; i>=0; i--) {
      const date = new Date(); date.setMonth(date.getMonth()-i);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth()+1, 0);
      const label = date.toLocaleString("default", { month:"short" });
      const expenses = await Expense.find({ userId: req.user._id, date: { $gte: start, $lte: end } });
      const income = expenses.filter(e=>e.type==="income").reduce((s,e)=>s+e.amount,0);
      const expense = expenses.filter(e=>e.type==="expense").reduce((s,e)=>s+e.amount,0);
      months.push({ label, income, expense });
    }
    res.json(months);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

router.get("/by-category", async (req, res) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const expenses = await Expense.find({ userId: req.user._id, type:"expense", date: { $gte: monthStart } });
    const categoryMap = {};
    expenses.forEach(e => { categoryMap[e.category] = (categoryMap[e.category]||0)+e.amount; });
    res.json(Object.entries(categoryMap).map(([category, amount]) => ({ category, amount })));
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

module.exports = router;
