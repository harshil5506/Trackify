// // import { BrowserRouter, Routes, Route } from "react-router-dom";
// // import { Toaster } from "react-hot-toast";
// // import { AuthProvider } from "./context/AuthContext";
// // import PrivateRoute from "./components/PrivateRoute";
// // import Home from "./pages/Home";
// // import Login from "./pages/Login";
// // import Signup from "./pages/Signup";
// // import ForgotPassword from "./pages/ForgotPassword";
// // import Verify from "./pages/Verify";
// // import Dashboard from "./pages/Dashboard";
// // import Profile from "./pages/Profile";
// // import AddExpense from "./pages/AddExpense";
// // import Transactions from "./pages/Transactions";
// // import Income from "./pages/Income";
// // import Budget from "./pages/Budget";
// // import Friends from "./pages/Friends";
// // import Groups from "./pages/Groups";
// // import Activity from "./pages/Activity";
// // import Reports from "./pages/Reports";
// // import Vision from "./pages/Vision";
// // import About from "./pages/About";
// // import Contact from "./pages/Contact";
// // import NotFound from "./pages/NotFound";
// // import ResetPassword from "./pages/ResetPassword";



// // function App() {
// //   return (
// //     <AuthProvider>
// //       <BrowserRouter>
// //         <Toaster position="top-right" />
// //         <Routes>
// //           <Route path="/" element={<Home />} />
// //           <Route path="/home" element={<Home />} />
// //           <Route path="/login" element={<Login />} />
// //           <Route path="/signup" element={<Signup />} />
// //           <Route path="/forgot-password" element={<ForgotPassword />} />
// //           <Route path="/reset-password/:token" element={<ResetPassword />} />
// //           <Route path="/verify" element={<Verify />} />
// //           <Route path="/about" element={<About />} />
// //           <Route path="/contact" element={<Contact />} />
// //           <Route
// //             path="/dashboard"
// //             element={
// //               <PrivateRoute>
// //                 <Dashboard />
// //               </PrivateRoute>
// //             }
// //           />
// //           <Route
// //             path="/profile"
// //             element={
// //               <PrivateRoute>
// //                 <Profile />
// //               </PrivateRoute>
// //             }
// //           />
// //           <Route
// //             path="/add-expense"
// //             element={
// //               <PrivateRoute>
// //                 <AddExpense />
// //               </PrivateRoute>
// //             }
// //           />
// //           <Route
// //             path="/transactions"
// //             element={
// //               <PrivateRoute>
// //                 <Transactions />
// //               </PrivateRoute>
// //             }
// //           />
// //           <Route
// //             path="/income"
// //             element={
// //               <PrivateRoute>
// //                 <Income />
// //               </PrivateRoute>
// //             }
// //           />
// //           <Route
// //             path="/budget"
// //             element={
// //               <PrivateRoute>
// //                 <Budget />
// //               </PrivateRoute>
// //             }
// //           />
// //           <Route
// //             path="/friends"
// //             element={
// //               <PrivateRoute>
// //                 <Friends />
// //               </PrivateRoute>
// //             }
// //           />
// //           <Route
// //             path="/groups"
// //             element={
// //               <PrivateRoute>
// //                 <Groups />
// //               </PrivateRoute>
// //             }
// //           />
// //           <Route
// //             path="/activity"
// //             element={
// //               <PrivateRoute>
// //                 <Activity />
// //               </PrivateRoute>
// //             }
// //           />
// //           <Route
// //             path="/reports"
// //             element={
// //               <PrivateRoute>
// //                 <Reports />
// //               </PrivateRoute>
// //             }
// //           />
// //           <Route
// //             path="/vision"
// //             element={
// //               <PrivateRoute>
// //                 <Vision />
// //               </PrivateRoute>
// //             }
// //           />
// //           <Route path="*" element={<NotFound />} />
// //         </Routes>
// //       </BrowserRouter>
// //     </AuthProvider>
// //   );
// // }

// // export default App;



// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { Toaster } from "react-hot-toast";
// import { AuthProvider, useAuth } from "./context/AuthContext";
// import PrivateRoute from "./components/PrivateRoute";
// import Home from "./pages/Home";
// import Login from "./pages/Login";
// import Signup from "./pages/Signup";
// import ForgotPassword from "./pages/ForgotPassword";
// import Verify from "./pages/Verify";
// import Dashboard from "./pages/Dashboard";
// import Profile from "./pages/Profile";
// import AddExpense from "./pages/AddExpense";
// import Transactions from "./pages/Transactions";
// import Income from "./pages/Income";
// import Budget from "./pages/Budget";
// import Friends from "./pages/Friends";
// import Groups from "./pages/Groups";
// import Activity from "./pages/Activity";
// import Reports from "./pages/Reports";
// import Vision from "./pages/Vision";
// import About from "./pages/About";
// import Contact from "./pages/Contact";
// import NotFound from "./pages/NotFound";
// import ResetPassword from "./pages/ResetPassword";
// import SetPin from "./pages/SetPin";
// import PinLock from "./pages/PinLock";

// // Wraps all private routes — checks PIN status before allowing access
// // const PinRoute = ({ children }) => {
// //   const { user, token, pinVerified, isLockRequired } = useAuth();

// //   if (!user || !token) return <Navigate to="/login" />;

// //   // If user has no PIN yet → force them to set one
// //   if (!user.pin) return <Navigate to="/set-pin" />;

// //   // If PIN not verified this session OR 30 mins passed → show lock screen
// //   if (!pinVerified || isLockRequired()) return <Navigate to="/pin-lock" />;

// //   return children;
// // };


// const PinRoute = ({ children }) => {
//   const { user, token, pinVerified, isLockRequired } = useAuth();

//   if (!user || !token) return <Navigate to="/login" />;

//   // If user has no PIN yet → force set pin (only for new users)
//   if (!user.pin) return <Navigate to="/set-pin" />;

//   // If PIN already set but not verified this session OR 30 mins passed → pin lock
//   if (user.pin && (!pinVerified || isLockRequired())) return <Navigate to="/pin-lock" />;

//   return children;
// };


// function App() {
//   return (
//     <AuthProvider>
//       <BrowserRouter>
//         <Toaster position="top-right" />
//         <Routes>
//           {/* Public routes */}
//           <Route path="/" element={<Home />} />
//           <Route path="/home" element={<Home />} />
// //           <Route path="/login" element={<Login />} />
// //           <Route path="/signup" element={<Signup />} />
// //           <Route path="/forgot-password" element={<ForgotPassword />} />
// //           <Route path="/reset-password/:token" element={<ResetPassword />} />
// //           <Route path="/verify" element={<Verify />} />
// //           <Route path="/about" element={<About />} />
// //           <Route path="/contact" element={<Contact />} />

// //           {/* PIN routes */}
// //                 <Route path="/set-pin" element={
// //         <PrivateRoute>
// //           {user?.pin ? <Navigate to="/pin-lock" /> : <SetPin />}
// //         </PrivateRoute>
// //         } />
// //           <Route path="/pin-lock" element={
// //             <PrivateRoute><PinLock /></PrivateRoute>
// //           } />

// //           {/* Protected routes — require PIN */}
// //           <Route path="/dashboard" element={
// //             <PinRoute><Dashboard /></PinRoute>
// //           } />
// //           <Route path="/profile" element={
// //             <PinRoute><Profile /></PinRoute>
// //           } />
// //           <Route path="/add-expense" element={
// //             <PinRoute><AddExpense /></PinRoute>
// //           } />
// //           <Route path="/transactions" element={
// //             <PinRoute><Transactions /></PinRoute>
// //           } />
// //           <Route path="/income" element={
// //             <PinRoute><Income /></PinRoute>
// //           } />
// //           <Route path="/budget" element={
// //             <PinRoute><Budget /></PinRoute>
// //           } />
// //           <Route path="/friends" element={
// //             <PinRoute><Friends /></PinRoute>
// //           } />
// //           <Route path="/groups" element={
// //             <PinRoute><Groups /></PinRoute>
// //           } />
// //           <Route path="/activity" element={
// //             <PinRoute><Activity /></PinRoute>
// //           } />
// //           <Route path="/reports" element={
// //             <PinRoute><Reports /></PinRoute>
// //           } />
// //           <Route path="/vision" element={
// //             <PinRoute><Vision /></PinRoute>
// //           } />

// //           <Route path="*" element={<NotFound />} />
// //         </Routes>
// //       </BrowserRouter>
// //     </AuthProvider>
// //   );
// // }

// // export default App;











// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { Toaster } from "react-hot-toast";
// import { AuthProvider, useAuth } from "./context/AuthContext";
// import Home from "./pages/Home";
// import Login from "./pages/Login";
// import Signup from "./pages/Signup";
// import ForgotPassword from "./pages/ForgotPassword";
// import Verify from "./pages/Verify";
// import Dashboard from "./pages/Dashboard";
// import Profile from "./pages/Profile";
// import AddExpense from "./pages/AddExpense";
// import Transactions from "./pages/Transactions";
// import Income from "./pages/Income";
// import Budget from "./pages/Budget";
// import Friends from "./pages/Friends";
// import Groups from "./pages/Groups";
// import Activity from "./pages/Activity";
// import Reports from "./pages/Reports";
// import Vision from "./pages/Vision";
// import About from "./pages/About";
// import Contact from "./pages/Contact";
// import NotFound from "./pages/NotFound";
// import ResetPassword from "./pages/ResetPassword";
// import SetPin from "./pages/SetPin";
// import PinLock from "./pages/PinLock";

// // Only for logged-in users — checks PIN status
// const PinRoute = ({ children }) => {
//   const { user, token, pinVerified, isLockRequired } = useAuth();
//   if (!user || !token) return <Navigate to="/login" />;
//   if (!user.pin) return <Navigate to="/set-pin" />;
//   if (!pinVerified || isLockRequired()) return <Navigate to="/pin-lock" />;
//   return children;
// };

// // /set-pin — only for users with no PIN yet
// const SetPinRoute = () => {
//   const { user, token } = useAuth();
//   if (!user || !token) return <Navigate to="/login" />;
//   if (user.pin) return <Navigate to="/pin-lock" />;
//   return <SetPin />;
// };

// // /pin-lock — only for users who have a PIN but haven't verified yet
// const PinLockRoute = () => {
//   const { user, token, pinVerified, isLockRequired } = useAuth();
//   if (!user || !token) return <Navigate to="/login" />;
//   if (!user.pin) return <Navigate to="/set-pin" />;
//   if (pinVerified && !isLockRequired()) return <Navigate to="/dashboard" />;
//   return <PinLock />;
// };

// // All routes live here — inside AuthProvider so useAuth() works
// function AppRoutes() {
//   return (
//     <Routes>
//       {/* Public */}
//       <Route path="/" element={<Home />} />
//       <Route path="/home" element={<Home />} />
//       <Route path="/login" element={<Login />} />
//       <Route path="/signup" element={<Signup />} />
//       <Route path="/forgot-password" element={<ForgotPassword />} />
//       <Route path="/reset-password/:token" element={<ResetPassword />} />
//       <Route path="/verify" element={<Verify />} />
//       <Route path="/about" element={<About />} />
//       <Route path="/contact" element={<Contact />} />

//       {/* PIN */}
//       <Route path="/set-pin" element={<SetPinRoute />} />
//       <Route path="/pin-lock" element={<PinLockRoute />} />

//       {/* Protected */}
//       <Route path="/dashboard"    element={<PinRoute><Dashboard /></PinRoute>} />
//       <Route path="/profile"      element={<PinRoute><Profile /></PinRoute>} />
//       <Route path="/add-expense"  element={<PinRoute><AddExpense /></PinRoute>} />
//       <Route path="/transactions" element={<PinRoute><Transactions /></PinRoute>} />
//       <Route path="/income"       element={<PinRoute><Income /></PinRoute>} />
//       <Route path="/budget"       element={<PinRoute><Budget /></PinRoute>} />
//       <Route path="/friends"      element={<PinRoute><Friends /></PinRoute>} />
//       <Route path="/groups"       element={<PinRoute><Groups /></PinRoute>} />
//       <Route path="/activity"     element={<PinRoute><Activity /></PinRoute>} />
//       <Route path="/reports"      element={<PinRoute><Reports /></PinRoute>} />
//       <Route path="/vision"       element={<PinRoute><Vision /></PinRoute>} />

//       <Route path="*" element={<NotFound />} />
//     </Routes>
//   );
// }

// function App() {
//   return (
//     <AuthProvider>
//       <BrowserRouter>
//         <Toaster position="top-right" />
//         <AppRoutes />
//       </BrowserRouter>
//     </AuthProvider>
//   );
// }

// export default App;



import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Verify from "./pages/Verify";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AddExpense from "./pages/AddExpense";
import Transactions from "./pages/Transactions";
import Income from "./pages/Income";
import Budget from "./pages/Budget";
import Friends from "./pages/Friends";
import Groups from "./pages/Groups";
import Activity from "./pages/Activity";
import Reports from "./pages/Reports";
import Vision from "./pages/Vision";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";
import SetPin from "./pages/SetPin";
import PinLock from "./pages/PinLock";

const PinRoute = ({ children }) => {
  const { user, token, pinVerified, isLockRequired, isSessionExpired, isWithin30Mins } = useAuth();

  // Not logged in → login page
  if (!user || !token) return <Navigate to="/login" />;

  // 24 hours passed → force full login again
  if (isSessionExpired()) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("lastActive");
    return <Navigate to="/login" />;
  }

  // No PIN set yet → set PIN first
  if (!user.pin) return <Navigate to="/set-pin" />;

  // Within 30 mins → skip PIN, go straight in
  if (isWithin30Mins() && pinVerified) return children;

  // PIN not verified → show lock screen
  if (isLockRequired()) return <Navigate to="/pin-lock" />;

  return children;
};

const SetPinRoute = () => {
  const { user, token } = useAuth();
  if (!user || !token) return <Navigate to="/login" />;
  if (user.pin) return <Navigate to="/pin-lock" />;
  return <SetPin />;
};

const PinLockRoute = () => {
  const { user, token, pinVerified, isWithin30Mins } = useAuth();
  if (!user || !token) return <Navigate to="/login" />;
  if (!user.pin) return <Navigate to="/set-pin" />;
  if (pinVerified && isWithin30Mins()) return <Navigate to="/dashboard" />;
  return <PinLock />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/verify" element={<Verify />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />

      {/* PIN */}
      <Route path="/set-pin" element={<SetPinRoute />} />
      <Route path="/pin-lock" element={<PinLockRoute />} />

      {/* Protected — all require PIN */}
      <Route path="/dashboard"    element={<PinRoute><Dashboard /></PinRoute>} />
      <Route path="/profile"      element={<PinRoute><Profile /></PinRoute>} />
      <Route path="/add-expense"  element={<PinRoute><AddExpense /></PinRoute>} />
      <Route path="/transactions" element={<PinRoute><Transactions /></PinRoute>} />
      <Route path="/income"       element={<PinRoute><Income /></PinRoute>} />
      <Route path="/budget"       element={<PinRoute><Budget /></PinRoute>} />
      <Route path="/friends"      element={<PinRoute><Friends /></PinRoute>} />
      <Route path="/groups"       element={<PinRoute><Groups /></PinRoute>} />
      <Route path="/activity"     element={<PinRoute><Activity /></PinRoute>} />
      <Route path="/reports"      element={<PinRoute><Reports /></PinRoute>} />
      <Route path="/vision"       element={<PinRoute><Vision /></PinRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;