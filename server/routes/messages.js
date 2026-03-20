const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const authMiddleware = require("../middleware/authMiddleware");

// POST — Send message
router.post("/send", authMiddleware, async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    if (!receiverId || !text)
      return res.status(400).json({ message: "Receiver and text required" });

    const message = await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      text,
    });

    await message.populate("sender", "name email");
    res.status(201).json({ message: "Message sent!", data: message });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET — Get all messages between two users
router.get("/conversation/:friendId", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.friendId },
        { sender: req.params.friendId, receiver: req.user.id },
      ],
    })
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { sender: req.params.friendId, receiver: req.user.id, read: false },
      { read: true },
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET — Get all unread messages for current user
router.get("/unread", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({
      receiver: req.user.id,
      read: false,
    }).populate("sender", "name email");

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET — Get inbox (latest message per friend)
router.get("/inbox", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }],
    })
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .sort({ createdAt: -1 });

    // Get unique conversations
    const seen = new Set();
    const inbox = [];
    messages.forEach((msg) => {
      const friendId =
        msg.sender._id.toString() === req.user.id
          ? msg.receiver._id.toString()
          : msg.sender._id.toString();
      if (!seen.has(friendId)) {
        seen.add(friendId);
        inbox.push(msg);
      }
    });

    res.json(inbox);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
