const mongoose = require("mongoose");

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
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: [
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
      ],
      default: "Other",
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
      trim: true,
    },
    merchant: {
      type: String,
      trim: true,
      default: "",
    },
    paymentMethod: {
      type: String,
      trim: true,
      default: "Cash",
    },
    currency: {
      type: String,
      trim: true,
      uppercase: true,
      default: "INR",
    },
    exchangeRate: {
      type: Number,
      default: 1.0,
    },
    baseAmount: {
      type: Number,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Expense", expenseSchema);
