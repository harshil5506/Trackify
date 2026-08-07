# 🚀 Trackify — Project Overview & Architecture Guide

Welcome to the **Trackify** codebase! This document provides a complete end-to-end breakdown of the Trackify project so that you, as a new team member, can quickly understand the system design, tech stack, directory structure, data models, API endpoints, and features.

---

## 📌 1. Project Overview & Vision

**Trackify** is a modern, full-stack Personal & Group Finance Management Web Application. It empowers users to:
- Track daily income and expenses with categories and timestamps.
- Set monthly budget limits and visualize spending analytics.
- Create social groups, add friends, and split group expenses (equal, custom, percentage split).
- Track settlements, pending debts, and group activity logs.
- Generate financial reports and export them as PDF documents.
- Secure their account with JWT auth, Google OAuth, and Security PIN lock.

---

## 🛠️ 2. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + Vite | Fast, component-based single-page application (`/client`) |
| **Frontend Routing** | React Router v7 | Client-side page routing with `PrivateRoute` guards |
| **Charts & Graphics** | Recharts | Interactive pie, bar, and area charts for financial analytics |
| **PDF Generation** | jsPDF & jsPDF-AutoTable | Client-side export of financial reports |
| **UI Notifications** | React Hot Toast | Real-time toast notifications for UI feedback |
| **Backend Framework** | Node.js + Express 5 | RESTful API server (`/server`) |
| **Database** | MongoDB + Mongoose 9 | NoSQL Database & Schema Object Modeling |
| **Authentication** | JWT + Google Auth Library | Secure token-based authentication & Google Sign-In |
| **Security** | BcryptJS & Cookie Parser | Password hashing & secure cookie parsing |
| **Mailing System** | Nodemailer | Transactional emails (password reset, email alerts) |

---

## 📂 3. Directory & File Structure

```text
Trackify-main/
├── Trackify_Features.docx               # Feature checklist & requirements document
├── client/                              # Modern React + Vite Frontend Application
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js                 # Centralized Axios instance (baseURL: http://localhost:5000)
│   │   ├── components/
│   │   │   ├── Navbar.jsx               # Navigation header with active links & user menu
│   │   │   ├── Footer.jsx               # Quick links & footer branding
│   │   │   └── PrivateRoute.jsx         # Auth wrapper protecting private routes
│   │   ├── context/
│   │   │   └── AuthContext.jsx          # React Context for user auth state & login/logout methods
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx            # Core user dashboard with summary cards & charts
│   │   │   ├── Transactions.jsx         # Complete expense list with search/filter/edit
│   │   │   ├── AddExpense.jsx           # Form to log new expenses
│   │   │   ├── Income.jsx               # Dedicated income tracking page
│   │   │   ├── Budget.jsx               # Monthly budget planner & spending progress bar
│   │   │   ├── Friends.jsx              # Friends list & friend requests
│   │   │   ├── Groups.jsx               # Group creation & list of expense groups
│   │   │   ├── GroupDetail.jsx          # Group splits, expenses, settlement calculator
│   │   │   ├── Reports.jsx              # Advanced analytics & PDF export
│   │   │   ├── Profile.jsx              # User profile, currency setting, security PIN
│   │   │   ├── Login.jsx / Signup.jsx   # Auth pages with Google login option
│   │   │   └── ...                      # ForgotPassword, PinLock, SetPin, Activity, About, etc.
│   │   ├── utils/
│   │   │   └── finance.js               # Utility functions for currency formatting & calculations
│   │   ├── App.jsx                      # App root router & layout manager
│   │   └── main.jsx                     # Entry point mounting React DOM
│   └── package.json                     # Client dependencies
│
└── server/                              # Express.js REST API Backend
    ├── middleware/
    │   └── auth.js                      # JWT Verification middleware (`req.user`)
    ├── models/
    │   ├── User.js                      # User schema (email, password, googleId, currency, pin)
    │   ├── Expense.js                   # Expense/Income schema (user, title, amount, category, type, date)
    │   ├── Budget.js                    # Monthly budget schema (user, month, limit, categories)
    │   ├── Friend.js                    # Friend request schema (requester, recipient, status)
    │   ├── Group.js                     # Group splitting schema (members, expenses, splits)
    │   └── Message.js                   # In-app chat messages schema
    ├── routes/
    │   ├── auth.js                      # POST /api/auth/register, /login, /google, /forgot-password
    │   ├── user.js                      # GET/PUT /api/user/profile, /pin
    │   ├── expenses.js                  # CRUD /api/expenses (income & expense)
    │   ├── budget.js                    # GET/POST /api/budget
    │   ├── analytics.js                 # GET /api/analytics/dashboard, /monthly
    │   ├── friends.js                   # Friends management routes
    │   ├── groups.js                    # Group split management routes
    │   └── messages.js                  # Group chat messaging routes
    ├── server.js                        # Server initialization & MongoDB connection
    └── package.json                     # Server dependencies
```

---

## 🗄️ 4. Data Models (Schemas)

### 1. **User Schema** (`server/models/User.js`)
- `name`, `email`, `password` (hashed)
- `googleId`, `avatar`
- `currency` (String, default: `"INR"`)
- `pin` (String, default: `null` for quick app lock)
- `resetPasswordToken`, `resetPasswordExpire`

### 2. **Expense Schema** (`server/models/Expense.js`)
- `user` (ObjectId ref User)
- `title` (String), `amount` (Number)
- `category` (Food, Transport, Bills, Salary, Freelance, etc.)
- `type` (`"expense"` | `"income"`)
- `date` (Date)

### 3. **Budget Schema** (`server/models/Budget.js`)
- `user` (ObjectId ref User)
- `monthlyLimit` (Number)
- `month` (String: `"YYYY-MM"`)
- `categoryLimits` (Array of `{ category, limit }`)

### 4. **Group Schema** (`server/models/Group.js`)
- `name`, `description`, `createdBy`
- `members` (Array of User ObjectIds)
- `expenses` (Array containing expense title, amount, paidBy, splitShares, settlements)

---

## 🔌 5. Key REST API Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user account | No |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token | No |
| `POST` | `/api/auth/google` | Sign in / Register with Google OAuth | No |
| `GET` | `/api/user/profile` | Get current user's profile info | Yes |
| `PUT` | `/api/user/profile` | Update profile settings (e.g. name, currency) | Yes |
| `GET` | `/api/expenses` | Get all expenses & income for logged-in user | Yes |
| `POST` | `/api/expenses` | Add new expense or income record | Yes |
| `DELETE` | `/api/expenses/:id` | Delete an expense record | Yes |
| `GET` | `/api/analytics/dashboard` | Get summary (total income, expense, balance, charts) | Yes |
| `GET` | `/api/budget` | Get current month budget and status | Yes |
| `POST` | `/api/budget` | Create/update monthly budget | Yes |

---

## 🎯 6. Roadmap: Implementing Requested Features Safely

You requested two new features from the feature roadmap:

### 1. Multi-Currency Converter
- **Current Gap**: User schema stores `currency`, but formatting across pages is hardcoded to `₹`. No live exchange rates.
- **Implementation Strategy**:
  - Build a central `CurrencyContext` or Currency Utility (`client/src/utils/currency.js`).
  - Support major currencies (INR ₹, USD $, EUR €, GBP £, JPY ¥, AED AED, CAD $, AUD $, etc.).
  - Fetch live conversion rates from a reliable exchange rate API with offline fallback rates.
  - Wrap price displays with a central `formatCurrency(amount, targetCurrency)` function.
  - Allow users to switch primary currency in **Profile** settings. All values on Dashboard, Transactions, Budget, and Reports update seamlessly.

### 2. Monthly / Annual Auto-Reports Scheduler & Emailer
- **Current Gap**: Manual PDF download exists, but no automatic periodic email reports or scheduler.
- **Implementation Strategy**:
  - Implement a server-side background job runner using `node-cron` (`server/services/reportScheduler.js`).
  - Create styled HTML email templates (`server/utils/emailTemplates.js`) for monthly and annual financial summaries.
  - Add user preferences (`emailReports: { monthly: true, annual: true }`) in `User` schema.
  - Expose an instant trigger endpoint `POST /api/user/send-test-report` so users and testers can generate and preview their report email immediately without waiting for midnight cron jobs!

---

## 🚀 7. How to Run & Test the Project

1. **Start Backend Server**:
   ```bash
   cd server
   npm install
   npm run dev # or node server.js
   ```
2. **Start Frontend Client**:
   ```bash
   cd client
   npm install
   npm run dev
   ```
3. Open browser at `http://localhost:5173`.
