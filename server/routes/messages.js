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

    const validMessages = messages.filter((msg) => msg.sender != null);
    res.json(validMessages);
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
    const currentUserId = req.user.id.toString();
    messages.forEach((msg) => {
      if (!msg.sender || !msg.receiver) return;
      const senderId = msg.sender._id ? msg.sender._id.toString() : null;
      const receiverId = msg.receiver._id ? msg.receiver._id.toString() : null;
      if (!senderId || !receiverId) return;

      const friendId = senderId === currentUserId ? receiverId : senderId;
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
