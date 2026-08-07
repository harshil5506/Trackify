const mongoose = require("mongoose");

const groupExpenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  splitBetween: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      share: { type: Number }, // amount owed
      settledAmount: { type: Number, default: 0 },
      settled: { type: Boolean, default: false },
    },
  ],
  date: { type: Date, default: Date.now },
});

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    expenses: [groupExpenseSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Group", groupSchema);
