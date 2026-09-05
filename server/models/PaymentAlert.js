const mongoose = require("mongoose");

const paymentAlertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recurringKey: {
      type: String,
      required: true,
      trim: true,
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
    currency: {
      type: String,
      default: "INR",
    },
    dueDate: {
      type: Date,
      required: true,
    },
    dueDateString: {
      type: String,
      required: true, // Format: "YYYY-MM-DD"
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    channel: {
      type: String,
      default: "email",
    },
  },
  { timestamps: true }
);

// Compound unique index prevents sending duplicate alerts for the same recurring payment on the same cycle
paymentAlertSchema.index({ user: 1, recurringKey: 1, dueDateString: 1 }, { unique: true });

module.exports = mongoose.model("PaymentAlert", paymentAlertSchema);
