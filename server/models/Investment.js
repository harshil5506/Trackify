const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    assetClass: {
      type: String,
      enum: [
        "Stocks",
        "Mutual Funds",
        "Fixed Deposit",
        "Crypto",
        "Gold",
        "Real Estate",
        "Bonds",
        "Other",
      ],
      default: "Stocks",
    },
    investedAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currentValue: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 0,
    },
    buyDate: {
      type: Date,
      default: Date.now,
    },
    institution: {
      type: String,
      default: "",
      trim: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Investment", investmentSchema);
