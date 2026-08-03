const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Expense = require("./models/Expense");
const Budget = require("./models/Budget");
const Friend = require("./models/Friend");
const Message = require("./models/Message");
const Group = require("./models/Group");

const MONGO_URI = "mongodb://localhost:27017/trackify";

async function seed() {
  try {
    console.log("Connecting to local MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully. Cleaning up existing databases...");

    // Delete existing records
    await User.deleteMany({});
    await Expense.deleteMany({});
    await Budget.deleteMany({});
    await Friend.deleteMany({});
    await Message.deleteMany({});
    await Group.deleteMany({});
    console.log("Cleanup finished.");

    // Create password hash
    const hashedPassword = await bcrypt.hash("Password123!", 10);

    // Create Users
    console.log("Creating users...");
    const userHarshil = await User.create({
      name: "Harshil Thakkar",
      email: "harshil123@gmail.com",
      password: hashedPassword,
      currency: "INR",
      language: "English",
      timezone: "IST (UTC+5:30)",
    });

    const userAmit = await User.create({
      name: "Amit Patel",
      email: "amit@gmail.com",
      password: hashedPassword,
      currency: "INR",
      language: "English",
      timezone: "IST (UTC+5:30)",
    });

    const userPriya = await User.create({
      name: "Priya Sharma",
      email: "priya@gmail.com",
      password: hashedPassword,
      currency: "INR",
      language: "English",
      timezone: "IST (UTC+5:30)",
    });

    const userRohan = await User.create({
      name: "Rohan Shah",
      email: "rohan@gmail.com",
      password: hashedPassword,
      currency: "INR",
      language: "English",
      timezone: "IST (UTC+5:30)",
    });

    console.log("Users created:", [
      userHarshil.email,
      userAmit.email,
      userPriya.email,
      userRohan.email,
    ]);

    // Create Budgets for Harshil
    console.log("Creating budgets for Harshil...");
    const currentMonth = new Date().toISOString().substring(0, 7); // e.g. "2026-07"
    
    await Budget.create([
      { user: userHarshil._id, category: "Food", limit: 8000, month: currentMonth },
      { user: userHarshil._id, category: "Transportation", limit: 4000, month: currentMonth },
      { user: userHarshil._id, category: "Shopping", limit: 12000, month: currentMonth },
      { user: userHarshil._id, category: "Entertainment", limit: 6000, month: currentMonth },
      { user: userHarshil._id, category: "Bills & Utilities", limit: 15000, month: currentMonth },
    ]);

    // Create Income and Expenses for Harshil (spread over last 6 months for chart trends)
    console.log("Creating transactions for Harshil...");
    const transactions = [];

    // Helper to get date N months ago
    const getDateMonthsAgo = (m, day = 15) => {
      const d = new Date();
      d.setMonth(d.getMonth() - m);
      d.setDate(day);
      return d;
    };

    // Salary Incomes (Last 6 Months)
    for (let i = 0; i <= 5; i++) {
      transactions.push({
        user: userHarshil._id,
        title: "Monthly Salary",
        amount: 75000,
        category: "Salary",
        type: "income",
        date: getDateMonthsAgo(i, 1),
        note: "Company payroll deposit",
      });
    }

    // Freelance Incomes
    transactions.push({
      user: userHarshil._id,
      title: "UI Design Freelance",
      amount: 18000,
      category: "Freelance",
      type: "income",
      date: getDateMonthsAgo(2, 20),
      note: "Contract work payment",
    });
    transactions.push({
      user: userHarshil._id,
      title: "API Development",
      amount: 25000,
      category: "Freelance",
      type: "income",
      date: getDateMonthsAgo(4, 10),
      note: "Completed backend module",
    });

    // Expenses (Last 6 Months)
    const expenseData = [
      { title: "Supermarket Grocery", amount: 4500, category: "Food", type: "expense", months: [0, 1, 2, 3, 4, 5], day: 5 },
      { title: "Zomato Dinner Split", amount: 1200, category: "Food", type: "expense", months: [0, 1, 2, 4], day: 12 },
      { title: "Swiggy Delivery", amount: 850, category: "Food", type: "expense", months: [0, 2, 3, 5], day: 22 },
      
      { title: "Fuel Refill", amount: 3000, category: "Transportation", type: "expense", months: [0, 1, 2, 3, 4, 5], day: 2 },
      { title: "Uber Cab Ride", amount: 650, category: "Transportation", type: "expense", months: [0, 1, 3, 4], day: 18 },
      
      { title: "Zara Clothing", amount: 5500, category: "Shopping", type: "expense", months: [0, 2, 4], day: 8 },
      { title: "Amazon Gadgets", amount: 8900, category: "Shopping", type: "expense", months: [1, 3], day: 15 },
      
      { title: "Netflix Subscription", amount: 799, category: "Entertainment", type: "expense", months: [0, 1, 2, 3, 4, 5], day: 1 },
      { title: "Movie tickets & Snacks", amount: 1500, category: "Entertainment", type: "expense", months: [0, 1, 4, 5], day: 24 },
      
      { title: "House Rent", amount: 18000, category: "Rent", type: "expense", months: [0, 1, 2, 3, 4, 5], day: 1 },
      
      { title: "Electricity Bill", amount: 4200, category: "Bills & Utilities", type: "expense", months: [0, 1, 2, 3, 4, 5], day: 10 },
      { title: "Wi-Fi Fiber Internet", amount: 999, category: "Bills & Utilities", type: "expense", months: [0, 1, 2, 3, 4, 5], day: 7 },
      { title: "Mobile Recharge", amount: 719, category: "Bills & Utilities", type: "expense", months: [0, 1, 2, 3, 4, 5], day: 15 },
      
      { title: "Health Insurance Premium", amount: 3500, category: "Healthcare", type: "expense", months: [1, 3, 5], day: 20 },
      { title: "Dentist Visit", amount: 1500, category: "Healthcare", type: "expense", months: [0], day: 14 }
    ];

    expenseData.forEach(exp => {
      exp.months.forEach(m => {
        transactions.push({
          user: userHarshil._id,
          title: exp.title,
          amount: exp.amount,
          category: exp.category,
          type: exp.type,
          date: getDateMonthsAgo(m, exp.day),
          note: `${exp.title} in month -${m}`,
        });
      });
    });

    await Expense.insertMany(transactions);
    console.log(`Seeded ${transactions.length} personal transactions for Harshil.`);

    // Friends Setup
    console.log("Setting up friends layer...");
    await Friend.create([
      { sender: userHarshil._id, receiver: userAmit._id, status: "accepted" },
      { sender: userHarshil._id, receiver: userPriya._id, status: "accepted" },
      { sender: userRohan._id, receiver: userHarshil._id, status: "accepted" },
    ]);

    // In-app Messages
    console.log("Seeding direct messages...");
    await Message.create([
      { sender: userHarshil._id, receiver: userAmit._id, text: "Hey Amit, split for last night's dinner?" },
      { sender: userAmit._id, receiver: userHarshil._id, text: "Yeah sure, send me the split details." },
      { sender: userHarshil._id, receiver: userAmit._id, text: "Adding it in the roommates group now!" },
      { sender: userPriya._id, receiver: userHarshil._id, text: "Hey Harshil, when are we planning the Goa trip details?" },
      { sender: userHarshil._id, receiver: userPriya._id, text: "This weekend, let's create a splitting group first." },
    ]);

    // Groups Setup
    console.log("Seeding group expense splits...");
    
    // Group 1: Flat 304 Roommates
    const groupFlat = await Group.create({
      name: "Flat 304 Roommates",
      description: "Monthly shared apartment expenses",
      createdBy: userHarshil._id,
      members: [userHarshil._id, userAmit._id, userRohan._id],
      expenses: [
        {
          title: "Monthly Rent",
          amount: 24000,
          paidBy: userHarshil._id,
          splitBetween: [
            { user: userHarshil._id, share: 8000, settledAmount: 8000, settled: true },
            { user: userAmit._id, share: 8000, settledAmount: 8000, settled: true },
            { user: userRohan._id, share: 8000, settledAmount: 4000, settled: false } // Rohan still owes 4000
          ],
          date: getDateMonthsAgo(0, 1),
        },
        {
          title: "High-Speed Wi-Fi Router",
          amount: 3000,
          paidBy: userAmit._id,
          splitBetween: [
            { user: userHarshil._id, share: 1000, settledAmount: 1000, settled: true },
            { user: userAmit._id, share: 1000, settledAmount: 1000, settled: true },
            { user: userRohan._id, share: 1000, settledAmount: 0, settled: false }
          ],
          date: getDateMonthsAgo(0, 5),
        },
        {
          title: "Groceries & Milk supply",
          amount: 1500,
          paidBy: userRohan._id,
          splitBetween: [
            { user: userHarshil._id, share: 500, settledAmount: 0, settled: false },
            { user: userAmit._id, share: 500, settledAmount: 0, settled: false },
            { user: userRohan._id, share: 500, settledAmount: 500, settled: true }
          ],
          date: getDateMonthsAgo(0, 10),
        }
      ]
    });

    // Group 2: Goa Trip 2026
    const groupGoa = await Group.create({
      name: "Goa Trip 2026",
      description: "Flight tickets, villa rent and dinner split",
      createdBy: userPriya._id,
      members: [userHarshil._id, userAmit._id, userPriya._id, userRohan._id],
      expenses: [
        {
          title: "Villa Stay Booking",
          amount: 16000,
          paidBy: userPriya._id,
          splitBetween: [
            { user: userHarshil._id, share: 4000, settledAmount: 0, settled: false },
            { user: userAmit._id, share: 4000, settledAmount: 4000, settled: true },
            { user: userPriya._id, share: 4000, settledAmount: 4000, settled: true },
            { user: userRohan._id, share: 4000, settledAmount: 0, settled: false }
          ],
          date: getDateMonthsAgo(1, 15),
        },
        {
          title: "Flight Tickets (Group Booking)",
          amount: 24000,
          paidBy: userHarshil._id,
          splitBetween: [
            { user: userHarshil._id, share: 6000, settledAmount: 6000, settled: true },
            { user: userAmit._id, share: 6000, settledAmount: 0, settled: false },
            { user: userPriya._id, share: 6000, settledAmount: 6000, settled: true },
            { user: userRohan._id, share: 6000, settledAmount: 0, settled: false }
          ],
          date: getDateMonthsAgo(1, 10),
        }
      ]
    });

    console.log("Groups split structures seeded.");
    console.log("\n==========================================");
    console.log("SEEDED ALL DATA SUCCESSFULLY! 🎉");
    console.log("You can log in with: ");
    console.log("  Email:    harshil123@gmail.com");
    console.log("  Password: Password123!");
    console.log("==========================================");

  } catch (error) {
    console.error("Error seeding MongoDB:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

seed();
