const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: false },
  googleId: { type: String, default: null },
  avatar: { type: String, default: "" },
  currency: { type: String, default: "INR" },
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
  city: { type: String, default: "" },
  state: { type: String, default: "" },
  zip: { type: String, default: "" },
  country: { type: String, default: "" },
  language: { type: String, default: "English" },
  timezone: { type: String, default: "IST (UTC+5:30)" },
  
  pin: { type: String, default: null },

  reportPreferences: {
    monthlyEmail: { type: Boolean, default: true },
    annualEmail: { type: Boolean, default: true },
  },

  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpire: {
    type: Date,
  },
}, { timestamps: true });
module.exports = mongoose.model("User", userSchema);
