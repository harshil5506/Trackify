const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

router.use(auth);

router.get("/profile", async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

router.put("/profile", async (req, res) => {
  try {
    const { name, phone, address, city, state, zip, country, currency, language, timezone } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone, address, city, state, zip, country, currency, language, timezone }, { new: true }).select("-password");
    res.json(user);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

module.exports = router;
