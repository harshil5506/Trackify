const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

router.use(auth);

router.get("/profile", async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/profile", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      city,
      state,
      zip,
      country,
      currency,
      language,
      timezone,
      avatar,
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (email && email !== user.email) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email.toLowerCase();
    }

    if (typeof name === "string") user.name = name.trim();
    if (typeof phone === "string") user.phone = phone.trim();
    if (typeof address === "string") user.address = address.trim();
    if (typeof city === "string") user.city = city.trim();
    if (typeof state === "string") user.state = state.trim();
    if (typeof zip === "string") user.zip = zip.trim();
    if (typeof country === "string") user.country = country.trim();
    if (typeof currency === "string") user.currency = currency.trim();
    if (typeof language === "string") user.language = language.trim();
    if (typeof timezone === "string") user.timezone = timezone.trim();
    if (typeof avatar === "string") user.avatar = avatar.trim();

    await user.save();

    const profile = await User.findById(req.user.id).select("-password");
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET quiz result
router.get("/quiz-result", async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("spendingPersonality");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.spendingPersonality || {});
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST quiz result
router.post("/quiz-result", async (req, res) => {
  try {
    const { archetype, title, badge, score } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.spendingPersonality = {
      archetype,
      title,
      badge,
      score: Number(score || 0),
      completedAt: new Date(),
    };

    await user.save();
    res.json({ message: "Quiz result saved", spendingPersonality: user.spendingPersonality });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
