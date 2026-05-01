const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    // res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
    res
      .status(201)
      .json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          pin: !!user.pin,
        },
      });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid email or password" });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    // res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        pin: !!user.pin,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    console.log("EMAIL RECEIVED:", email); // debug

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔐 Generate token
    const token = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min

    await user.save();

    console.log("TOKEN:", token); // debug

    const resetLink = `http://localhost:5173/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "trackify.services@gmail.com",
        pass: "bnhz jlem nkio egos",
      },
    });

    await transporter.sendMail({
      from: `"Trackify Support" <trackify.services@gmail.com>`,
      to: email,
      subject: "Reset Password",
      html: `<a href="${resetLink}">Reset Password</a>`,
    });

    res.json({ message: "Reset link sent" });
  } catch (error) {
    console.log("ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;
    const token = String(req.params.token || "").trim();

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.log("RESET PASSWORD ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/set-pin", async (req, res) => {
  try {
    const { userId, pin } = req.body;
    const hashed = await bcrypt.hash(pin, 10);
    await User.findByIdAndUpdate(userId, { pin: hashed });
    res.json({ message: "PIN set successfully" });
  } catch (error) {
    console.log("SET PIN ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/verify-pin", async (req, res) => {
  try {
    const { userId, pin } = req.body;
    const user = await User.findById(userId);
    if (!user.pin) return res.status(400).json({ message: "No PIN set" });
    const match = await bcrypt.compare(pin, user.pin);
    if (!match) return res.status(400).json({ message: "Wrong PIN" });
    res.json({ message: "PIN verified" });
  } catch (error) {
    console.log("VERIFY PIN ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
