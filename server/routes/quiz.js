const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const quizQuestions = require("../data/quizQuestions");
const { analyzeBehavioralSpendingProfile } = require("../services/behavioralEngine");
const User = require("../models/User");

/**
 * GET /api/quiz/questions
 * Returns dynamic, nuanced quiz scenarios (Self vs. Peer occasion spending)
 */
router.get("/questions", (req, res) => {
  try {
    res.json({
      totalQuestions: quizQuestions.length,
      categories: [
        "Peer Dining & Social Outings",
        "The Unequal Split Bill",
        "Solitary Late-Night Browsing",
        "Spontaneous Peer Vacation / Getaway",
        "Celebratory Occasion & Windfall",
        "Emotional Trigger & Retail Therapy",
        "Peer Gifting & Group Milestones",
        "Month-End Solitary vs. Social Budget Defense",
      ],
      questions: quizQuestions,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load quiz questions", error: err.message });
  }
});

/**
 * POST /api/quiz/analyze
 * Evaluates behavioral spending profile using Python Scikit-Learn ML / Dynamic Rule Engine
 * Stores full multi-dimensional profile in user's profile
 */
router.post("/analyze", authMiddleware, async (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: "Quiz answers array is required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Run ML Behavioral Profiling engine
    const profile = await analyzeBehavioralSpendingProfile(req.user.id, answers);

    // Save profile to user document
    user.spendingPersonality = profile;
    user.markModified("spendingPersonality");
    await user.save();

    res.json({
      message: "Behavioral spending profile successfully analyzed",
      profile,
    });
  } catch (err) {
    console.error("Quiz analysis error:", err);
    res.status(500).json({ message: "Failed to evaluate behavioral profile", error: err.message });
  }
});

/**
 * GET /api/quiz/result
 * Retrieves active user's behavioral spending profile
 */
router.get("/result", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("spendingPersonality");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.spendingPersonality || null);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch quiz result", error: err.message });
  }
});

/**
 * DELETE /api/quiz/result
 * Clears quiz result so user can take a fresh diagnostic
 */
router.delete("/result", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.spendingPersonality = null;
    user.markModified("spendingPersonality");
    await user.save();
    res.json({ message: "Quiz result cleared successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to clear quiz result", error: err.message });
  }
});

module.exports = router;
