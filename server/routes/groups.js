const express = require("express");
const router = express.Router();
const Group = require("../models/Group");
const authMiddleware = require("../middleware/authMiddleware");

// GET — All groups for current user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const groups = await Group.find({
      $or: [{ members: req.user.id }, { createdBy: req.user.id }],
    })
      .populate("members", "name email")
      .populate("createdBy", "name email")
      .populate("expenses.paidBy", "name email"); // ✅ typo fixed

    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// GET — Single group by ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("members", "name email")
      .populate("createdBy", "name email")
      .populate("expenses.paidBy", "name email")
      .populate("expenses.splitBetween.user", "name email");

    if (!group) return res.status(404).json({ message: "Group not found" });

    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// POST — Add member to existing group
router.post("/:id/members", authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    // Only creator can add members
    if (group.createdBy.toString() !== req.user.id)
      return res.status(403).json({ message: "Only admin can add members" });

    const User = require("../models/User");
    const newMember = await User.findOne({ email });
    if (!newMember) return res.status(404).json({ message: "User not found" });

    // Check if already a member
    const alreadyMember = group.members.some(
      (m) => m.toString() === newMember._id.toString(),
    );
    if (alreadyMember)
      return res.status(400).json({ message: "Already a member" });

    group.members.push(newMember._id);
    await group.save();
    await group.populate("members", "name email");

    res.json({ message: "Member added!", group });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST — Create group
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, description, memberEmails } = req.body;

    const User = require("../models/User");
    const members = await User.find({ email: { $in: memberEmails || [] } });

    // ✅ Convert to strings so .includes() works correctly
    const memberIds = members.map((m) => m._id.toString());
    if (!memberIds.includes(req.user.id.toString())) {
      memberIds.push(req.user.id);
    }

    const group = await Group.create({
      name,
      description,
      createdBy: req.user.id,
      members: memberIds,
    });

    await group.populate("members", "name email");
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST — Add expense to group with equal split
// POST — Add expense with flexible splitting
router.post("/:id/expenses", authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const isMember = group.members.some(
      (m) => m.toString() === req.user.id.toString(),
    );
    if (!isMember)
      return res.status(403).json({ message: "Not a group member" });

    const { title, amount, splitType, customSplits } = req.body;
    // splitType: "equal" | "custom" | "percentage"
    // customSplits: [{ userId, amount }] for custom
    // customSplits: [{ userId, percentage }] for percentage

    let splitBetween = [];

    if (splitType === "custom" && customSplits?.length) {
      // Custom amount per person
      splitBetween = customSplits.map((s) => ({
        user: s.userId,
        share: parseFloat(s.amount),
        settled: s.userId === req.user.id,
      }));
    } else if (splitType === "percentage" && customSplits?.length) {
      // Percentage based split
      splitBetween = customSplits.map((s) => ({
        user: s.userId,
        share: parseFloat(((s.percentage / 100) * amount).toFixed(2)),
        settled: s.userId === req.user.id,
      }));
    } else {
      // Default — equal split
      if (!group.members || group.members.length === 0) {
        return res.status(400).json({ message: "Cannot split expense in group with no members" });
      }
      const splitAmount = parseFloat(
        (amount / group.members.length).toFixed(2),
      );
      splitBetween = group.members.map((memberId) => ({
        user: memberId,
        share: splitAmount,
        settled: memberId.toString() === req.user.id.toString(),
      }));
    }

    group.expenses.push({
      title,
      amount,
      paidBy: req.user.id,
      splitBetween,
    });

    await group.save();
    res.status(201).json({ message: "Expense added!", group });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT — Settle a share
// PUT — Settle a share (admin can settle anyone, members settle own)
router.put(
  "/:groupId/expenses/:expenseId/settle",
  authMiddleware,
  async (req, res) => {
    try {
      const { userId, partialAmount } = req.body;
      // userId — who is being settled (admin settles others)
      // partialAmount — optional partial payment amount

      const group = await Group.findById(req.params.groupId);
      if (!group) return res.status(404).json({ message: "Group not found" });

      const expense = group.expenses.id(req.params.expenseId);
      if (!expense)
        return res.status(404).json({ message: "Expense not found" });

      const isAdmin = group.createdBy.toString() === req.user.id;

      // Target user — admin can settle others, members settle themselves
      const targetUserId = isAdmin && userId ? userId : req.user.id;

      // Check if requester is allowed
      if (!isAdmin && targetUserId !== req.user.id)
        return res
          .status(403)
          .json({ message: "Only admin can settle others" });

      const split = expense.splitBetween.find(
        (s) => s.user.toString() === targetUserId,
      );

      if (!split)
        return res
          .status(404)
          .json({ message: "Split not found for this user" });

      if (split.settled)
        return res.status(400).json({ message: "Already fully settled" });

      // Partial settlement support
      if (partialAmount && partialAmount > 0 && partialAmount < split.share) {
        split.settledAmount =
          (split.settledAmount || 0) + parseFloat(partialAmount);
        split.share = parseFloat((split.share - partialAmount).toFixed(2));
        if (split.share <= 0) split.settled = true;
      } else {
        // Full settlement
        split.settledAmount = split.share;
        split.share = 0;
        split.settled = true;
      }

      await group.save();
      res.json({ message: "Settlement updated!", group });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);
// DELETE — Delete group (only creator)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.createdBy.toString() !== req.user.id.toString())
      return res.status(403).json({ message: "Only creator can delete" });

    await group.deleteOne();
    res.json({ message: "Group deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
