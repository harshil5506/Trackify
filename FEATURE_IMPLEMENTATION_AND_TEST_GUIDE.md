# 📗 Complete Step-by-Step Guide: How to Run, Test, and Present Trackify

> **Save this file in your project folder and push it to GitHub!**  
> This guide is designed for beginners. It explains **everything** step-by-step: how to set up, how to start the backend and frontend servers, how to use the app, and how to execute a complete manual test plan.

---

## 📌 Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Step-by-Step: How to Run the Project](#2-step-by-step-how-to-run-the-project)
3. [Step-by-Step: Complete Manual Test Plan](#3-step-by-step-complete-manual-test-plan)
4. [Detailed Breakdown of Implemented Features](#4-detailed-breakdown-of-implemented-features)
5. [Troubleshooting & FAQs](#5-troubleshooting--faqs)
6. [How to Commit & Push to GitHub](#6-how-to-commit--push-to-github)

---

## 🛠️ 1. Prerequisites

Before starting, ensure you have:
1. **Node.js** installed on your system (Download from [nodejs.org](https://nodejs.org/)).
2. **MongoDB** running locally OR a MongoDB Atlas cloud connection URI string.
3. Two terminal windows open in VS Code / PowerShell.

---

## 🚀 2. Step-by-Step: How to Run the Project

Follow these exact steps to start the application:

### Step 2.1: Open the Project Directory
Open your terminal (PowerShell or Command Prompt) and navigate to the project directory:
```bash
cd "e:\SGP 5th\Trackify-main\Trackify-main"
```

---

### Step 2.2: Start the Backend Server (Terminal 1)

1. Open **Terminal 1**.
2. Navigate to the `server` folder:
   ```bash
   cd server
   ```
3. Install dependencies (only needed the first time):
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm run dev
   ```
   *(Or run: `node server.js`)*

5. **Expected Output in Terminal 1**:
   ```text
   Server running on port 5000
   MongoDB connected ✅
   📅 Auto-Report Scheduler Service Initialized ✅
   ```

---

### Step 2.3: Start the Frontend Client (Terminal 2)

1. Open a **new Terminal window (Terminal 2)**.
2. Navigate to the `client` folder:
   ```bash
   cd "e:\SGP 5th\Trackify-main\Trackify-main\client"
   ```
3. Install dependencies (only needed the first time):
   ```bash
   npm install
   ```
4. Start the Vite React development server:
   ```bash
   npm run dev
   ```

5. **Expected Output in Terminal 2**:
   ```text
   VITE v7.3.1 ready in 350 ms
   ➜ Local: http://localhost:5173/
   ```

---

### Step 2.4: Open in Web Browser
Open your web browser (Chrome, Edge, or Firefox) and go to:
👉 **`http://localhost:5173`**

---

## 🧪 3. Step-by-Step: Complete Manual Test Plan

Perform these tests step-by-step to verify that the entire project and both new features work perfectly.

---

### 📝 Test Case 1: Account Registration & Login
- **Goal**: Verify user authentication flow.
- **Steps**:
  1. Go to `http://localhost:5173/signup`.
  2. Enter a Name, Email, and Password (e.g. `testuser@example.com` / `password123`).
  3. Click **Sign Up**.
  4. Log in at `http://localhost:5173/login`.
- **Expected Result**: Successfully logged in and redirected to the **Dashboard**.

---

### 📝 Test Case 2: Verify Default Currency (INR ₹)
- **Goal**: Ensure the app defaults to Indian Rupee (`INR` / `₹`) with zero breaking changes.
- **Steps**:
  1. On the **Dashboard**, look at the summary cards (**Total Income**, **Total Expense**, **Net Balance**).
  2. Navigate to **Transactions** page (`/transactions`).
- **Expected Result**: All financial values are formatted with `₹` symbol (e.g., `₹0.00` or `₹5,000.00`).

---

### 📝 Test Case 3: Add Income and Expense
- **Goal**: Create transaction data to test financial summaries & currency conversion.
- **Steps**:
  1. Go to **Add Expense** page (`/add-expense`).
  2. Add an Income entry:
     - Title: `Monthly Salary`
     - Amount: `50000`
     - Type: `Income`
     - Category: `Salary`
     - Click **Save**.
  3. Add an Expense entry:
     - Title: `Grocery Shopping`
     - Amount: `5000`
     - Type: `Expense`
     - Category: `Food`
     - Click **Save**.
- **Expected Result**: Dashboard updates immediately showing Total Income = `₹50,000.00`, Total Expense = `₹5,000.00`, Net Balance = `₹45,000.00`.

---

### 📝 Test Case 4: Test Multi-Currency Converter
- **Goal**: Verify live exchange rate conversion & currency switching.
- **Steps**:
  1. Click **Profile** on the top navbar (or visit `/profile`).
  2. Click **✏️ Edit Profile**.
  3. Scroll down to **Preferred Currency 💱** dropdown.
  4. Select **`🇺🇸 USD ($) - US Dollar`**.
  5. Click **Save Changes**. Toast notification will confirm: *"Profile & preferences updated!"*.
  6. Go to **Dashboard** (`/dashboard`).
- **Expected Result**:
  - The currency symbol changes to `$`.
  - Amounts convert dynamically using live/fallback exchange rates (e.g., `₹50,000.00` converts to `~$600.00 USD`).
  - Check **Transactions** page (`/transactions`): All amounts now display with `+$...` and `-$...`.

---

### 📝 Test Case 5: Test Switching to Other Currencies
- **Goal**: Ensure non-USD currencies (EUR, GBP, JPY) format properly.
- **Steps**:
  1. Go to **Profile** -> click **Edit Profile**.
  2. Change currency to **`🇪🇺 EUR (€) - Euro`** or **`🇬🇧 GBP (£) - British Pound`**.
  3. Save changes.
- **Expected Result**: Dashboard, Transactions, and Reports update instantly displaying `€` or `£` with correct rate conversions.

---

### 📝 Test Case 6: Test Instant Email Summary Report
- **Goal**: Verify backend email generation, Nodemailer transport, and HTML template formatting.
- **Steps**:
  1. Go to **Reports** page (`/reports`).
  2. Look at the Report Configuration card.
  3. Click the purple button: **"📧 Send Instant Email Summary Report"**.
- **Expected Result**:
  - Button state changes to `⏳ Sending Email...`.
  - Toast notification appears: *"Instant Monthly Financial Summary Report sent to your email successfully!"*.
  - Check Terminal 1 (Backend logs): Confirmation message `Financial summary email sent: <messageId>`.
  - Open your email inbox: You will receive a styled email containing income, expense, balance, and top spending category table formatted in your selected currency.

---

### 📝 Test Case 7: Test Auto-Report Preference Toggling
- **Goal**: Verify that users can turn auto-reports on or off.
- **Steps**:
  1. Go to **Profile** (`/profile`).
  2. Toggle **Monthly Auto-Report** or **Annual Auto-Report**.
  3. Click **Save Changes**.
- **Expected Result**: Preferences persist in MongoDB (`reportPreferences: { monthlyEmail: true, annualEmail: false }`).

---

### 📝 Test Case 8: Revert Currency Back to INR (₹)
- **Goal**: Verify backward compatibility.
- **Steps**:
  1. Go to **Profile** -> select **`🇮🇳 INR (₹) - Indian Rupee`**.
  2. Save changes.
- **Expected Result**: All numbers revert cleanly to original `₹` formatting.

---

## 🗂️ 4. Detailed Breakdown of Implemented Features

### 1. Multi-Currency Engine (`client/src/utils/currency.js` & `CurrencyContext.jsx`)
- Integrates `https://open.er-api.com/v6/latest/INR` to fetch dynamic rates.
- Includes offline fallback exchange rates for reliable operation even without internet.
- Wraps entire app with `<CurrencyProvider>` so every page formats money effortlessly.

### 2. Auto-Reports & Emailer (`server/services/reportScheduler.js` & `emailTemplates.js`)
- Runs a background interval service checking on the 1st of every month.
- Aggregates user monthly income/expenses and computes top 5 spending categories.
- Sends responsive HTML emails via Nodemailer.
- Exposes `POST /api/user/send-summary-report` for instant manual trigger.

---

## ❓ 5. Troubleshooting & FAQs

### Q1: Terminal says `MongoDB error ❌` or `MongooseServerSelectionError`
- **Solution**: Make sure MongoDB is running on your machine, or verify your `MONGODB_URI` inside `server/.env`.
- Example `.env` file in `server/.env`:
  ```env
  PORT=5000
  MONGODB_URI=mongodb://localhost:27017/trackify
  JWT_SECRET=supersecretkey123
  ```

### Q2: Port 5000 is already in use
- **Solution**: Either kill the process running on port 5000 or change `PORT=5001` in `server/.env`.

### Q3: Email report button shows error or email not arriving
- **Explanation**: The app uses Nodemailer. If no custom SMTP environment variables are set, it falls back to the default service or outputs email delivery status to Terminal 1 logs.

---

## 🐙 6. How to Commit & Push to GitHub

Once you complete testing, save and push your code to GitHub with these commands:

```bash
# Navigate to workspace root
cd "e:\SGP 5th\Trackify-main\Trackify-main"

# Stage all files
git add .

# Commit changes
git commit -m "feat: implement Multi-Currency converter, email auto-reports & test plan guide"

# Push to repository
git push origin main
```
