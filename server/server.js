const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.log("MongoDB error ❌", err));

app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
