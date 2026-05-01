const mongoose = require("mongoose");
const expenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  category: { type: String, enum: ["Food","Transportation","Shopping","Entertainment","Bills & Utilities","Healthcare","Salary","Freelance","Investment","Other"], default: "Other" },
  type: { type: String, enum: ["expense","income"], default: "expense" },
  date: { type: Date, default: Date.now },
  note: { type: String, default: "" },
  merchant: { type: String, default: "" },
  paymentMethod: { type: String, default: "Cash" },
}, { timestamps: true });
module.exports = mongoose.model("Expense", expenseSchema);
