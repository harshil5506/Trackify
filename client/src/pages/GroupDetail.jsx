// import { useState, useEffect } from "react";
// import { Link, useNavigate, useParams } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import API from "../api/axios";
// import toast from "react-hot-toast";

// const GroupDetail = () => {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
//   const { id } = useParams();
//   const [group, setGroup] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [activeAction, setActiveAction] = useState(null);
//   // null | "addMember" | "splitExpense" | "settleUp" | "whoOwes"
//   const [memberEmail, setMemberEmail] = useState("");
//   const [addingMember, setAddingMember] = useState(false);
//   const [expenseForm, setExpenseForm] = useState({
//     title: "",
//     amount: "",
//     splitType: "equal", // equal | custom | percentage
//     customSplits: [],
//   });
//   const [addingExpense, setAddingExpense] = useState(false);

//   useEffect(() => {
//     fetchGroup();
//   }, [id]);

//   const fetchGroup = async () => {
//     try {
//       const { data } = await API.get(`/api/groups/${id}`);
//       setGroup(data);
//       // Initialize customSplits with all members
//       setExpenseForm((prev) => ({
//         ...prev,
//         customSplits: data.members.map((m) => ({
//           userId: m._id,
//           name: m.name,
//           amount: "",
//           percentage: "",
//         })),
//       }));
//     } catch (err) {
//       toast.error("Failed to load group");
//       navigate("/groups");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddMember = async () => {
//     if (!memberEmail.trim()) return toast.error("Enter an email address");
//     setAddingMember(true);
//     try {
//       await API.post(`/api/groups/${id}/members`, { email: memberEmail });
//       toast.success("Member added!");
//       setMemberEmail("");
//       setActiveAction(null);
//       fetchGroup();
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Failed to add member");
//     } finally {
//       setAddingMember(false);
//     }
//   };

//   const handleAddExpense = async () => {
//     if (!expenseForm.title.trim()) return toast.error("Title is required");
//     if (!expenseForm.amount || expenseForm.amount <= 0)
//       return toast.error("Valid amount is required");

//     // Validate custom splits add up
//     if (expenseForm.splitType === "custom") {
//       const total = expenseForm.customSplits.reduce(
//         (s, c) => s + parseFloat(c.amount || 0),
//         0,
//       );
//       if (Math.abs(total - parseFloat(expenseForm.amount)) > 0.01)
//         return toast.error(
//           `Custom amounts must add up to ₹${expenseForm.amount}`,
//         );
//     }
//     if (expenseForm.splitType === "percentage") {
//       const total = expenseForm.customSplits.reduce(
//         (s, c) => s + parseFloat(c.percentage || 0),
//         0,
//       );
//       if (Math.abs(total - 100) > 0.01)
//         return toast.error("Percentages must add up to 100%");
//     }

//     setAddingExpense(true);
//     try {
//       const payload = {
//         title: expenseForm.title,
//         amount: parseFloat(expenseForm.amount),
//         splitType: expenseForm.splitType,
//         customSplits: expenseForm.customSplits.map((s) => ({
//           userId: s.userId,
//           amount: parseFloat(s.amount || 0),
//           percentage: parseFloat(s.percentage || 0),
//         })),
//       };
//       await API.post(`/api/groups/${id}/expenses`, payload);
//       toast.success("Expense added & split!");
//       setExpenseForm((prev) => ({
//         ...prev,
//         title: "",
//         amount: "",
//         splitType: "equal",
//       }));
//       setActiveAction(null);
//       fetchGroup();
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Failed to add expense");
//     } finally {
//       setAddingExpense(false);
//     }
//   };

//   const handleSettle = async (expenseId, targetUserId, partialAmount) => {
//     try {
//       await API.put(`/api/groups/${id}/expenses/${expenseId}/settle`, {
//         userId: targetUserId, // admin settles on behalf of others
//         partialAmount: partialAmount || null,
//       });
//       toast.success(
//         partialAmount
//           ? `₹${partialAmount} marked as paid!`
//           : "Fully settled! ✓",
//       );
//       fetchGroup();
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Failed to settle");
//     }
//   };

//   const handleLogout = () => {
//     logout();
//     toast.success("Logged out!");
//     navigate("/login");
//   };

//   // Calculate who owes what
//   // Calculate who owes what
//   const getOweSummary = () => {
//     if (!group) return [];
//     const owes = {};
//     group.members.forEach((m) => {
//       owes[m._id] = { name: m.name, owes: 0, paid: 0, settled: 0 }; // ← added settled
//     });
//     group.expenses?.forEach((exp) => {
//       if (owes[exp.paidBy?._id]) {
//         owes[exp.paidBy._id].paid += exp.amount;
//       }
//       exp.splitBetween?.forEach((s) => {
//         if (owes[s.user?._id]) {
//           if (!s.settled) {
//             owes[s.user._id].owes += s.share;
//           }
//           if (s.settledAmount) {
//             owes[s.user._id].settled += s.settledAmount; // ← track settled amount
//           }
//         }
//       });
//     });
//     return Object.values(owes);
//   };

//   const myOwed = () => {
//     if (!group) return 0;
//     let total = 0;
//     group.expenses?.forEach((exp) => {
//       exp.splitBetween?.forEach((s) => {
//         if (s.user?._id === user?._id && !s.settled) {
//           total += s.share;
//         }
//       });
//     });
//     return total;
//   };

//   if (loading) {
//     return (
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           minHeight: "100vh",
//         }}
//       >
//         <p style={{ color: "#666" }}>Loading group...</p>
//       </div>
//     );
//   }

//   if (!group) return null;

//   return (
//     <div style={s.appBody}>
//       {/* Nav */}
//       <nav style={s.appNav}>
//         <div style={s.appNavBrand}>
//           <div style={s.appLogoFallback}>T</div>
//           <span style={s.appBrandName}>Trackify</span>
//         </div>
//         <ul style={s.appNavLinks}>
//           <li>
//             <Link to="/dashboard" style={s.appNavLink}>
//               Dashboard
//             </Link>
//           </li>
//           <li>
//             <Link to="/add-expense" style={s.appNavLink}>
//               Add Expense
//             </Link>
//           </li>
//           <li>
//             <Link to="/transactions" style={s.appNavLink}>
//               Transactions
//             </Link>
//           </li>
//           <li>
//             <Link to="/friends" style={s.appNavLink}>
//               Friends
//             </Link>
//           </li>
//           <li>
//             <Link to="/groups" style={{ ...s.appNavLink, color: "white" }}>
//               Groups
//             </Link>
//           </li>
//           <li>
//             <Link to="/budget" style={s.appNavLink}>
//               Budget
//             </Link>
//           </li>
//         </ul>
//         <div style={s.appNavRight}>
//           <button style={s.notifBtn}>
//             🔔<span style={s.notifBadge}>2</span>
//           </button>
//           <div style={s.appUserChip}>
//             <div style={s.appAvatar}>{user?.name?.charAt(0).toUpperCase()}</div>
//             <span style={s.appUsername}>{user?.name}</span>
//           </div>
//           <button style={s.logoutBtn} onClick={handleLogout}>
//             Logout
//           </button>
//         </div>
//       </nav>

//       <main style={s.dashMain}>
//         {/* Header */}
//         <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
//           <button onClick={() => navigate("/groups")} style={s.backBtn}>
//             ← Back
//           </button>
//           <div style={{ flex: 1 }}>
//             <h1 style={s.pageTitle}>{group.name}</h1>
//             <p style={{ fontSize: "0.85rem", color: "#666" }}>
//               {group.description || "No description"} • {group.members?.length}{" "}
//               member
//               {group.members?.length !== 1 ? "s" : ""}
//             </p>
//           </div>
//         </div>

//         {/* Summary Cards */}
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(3,1fr)",
//             gap: "16px",
//           }}
//         >
//           {[
//             {
//               label: "Total Expenses",
//               value: `₹${(group.expenses?.reduce((s, e) => s + e.amount, 0) || 0).toFixed(2)}`,
//               icon: "💸",
//             },
//             { label: "Members", value: group.members?.length || 0, icon: "👥" },
//             { label: "You Owe", value: `₹${myOwed().toFixed(2)}`, icon: "👛" },
//           ].map((c) => (
//             <div key={c.label} style={s.statCard}>
//               <p style={s.statLabel}>{c.label}</p>
//               <p style={s.statValue}>{c.value}</p>
//               <span style={s.statIcon}>{c.icon}</span>
//             </div>
//           ))}
//         </div>

//         {/* ✅ Quick Actions */}
//         <div style={s.dashCard}>
//           <h3 style={s.cardTitle}>Quick Actions</h3>
//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "repeat(4,1fr)",
//               gap: "12px",
//             }}
//           >
//             {[
//               {
//                 key: "addMember",
//                 icon: "👥",
//                 label: "Add Member",
//                 color: "#e3ebff",
//                 tc: "#1a2ea8",
//               },
//               {
//                 key: "splitExpense",
//                 icon: "💸",
//                 label: "Split Expense",
//                 color: "#d6f5e8",
//                 tc: "#0d7a68",
//               },
//               {
//                 key: "settleUp",
//                 icon: "✅",
//                 label: "Settle Up",
//                 color: "#fdf3d0",
//                 tc: "#7c3000",
//               },
//               {
//                 key: "whoOwes",
//                 icon: "📊",
//                 label: "Who Owes",
//                 color: "#f3e8ff",
//                 tc: "#6b21a8",
//               },
//             ].map((qa) => (
//               <div
//                 key={qa.key}
//                 onClick={() =>
//                   setActiveAction(activeAction === qa.key ? null : qa.key)
//                 }
//                 style={{
//                   background: activeAction === qa.key ? qa.color : "#f8f9fc",
//                   border: `2px solid ${activeAction === qa.key ? qa.tc + "44" : "#e2e6f0"}`,
//                   borderRadius: "12px",
//                   padding: "18px 14px",
//                   textAlign: "center",
//                   cursor: "pointer",
//                 }}
//               >
//                 <p style={{ fontSize: "28px", marginBottom: "8px" }}>
//                   {qa.icon}
//                 </p>
//                 <p
//                   style={{
//                     fontSize: "0.82rem",
//                     fontWeight: "700",
//                     color: activeAction === qa.key ? qa.tc : "#1a1a2e",
//                   }}
//                 >
//                   {qa.label}
//                 </p>
//               </div>
//             ))}
//           </div>

//           {/* ── Add Member Panel ── */}
//           {activeAction === "addMember" && (
//             <div style={s.actionPanel}>
//               <h4 style={s.actionTitle}>👥 Add Member to Group</h4>
//               <div style={{ display: "flex", gap: "10px" }}>
//                 <input
//                   type="email"
//                   placeholder="Enter member's email"
//                   value={memberEmail}
//                   onChange={(e) => setMemberEmail(e.target.value)}
//                   style={{ ...s.formInput, flex: 1 }}
//                 />
//                 <button
//                   onClick={handleAddMember}
//                   disabled={addingMember}
//                   style={s.addBtn}
//                 >
//                   {addingMember ? "Adding..." : "Add"}
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* ── Split Expense Panel ── */}
//           {activeAction === "splitExpense" && (
//             <div style={s.actionPanel}>
//               <h4 style={s.actionTitle}>💸 Split Expense</h4>
//               <div
//                 style={{
//                   display: "flex",
//                   flexDirection: "column",
//                   gap: "12px",
//                 }}
//               >
//                 <input
//                   type="text"
//                   placeholder="What was this for? e.g. Dinner"
//                   value={expenseForm.title}
//                   onChange={(e) =>
//                     setExpenseForm({ ...expenseForm, title: e.target.value })
//                   }
//                   style={s.formInput}
//                 />
//                 <input
//                   type="number"
//                   placeholder="Total amount (₹)"
//                   value={expenseForm.amount}
//                   onChange={(e) =>
//                     setExpenseForm({ ...expenseForm, amount: e.target.value })
//                   }
//                   style={s.formInput}
//                 />

//                 {/* Split Type Selector */}
//                 <div>
//                   <p
//                     style={{
//                       fontSize: "0.82rem",
//                       fontWeight: "600",
//                       color: "#1a1a2e",
//                       marginBottom: "8px",
//                     }}
//                   >
//                     How to split?
//                   </p>
//                   <div style={{ display: "flex", gap: "8px" }}>
//                     {[
//                       { key: "equal", label: "⚖️ Equal" },
//                       { key: "custom", label: "✏️ Custom Amount" },
//                       { key: "percentage", label: "📊 Percentage" },
//                     ].map((st) => (
//                       <button
//                         key={st.key}
//                         onClick={() =>
//                           setExpenseForm({ ...expenseForm, splitType: st.key })
//                         }
//                         style={{
//                           padding: "7px 14px",
//                           borderRadius: "8px",
//                           border: "1.5px solid",
//                           fontSize: "0.78rem",
//                           fontWeight: "600",
//                           cursor: "pointer",
//                           borderColor:
//                             expenseForm.splitType === st.key
//                               ? "#1a2ea8"
//                               : "#e2e6f0",
//                           background:
//                             expenseForm.splitType === st.key
//                               ? "#e3ebff"
//                               : "white",
//                           color:
//                             expenseForm.splitType === st.key
//                               ? "#1a2ea8"
//                               : "#666",
//                         }}
//                       >
//                         {st.label}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Equal Split Preview */}
//                 {expenseForm.splitType === "equal" && expenseForm.amount && (
//                   <div style={s.splitPreview}>
//                     <p
//                       style={{
//                         fontSize: "0.8rem",
//                         color: "#666",
//                         marginBottom: "8px",
//                       }}
//                     >
//                       Each person pays:
//                     </p>
//                     {group.members.map((m) => (
//                       <div key={m._id} style={s.splitRow}>
//                         <span style={s.splitName}>{m.name}</span>
//                         <span style={s.splitAmount}>
//                           ₹
//                           {(
//                             parseFloat(expenseForm.amount) /
//                             group.members.length
//                           ).toFixed(2)}
//                         </span>
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 {/* Custom Amount Split */}
//                 {expenseForm.splitType === "custom" && (
//                   <div style={s.splitPreview}>
//                     <p
//                       style={{
//                         fontSize: "0.8rem",
//                         color: "#666",
//                         marginBottom: "8px",
//                       }}
//                     >
//                       Enter amount for each person:
//                     </p>
//                     {expenseForm.customSplits.map((cs, i) => (
//                       <div key={cs.userId} style={s.splitRow}>
//                         <span style={s.splitName}>{cs.name}</span>
//                         <div
//                           style={{
//                             display: "flex",
//                             alignItems: "center",
//                             gap: "6px",
//                           }}
//                         >
//                           <span style={{ fontSize: "0.82rem", color: "#666" }}>
//                             ₹
//                           </span>
//                           <input
//                             type="number"
//                             placeholder="0.00"
//                             value={cs.amount}
//                             onChange={(e) => {
//                               const updated = [...expenseForm.customSplits];
//                               updated[i].amount = e.target.value;
//                               setExpenseForm({
//                                 ...expenseForm,
//                                 customSplits: updated,
//                               });
//                             }}
//                             style={{
//                               ...s.formInput,
//                               width: "100px",
//                               padding: "6px 10px",
//                             }}
//                           />
//                         </div>
//                       </div>
//                     ))}
//                     <p
//                       style={{
//                         fontSize: "0.75rem",
//                         color: "#666",
//                         marginTop: "6px",
//                       }}
//                     >
//                       Total entered: ₹
//                       {expenseForm.customSplits
//                         .reduce((s, c) => s + parseFloat(c.amount || 0), 0)
//                         .toFixed(2)}{" "}
//                       / ₹{expenseForm.amount || "0"}
//                     </p>
//                   </div>
//                 )}

//                 {/* Percentage Split */}
//                 {expenseForm.splitType === "percentage" && (
//                   <div style={s.splitPreview}>
//                     <p
//                       style={{
//                         fontSize: "0.8rem",
//                         color: "#666",
//                         marginBottom: "8px",
//                       }}
//                     >
//                       Enter percentage for each person:
//                     </p>
//                     {expenseForm.customSplits.map((cs, i) => (
//                       <div key={cs.userId} style={s.splitRow}>
//                         <span style={s.splitName}>{cs.name}</span>
//                         <div
//                           style={{
//                             display: "flex",
//                             alignItems: "center",
//                             gap: "6px",
//                           }}
//                         >
//                           <input
//                             type="number"
//                             placeholder="0"
//                             value={cs.percentage}
//                             onChange={(e) => {
//                               const updated = [...expenseForm.customSplits];
//                               updated[i].percentage = e.target.value;
//                               setExpenseForm({
//                                 ...expenseForm,
//                                 customSplits: updated,
//                               });
//                             }}
//                             style={{
//                               ...s.formInput,
//                               width: "80px",
//                               padding: "6px 10px",
//                             }}
//                           />
//                           <span style={{ fontSize: "0.82rem", color: "#666" }}>
//                             %
//                           </span>
//                           {expenseForm.amount && cs.percentage && (
//                             <span
//                               style={{ fontSize: "0.75rem", color: "#1a2ea8" }}
//                             >
//                               = ₹
//                               {(
//                                 (parseFloat(cs.percentage) / 100) *
//                                 parseFloat(expenseForm.amount)
//                               ).toFixed(2)}
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                     <p
//                       style={{
//                         fontSize: "0.75rem",
//                         color: "#666",
//                         marginTop: "6px",
//                       }}
//                     >
//                       Total:{" "}
//                       {expenseForm.customSplits.reduce(
//                         (s, c) => s + parseFloat(c.percentage || 0),
//                         0,
//                       )}
//                       % / 100%
//                     </p>
//                   </div>
//                 )}

//                 <div style={{ display: "flex", justifyContent: "flex-end" }}>
//                   <button
//                     onClick={handleAddExpense}
//                     disabled={addingExpense}
//                     style={s.addBtn}
//                   >
//                     {addingExpense ? "Adding..." : "Add & Split"}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* ── Settle Up Panel ── */}
//           {activeAction === "settleUp" && (
//             <div style={s.actionPanel}>
//               <h4 style={s.actionTitle}>✅ Settle Up</h4>

//               {group.expenses?.length === 0 ? (
//                 <p
//                   style={{
//                     color: "#666",
//                     textAlign: "center",
//                     padding: "20px",
//                   }}
//                 >
//                   No expenses to settle
//                 </p>
//               ) : (
//                 <div
//                   style={{
//                     display: "flex",
//                     flexDirection: "column",
//                     gap: "16px",
//                   }}
//                 >
//                   {group.expenses?.map((exp) => {
//                     const totalSettled = exp.splitBetween?.reduce(
//                       (s, x) => s + (x.settledAmount || 0),
//                       0,
//                     );
//                     const totalPending = exp.splitBetween?.reduce(
//                       (s, x) => s + (x.settled ? 0 : x.share),
//                       0,
//                     );
//                     const isAdmin = group.createdBy?._id === user?._id;

//                     return (
//                       <div
//                         key={exp._id}
//                         style={{
//                           background: "white",
//                           borderRadius: "10px",
//                           border: "1px solid #e2e6f0",
//                           overflow: "hidden",
//                         }}
//                       >
//                         {/* Expense Header */}
//                         <div
//                           style={{
//                             padding: "12px 16px",
//                             borderBottom: "1px solid #f0f2f8",
//                             display: "flex",
//                             justifyContent: "space-between",
//                             alignItems: "center",
//                           }}
//                         >
//                           <div>
//                             <p
//                               style={{
//                                 fontSize: "0.9rem",
//                                 fontWeight: "700",
//                                 color: "#1a1a2e",
//                               }}
//                             >
//                               {exp.title}
//                             </p>
//                             <p style={{ fontSize: "0.74rem", color: "#666" }}>
//                               Total: ₹{exp.amount.toFixed(2)} • Paid by{" "}
//                               {exp.paidBy?.name || "Someone"}
//                             </p>
//                           </div>
//                           <div style={{ textAlign: "right" }}>
//                             <p
//                               style={{
//                                 fontSize: "0.75rem",
//                                 color: "#16a34a",
//                                 fontWeight: "600",
//                               }}
//                             >
//                               ✓ ₹{totalSettled.toFixed(2)} settled
//                             </p>
//                             <p
//                               style={{
//                                 fontSize: "0.75rem",
//                                 color: "#dc2626",
//                                 fontWeight: "600",
//                               }}
//                             >
//                               ⏳ ₹{totalPending.toFixed(2)} pending
//                             </p>
//                           </div>
//                         </div>

//                         {/* Per Person Rows */}
//                         {exp.splitBetween?.map((split) => {
//                           const canSettle =
//                             isAdmin || split.user?._id === user?._id;
//                           return (
//                             <div
//                               key={split._id}
//                               style={{
//                                 padding: "10px 16px",
//                                 borderBottom: "1px solid #f9fafb",
//                                 display: "flex",
//                                 alignItems: "center",
//                                 gap: "10px",
//                               }}
//                             >
//                               {/* Avatar */}
//                               <div
//                                 style={{
//                                   width: "32px",
//                                   height: "32px",
//                                   borderRadius: "50%",
//                                   background: "#1a2ea8",
//                                   color: "white",
//                                   fontSize: "12px",
//                                   fontWeight: "700",
//                                   display: "flex",
//                                   alignItems: "center",
//                                   justifyContent: "center",
//                                   flexShrink: 0,
//                                 }}
//                               >
//                                 {split.user?.name?.charAt(0).toUpperCase()}
//                               </div>

//                               {/* Name + amounts */}
//                               <div style={{ flex: 1 }}>
//                                 <p
//                                   style={{
//                                     fontSize: "0.84rem",
//                                     fontWeight: "600",
//                                     color: "#1a1a2e",
//                                   }}
//                                 >
//                                   {split.user?.name}
//                                   {split.user?._id === user?._id && (
//                                     <span
//                                       style={{
//                                         fontSize: "0.7rem",
//                                         color: "#1a2ea8",
//                                         marginLeft: "4px",
//                                       }}
//                                     >
//                                       (You)
//                                     </span>
//                                   )}
//                                 </p>
//                                 <div
//                                   style={{
//                                     display: "flex",
//                                     gap: "8px",
//                                     marginTop: "2px",
//                                   }}
//                                 >
//                                   {split.settledAmount > 0 && (
//                                     <span
//                                       style={{
//                                         fontSize: "0.7rem",
//                                         color: "#16a34a",
//                                         fontWeight: "600",
//                                       }}
//                                     >
//                                       Paid: ₹{split.settledAmount.toFixed(2)}
//                                     </span>
//                                   )}
//                                   {!split.settled && (
//                                     <span
//                                       style={{
//                                         fontSize: "0.7rem",
//                                         color: "#dc2626",
//                                         fontWeight: "600",
//                                       }}
//                                     >
//                                       Owes: ₹{split.share.toFixed(2)}
//                                     </span>
//                                   )}
//                                   {split.settled && (
//                                     <span
//                                       style={{
//                                         fontSize: "0.7rem",
//                                         color: "#16a34a",
//                                         fontWeight: "600",
//                                       }}
//                                     >
//                                       ✓ Fully Settled
//                                     </span>
//                                   )}
//                                 </div>
//                               </div>

//                               {/* Settle buttons — only if not settled and allowed */}
//                               {!split.settled && canSettle && (
//                                 <div
//                                   style={{
//                                     display: "flex",
//                                     gap: "6px",
//                                     alignItems: "center",
//                                   }}
//                                 >
//                                   {/* Partial settle input */}
//                                   <input
//                                     type="number"
//                                     placeholder={`Max ₹${split.share}`}
//                                     id={`partial-${exp._id}-${split._id}`}
//                                     style={{
//                                       width: "100px",
//                                       padding: "5px 8px",
//                                       border: "1.5px solid #d1d5db",
//                                       borderRadius: "6px",
//                                       fontSize: "0.78rem",
//                                       outline: "none",
//                                     }}
//                                   />
//                                   {/* Partial settle button */}
//                                   <button
//                                     onClick={() => {
//                                       const input = document.getElementById(
//                                         `partial-${exp._id}-${split._id}`,
//                                       );
//                                       const partial = parseFloat(input?.value);
//                                       handleSettle(
//                                         exp._id,
//                                         split.user?._id,
//                                         partial || null,
//                                       );
//                                       if (input) input.value = "";
//                                     }}
//                                     style={{
//                                       background: "#fef9c3",
//                                       color: "#854d0e",
//                                       border: "none",
//                                       borderRadius: "6px",
//                                       padding: "5px 10px",
//                                       fontSize: "0.74rem",
//                                       fontWeight: "600",
//                                       cursor: "pointer",
//                                     }}
//                                   >
//                                     Pay Partial
//                                   </button>
//                                   {/* Full settle button */}
//                                   <button
//                                     onClick={() =>
//                                       handleSettle(
//                                         exp._id,
//                                         split.user?._id,
//                                         null,
//                                       )
//                                     }
//                                     style={{
//                                       background: "#dcfce7",
//                                       color: "#16a34a",
//                                       border: "none",
//                                       borderRadius: "6px",
//                                       padding: "5px 10px",
//                                       fontSize: "0.74rem",
//                                       fontWeight: "600",
//                                       cursor: "pointer",
//                                     }}
//                                   >
//                                     Settle All ✓
//                                   </button>
//                                 </div>
//                               )}
//                             </div>
//                           );
//                         })}
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//         {/* ── Who Owes Panel ── */}
//         {/* ── Who Owes Panel ── */}
//         {activeAction === "whoOwes" && (
//           <div style={s.actionPanel}>
//             <h4 style={s.actionTitle}>📊 Who Owes What</h4>
//             <div
//               style={{ display: "flex", flexDirection: "column", gap: "10px" }}
//             >
//               {getOweSummary().map((person) => (
//                 <div
//                   key={person.name}
//                   style={{
//                     display: "flex",
//                     alignItems: "center",
//                     gap: "12px",
//                     padding: "12px",
//                     borderRadius: "8px",
//                     background: "white",
//                     border: "1px solid #e2e6f0",
//                   }}
//                 >
//                   <div style={s.oweAvatar}>
//                     {person.name?.charAt(0).toUpperCase()}
//                   </div>
//                   <div style={{ flex: 1 }}>
//                     <p
//                       style={{
//                         fontSize: "0.88rem",
//                         fontWeight: "600",
//                         color: "#1a1a2e",
//                         marginBottom: "4px",
//                       }}
//                     >
//                       {person.name}
//                     </p>
//                     <div style={{ display: "flex", gap: "12px" }}>
//                       <span
//                         style={{
//                           fontSize: "0.74rem",
//                           color: "#16a34a",
//                           fontWeight: "600",
//                         }}
//                       >
//                         💰 Paid: ₹{person.paid.toFixed(2)}
//                       </span>
//                       <span
//                         style={{
//                           fontSize: "0.74rem",
//                           color: "#dc2626",
//                           fontWeight: "600",
//                         }}
//                       >
//                         ⏳ Owes: ₹{person.owes.toFixed(2)}
//                       </span>
//                       <span
//                         style={{
//                           fontSize: "0.74rem",
//                           color: "#1a2ea8",
//                           fontWeight: "600",
//                         }}
//                       >
//                         ✓ Settled: ₹{person.settled.toFixed(2)}
//                       </span>
//                     </div>
//                   </div>
//                   <div
//                     style={{
//                       padding: "4px 10px",
//                       borderRadius: "6px",
//                       background: person.owes > 0 ? "#fee2e2" : "#dcfce7",
//                     }}
//                   >
//                     <p
//                       style={{
//                         fontSize: "0.82rem",
//                         fontWeight: "700",
//                         color: person.owes > 0 ? "#dc2626" : "#16a34a",
//                       }}
//                     >
//                       {person.owes > 0
//                         ? `Owes ₹${person.owes.toFixed(2)}`
//                         : "✓ Clear"}
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Members List */}
//         <div style={s.dashCard}>
//           <h3 style={s.cardTitle}>Members ({group.members?.length})</h3>
//           <div
//             style={{ display: "flex", flexDirection: "column", gap: "10px" }}
//           >
//             {group.members?.map((member) => (
//               <div key={member._id} style={s.memberRow}>
//                 <div style={s.memberAvatar}>
//                   {member.name?.charAt(0).toUpperCase()}
//                 </div>
//                 <div style={{ flex: 1 }}>
//                   <p
//                     style={{
//                       fontSize: "0.88rem",
//                       fontWeight: "600",
//                       color: "#1a1a2e",
//                     }}
//                   >
//                     {member.name}
//                     {member._id === user?._id && (
//                       <span
//                         style={{
//                           fontSize: "0.7rem",
//                           color: "#1a2ea8",
//                           marginLeft: "6px",
//                         }}
//                       >
//                         (You)
//                       </span>
//                     )}
//                   </p>
//                   <p style={{ fontSize: "0.74rem", color: "#666" }}>
//                     {member.email}
//                   </p>
//                 </div>
//                 {group.createdBy?._id === member._id && (
//                   <span style={s.adminBadge}>Admin</span>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Expenses List */}
//         <div style={s.dashCard}>
//           <h3 style={s.cardTitle}>
//             All Expenses ({group.expenses?.length || 0})
//           </h3>
//           {!group.expenses?.length ? (
//             <div style={{ textAlign: "center", padding: "40px 0" }}>
//               <p style={{ fontSize: "40px", marginBottom: "12px" }}>💸</p>
//               <p style={{ color: "#666", fontSize: "0.88rem" }}>
//                 No expenses yet. Use Split Expense above!
//               </p>
//             </div>
//           ) : (
//             <div
//               style={{ display: "flex", flexDirection: "column", gap: "12px" }}
//             >
//               {group.expenses?.map((exp) => (
//                 <div key={exp._id} style={s.expenseRow}>
//                   <div style={s.expenseIcon}>💸</div>
//                   <div style={{ flex: 1 }}>
//                     <p
//                       style={{
//                         fontSize: "0.9rem",
//                         fontWeight: "600",
//                         color: "#1a1a2e",
//                         marginBottom: "3px",
//                       }}
//                     >
//                       {exp.title}
//                     </p>
//                     <p style={{ fontSize: "0.74rem", color: "#666" }}>
//                       Paid by <strong>{exp.paidBy?.name || "Someone"}</strong> •{" "}
//                       {new Date(exp.date).toLocaleDateString("en-IN", {
//                         day: "numeric",
//                         month: "short",
//                         year: "numeric",
//                       })}
//                     </p>
//                     <div
//                       style={{
//                         display: "flex",
//                         gap: "6px",
//                         marginTop: "6px",
//                         flexWrap: "wrap",
//                       }}
//                     >
//                       {exp.splitBetween?.map((s) => (
//                         <span
//                           key={s._id}
//                           style={{
//                             fontSize: "0.68rem",
//                             padding: "2px 7px",
//                             borderRadius: "4px",
//                             fontWeight: "600",
//                             background: s.settled ? "#dcfce7" : "#fee2e2",
//                             color: s.settled ? "#16a34a" : "#dc2626",
//                           }}
//                         >
//                           {s.user?.name?.split(" ")[0] || "?"}: ₹{s.share}
//                           {s.settled ? " ✓" : ""}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                   <p
//                     style={{
//                       fontFamily: "'Sora',sans-serif",
//                       fontSize: "0.95rem",
//                       fontWeight: "700",
//                       color: "#1a1a2e",
//                     }}
//                   >
//                     ₹{exp.amount.toFixed(2)}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// };

// const s = {
//   appBody: {
//     background: "#eef0f7",
//     minHeight: "100vh",
//     fontFamily: "'Inter',sans-serif",
//   },
//   appNav: {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "space-between",
//     padding: "0 36px",
//     height: "60px",
//     background: "#1a2ea8",
//     position: "sticky",
//     top: 0,
//     zIndex: 100,
//   },
//   appNavBrand: { display: "flex", alignItems: "center", gap: "10px" },
//   appLogoFallback: {
//     width: "38px",
//     height: "38px",
//     borderRadius: "50%",
//     background: "#4a6cf7",
//     color: "white",
//     fontFamily: "'Sora',sans-serif",
//     fontSize: "16px",
//     fontWeight: "700",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   appBrandName: {
//     fontFamily: "'Sora',sans-serif",
//     fontSize: "19px",
//     fontWeight: "700",
//     color: "white",
//   },
//   appNavLinks: {
//     display: "flex",
//     gap: "30px",
//     listStyle: "none",
//     margin: 0,
//     padding: 0,
//   },
//   appNavLink: {
//     color: "rgba(255,255,255,0.78)",
//     fontSize: "14px",
//     fontWeight: "500",
//     textDecoration: "none",
//   },
//   appNavRight: { display: "flex", alignItems: "center", gap: "12px" },
//   notifBtn: {
//     position: "relative",
//     background: "rgba(255,255,255,0.14)",
//     border: "none",
//     borderRadius: "8px",
//     width: "36px",
//     height: "36px",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     cursor: "pointer",
//     color: "white",
//     fontSize: "16px",
//   },
//   notifBadge: {
//     position: "absolute",
//     top: "-5px",
//     right: "-5px",
//     background: "#ef4444",
//     color: "white",
//     fontSize: "10px",
//     fontWeight: "700",
//     width: "17px",
//     height: "17px",
//     borderRadius: "50%",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   appUserChip: {
//     display: "flex",
//     alignItems: "center",
//     gap: "8px",
//     background: "#2d47c9",
//     borderRadius: "8px",
//     padding: "5px 10px 5px 5px",
//   },
//   appAvatar: {
//     width: "30px",
//     height: "30px",
//     borderRadius: "6px",
//     background: "rgba(255,255,255,0.2)",
//     color: "white",
//     fontSize: "11px",
//     fontWeight: "700",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   appUsername: { fontSize: "12px", color: "white" },
//   logoutBtn: {
//     background: "rgba(255,255,255,0.15)",
//     border: "none",
//     borderRadius: "8px",
//     padding: "6px 14px",
//     color: "white",
//     fontSize: "13px",
//     fontWeight: "600",
//     cursor: "pointer",
//   },
//   dashMain: {
//     maxWidth: "1060px",
//     margin: "0 auto",
//     padding: "28px 28px 60px",
//     display: "flex",
//     flexDirection: "column",
//     gap: "20px",
//   },
//   pageTitle: {
//     fontFamily: "'Sora',sans-serif",
//     fontSize: "1.9rem",
//     fontWeight: "800",
//     color: "#1a1a2e",
//     marginBottom: "4px",
//   },
//   backBtn: {
//     background: "white",
//     border: "1px solid #e2e6f0",
//     borderRadius: "8px",
//     padding: "8px 16px",
//     fontSize: "0.85rem",
//     fontWeight: "600",
//     color: "#1a1a2e",
//     cursor: "pointer",
//   },
//   addBtn: {
//     background: "#1a2ea8",
//     color: "white",
//     border: "none",
//     borderRadius: "8px",
//     padding: "10px 20px",
//     fontSize: "0.88rem",
//     fontWeight: "600",
//     fontFamily: "'Sora',sans-serif",
//     cursor: "pointer",
//   },
//   dashCard: {
//     background: "white",
//     borderRadius: "14px",
//     border: "1px solid #e2e6f0",
//     padding: "26px 28px",
//   },
//   cardTitle: {
//     fontFamily: "'Sora',sans-serif",
//     fontSize: "1rem",
//     fontWeight: "700",
//     color: "#1a1a2e",
//     marginBottom: "16px",
//   },
//   formInput: {
//     padding: "11px 14px",
//     border: "1.5px solid #d1d5db",
//     borderRadius: "8px",
//     fontSize: "0.9rem",
//     fontFamily: "'Inter',sans-serif",
//     color: "#1a1a2e",
//     background: "#f9fafb",
//     outline: "none",
//     width: "100%",
//     boxSizing: "border-box",
//   },
//   statCard: {
//     background: "linear-gradient(135deg,#1a2ea8,#2d47c9)",
//     borderRadius: "14px",
//     padding: "20px 22px",
//     position: "relative",
//   },
//   statLabel: {
//     fontSize: "0.8rem",
//     color: "rgba(255,255,255,0.72)",
//     marginBottom: "6px",
//   },
//   statValue: {
//     fontFamily: "'Sora',sans-serif",
//     fontSize: "1.4rem",
//     fontWeight: "700",
//     color: "white",
//   },
//   statIcon: {
//     position: "absolute",
//     top: "18px",
//     right: "18px",
//     fontSize: "22px",
//   },
//   actionPanel: {
//     marginTop: "16px",
//     padding: "20px",
//     borderRadius: "12px",
//     background: "#f8f9fc",
//     border: "1px solid #e2e6f0",
//   },
//   actionTitle: {
//     fontFamily: "'Sora',sans-serif",
//     fontSize: "0.95rem",
//     fontWeight: "700",
//     color: "#1a1a2e",
//     marginBottom: "14px",
//   },
//   splitPreview: {
//     background: "white",
//     borderRadius: "8px",
//     padding: "12px",
//     border: "1px solid #e2e6f0",
//   },
//   splitRow: {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "space-between",
//     padding: "6px 0",
//     borderBottom: "1px solid #f0f2f8",
//   },
//   splitName: { fontSize: "0.82rem", fontWeight: "600", color: "#1a1a2e" },
//   splitAmount: { fontSize: "0.82rem", fontWeight: "700", color: "#1a2ea8" },
//   settleRow: {
//     display: "flex",
//     alignItems: "center",
//     gap: "12px",
//     padding: "12px",
//     borderRadius: "8px",
//     background: "white",
//     border: "1px solid #e2e6f0",
//   },
//   settleBtn: {
//     background: "#dcfce7",
//     color: "#16a34a",
//     border: "none",
//     borderRadius: "6px",
//     padding: "6px 12px",
//     fontSize: "0.78rem",
//     fontWeight: "600",
//     cursor: "pointer",
//   },
//   oweRow: {
//     display: "flex",
//     alignItems: "center",
//     gap: "12px",
//     padding: "10px",
//     borderRadius: "8px",
//     background: "white",
//     border: "1px solid #e2e6f0",
//   },
//   oweAvatar: {
//     width: "36px",
//     height: "36px",
//     borderRadius: "50%",
//     background: "#1a2ea8",
//     color: "white",
//     fontSize: "13px",
//     fontWeight: "700",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   memberRow: {
//     display: "flex",
//     alignItems: "center",
//     gap: "12px",
//     padding: "10px 12px",
//     borderRadius: "10px",
//     background: "#f8f9fc",
//   },
//   memberAvatar: {
//     width: "38px",
//     height: "38px",
//     borderRadius: "50%",
//     background: "#1a2ea8",
//     color: "white",
//     fontSize: "14px",
//     fontWeight: "700",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   adminBadge: {
//     fontSize: "0.68rem",
//     fontWeight: "700",
//     padding: "3px 8px",
//     borderRadius: "4px",
//     background: "#e3ebff",
//     color: "#1a2ea8",
//   },
//   expenseRow: {
//     display: "flex",
//     alignItems: "flex-start",
//     gap: "14px",
//     padding: "14px",
//     borderRadius: "12px",
//     background: "#f8f9fc",
//     border: "1px solid #e2e6f0",
//   },
//   expenseIcon: {
//     width: "40px",
//     height: "40px",
//     borderRadius: "10px",
//     background: "#e3ebff",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     fontSize: "18px",
//     flexShrink: 0,
//   },
// };

// export default GroupDetail;

import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";

const GroupDetail = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeAction, setActiveAction] = useState(null);
  const [memberEmail, setMemberEmail] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    title: "",
    amount: "",
    splitType: "equal",
    customSplits: [],
  });
  const [addingExpense, setAddingExpense] = useState(false);

  useEffect(() => {
    fetchGroup();
  }, [id]);

  const fetchGroup = async () => {
    try {
      const { data } = await API.get(`/api/groups/${id}`);
      setGroup(data);
      setExpenseForm((prev) => ({
        ...prev,
        customSplits: data.members.map((m) => ({
          userId: m._id,
          name: m.name,
          amount: "",
          percentage: "",
        })),
      }));
    } catch (err) {
      toast.error("Failed to load group");
      navigate("/groups");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!memberEmail.trim()) return toast.error("Enter an email address");
    setAddingMember(true);
    try {
      await API.post(`/api/groups/${id}/members`, { email: memberEmail });
      toast.success("Member added!");
      setMemberEmail("");
      setActiveAction(null);
      fetchGroup();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add member");
    } finally {
      setAddingMember(false);
    }
  };

  const handleAddExpense = async () => {
    if (!expenseForm.title.trim()) return toast.error("Title is required");
    if (!expenseForm.amount || expenseForm.amount <= 0)
      return toast.error("Valid amount is required");

    if (expenseForm.splitType === "custom") {
      const total = expenseForm.customSplits.reduce(
        (s, c) => s + parseFloat(c.amount || 0),
        0,
      );
      if (Math.abs(total - parseFloat(expenseForm.amount)) > 0.01)
        return toast.error(
          `Custom amounts must add up to ₹${expenseForm.amount}`,
        );
    }
    if (expenseForm.splitType === "percentage") {
      const total = expenseForm.customSplits.reduce(
        (s, c) => s + parseFloat(c.percentage || 0),
        0,
      );
      if (Math.abs(total - 100) > 0.01)
        return toast.error("Percentages must add up to 100%");
    }

    setAddingExpense(true);
    try {
      const payload = {
        title: expenseForm.title,
        amount: parseFloat(expenseForm.amount),
        splitType: expenseForm.splitType,
        customSplits: expenseForm.customSplits.map((s) => ({
          userId: s.userId,
          amount: parseFloat(s.amount || 0),
          percentage: parseFloat(s.percentage || 0),
        })),
      };
      await API.post(`/api/groups/${id}/expenses`, payload);
      toast.success("Expense added & split!");
      setExpenseForm((prev) => ({
        ...prev,
        title: "",
        amount: "",
        splitType: "equal",
      }));
      setActiveAction(null);
      fetchGroup();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add expense");
    } finally {
      setAddingExpense(false);
    }
  };

  // ✅ Fixed handleSettle
  const handleSettle = async (expenseId, targetUserId, partialAmount) => {
    try {
      await API.put(`/api/groups/${id}/expenses/${expenseId}/settle`, {
        userId: targetUserId,
        partialAmount: partialAmount || null,
      });
      toast.success(
        partialAmount
          ? `₹${partialAmount} marked as paid!`
          : "Fully settled! ✓",
      );
      fetchGroup();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to settle");
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out!");
    navigate("/login");
  };

  // ✅ Fixed getOweSummary with settled field
  const getOweSummary = () => {
    if (!group) return [];
    const owes = {};
    group.members.forEach((m) => {
      owes[m._id] = { name: m.name, owes: 0, paid: 0, settled: 0 };
    });
    group.expenses?.forEach((exp) => {
      if (owes[exp.paidBy?._id]) {
        owes[exp.paidBy._id].paid += exp.amount;
      }
      exp.splitBetween?.forEach((s) => {
        if (owes[s.user?._id]) {
          if (!s.settled) {
            owes[s.user._id].owes += s.share;
          }
          if (s.settledAmount) {
            owes[s.user._id].settled += s.settledAmount;
          }
        }
      });
    });
    return Object.values(owes);
  };

  const myOwed = () => {
    if (!group) return 0;
    let total = 0;
    group.expenses?.forEach((exp) => {
      exp.splitBetween?.forEach((s) => {
        // ✅ Fixed toString() comparison
        if (s.user?._id?.toString() === user?.id?.toString() && !s.settled) {
          total += s.share;
        }
      });
    });
    return total;
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <p style={{ color: "#666" }}>Loading group...</p>
      </div>
    );
  }

  if (!group) return null;

  return (
    <div style={s.appBody}>
      {/* Nav */}
      <nav style={s.appNav}>
        <div style={s.appNavBrand}>
          <div style={s.appLogoFallback}>T</div>
          <span style={s.appBrandName}>Trackify</span>
        </div>
        <ul style={s.appNavLinks}>
          <li>
            <Link to="/dashboard" style={s.appNavLink}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/add-expense" style={s.appNavLink}>
              Add Expense
            </Link>
          </li>
          <li>
            <Link to="/transactions" style={s.appNavLink}>
              Transactions
            </Link>
          </li>
          <li>
            <Link to="/friends" style={s.appNavLink}>
              Friends
            </Link>
          </li>
          <li>
            <Link to="/groups" style={{ ...s.appNavLink, color: "white" }}>
              Groups
            </Link>
          </li>
          <li>
            <Link to="/budget" style={s.appNavLink}>
              Budget
            </Link>
          </li>
        </ul>
        <div style={s.appNavRight}>
          <button style={s.notifBtn}>
            🔔<span style={s.notifBadge}>2</span>
          </button>
          <div style={s.appUserChip}>
            <div style={s.appAvatar}>{user?.name?.charAt(0).toUpperCase()}</div>
            <span style={s.appUsername}>{user?.name}</span>
          </div>
          <button style={s.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <main style={s.dashMain}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => navigate("/groups")} style={s.backBtn}>
            ← Back
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={s.pageTitle}>{group.name}</h1>
            <p style={{ fontSize: "0.85rem", color: "#666" }}>
              {group.description || "No description"} • {group.members?.length}{" "}
              member
              {group.members?.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: "16px",
          }}
        >
          {[
            {
              label: "Total Expenses",
              value: `₹${(group.expenses?.reduce((s, e) => s + e.amount, 0) || 0).toFixed(2)}`,
              icon: "💸",
            },
            { label: "Members", value: group.members?.length || 0, icon: "👥" },
            { label: "You Owe", value: `₹${myOwed().toFixed(2)}`, icon: "👛" },
          ].map((c) => (
            <div key={c.label} style={s.statCard}>
              <p style={s.statLabel}>{c.label}</p>
              <p style={s.statValue}>{c.value}</p>
              <span style={s.statIcon}>{c.icon}</span>
            </div>
          ))}
        </div>

        {/* ✅ Quick Actions — ALL panels inside this one dashCard */}
        <div style={s.dashCard}>
          <h3 style={s.cardTitle}>Quick Actions</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: "12px",
            }}
          >
            {[
              {
                key: "addMember",
                icon: "👥",
                label: "Add Member",
                color: "#e3ebff",
                tc: "#1a2ea8",
              },
              {
                key: "splitExpense",
                icon: "💸",
                label: "Split Expense",
                color: "#d6f5e8",
                tc: "#0d7a68",
              },
              {
                key: "settleUp",
                icon: "✅",
                label: "Settle Up",
                color: "#fdf3d0",
                tc: "#7c3000",
              },
              {
                key: "whoOwes",
                icon: "📊",
                label: "Who Owes",
                color: "#f3e8ff",
                tc: "#6b21a8",
              },
            ].map((qa) => (
              <div
                key={qa.key}
                onClick={() =>
                  setActiveAction(activeAction === qa.key ? null : qa.key)
                }
                style={{
                  background: activeAction === qa.key ? qa.color : "#f8f9fc",
                  border: `2px solid ${activeAction === qa.key ? qa.tc + "44" : "#e2e6f0"}`,
                  borderRadius: "12px",
                  padding: "18px 14px",
                  textAlign: "center",
                  cursor: "pointer",
                }}
              >
                <p style={{ fontSize: "28px", marginBottom: "8px" }}>
                  {qa.icon}
                </p>
                <p
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: "700",
                    color: activeAction === qa.key ? qa.tc : "#1a1a2e",
                  }}
                >
                  {qa.label}
                </p>
              </div>
            ))}
          </div>

          {/* ── Add Member Panel ── */}
          {activeAction === "addMember" && (
            <div style={s.actionPanel}>
              <h4 style={s.actionTitle}>👥 Add Member to Group</h4>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="email"
                  placeholder="Enter member's email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  style={{ ...s.formInput, flex: 1 }}
                />
                <button
                  onClick={handleAddMember}
                  disabled={addingMember}
                  style={s.addBtn}
                >
                  {addingMember ? "Adding..." : "Add"}
                </button>
              </div>
            </div>
          )}

          {/* ── Split Expense Panel ── */}
          {activeAction === "splitExpense" && (
            <div style={s.actionPanel}>
              <h4 style={s.actionTitle}>💸 Split Expense</h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <input
                  type="text"
                  placeholder="What was this for? e.g. Dinner"
                  value={expenseForm.title}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, title: e.target.value })
                  }
                  style={s.formInput}
                />
                <input
                  type="number"
                  placeholder="Total amount (₹)"
                  value={expenseForm.amount}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, amount: e.target.value })
                  }
                  style={s.formInput}
                />
                <div>
                  <p
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: "600",
                      color: "#1a1a2e",
                      marginBottom: "8px",
                    }}
                  >
                    How to split?
                  </p>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {[
                      { key: "equal", label: "⚖️ Equal" },
                      { key: "custom", label: "✏️ Custom Amount" },
                      { key: "percentage", label: "📊 Percentage" },
                    ].map((st) => (
                      <button
                        key={st.key}
                        onClick={() =>
                          setExpenseForm({ ...expenseForm, splitType: st.key })
                        }
                        style={{
                          padding: "7px 14px",
                          borderRadius: "8px",
                          border: "1.5px solid",
                          fontSize: "0.78rem",
                          fontWeight: "600",
                          cursor: "pointer",
                          borderColor:
                            expenseForm.splitType === st.key
                              ? "#1a2ea8"
                              : "#e2e6f0",
                          background:
                            expenseForm.splitType === st.key
                              ? "#e3ebff"
                              : "white",
                          color:
                            expenseForm.splitType === st.key
                              ? "#1a2ea8"
                              : "#666",
                        }}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Equal Split Preview */}
                {expenseForm.splitType === "equal" && expenseForm.amount && (
                  <div style={s.splitPreview}>
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "#666",
                        marginBottom: "8px",
                      }}
                    >
                      Each person pays:
                    </p>
                    {group.members.map((m) => (
                      <div key={m._id} style={s.splitRow}>
                        <span style={s.splitName}>{m.name}</span>
                        <span style={s.splitAmount}>
                          ₹
                          {(
                            parseFloat(expenseForm.amount) /
                            group.members.length
                          ).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Custom Amount Split */}
                {expenseForm.splitType === "custom" && (
                  <div style={s.splitPreview}>
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "#666",
                        marginBottom: "8px",
                      }}
                    >
                      Enter amount for each person:
                    </p>
                    {expenseForm.customSplits.map((cs, i) => (
                      <div key={cs.userId} style={s.splitRow}>
                        <span style={s.splitName}>{cs.name}</span>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <span style={{ fontSize: "0.82rem", color: "#666" }}>
                            ₹
                          </span>
                          <input
                            type="number"
                            placeholder="0.00"
                            value={cs.amount}
                            onChange={(e) => {
                              const updated = [...expenseForm.customSplits];
                              updated[i].amount = e.target.value;
                              setExpenseForm({
                                ...expenseForm,
                                customSplits: updated,
                              });
                            }}
                            style={{
                              ...s.formInput,
                              width: "100px",
                              padding: "6px 10px",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "#666",
                        marginTop: "6px",
                      }}
                    >
                      Total: ₹
                      {expenseForm.customSplits
                        .reduce((s, c) => s + parseFloat(c.amount || 0), 0)
                        .toFixed(2)}{" "}
                      / ₹{expenseForm.amount || "0"}
                    </p>
                  </div>
                )}

                {/* Percentage Split */}
                {expenseForm.splitType === "percentage" && (
                  <div style={s.splitPreview}>
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "#666",
                        marginBottom: "8px",
                      }}
                    >
                      Enter percentage for each person:
                    </p>
                    {expenseForm.customSplits.map((cs, i) => (
                      <div key={cs.userId} style={s.splitRow}>
                        <span style={s.splitName}>{cs.name}</span>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <input
                            type="number"
                            placeholder="0"
                            value={cs.percentage}
                            onChange={(e) => {
                              const updated = [...expenseForm.customSplits];
                              updated[i].percentage = e.target.value;
                              setExpenseForm({
                                ...expenseForm,
                                customSplits: updated,
                              });
                            }}
                            style={{
                              ...s.formInput,
                              width: "80px",
                              padding: "6px 10px",
                            }}
                          />
                          <span style={{ fontSize: "0.82rem", color: "#666" }}>
                            %
                          </span>
                          {expenseForm.amount && cs.percentage && (
                            <span
                              style={{ fontSize: "0.75rem", color: "#1a2ea8" }}
                            >
                              = ₹
                              {(
                                (parseFloat(cs.percentage) / 100) *
                                parseFloat(expenseForm.amount)
                              ).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "#666",
                        marginTop: "6px",
                      }}
                    >
                      Total:{" "}
                      {expenseForm.customSplits.reduce(
                        (s, c) => s + parseFloat(c.percentage || 0),
                        0,
                      )}
                      % / 100%
                    </p>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={handleAddExpense}
                    disabled={addingExpense}
                    style={s.addBtn}
                  >
                    {addingExpense ? "Adding..." : "Add & Split"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Settle Up Panel ── */}
          {activeAction === "settleUp" && (
            <div style={s.actionPanel}>
              <h4 style={s.actionTitle}>✅ Settle Up</h4>
              {group.expenses?.length === 0 ? (
                <p
                  style={{
                    color: "#666",
                    textAlign: "center",
                    padding: "20px",
                  }}
                >
                  No expenses to settle
                </p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  {group.expenses?.map((exp) => {
                    const totalSettled = exp.splitBetween?.reduce(
                      (s, x) => s + (x.settledAmount || 0),
                      0,
                    );
                    const totalPending = exp.splitBetween?.reduce(
                      (s, x) => s + (x.settled ? 0 : x.share),
                      0,
                    );
                    // ✅ Fixed isAdmin comparison
                    const isAdmin =
                      group.createdBy?._id?.toString() === user?.id?.toString();

                    return (
                      <div
                        key={exp._id}
                        style={{
                          background: "white",
                          borderRadius: "10px",
                          border: "1px solid #e2e6f0",
                          overflow: "hidden",
                        }}
                      >
                        {/* Expense Header */}
                        <div
                          style={{
                            padding: "12px 16px",
                            borderBottom: "1px solid #f0f2f8",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <p
                              style={{
                                fontSize: "0.9rem",
                                fontWeight: "700",
                                color: "#1a1a2e",
                              }}
                            >
                              {exp.title}
                            </p>
                            <p style={{ fontSize: "0.74rem", color: "#666" }}>
                              Total: ₹{exp.amount.toFixed(2)} • Paid by{" "}
                              {exp.paidBy?.name || "Someone"}
                            </p>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <p
                              style={{
                                fontSize: "0.75rem",
                                color: "#16a34a",
                                fontWeight: "600",
                              }}
                            >
                              ✓ ₹{totalSettled.toFixed(2)} settled
                            </p>
                            <p
                              style={{
                                fontSize: "0.75rem",
                                color: "#dc2626",
                                fontWeight: "600",
                              }}
                            >
                              ⏳ ₹{totalPending.toFixed(2)} pending
                            </p>
                          </div>
                        </div>

                        {/* Per Person Rows */}
                        {exp.splitBetween?.map((split) => {
                          // ✅ Fixed canSettle comparison
                          const canSettle =
                            isAdmin ||
                            split.user?._id?.toString() ===
                              user?.id?.toString();
                          return (
                            <div
                              key={split._id}
                              style={{
                                padding: "10px 16px",
                                borderBottom: "1px solid #f9fafb",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                              }}
                            >
                              {/* Avatar */}
                              <div
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "50%",
                                  background: "#1a2ea8",
                                  color: "white",
                                  fontSize: "12px",
                                  fontWeight: "700",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                {split.user?.name?.charAt(0).toUpperCase()}
                              </div>

                              {/* Name + amounts */}
                              <div style={{ flex: 1 }}>
                                <p
                                  style={{
                                    fontSize: "0.84rem",
                                    fontWeight: "600",
                                    color: "#1a1a2e",
                                  }}
                                >
                                  {split.user?.name}
                                  {split.user?._id?.toString() ===
                                    user?.id?.toString() && (
                                    <span
                                      style={{
                                        fontSize: "0.7rem",
                                        color: "#1a2ea8",
                                        marginLeft: "4px",
                                      }}
                                    >
                                      (You)
                                    </span>
                                  )}
                                </p>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "8px",
                                    marginTop: "2px",
                                  }}
                                >
                                  {split.settledAmount > 0 && (
                                    <span
                                      style={{
                                        fontSize: "0.7rem",
                                        color: "#16a34a",
                                        fontWeight: "600",
                                      }}
                                    >
                                      Paid: ₹{split.settledAmount.toFixed(2)}
                                    </span>
                                  )}
                                  {!split.settled && (
                                    <span
                                      style={{
                                        fontSize: "0.7rem",
                                        color: "#dc2626",
                                        fontWeight: "600",
                                      }}
                                    >
                                      Owes: ₹{split.share.toFixed(2)}
                                    </span>
                                  )}
                                  {split.settled && (
                                    <span
                                      style={{
                                        fontSize: "0.7rem",
                                        color: "#16a34a",
                                        fontWeight: "600",
                                      }}
                                    >
                                      ✓ Fully Settled
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* ✅ Settle buttons — show for admin or own row */}
                              {!split.settled && canSettle && (
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "6px",
                                    alignItems: "center",
                                  }}
                                >
                                  <input
                                    type="number"
                                    placeholder={`Max ₹${split.share}`}
                                    id={`partial-${exp._id}-${split._id}`}
                                    style={{
                                      width: "100px",
                                      padding: "5px 8px",
                                      border: "1.5px solid #d1d5db",
                                      borderRadius: "6px",
                                      fontSize: "0.78rem",
                                      outline: "none",
                                    }}
                                  />
                                  <button
                                    onClick={() => {
                                      const input = document.getElementById(
                                        `partial-${exp._id}-${split._id}`,
                                      );
                                      const partial = parseFloat(input?.value);
                                      handleSettle(
                                        exp._id,
                                        split.user?._id,
                                        partial || null,
                                      );
                                      if (input) input.value = "";
                                    }}
                                    style={{
                                      background: "#fef9c3",
                                      color: "#854d0e",
                                      border: "none",
                                      borderRadius: "6px",
                                      padding: "5px 10px",
                                      fontSize: "0.74rem",
                                      fontWeight: "600",
                                      cursor: "pointer",
                                    }}
                                  >
                                    Pay Partial
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleSettle(
                                        exp._id,
                                        split.user?._id,
                                        null,
                                      )
                                    }
                                    style={{
                                      background: "#dcfce7",
                                      color: "#16a34a",
                                      border: "none",
                                      borderRadius: "6px",
                                      padding: "5px 10px",
                                      fontSize: "0.74rem",
                                      fontWeight: "600",
                                      cursor: "pointer",
                                    }}
                                  >
                                    Settle All ✓
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Who Owes Panel ── INSIDE dashCard */}
          {activeAction === "whoOwes" && (
            <div style={s.actionPanel}>
              <h4 style={s.actionTitle}>📊 Who Owes What</h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {getOweSummary().map((person) => (
                  <div
                    key={person.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px",
                      borderRadius: "8px",
                      background: "white",
                      border: "1px solid #e2e6f0",
                    }}
                  >
                    <div style={s.oweAvatar}>
                      {person.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontSize: "0.88rem",
                          fontWeight: "600",
                          color: "#1a1a2e",
                          marginBottom: "4px",
                        }}
                      >
                        {person.name}
                      </p>
                      <div style={{ display: "flex", gap: "12px" }}>
                        <span
                          style={{
                            fontSize: "0.74rem",
                            color: "#16a34a",
                            fontWeight: "600",
                          }}
                        >
                          💰 Paid: ₹{person.paid.toFixed(2)}
                        </span>
                        <span
                          style={{
                            fontSize: "0.74rem",
                            color: "#dc2626",
                            fontWeight: "600",
                          }}
                        >
                          ⏳ Owes: ₹{person.owes.toFixed(2)}
                        </span>
                        <span
                          style={{
                            fontSize: "0.74rem",
                            color: "#1a2ea8",
                            fontWeight: "600",
                          }}
                        >
                          ✓ Settled: ₹{person.settled.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        padding: "4px 10px",
                        borderRadius: "6px",
                        background: person.owes > 0 ? "#fee2e2" : "#dcfce7",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: "700",
                          color: person.owes > 0 ? "#dc2626" : "#16a34a",
                        }}
                      >
                        {person.owes > 0
                          ? `Owes ₹${person.owes.toFixed(2)}`
                          : "✓ Clear"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* ← END Quick Actions dashCard */}

        {/* Members List */}
        <div style={s.dashCard}>
          <h3 style={s.cardTitle}>Members ({group.members?.length})</h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {group.members?.map((member) => (
              <div key={member._id} style={s.memberRow}>
                <div style={s.memberAvatar}>
                  {member.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: "600",
                      color: "#1a1a2e",
                    }}
                  >
                    {member.name}
                    {member._id?.toString() === user?.id?.toString() && (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: "#1a2ea8",
                          marginLeft: "6px",
                        }}
                      >
                        (You)
                      </span>
                    )}
                  </p>
                  <p style={{ fontSize: "0.74rem", color: "#666" }}>
                    {member.email}
                  </p>
                </div>
                {group.createdBy?._id?.toString() ===
                  member._id?.toString() && (
                  <span style={s.adminBadge}>Admin</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Expenses List */}
        <div style={s.dashCard}>
          <h3 style={s.cardTitle}>
            All Expenses ({group.expenses?.length || 0})
          </h3>
          {!group.expenses?.length ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ fontSize: "40px", marginBottom: "12px" }}>💸</p>
              <p style={{ color: "#666", fontSize: "0.88rem" }}>
                No expenses yet. Use Split Expense above!
              </p>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {group.expenses?.map((exp) => (
                <div key={exp._id} style={s.expenseRow}>
                  <div style={s.expenseIcon}>💸</div>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: "600",
                        color: "#1a1a2e",
                        marginBottom: "3px",
                      }}
                    >
                      {exp.title}
                    </p>
                    <p style={{ fontSize: "0.74rem", color: "#666" }}>
                      Paid by <strong>{exp.paidBy?.name || "Someone"}</strong> •{" "}
                      {new Date(exp.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: "6px",
                        marginTop: "6px",
                        flexWrap: "wrap",
                      }}
                    >
                      {exp.splitBetween?.map((s) => (
                        <span
                          key={s._id}
                          style={{
                            fontSize: "0.68rem",
                            padding: "2px 7px",
                            borderRadius: "4px",
                            fontWeight: "600",
                            background: s.settled ? "#dcfce7" : "#fee2e2",
                            color: s.settled ? "#16a34a" : "#dc2626",
                          }}
                        >
                          {s.user?.name?.split(" ")[0] || "?"}: ₹{s.share}
                          {s.settled ? " ✓" : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p
                    style={{
                      fontFamily: "'Sora',sans-serif",
                      fontSize: "0.95rem",
                      fontWeight: "700",
                      color: "#1a1a2e",
                    }}
                  >
                    ₹{exp.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
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
  appNav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 36px",
    height: "60px",
    background: "#1a2ea8",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  appNavBrand: { display: "flex", alignItems: "center", gap: "10px" },
  appLogoFallback: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "#4a6cf7",
    color: "white",
    fontFamily: "'Sora',sans-serif",
    fontSize: "16px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  appBrandName: {
    fontFamily: "'Sora',sans-serif",
    fontSize: "19px",
    fontWeight: "700",
    color: "white",
  },
  appNavLinks: {
    display: "flex",
    gap: "30px",
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  appNavLink: {
    color: "rgba(255,255,255,0.78)",
    fontSize: "14px",
    fontWeight: "500",
    textDecoration: "none",
  },
  appNavRight: { display: "flex", alignItems: "center", gap: "12px" },
  notifBtn: {
    position: "relative",
    background: "rgba(255,255,255,0.14)",
    border: "none",
    borderRadius: "8px",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "white",
    fontSize: "16px",
  },
  notifBadge: {
    position: "absolute",
    top: "-5px",
    right: "-5px",
    background: "#ef4444",
    color: "white",
    fontSize: "10px",
    fontWeight: "700",
    width: "17px",
    height: "17px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  appUserChip: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#2d47c9",
    borderRadius: "8px",
    padding: "5px 10px 5px 5px",
  },
  appAvatar: {
    width: "30px",
    height: "30px",
    borderRadius: "6px",
    background: "rgba(255,255,255,0.2)",
    color: "white",
    fontSize: "11px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  appUsername: { fontSize: "12px", color: "white" },
  logoutBtn: {
    background: "rgba(255,255,255,0.15)",
    border: "none",
    borderRadius: "8px",
    padding: "6px 14px",
    color: "white",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
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
  backBtn: {
    background: "white",
    border: "1px solid #e2e6f0",
    borderRadius: "8px",
    padding: "8px 16px",
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#1a1a2e",
    cursor: "pointer",
  },
  addBtn: {
    background: "#1a2ea8",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "10px 20px",
    fontSize: "0.88rem",
    fontWeight: "600",
    fontFamily: "'Sora',sans-serif",
    cursor: "pointer",
  },
  dashCard: {
    background: "white",
    borderRadius: "14px",
    border: "1px solid #e2e6f0",
    padding: "26px 28px",
  },
  cardTitle: {
    fontFamily: "'Sora',sans-serif",
    fontSize: "1rem",
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: "16px",
  },
  formInput: {
    padding: "11px 14px",
    border: "1.5px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "0.9rem",
    fontFamily: "'Inter',sans-serif",
    color: "#1a1a2e",
    background: "#f9fafb",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  statCard: {
    background: "linear-gradient(135deg,#1a2ea8,#2d47c9)",
    borderRadius: "14px",
    padding: "20px 22px",
    position: "relative",
  },
  statLabel: {
    fontSize: "0.8rem",
    color: "rgba(255,255,255,0.72)",
    marginBottom: "6px",
  },
  statValue: {
    fontFamily: "'Sora',sans-serif",
    fontSize: "1.4rem",
    fontWeight: "700",
    color: "white",
  },
  statIcon: {
    position: "absolute",
    top: "18px",
    right: "18px",
    fontSize: "22px",
  },
  actionPanel: {
    marginTop: "16px",
    padding: "20px",
    borderRadius: "12px",
    background: "#f8f9fc",
    border: "1px solid #e2e6f0",
  },
  actionTitle: {
    fontFamily: "'Sora',sans-serif",
    fontSize: "0.95rem",
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: "14px",
  },
  splitPreview: {
    background: "white",
    borderRadius: "8px",
    padding: "12px",
    border: "1px solid #e2e6f0",
  },
  splitRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "6px 0",
    borderBottom: "1px solid #f0f2f8",
  },
  splitName: { fontSize: "0.82rem", fontWeight: "600", color: "#1a1a2e" },
  splitAmount: { fontSize: "0.82rem", fontWeight: "700", color: "#1a2ea8" },
  settleRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    borderRadius: "8px",
    background: "white",
    border: "1px solid #e2e6f0",
  },
  settleBtn: {
    background: "#dcfce7",
    color: "#16a34a",
    border: "none",
    borderRadius: "6px",
    padding: "6px 12px",
    fontSize: "0.78rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  oweRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px",
    borderRadius: "8px",
    background: "white",
    border: "1px solid #e2e6f0",
  },
  oweAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "#1a2ea8",
    color: "white",
    fontSize: "13px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  memberRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 12px",
    borderRadius: "10px",
    background: "#f8f9fc",
  },
  memberAvatar: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "#1a2ea8",
    color: "white",
    fontSize: "14px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  adminBadge: {
    fontSize: "0.68rem",
    fontWeight: "700",
    padding: "3px 8px",
    borderRadius: "4px",
    background: "#e3ebff",
    color: "#1a2ea8",
  },
  expenseRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    padding: "14px",
    borderRadius: "12px",
    background: "#f8f9fc",
    border: "1px solid #e2e6f0",
  },
  expenseIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "#e3ebff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    flexShrink: 0,
  },
};

export default GroupDetail;
