const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
        "Other",
      ],
      required: true,
    },
    limit: {
      type: Number,
      required: true,
    },
    month: {
      type: String, // format: "2024-06"
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Budget", budgetSchema);
