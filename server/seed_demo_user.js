const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const User = require("./models/User");
const Expense = require("./models/Expense");
const PaymentAlert = require("./models/PaymentAlert");

async function seed() {
  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/trackify";
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB for seeding...");

  const email = "testuser@trackify.com";
  let user = await User.findOne({ email });

  const hashedPassword = await bcrypt.hash("TestPassword@123", 10);

  if (!user) {
    user = await User.create({
      name: "Alex Mercer",
      email,
      password: hashedPassword,
      currency: "INR",
      reminderPreferences: {
        upcomingAlertsEmail: true,
        reminderDaysBefore: 5,
      },
    });
    console.log("Created user:", user.email);
  } else {
    user.password = hashedPassword;
    user.reminderPreferences = {
      upcomingAlertsEmail: true,
      reminderDaysBefore: 5,
    };
    await user.save();
    console.log("Updated user password and preferences:", user.email);
  }

  // Clear existing expenses for this user to ensure clean state
  await Expense.deleteMany({ user: user._id });
  await PaymentAlert.deleteMany({ user: user._id });

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  // 1. Legacy INR expense (no currency, no baseAmount fields)
  await Expense.create({
    user: user._id,
    title: "Legacy Grocery Run",
    amount: 1500,
    category: "Food",
    type: "expense",
    date: new Date(now - 12 * dayMs),
    paymentMethod: "Cash",
  });

  // 2. An income item so balance is healthy
  await Expense.create({
    user: user._id,
    title: "Monthly Salary",
    amount: 75000,
    currency: "INR",
    category: "Job",
    type: "income",
    date: new Date(now - 15 * dayMs),
    paymentMethod: "UPI / Net Banking",
  });

  // 3. Monthly recurring Netflix subscription (4 occurrences)
  const netflixDates = [
    new Date(now - 90 * dayMs),
    new Date(now - 60 * dayMs),
    new Date(now - 30 * dayMs),
    new Date(now - 1 * dayMs),
  ];
  for (const d of netflixDates) {
    await Expense.create({
      user: user._id,
      title: "Netflix Subscription",
      merchant: "Netflix",
      amount: 649,
      currency: "INR",
      baseAmount: 649,
      category: "Entertainment",
      type: "expense",
      date: d,
      paymentMethod: "Credit Card",
    });
  }

  // 4. Monthly recurring electricity bill due in ~1-2 days (to test upcoming alerts)
  const billDates = [
    new Date(now - 60 * dayMs),
    new Date(now - 29 * dayMs),
  ];
  for (const d of billDates) {
    await Expense.create({
      user: user._id,
      title: "State Electricity Bill",
      merchant: "Electricity Board",
      amount: 1850,
      currency: "INR",
      baseAmount: 1850,
      category: "Bills & Utilities",
      type: "expense",
      date: d,
      paymentMethod: "UPI / Net Banking",
    });
  }

  console.log("Seeding complete! Log in with:");
  console.log("Email: testuser@trackify.com");
  console.log("Password: TestPassword@123");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
