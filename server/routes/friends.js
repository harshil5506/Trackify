const express = require("express");
const router = express.Router();
const Friend = require("../models/Friend");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

// POST — Send friend request by email
router.post("/send-request", authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;
    const receiver = await User.findOne({ email });
    if (!receiver) return res.status(404).json({ message: "User not found" });

    if (receiver._id.toString() === req.user.id)
      return res.status(400).json({ message: "Cannot add yourself" });

    const existing = await Friend.findOne({
      $or: [
        { sender: req.user.id, receiver: receiver._id },
        { sender: receiver._id, receiver: req.user.id },
      ],
    });
    if (existing)
      return res.status(400).json({
        message:
          existing.status === "accepted"
            ? "Already friends"
            : "Request already sent",
      });

    const request = await Friend.create({
      sender: req.user.id,
      receiver: receiver._id,
    });

    res.status(201).json({ message: "Friend request sent!", request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT — Accept or reject request
router.put("/respond/:id", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const request = await Friend.findById(req.params.id);

    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.receiver.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    request.status = status;
    await request.save();

    res.json({ message: `Request ${status}`, request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET — All accepted friends
router.get("/list", authMiddleware, async (req, res) => {
  try {
    const friends = await Friend.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }],
      status: "accepted",
    })
      .populate("sender", "name email")
      .populate("receiver", "name email");

    const list = friends
      .filter((f) => f.sender && f.receiver)
      .map((f) =>
        f.sender._id.toString() === req.user.id.toString() ? f.receiver : f.sender,
      );

    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET — Pending incoming requests
router.get("/pending", authMiddleware, async (req, res) => {
  try {
    const pending = await Friend.find({
      receiver: req.user.id,
      status: "pending",
    }).populate("sender", "name email");

    const validPending = pending.filter((p) => p.sender != null);
    res.json(validPending);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE — Remove friend
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const targetId = req.params.id;
    const deleted = await Friend.findOneAndDelete({
      $or: [
        { _id: targetId, $or: [{ sender: req.user.id }, { receiver: req.user.id }] },
        { sender: req.user.id, receiver: targetId },
        { sender: targetId, receiver: req.user.id },
      ],
    });
    if (!deleted) {
      return res.status(404).json({ message: "Friend relationship not found" });
    }
    res.json({ message: "Friend removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
