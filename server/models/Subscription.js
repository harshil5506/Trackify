const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
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
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly", "weekly", "quarterly"],
      default: "monthly",
    },
    category: {
      type: String,
      default: "Entertainment",
      trim: true,
    },
    nextBillingDate: {
      type: Date,
      required: true,
    },
    reminderDaysBefore: {
      type: Number,
      default: 3,
    },
    status: {
      type: String,
      enum: ["active", "paused", "cancelled"],
      default: "active",
    },
    paymentMethod: {
      type: String,
      default: "Card / UPI",
      trim: true,
    },
    icon: {
      type: String,
      default: "📱",
    },
    color: {
      type: String,
      default: "#1a2ea8",
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    autoDetected: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
