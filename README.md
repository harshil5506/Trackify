<div align="center">

# 💰 Trackify — Personal Expense Tracker

### *Take control of your finances. One transaction at a time.*

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x_LTS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](./LICENSE)

<br/>

> A modern, full-stack **MERN** web application for personal finance management — track expenses, plan budgets, visualise spending patterns, and split costs with friends.

<br/>

[📖 Project Report](#-project-overview) · [🚀 Quick Start](#-installation--setup-guide) · [📡 API Docs](#-api-workflow) · [🗺️ Roadmap](#-future-scope) · [👥 Team](#-contributorsteam-members)

</div>

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Problem Statement](#-problem-statement)
3. [Objectives](#-objectives)
4. [Features](#-features)
5. [Technology Stack](#-technology-stack)
6. [System Architecture](#%EF%B8%8F-system-architecture)
7. [Folder Structure](#-folder-structure)
8. [Authentication Workflow](#-authentication-workflow)
9. [Installation & Setup Guide](#-installation--setup-guide)
10. [Environment Variables](#-environment-variables)
11. [API Workflow](#-api-workflow)
12. [Database Design](#-database-design)
13. [Screenshots](#-screenshots)
14. [Future Scope](#-future-scope)
15. [Challenges Faced](#-challenges-faced)
16. [Learning Outcomes](#-learning-outcomes)
17. [Contributors / Team Members](#-contributorsteam-members)
18. [Mentor / Guide Information](#-mentorguide-information)
19. [License](#-license)
20. [Conclusion](#-conclusion)

---

## 📌 Project Overview

**Trackify** is a comprehensive, full-stack personal expense tracking web application built using the **MERN stack** (MongoDB, Express.js, React.js, Node.js). Developed as a final-year Software Group Project at **DEPSTAR, CHARUSAT**, Trackify aims to bridge the gap between overly complex financial software and simplistic budgeting tools.

The platform empowers users to:
- Securely record and categorise every income and expense transaction
- Set monthly budgets per category with real-time progress tracking
- Visualise spending patterns through interactive Chart.js-powered dashboards
- Connect with friends to split and settle shared expenses
- Export financial summaries as CSV or PDF reports

Trackify runs as a **Single Page Application (SPA)** with the React client on port `5173` and the Express REST API on port `5000`, backed by **MongoDB Atlas** as the cloud database.

**Academic Context:**
- 📚 Subject: ITUP201 — Software Group Project (4th Semester, B.Tech IT)
- 🏫 Institute: Devang Patel Institute of Advance Technology and Research (DEPSTAR), CHARUSAT, Changa, Anand — 388421
- 📅 Submitted: April 2026
- 🔗 Repository: [github.com/harshil5506/Trackify](https://github.com/harshil5506/Trackify)

---

## 🚩 Problem Statement

Managing personal finances is a challenge faced by millions of individuals worldwide, particularly **students and young professionals** who often lack structured tools for tracking daily expenditures.

Existing solutions fall short in one or more critical areas:

| Pain Point | Description |
|---|---|
| 📊 No unified view | No consolidated dashboard showing income vs. expenditure trends over time |
| ⚠️ No budget alerts | Absence of spending limit notifications to prevent financial overruns |
| 🤝 No social layer | Lack of shared expense-splitting features for group costs among friends |
| 📤 No export options | No simple mechanism to export financial summaries for external review |
| 🌍 Limited accessibility | Many tools are mobile-only or region-locked (e.g., US-only bank integrations) |
| 🧩 Complexity vs. depth | Tools are either too complex for casual users or too shallow for meaningful insights |

Trackify was designed from the ground up to solve all of these problems in a single, accessible, open web application.

---

## 🎯 Objectives

The primary objectives of the Trackify project are:

- ✅ **Secure Authentication** — Implement JWT + bcrypt-based user registration and login
- ✅ **Transaction Management** — Full CRUD operations for income and expense records
- ✅ **Budget Planning** — Category-based monthly budget limits with real-time spent-vs-limit tracking
- ✅ **Visual Analytics** — Interactive pie and line charts via Chart.js on a central dashboard
- ✅ **Social Expense Splitting** — Friend requests, in-app messaging, and shared expense recording
- ✅ **Report Export** — CSV and PDF export of filtered transaction data
- ✅ **Scalable Architecture** — Clean, modular codebase structured for future deployment and enhancement
- ✅ **Responsive UI** — Fully functional across all screen sizes ≥ 768px

---

## ✨ Features

### 🔐 User Authentication
- Secure **Register / Login** with email and password
- Passwords hashed with **bcryptjs** (salt factor 10)
- **JWT tokens** issued on login with 7-day expiry
- Protected routes via `PrivateRoute` component
- Forgot-password workflow (UI ready, email integration in roadmap)

### 💸 Expense Management
- Add, view, edit, and delete **expense and income transactions**
- Each transaction stores: amount, category, type, date, note, merchant, and payment method
- Filter transactions by category, date range, and type
- Sort by date, amount, or merchant name

### 📈 Income Tracking
- Dedicated income page with **source categorisation** (Salary, Freelance, Investment, Other)
- Monthly income totals with breakdown

### 🗓️ Budget Planning
- Set monthly spending limits **per category**
- Real-time **colour-coded progress bars** (🟢 Green < 80% · 🟡 Amber 80–100% · 🔴 Red > 100%)
- Instant alerts when approaching or exceeding budget limits

### 📊 Dashboard & Analytics
- **Stat cards**: Total Income · Total Expense · Net Balance
- **Pie chart**: Current month's spending by category
- **Line chart**: 6-month income vs. expense trend
- Recent transactions list (latest 5)

### 👥 Friends & Group Expense System
- Send and accept **friend requests** by email
- **In-app messaging** between connected friends
- Record **shared expenses** with split tracking (who owes whom)

### 📄 Report Export
- Configure report by **date range** and **category**
- Export as **CSV** or **PDF**

### 📱 Responsive UI
- 19-page React application styled for desktop and tablet
- Instant client-side navigation via **React Router DOM v6**
- **Toast notifications** for all user actions (react-hot-toast)

---

## 🛠️ Technology Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React.js** | v18.x | UI component library |
| **Vite** | v5.x | Build tool & dev server |
| **React Router DOM** | v6.x | Client-side routing & PrivateRoute |
| **Axios** | Latest | HTTP client with JWT interceptor |
| **Chart.js + react-chartjs-2** | Latest | Pie & line chart visualisations |
| **react-hot-toast** | Latest | Toast notification system |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | v22 LTS | JavaScript runtime |
| **Express.js** | v4.x | REST API framework |
| **Mongoose** | Latest | MongoDB ODM / schema validation |
| **jsonwebtoken** | Latest | JWT generation & verification |
| **bcryptjs** | Latest | Password hashing |
| **cors** | Latest | Cross-origin request handling |
| **dotenv** | Latest | Environment variable management |

### Database & DevOps

| Technology | Purpose |
|---|---|
| **MongoDB Atlas** | Cloud-hosted NoSQL database (free tier) |
| **Postman** | API testing & validation |
| **Git + GitHub** | Version control & remote repository |
| **VS Code** | Primary code editor (ESLint + Prettier) |
| **Git Bash** | Unix-compatible terminal on Windows |

---

## 🏗️ System Architecture

Trackify follows a classic **three-tier client-server architecture**:

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT (Port 5173)                │
│              React.js + Vite SPA                    │
│   Pages · Components · AuthContext · Axios Instance  │
└───────────────────────┬─────────────────────────────┘
                        │  HTTP Requests (Axios + JWT)
                        ▼
┌─────────────────────────────────────────────────────┐
│                   SERVER (Port 5000)                 │
│             Node.js + Express.js REST API           │
│   Routes · Middleware (JWT Auth) · Business Logic    │
└───────────────────────┬─────────────────────────────┘
                        │  Mongoose ODM
                        ▼
┌─────────────────────────────────────────────────────┐
│              DATABASE (MongoDB Atlas)                │
│    Users · Expenses · Budgets · Friends · Messages   │
└─────────────────────────────────────────────────────┘
```

### Frontend Workflow

```
User Action
    │
    ▼
React Component (useState / useEffect)
    │
    ▼
Axios Instance → Attaches JWT via Interceptor
    │
    ▼
Express API Endpoint
    │
    ▼
Response → React State Updated → UI Re-renders
```

### Backend Workflow

```
Incoming HTTP Request
    │
    ▼
CORS Middleware → Express JSON Parser
    │
    ▼
Route Matched (e.g. POST /api/expenses)
    │
    ▼
authMiddleware.js → Verifies JWT → Attaches req.user
    │
    ▼
Route Handler → Business Logic
    │
    ▼
Mongoose Model → MongoDB Atlas Query
    │
    ▼
JSON Response sent to Client
```

---

## 📁 Folder Structure

```
Trackify/
│
├── client/                          # ⚛️  React + Vite Frontend
│   ├── public/
│   ├── index.html                   # Vite entry HTML
│   ├── vite.config.js               # Vite configuration
│   ├── .env                         # Frontend environment variables
│   └── src/
│       ├── api/
│       │   └── axios.js             # Pre-configured Axios instance + JWT interceptor
│       │
│       ├── context/
│       │   └── AuthContext.jsx      # Global auth state (React Context + localStorage)
│       │
│       ├── components/
│       │   ├── PrivateRoute.jsx     # Authentication route guard
│       │   └── Navbar.jsx           # Top navigation bar
│       │
│       ├── pages/                   # 19 JSX Page Components
│       │   ├── Home.jsx             # Landing page
│       │   ├── Login.jsx            # Login form
│       │   ├── Signup.jsx           # Registration form
│       │   ├── ForgotPassword.jsx   # Password reset request
│       │   ├── Dashboard.jsx        # Analytics & summary charts
│       │   ├── AddExpense.jsx       # Transaction entry form
│       │   ├── Transactions.jsx     # Full transaction history
│       │   ├── Budget.jsx           # Budget planner
│       │   ├── Income.jsx           # Income tracking
│       │   ├── Profile.jsx          # User profile settings
│       │   ├── Friends.jsx          # Friend requests & shared expenses
│       │   ├── Reports.jsx          # Report export
│       │   ├── About.jsx
│       │   ├── Contact.jsx
│       │   └── NotFound.jsx         # 404 page
│       │
│       └── main.jsx                 # React DOM entry point
│
├── server/                          # 🖥️  Node.js + Express Backend
│   ├── .env                         # Backend environment variables
│   ├── server.js                    # Express app entry point
│   │
│   ├── middleware/
│   │   └── authMiddleware.js        # JWT verification middleware
│   │
│   ├── models/                      # Mongoose Schemas
│   │   ├── User.js
│   │   ├── Expense.js
│   │   ├── Budget.js
│   │   ├── Friend.js
│   │   └── Message.js
│   │
│   └── routes/                      # Express Route Handlers
│       ├── auth.js                  # /api/auth
│       ├── expenses.js              # /api/expenses
│       ├── user.js                  # /api/user
│       ├── analytics.js             # /api/analytics
│       ├── budget.js                # /api/budget
│       ├── friends.js               # /api/friends
│       └── messages.js              # /api/messages
│
├── .gitignore
├── README.md
└── LICENSE
```

---

## 🔐 Authentication Workflow

Trackify uses a **stateless JWT (JSON Web Token)** authentication strategy combined with **bcryptjs** password hashing. Here is the full end-to-end flow:

### Step-by-Step: Registration

```
1. User fills Signup form (name, email, password)
        │
        ▼
2. POST /api/auth/register
        │
        ▼
3. Server checks if email already exists in MongoDB
        │
   ┌────┴────┐
  Yes        No
   │          │
  400        ▼
  Error   4. bcryptjs.hash(password, saltRounds=10)
              │
              ▼
           5. New User document saved to MongoDB
              │
              ▼
           6. jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
              │
              ▼
           7. { token, user } returned to client (201)
              │
              ▼
           8. Token stored in localStorage via AuthContext
              │
              ▼
           9. User redirected to /dashboard
```

### Step-by-Step: Login

```
1. User submits Login form (email, password)
        │
        ▼
2. POST /api/auth/login
        │
        ▼
3. Server queries MongoDB for user by email
        │
   ┌────┴────┐
 Not Found   Found
   │          │
  400        ▼
  Error   4. bcryptjs.compare(inputPassword, storedHash)
              │
         ┌───┴───┐
       Match    No Match
         │          │
         ▼         400 Error
      5. jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
         │
         ▼
      6. { token, user } returned (200)
         │
         ▼
      7. Token saved to localStorage → AuthContext updated
         │
         ▼
      8. Redirect to /dashboard
```

### Authenticated API Request Flow

```
React Component calls Axios
        │
        ▼
Axios Interceptor reads token from localStorage
        │
        ▼
Header: Authorization: Bearer <JWT_TOKEN>
        │
        ▼
authMiddleware.js → jwt.verify(token, JWT_SECRET)
        │
   ┌────┴────┐
Invalid     Valid
   │          │
  401        req.user = decoded payload
  Error       │
              ▼
           Route Handler executes
```

### Security Highlights

| Mechanism | Implementation |
|---|---|
| **Password Hashing** | `bcryptjs.hash(password, 10)` — one-way, salted |
| **Token Signing** | `jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })` |
| **Token Verification** | `authMiddleware.js` on all protected routes |
| **CORS Protection** | Whitelist: `localhost:5173`, `localhost:5174` only |
| **Route Guarding** | `PrivateRoute` component redirects unauthenticated users to `/login` |

---

## 🚀 Installation & Setup Guide

### Prerequisites

Ensure the following are installed on your machine:

| Tool | Version | Download |
|---|---|---|
| Node.js | v18+ (v22 LTS recommended) | [nodejs.org](https://nodejs.org/) |
| npm | v9+ (bundled with Node.js) | — |
| Git | Latest | [git-scm.com](https://git-scm.com/) |
| MongoDB Atlas account | Free tier | [cloud.mongodb.com](https://cloud.mongodb.com/) |

> ⚠️ **Windows Users:** Use **Git Bash** as your terminal throughout this setup. PowerShell is incompatible with several Unix commands used in this project.

---

### 1. Clone the Repository

```bash
git clone https://github.com/harshil5506/Trackify.git
cd Trackify
```

---

### 2. Set Up the Backend (Server)

```bash
# Navigate into the server directory
cd server

# Install all backend dependencies
npm install
```

Create the environment file (see [Environment Variables](#-environment-variables) section):

```bash
# Using Git Bash (recommended on Windows — avoids UTF-16 encoding issues)
printf 'MONGODB_URI=your_atlas_connection_string\nJWT_SECRET=your_super_secret_key\nPORT=5000\n' > .env
```

Start the backend development server:

```bash
node server.js
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
```

---

### 3. Set Up the Frontend (Client)

Open a **new terminal window**, then:

```bash
# Navigate into the client directory
cd client

# Install all frontend dependencies
npm install
```

Create the frontend environment file:

```bash
printf 'VITE_API_URL=http://localhost:5000\n' > .env
```

Start the Vite development server:

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in 300ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

### 4. Open the App

Navigate to **[http://localhost:5173](http://localhost:5173)** in your browser.

Register a new account and start tracking your expenses! 🎉

---

### Running Both Servers Simultaneously (Recommended)

Keep two terminals open side by side:

| Terminal 1 (Backend) | Terminal 2 (Frontend) |
|---|---|
| `cd server && node server.js` | `cd client && npm run dev` |
| Runs on `localhost:5000` | Runs on `localhost:5173` |

---

## 🔑 Environment Variables

### `server/.env`

```env
# MongoDB Atlas connection string
# Format: mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/trackify

# JWT Secret — use a long, random, unpredictable string
JWT_SECRET=your_super_secret_jwt_key_min_32_chars

# Port for Express server
PORT=5000
```

### `client/.env`

```env
# Base URL of the Express backend API
VITE_API_URL=http://localhost:5000
```

> ⚠️ **Important:** Never commit `.env` files to version control. Both `server/.env` and `client/.env` are included in `.gitignore`.

> ⚠️ **Windows Encoding Warning:** Always create `.env` files using `printf` in Git Bash. Saving via Notepad or PowerShell `echo` may produce UTF-16 encoding, causing `dotenv` to silently fail to load your variables.

---

## 📡 API Workflow

All API endpoints are prefixed with their module name. All routes **except** `/api/auth/register` and `/api/auth/login` require a valid JWT in the `Authorization` header.

**Request Header for Protected Routes:**
```
Authorization: Bearer <your_jwt_token>
```

---

### 🔑 Authentication — `/api/auth`

| Method | Endpoint | Auth Required | Description | Request Body |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | Register a new user | `{ name, email, password }` |
| `POST` | `/api/auth/login` | ❌ | Login, returns JWT | `{ email, password }` |

**Example — Register:**
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Harshil Thakkar",
  "email": "harshil@example.com",
  "password": "securePassword123"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "user": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "name": "Harshil Thakkar",
    "email": "harshil@example.com"
  }
}
```

---

### 💸 Transactions — `/api/expenses`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/expenses` | ✅ | Get all transactions + aggregate stats |
| `POST` | `/api/expenses` | ✅ | Add a new transaction |
| `PUT` | `/api/expenses/:id` | ✅ | Update an existing transaction |
| `DELETE` | `/api/expenses/:id` | ✅ | Delete a transaction |

**Example — Add Expense:**
```http
POST http://localhost:5000/api/expenses
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 450,
  "category": "Food",
  "type": "expense",
  "date": "2026-04-15",
  "note": "Lunch at canteen",
  "merchant": "DEPSTAR Canteen",
  "paymentMethod": "UPI"
}
```

---

### 📊 Analytics — `/api/analytics`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/analytics/summary` | ✅ | Total income, expense & net balance |
| `GET` | `/api/analytics/monthly` | ✅ | 6-month income vs expense trend data |
| `GET` | `/api/analytics/by-category` | ✅ | Spending breakdown per category |

---

### 🗓️ Budget — `/api/budget`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/budget` | ✅ | Get all budgets with spent amounts |
| `POST` | `/api/budget` | ✅ | Set or update a budget limit |

---

### 👥 Friends — `/api/friends`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/friends/send-request` | ✅ | Send friend request by email |
| `GET` | `/api/friends/list` | ✅ | Get all accepted friends |
| `PUT` | `/api/friends/respond/:id` | ✅ | Accept or reject a request |
| `POST` | `/api/friends/expense` | ✅ | Record a shared expense |

---

### 💬 Messages — `/api/messages`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/messages/send` | ✅ | Send a message to a friend |
| `GET` | `/api/messages/conversation/:id` | ✅ | Get full conversation history |

---

### 👤 User Profile — `/api/user`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/user/profile` | ✅ | Get current user's profile |
| `PUT` | `/api/user/profile` | ✅ | Update profile details |

---

## 🗄️ Database Design

Trackify uses **MongoDB Atlas** with **Mongoose** schemas. Below is the data model overview.

### User Schema
```js
{
  name:      String (required, trimmed),
  email:     String (required, unique, lowercase),
  password:  String (required, bcrypt-hashed),
  avatar:    String,
  currency:  String,
  phone:     String,
  address:   String,
  city:      String,
  state:     String,
  zip:       String,
  country:   String,
  language:  String,
  timezone:  String,
  timestamps: { createdAt, updatedAt }
}
```

### Expense Schema
```js
{
  userId:        ObjectId (ref: 'User', required),
  amount:        Number (required),
  category:      Enum ['Food', 'Transportation', 'Shopping', 'Entertainment',
                       'Bills & Utilities', 'Healthcare', 'Salary',
                       'Freelance', 'Investment', 'Other'],
  type:          Enum ['expense', 'income'],
  date:          Date,
  note:          String,
  merchant:      String,
  paymentMethod: String,
  timestamps: { createdAt, updatedAt }
}
```

### Budget Schema
```js
{
  userId:    ObjectId (ref: 'User', required),
  category:  String (required),
  limit:     Number (required),
  month:     String (format: 'YYYY-MM'),
  timestamps: { createdAt, updatedAt }
}
```

### Friend Schema
```js
{
  sender:    ObjectId (ref: 'User', required),
  receiver:  ObjectId (ref: 'User', required),
  status:    Enum ['pending', 'accepted', 'rejected'],
  timestamps: { createdAt, updatedAt }
}
```

### Message Schema
```js
{
  sender:    ObjectId (ref: 'User', required),
  receiver:  ObjectId (ref: 'User', required),
  text:      String (required),
  read:      Boolean (default: false),
  timestamps: { createdAt, updatedAt }
}
```

### Entity Relationship Overview

```
User ──┬── (1:N) ──► Expense
       ├── (1:N) ──► Budget
       ├── (1:N) ──► Friend (as sender)
       ├── (1:N) ──► Friend (as receiver)
       ├── (1:N) ──► Message (as sender)
       └── (1:N) ──► Message (as receiver)
```

---

## 📸 Screenshots

> 🖼️ *Screenshots are placeholders. Replace with actual app screenshots after deployment.*

| Screen | Description |
|---|---|
| ![Home Page](./screenshots/home.png) | **Home Page** — Landing page with hero section, feature highlights & testimonials |
| ![Login](./screenshots/login.png) | **Login Page** — Secure login with Trackify branding |
| ![Dashboard](./screenshots/dashboard.png) | **Dashboard** — Stat cards, pie chart & line chart analytics |
| ![Add Expense](./screenshots/add-expense.png) | **Add Expense** — Transaction form with full field set |
| ![Budget](./screenshots/budget.png) | **Budget Planner** — Colour-coded progress bars per category |
| ![Friends](./screenshots/friends.png) | **Friends Page** — Friend requests, chat & shared expenses |
| ![Reports](./screenshots/reports.png) | **Reports** — Export configuration with CSV/PDF options |
| ![Transactions](./screenshots/transactions.png) | **Transactions** — Sortable full transaction history |
| ![Profile](./screenshots/profile.png) | **Profile** — Editable personal info & security settings |

---

## 🚀 Deployment

### Backend — Deploy to Render

1. Push the `server/` directory to GitHub (or the full monorepo)
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set the following environment variables in the Render dashboard:

```
MONGODB_URI = your_atlas_connection_string
JWT_SECRET  = your_production_jwt_secret
PORT        = 10000   (Render sets this automatically)
```

4. Set the **Start Command** to:
```bash
node server.js
```

### Frontend — Deploy to Vercel

1. Push the `client/` directory to GitHub
2. Import the project at [vercel.com](https://vercel.com)
3. Set the environment variable:

```
VITE_API_URL = https://your-render-backend.onrender.com
```

4. Update `server/server.js` CORS config to allow your Vercel domain:

```js
cors({
  origin: ['https://your-app.vercel.app'],
  credentials: true
})
```

5. Deploy — Vercel auto-detects Vite and builds correctly.

---

## 🔭 Future Scope

The following enhancements are planned for upcoming versions of Trackify:

| Feature | Description |
|---|---|
| 📧 **Email Password Reset** | Nodemailer + SendGrid integration for password reset link delivery |
| 🧮 **Group Settlement Algorithm** | Debt simplification to suggest minimum transactions to settle group expenses |
| 🚀 **Production Deployment** | Render (backend) + Vercel (frontend) full production setup |
| 🔔 **Push Notifications** | Web Push API / Firebase Cloud Messaging for budget alerts |
| 📱 **React Native App** | Cross-platform mobile app sharing the same Express backend API |
| 🤖 **AI-Powered Insights** | ML-based spending anomaly detection and personalised savings recommendations |
| 🔁 **Recurring Transactions** | Auto-create scheduled transactions (monthly salary, rent, subscriptions) |
| 🏦 **Bank Integration** | Open Banking API links for automatic transaction import |

---

## 🧩 Challenges Faced

Building Trackify involved overcoming several real-world development challenges:

### 1. 🗂️ `.env` UTF-16 Encoding Issue
Saving `.env` on Windows produced a UTF-16 file, causing `dotenv` to silently fail — the `JWT_SECRET` was undefined, crashing all token signing.

**Fix:** Recreate `.env` using `printf` in Git Bash, which always produces correctly encoded UTF-8.

### 2. 🌐 CORS Policy Blocking Requests
The browser blocked all frontend-to-backend API requests on initial integration.

**Fix:** Configure `cors` middleware with an explicit origin whitelist: `['http://localhost:5173', 'http://localhost:5174']` with `credentials: true`.

### 3. 💾 File Loss Due to Missing Git Commits
Backend route files and JSX pages were lost after a Git checkout as they had never been staged.

**Fix:** Strict commit discipline after every significant feature; always verify with `ls` and `cat` before pushing.

### 4. 💻 PowerShell Incompatibility
Default Windows PowerShell rejected Unix-style commands (`mkdir` with multiple args, heredoc syntax).

**Fix:** Switch to Git Bash for all terminal operations throughout the project.

### 5. ⚛️ HTML-to-JSX Migration
Converting 19 static HTML pages to React JSX was time-intensive — replacing DOM manipulation with hooks, `class` → `className`, `href` → `<Link>`.

**Fix:** Systematic page-by-page conversion with a reusable component checklist.

### 6. 🖥️ Black Area Visual Bug
A legacy `body { display: flex }` from an accidentally linked CSS file caused a black area on the right side of all pages.

**Fix:** Override with `body { display: block !important }` in global `index.css` and remove the legacy stylesheet from `index.html`.

### 7. 🔌 MongoDB Atlas Auth Failures
Connection failures caused by password mismatches and the UTF-16 `.env` encoding issue producing empty `MONGODB_URI`.

**Fix:** Reset Atlas database user password, recreate `.env` with correct encoding, confirm variable injection via debug output.

---

## 📚 Learning Outcomes

This project delivered deep practical experience across the full web development stack:

- **RESTful API Design** — Designing clean, modular, versioned API endpoints with Express.js
- **JWT Authentication** — Implementing stateless, scalable auth without session storage
- **React State Management** — Using Context API and hooks (`useState`, `useEffect`, `useContext`) without Redux
- **MongoDB Aggregation** — Writing Mongoose aggregate queries for analytics and budget calculation
- **Responsive UI Development** — Building a 19-page SPA with React Router and Vite
- **Data Visualisation** — Integrating Chart.js pie and line charts in a React component model
- **Security Best Practices** — Password hashing, token expiry, CORS policy, and route protection
- **Version Control Discipline** — Structured Git commits, branching, and conflict resolution
- **Environment Management** — Proper use of `.env` files, `.gitignore`, and cross-platform encoding
- **Debug Methodology** — Diagnosing silent errors (dotenv encoding), network failures (CORS), and visual bugs

---

## 👥 Contributors/Team Members

| Name | Enrollment No. | Role |
|---|---|---|
| **Harshil Thakkar** | D25DIT083 | Full-Stack Developer & Project Lead |
| **Dhrumil Rana** | D25DIT095 | Backend Developer & API Design |
| **Bhumi Vora** | D25DIT090 | Frontend Developer & UI/UX |
| **Meera Turakhiya** | D25DIT080 | Testing, Documentation & Reports |

---

## 🎓 Mentor/Guide Information

| Role | Name | Designation |
|---|---|---|
| **Project Guide** | Prof. Ritika Jani | Assistant Professor, Dept. of Information Technology, DEPSTAR, CHARUSAT |
| **Head of Department** | Dr. Dweepna Garg | Head of Department, Dept. of Information Technology, DEPSTAR, CHARUSAT |

**Institution:**
> Devang Patel Institute of Advance Technology and Research (DEPSTAR)
> Faculty of Technology & Engineering, CHARUSAT
> At: Changa, Ta. Petlad, Dist. Anand, PIN: 388 421, Gujarat, India

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 Harshil Thakkar, Dhrumil Rana, Bhumi Vora, Meera Turakhiya

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🏁 Conclusion

**Trackify** has been successfully developed as a comprehensive, full-stack personal expense tracking application using the MERN stack. The project achieved all its primary objectives — secure JWT-based authentication, complete CRUD transaction management, category-based budget planning with real-time alerts, interactive analytics dashboards, a social expense-splitting layer, and a reports module.

The development journey spanned a structured seven-phase sprint from initial project setup through authentication, expense management, budgeting, analytics, social features, and final polish. Each phase was rigorously validated through Postman API testing and browser-based functional testing, with all 10 critical test cases passing.

Trackify demonstrates that a clean, lightweight, and accessible financial management tool is achievable with modern open-source JavaScript technologies — without complex bank integrations or paid subscriptions. The codebase is structured for straightforward deployment on Render (backend) and Vercel (frontend), and the stateless JWT architecture ensures the application can scale horizontally as the user base grows.

With planned future enhancements including email password reset, group settlement algorithms, push notifications, and a React Native mobile app, Trackify is positioned to evolve from an academic project into a genuinely useful, production-grade open-source financial tool.

---

<div align="center">

**Made with ❤️ by Team Trackify — DEPSTAR, CHARUSAT · April 2026**

⭐ If you found this project helpful, please give it a star on [GitHub](https://github.com/harshil5506/Trackify)!

</div>
