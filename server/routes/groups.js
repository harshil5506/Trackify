const express = require("express");
const router = express.Router();
const Group = require("../models/Group");
const authMiddleware = require("../middleware/authMiddleware");
const { simplifyGroupDebts } = require("../services/debtSimplifier");

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
    const creatorId = group.createdBy?._id
      ? group.createdBy._id.toString()
      : group.createdBy?.toString();
    const currentUserId = req.user?._id
      ? req.user._id.toString()
      : (req.user?.id ? req.user.id.toString() : "");

    console.log("👉 ADD MEMBER CHECK:", {
      creatorId,
      currentUserId,
      userEmail: req.user?.email,
      groupName: group.name,
      match: creatorId === currentUserId,
    });

    if (creatorId !== currentUserId)
      return res.status(403).json({ message: "Only admin can add members" });

    const User = require("../models/User");
    const cleanEmail = (email || "").toLowerCase().trim();
    const newMember = await User.findOne({ email: cleanEmail });
    if (!newMember)
      return res.status(404).json({ message: "User not found with this email" });

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

// GET — Simplified Debts for a Group (Min-Cash Flow Algorithm)
router.get("/:id/simplified-debts", authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("members", "name email")
      .populate("createdBy", "name email")
      .populate("expenses.paidBy", "name email")
      .populate("expenses.splitBetween.user", "name email");

    if (!group) return res.status(404).json({ message: "Group not found" });

    const isMember =
      group.members.some(
        (m) => m._id.toString() === req.user.id.toString(),
      ) || group.createdBy?._id.toString() === req.user.id.toString();

    if (!isMember) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this group" });
    }

    const simplificationResult = simplifyGroupDebts(group);

    res.json({
      groupId: group._id,
      groupName: group.name,
      ...simplificationResult,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST — Record a simplified debt settlement
router.post("/:id/settle-simplified-debt", authMiddleware, async (req, res) => {
  try {
    const { fromUserId, toUserId, amount } = req.body;
    const numericAmount = parseFloat(amount);

    if (!fromUserId || !toUserId || !numericAmount || numericAmount <= 0) {
      return res
        .status(400)
        .json({ message: "Valid payer, recipient, and amount are required" });
    }

    const group = await Group.findById(req.params.id)
      .populate("members", "name email")
      .populate("createdBy", "name email")
      .populate("expenses.paidBy", "name email")
      .populate("expenses.splitBetween.user", "name email");

    if (!group) return res.status(404).json({ message: "Group not found" });

    const isAdmin = group.createdBy._id.toString() === req.user.id.toString();
    const isPayer = fromUserId.toString() === req.user.id.toString();
    const isRecipient = toUserId.toString() === req.user.id.toString();

    // Only admin, payer, or recipient can record this settlement
    if (!isAdmin && !isPayer && !isRecipient) {
      return res
        .status(403)
        .json({ message: "Not authorized to settle this debt" });
    }

    const fromMember = group.members.find(
      (m) => m._id.toString() === fromUserId.toString(),
    );
    const toMember = group.members.find(
      (m) => m._id.toString() === toUserId.toString(),
    );

    if (!fromMember || !toMember) {
      return res.status(400).json({ message: "Members not found in group" });
    }

    // 1. Mark corresponding direct unsettled splits between fromUser and toUser as settled
    let remainingToSettle = numericAmount;
    for (const exp of group.expenses) {
      if (remainingToSettle <= 0.001) break;
      const payerId = exp.paidBy?._id
        ? exp.paidBy._id.toString()
        : exp.paidBy?.toString();
      if (payerId === toUserId.toString()) {
        const split = exp.splitBetween.find(
          (s) =>
            (s.user?._id ? s.user._id.toString() : s.user?.toString()) ===
              fromUserId.toString() && !s.settled,
        );
        if (split) {
          const unpaid = split.share || 0;
          if (remainingToSettle >= unpaid) {
            split.settledAmount = (split.settledAmount || 0) + unpaid;
            split.share = 0;
            split.settled = true;
            remainingToSettle -= unpaid;
          } else {
            split.settledAmount =
              (split.settledAmount || 0) + remainingToSettle;
            split.share = parseFloat((unpaid - remainingToSettle).toFixed(2));
            remainingToSettle = 0;
          }
        }
      }
    }

    // 2. Add a settlement expense entry so all members see the payment in activity
    group.expenses.push({
      title: `🤝 Settlement: ${fromMember.name} paid ${toMember.name}`,
      amount: numericAmount,
      paidBy: fromUserId,
      splitBetween: [
        {
          user: toUserId,
          share: numericAmount,
          settledAmount: numericAmount,
          settled: true,
        },
      ],
      isSettlement: true,
      date: new Date(),
    });

    await group.save();

    // Re-populate and compute latest simplified debts
    const updatedGroup = await Group.findById(req.params.id)
      .populate("members", "name email")
      .populate("createdBy", "name email")
      .populate("expenses.paidBy", "name email")
      .populate("expenses.splitBetween.user", "name email");

    const simplificationResult = simplifyGroupDebts(updatedGroup);

    res.json({
      message: `Settlement of ₹${numericAmount.toFixed(2)} between ${fromMember.name} and ${toMember.name} recorded successfully!`,
      group: updatedGroup,
      ...simplificationResult,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

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
