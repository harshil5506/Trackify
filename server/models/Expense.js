const mongoose = require("mongoose");

const VALID_CATEGORIES = [
  "Food",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Education",
  "Rent",
  "Business",
  "Job",
  "Part-Time Job",
  "Stock Market",
  "Freelancing",
  "Investments",
  "Rental Income",
  "Passive Income",
  "Salary",
  "Freelance",
  "Investment",
  "Other",
];

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      default: "Transaction",
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      default: "Other",
      set: (v) => (VALID_CATEGORIES.includes(v) ? v : "Other"),
    },
    paymentMethod: {
      type: String,
      default: "Cash",
      trim: true,
    },
    merchant: {
      type: String,
      default: "",
      trim: true,
    },
    source: {
      type: String,
      enum: ["personal", "group", "friend"],
      default: "personal",
    },
    type: {
      type: String,
      enum: ["expense", "income"],
      default: "expense",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);

