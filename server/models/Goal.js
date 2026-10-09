const mongoose = require("mongoose");

const contributionSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  note: { type: String, default: "" },
});

const goalSchema = new mongoose.Schema(
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
    targetAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    category: {
      type: String,
      default: "General",
      enum: ["Emergency", "Gadget & Tech", "Travel & Vacation", "Vehicle", "Education", "Home & Family", "General"],
    },
    targetDate: {
      type: Date,
      required: true,
    },
    color: {
      type: String,
      default: "#1a2ea8",
    },
    icon: {
      type: String,
      default: "🎯",
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    contributions: [contributionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Goal", goalSchema);
