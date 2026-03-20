import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";

const Friends = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("friends");
  const [inviteEmail, setInviteEmail] = useState("");
  const [sending, setSending] = useState(false);

  // Message modal state
  const [messageModal, setMessageModal] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchAll();
  }, []);

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  const fetchAll = async () => {
    try {
      const [friendsRes, pendingRes, unreadRes] = await Promise.all([
        API.get("/api/friends/list"),
        API.get("/api/friends/pending"),
        API.get("/api/messages/unread"),
      ]);
      setFriends(Array.isArray(friendsRes.data) ? friendsRes.data : []);
      setPending(Array.isArray(pendingRes.data) ? pendingRes.data : []);
      setUnreadCount(Array.isArray(unreadRes.data) ? unreadRes.data.length : 0);
    } catch (err) {
      toast.error("Failed to load friends");
    } finally {
      setLoading(false);
    }
  };

  const openChat = async (friend) => {
    setMessageModal(friend);
    try {
      const { data } = await API.get(
        `/api/messages/conversation/${friend._id}`,
      );
      setConversation(Array.isArray(data) ? data : []);
      // Refresh unread count after opening
      fetchAll();
    } catch (err) {
      toast.error("Failed to load conversation");
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return toast.error("Write a message first!");
    setSendingMsg(true);
    try {
      const { data } = await API.post("/api/messages/send", {
        receiverId: messageModal._id,
        text: newMessage.trim(),
      });
      setConversation((prev) => [...prev, data.data]);
      setNewMessage("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message");
    } finally {
      setSendingMsg(false);
    }
  };

  const handleSendRequest = async () => {
    if (!inviteEmail.trim()) return toast.error("Enter an email address");
    setSending(true);
    try {
      await API.post("/api/friends/send-request", { email: inviteEmail });
      toast.success("Friend request sent!");
      setInviteEmail("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send request");
    } finally {
      setSending(false);
    }
  };

  const handleRespond = async (requestId, status, name) => {
    try {
      await API.put(`/api/friends/respond/${requestId}`, { status });
      toast.success(
        status === "accepted" ? `${name} accepted!` : `${name} declined`,
      );
      fetchAll();
    } catch (err) {
      toast.error("Failed to respond");
    }
  };

  const handleRemoveFriend = async (friendId, name) => {
    if (!window.confirm(`Remove ${name} from friends?`)) return;
    try {
      await API.delete(`/api/friends/${friendId}`);
      toast.success(`${name} removed`);
      fetchAll();
    } catch (err) {
      toast.error("Failed to remove friend");
    }
  };

  const tabs = [
    { key: "friends", label: "My Friends", count: friends.length },
    { key: "requests", label: "Requests", count: pending.length },
    { key: "invite", label: "Add Friend", count: null },
  ];

  const myId = user?._id || user?.id;

  return (
    <div style={s.appBody}>
      <main style={s.dashMain}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h1 style={s.pageTitle}>Friends & Social</h1>
            <p style={{ fontSize: "0.85rem", color: "#666" }}>
              Manage your connections and split expenses
            </p>
          </div>
          {unreadCount > 0 && (
            <div
              style={{
                background: "#fee2e2",
                color: "#dc2626",
                borderRadius: "8px",
                padding: "8px 16px",
                fontSize: "0.84rem",
                fontWeight: "600",
              }}
            >
              📬 {unreadCount} unread message{unreadCount > 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: "14px",
          }}
        >
          {[
            {
              icon: "👥",
              label: "Total Friends",
              value: friends.length,
              tag: "Connected",
              tagBg: "#dbeafe",
              tagColor: "#1d4ed8",
            },
            {
              icon: "⏰",
              label: "Pending Requests",
              value: pending.length,
              tag: pending.length > 0 ? "Action needed" : "All clear",
              tagBg: pending.length > 0 ? "#fef3c7" : "#dcfce7",
              tagColor: pending.length > 0 ? "#92400e" : "#166534",
              action: () => setActiveTab("requests"),
            },
            {
              icon: "➕",
              label: "Add Friend",
              value: "Invite",
              tag: "Grow network",
              tagBg: "#f3e8ff",
              tagColor: "#6b21a8",
              action: () => setActiveTab("invite"),
            },
          ].map((stat) => (
            <div
              key={stat.label}
              onClick={stat.action}
              style={{
                background: "linear-gradient(160deg,#1e36be,#2a47d0)",
                borderRadius: "14px",
                padding: "18px 20px",
                color: "white",
                minHeight: "110px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                cursor: stat.action ? "pointer" : "default",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                }}
              >
                <span style={{ fontSize: "18px" }}>{stat.icon}</span>
                <span
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: "600",
                    padding: "2px 8px",
                    borderRadius: "5px",
                    background: stat.tagBg,
                    color: stat.tagColor,
                  }}
                >
                  {stat.tag}
                </span>
              </div>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.72)",
                  marginBottom: "3px",
                }}
              >
                {stat.label}
              </p>
              <p
                style={{
                  fontFamily: "'Sora',sans-serif",
                  fontSize: "2rem",
                  fontWeight: "800",
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Main Card with Tabs */}
        <div style={s.dashCard}>
          {/* Tab Headers */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "20px",
              borderBottom: "1px solid #e2e6f0",
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  background: "none",
                  fontSize: "0.88rem",
                  fontWeight: activeTab === tab.key ? "700" : "500",
                  color: activeTab === tab.key ? "#1a2ea8" : "#666",
                  borderBottom:
                    activeTab === tab.key
                      ? "2px solid #1a2ea8"
                      : "2px solid transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "-1px",
                }}
              >
                {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <span
                    style={{
                      background: "#1a2ea8",
                      color: "white",
                      fontSize: "0.68rem",
                      fontWeight: "700",
                      padding: "1px 6px",
                      borderRadius: "10px",
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── My Friends Tab ── */}
          {activeTab === "friends" && (
            <div>
              {loading ? (
                <p
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#666",
                  }}
                >
                  Loading...
                </p>
              ) : friends.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <p style={{ fontSize: "48px", marginBottom: "12px" }}>👥</p>
                  <p
                    style={{
                      fontSize: "1rem",
                      fontWeight: "600",
                      color: "#1a1a2e",
                      marginBottom: "8px",
                    }}
                  >
                    No friends yet
                  </p>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "#666",
                      marginBottom: "20px",
                    }}
                  >
                    Add friends to split expenses together
                  </p>
                  <button
                    onClick={() => setActiveTab("invite")}
                    style={s.primaryBtn}
                  >
                    Add Your First Friend
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {friends.map((friend) => (
                    <div key={friend._id} style={s.friendRow}>
                      <div style={s.avatar}>
                        {friend.name?.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            fontSize: "0.88rem",
                            fontWeight: "600",
                            color: "#1a1a2e",
                            marginBottom: "2px",
                          }}
                        >
                          {friend.name}
                        </p>
                        <p style={{ fontSize: "0.74rem", color: "#666" }}>
                          {friend.email}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => openChat(friend)}
                          style={s.msgBtn}
                        >
                          💬 Message
                        </button>
                        <button
                          onClick={() =>
                            handleRemoveFriend(friend._id, friend.name)
                          }
                          style={s.removeBtn}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Requests Tab ── */}
          {activeTab === "requests" && (
            <div>
              {loading ? (
                <p
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#666",
                  }}
                >
                  Loading...
                </p>
              ) : pending.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <p style={{ fontSize: "48px", marginBottom: "12px" }}>✅</p>
                  <p
                    style={{
                      fontSize: "1rem",
                      fontWeight: "600",
                      color: "#1a1a2e",
                    }}
                  >
                    No pending requests
                  </p>
                  <p style={{ fontSize: "0.85rem", color: "#666" }}>
                    You're all caught up!
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {pending.map((req) => (
                    <div key={req._id} style={s.friendRow}>
                      <div
                        style={{
                          ...s.avatar,
                          background: "#fef3c7",
                          color: "#92400e",
                        }}
                      >
                        {req.sender?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            fontSize: "0.88rem",
                            fontWeight: "600",
                            color: "#1a1a2e",
                            marginBottom: "2px",
                          }}
                        >
                          {req.sender?.name}
                        </p>
                        <p style={{ fontSize: "0.74rem", color: "#666" }}>
                          {req.sender?.email} •{" "}
                          {new Date(req.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() =>
                            handleRespond(req._id, "accepted", req.sender?.name)
                          }
                          style={s.primaryBtn}
                        >
                          ✓ Accept
                        </button>
                        <button
                          onClick={() =>
                            handleRespond(req._id, "rejected", req.sender?.name)
                          }
                          style={s.removeBtn}
                        >
                          ✕ Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Add Friend Tab ── */}
          {activeTab === "invite" && (
            <div>
              <div
                style={{
                  background: "#f8f9fc",
                  borderRadius: "12px",
                  padding: "24px",
                  border: "1px solid #e2e6f0",
                  marginBottom: "20px",
                }}
              >
                <h4
                  style={{
                    fontFamily: "'Sora',sans-serif",
                    fontSize: "0.95rem",
                    fontWeight: "700",
                    color: "#1a1a2e",
                    marginBottom: "6px",
                  }}
                >
                  🔍 Find & Add Friend
                </h4>
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "#666",
                    marginBottom: "16px",
                  }}
                >
                  Enter your friend's registered email to send a request
                </p>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="email"
                    placeholder="Enter friend's email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendRequest()}
                    style={{
                      flex: 1,
                      padding: "11px 14px",
                      border: "1.5px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "0.9rem",
                      fontFamily: "'Inter',sans-serif",
                      color: "#1a1a2e",
                      background: "white",
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={handleSendRequest}
                    disabled={sending}
                    style={s.primaryBtn}
                  >
                    {sending ? "Sending..." : "Send Request"}
                  </button>
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: "12px",
                }}
              >
                {[
                  {
                    icon: "📧",
                    title: "Enter Email",
                    desc: "Type your friend's registered email",
                  },
                  {
                    icon: "📨",
                    title: "Send Request",
                    desc: "They get a friend request notification",
                  },
                  {
                    icon: "🤝",
                    title: "Start Splitting",
                    desc: "Once accepted, split expenses together!",
                  },
                ].map((step) => (
                  <div
                    key={step.title}
                    style={{
                      background: "#f8f9fc",
                      borderRadius: "10px",
                      padding: "16px",
                      border: "1px solid #e2e6f0",
                      textAlign: "center",
                    }}
                  >
                    <p style={{ fontSize: "28px", marginBottom: "8px" }}>
                      {step.icon}
                    </p>
                    <p
                      style={{
                        fontSize: "0.84rem",
                        fontWeight: "700",
                        color: "#1a1a2e",
                        marginBottom: "4px",
                      }}
                    >
                      {step.title}
                    </p>
                    <p style={{ fontSize: "0.76rem", color: "#666" }}>
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Message / Chat Modal ── */}
        {messageModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                width: "100%",
                maxWidth: "480px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
                display: "flex",
                flexDirection: "column",
                maxHeight: "80vh",
              }}
            >
              {/* Chat Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "16px 20px",
                  borderBottom: "1px solid #e2e6f0",
                }}
              >
                <div style={s.avatar}>
                  {messageModal.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontFamily: "'Sora',sans-serif",
                      fontSize: "0.95rem",
                      fontWeight: "700",
                      color: "#1a1a2e",
                    }}
                  >
                    {messageModal.name}
                  </p>
                  <p
                    style={{
                      fontSize: "0.74rem",
                      color: "#16a34a",
                      fontWeight: "600",
                    }}
                  >
                    ● Active
                  </p>
                </div>
                <button
                  onClick={() => {
                    setMessageModal(null);
                    setConversation([]);
                    setNewMessage("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "20px",
                    cursor: "pointer",
                    color: "#666",
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Messages Area */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "16px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  minHeight: "300px",
                  maxHeight: "400px",
                  background: "#f8f9fc",
                }}
              >
                {conversation.length === 0 ? (
                  <div style={{ textAlign: "center", margin: "auto" }}>
                    <p style={{ fontSize: "36px", marginBottom: "8px" }}>👋</p>
                    <p style={{ fontSize: "0.84rem", color: "#666" }}>
                      Say hello to {messageModal.name}!
                    </p>
                  </div>
                ) : (
                  conversation.map((msg) => {
                    const isMine =
                      msg.sender?._id?.toString() === myId?.toString() ||
                      msg.sender?.id?.toString() === myId?.toString();
                    return (
                      <div
                        key={msg._id}
                        style={{
                          display: "flex",
                          justifyContent: isMine ? "flex-end" : "flex-start",
                        }}
                      >
                        <div
                          style={{
                            maxWidth: "70%",
                            padding: "10px 14px",
                            borderRadius: isMine
                              ? "14px 14px 4px 14px"
                              : "14px 14px 14px 4px",
                            background: isMine ? "#1a2ea8" : "white",
                            color: isMine ? "white" : "#1a1a2e",
                            fontSize: "0.86rem",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                            border: isMine ? "none" : "1px solid #e2e6f0",
                          }}
                        >
                          <p style={{ marginBottom: "4px" }}>{msg.text}</p>
                          <p
                            style={{
                              fontSize: "0.66rem",
                              color: isMine ? "rgba(255,255,255,0.6)" : "#999",
                              textAlign: "right",
                            }}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString(
                              "en-IN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div
                style={{
                  padding: "14px 16px",
                  borderTop: "1px solid #e2e6f0",
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-end",
                }}
              >
                <textarea
                  placeholder={`Message ${messageModal.name}...`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={2}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    border: "1.5px solid #d1d5db",
                    borderRadius: "10px",
                    fontSize: "0.88rem",
                    fontFamily: "'Inter',sans-serif",
                    color: "#1a1a2e",
                    background: "#f9fafb",
                    outline: "none",
                    resize: "none",
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sendingMsg}
                  style={{
                    ...s.primaryBtn,
                    padding: "10px 16px",
                    borderRadius: "10px",
                    fontSize: "18px",
                  }}
                >
                  {sendingMsg ? "..." : "➤"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const s = {
  appBody: {
    background: "#eef0f7",
    minHeight: "100vh",
    fontFamily: "'Inter',sans-serif",
  },
  dashMain: {
    maxWidth: "1060px",
    margin: "0 auto",
    padding: "28px 28px 60px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  pageTitle: {
    fontFamily: "'Sora',sans-serif",
    fontSize: "1.9rem",
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: "4px",
  },
  dashCard: {
    background: "white",
    borderRadius: "14px",
    border: "1px solid #e2e6f0",
    padding: "26px 28px",
  },
  friendRow: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "13px 14px",
    borderRadius: "10px",
    background: "#f8f9fc",
    border: "1px solid #e2e6f0",
  },
  avatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "#e2e6f5",
    color: "#1a2ea8",
    fontFamily: "'Sora',sans-serif",
    fontSize: "14px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  primaryBtn: {
    background: "#1a2ea8",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "8px 18px",
    fontSize: "0.82rem",
    fontWeight: "600",
    fontFamily: "'Sora',sans-serif",
    cursor: "pointer",
  },
  msgBtn: {
    background: "#e3ebff",
    color: "#1a2ea8",
    border: "none",
    borderRadius: "8px",
    padding: "7px 14px",
    fontSize: "0.8rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  removeBtn: {
    background: "#fee2e2",
    color: "#dc2626",
    border: "none",
    borderRadius: "8px",
    padding: "7px 14px",
    fontSize: "0.8rem",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default Friends;
