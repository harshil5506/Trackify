import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CurrencyProvider, useCurrency } from "./context/CurrencyContext";
import CurrencyConverterModal from "./components/CurrencyConverterModal";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";
import ErrorBoundary from "./components/ErrorBoundary";

// ✅ All page imports
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import SetPin from "./pages/SetPin";
import PinLock from "./pages/PinLock";
import ForgotPassword from "./pages/ForgotPassword";
import Verify from "./pages/Verify";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AddExpense from "./pages/AddExpense";
import Transactions from "./pages/Transactions";
import Income from "./pages/Income";
import Budget from "./pages/Budget";
import Goals from "./pages/Goals";
import Subscriptions from "./pages/Subscriptions";
import Friends from "./pages/Friends";
import Groups from "./pages/Groups";
import GroupDetail from "./pages/GroupDetail";
import Activity from "./pages/Activity";
import Reports from "./pages/Reports";
import Quiz from "./pages/Quiz";
import Investments from "./pages/Investments";
import Vision from "./pages/Vision";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

// ✅ Pages where Navbar should NOT show
const noNavbarPages = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/verify",
  "/set-pin",
  "/pinlock",
];

// ✅ Layout defined OUTSIDE App — important!
const GlobalCurrencyModal = () => {
  const { isConverterOpen, closeConverter } = useCurrency();
  return <CurrencyConverterModal isOpen={isConverterOpen} onClose={closeConverter} />;
};

const Layout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const showNavbar = user && !noNavbarPages.includes(location.pathname);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      {showNavbar && <Navbar />}
      <div style={{ flex: 1 }}>{children}</div>
      <GlobalCurrencyModal />
      <Footer />
    </div>
  );
};

import { GoogleOAuthProvider } from "@react-oauth/google";

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <BrowserRouter>
          <CurrencyProvider>
            <Toaster position="top-right" />
            {/* ✅ Layout is INSIDE AuthProvider and BrowserRouter */}
            <ErrorBoundary>
              <Layout>
                <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify" element={<Verify />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route
                  path="/set-pin"
                  element={
                    <PrivateRoute>
                      <SetPin />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/pinlock"
                  element={
                    <PrivateRoute>
                      <PinLock />
                    </PrivateRoute>
                  }
                />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/vision" element={<Vision />} />
                
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/add-expense"
                  element={
                    <PrivateRoute>
                      <AddExpense />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/transactions"
                  element={
                    <PrivateRoute>
                      <Transactions />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/income"
                  element={
                    <PrivateRoute>
                      <Income />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/budget"
                  element={
                    <PrivateRoute>
                      <Budget />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/goals"
                  element={
                    <PrivateRoute>
                      <Goals />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/subscriptions"
                  element={
                    <PrivateRoute>
                      <Subscriptions />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/friends"
                  element={
                    <PrivateRoute>
                      <Friends />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/groups"
                  element={
                    <PrivateRoute>
                      <Groups />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/groups/:id"
                  element={
                    <PrivateRoute>
                      <GroupDetail />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/activity"
                  element={
                    <PrivateRoute>
                      <Activity />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/quiz"
                  element={
                    <PrivateRoute>
                      <Quiz />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <PrivateRoute>
                      <Reports />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/investments"
                  element={
                    <PrivateRoute>
                      <Investments />
                    </PrivateRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </ErrorBoundary>
        </CurrencyProvider>
      </BrowserRouter>
    </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
