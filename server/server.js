

// require("dotenv").config(); // ← Must be the FIRST line
// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const authRoutes = require("./routes/auth");

// const app = express();

// app.use(
//   cors({
//     origin: ["http://localhost:5173", "http://localhost:5174"],
//     credentials: true,
//   }),
// );
// app.use(express.json());
// // app.use("/api/auth", authRoutes);

// mongoose
//   .connect(process.env.MONGODB_URI)
//   .then(() => console.log("MongoDB connected ✅"))
//   .catch((err) => console.log("MongoDB error ❌", err));

// app.use("/api/auth", require("./routes/auth"));
// app.use("/api/expenses", require("./routes/expenses"));
// app.use("/api/user", require("./routes/user"));
// app.use("/api/analytics", require("./routes/analytics"));
// app.use("/api/budget", require("./routes/budget"));

// app.get("/", (req, res) => res.send("Backend running 🚀"));

// app.listen(process.env.PORT || 5000, () => {
//   console.log(`Server running on port ${process.env.PORT || 5000}`);
// });





require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // ✅ uncommented

const app = express();

// Middleware FIRST
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
}));
app.use(express.json());

// Routes (no duplicates)
app.use("/api/auth", require("./routes/auth"));
app.use("/api/expenses", require("./routes/expenses"));
app.use("/api/user", require("./routes/user"));
app.use("/api/analytics", require("./routes/analytics"));
app.use("/api/budget", require("./routes/budget"));

app.get("/", (req, res) => res.send("Backend running 🚀"));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.log("MongoDB error ❌", err));

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});