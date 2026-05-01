

// // import { createContext, useContext, useState, useEffect } from "react";
// // const AuthContext = createContext();
// // export const AuthProvider = ({ children }) => {
// //   const [user, setUser] = useState(null);
// //   const [token, setToken] = useState(localStorage.getItem("token"));
// //   const [loading, setLoading] = useState(true);
// //   useEffect(() => {
// //     const savedUser = localStorage.getItem("user");
// //     if (savedUser && token) setUser(JSON.parse(savedUser));
// //     setLoading(false);
// //   }, []);
// //   const login = (userData, jwtToken) => {
// //     setUser(userData); setToken(jwtToken);
// //     localStorage.setItem("token", jwtToken);
// //     localStorage.setItem("user", JSON.stringify(userData));
// //   };
// //   const logout = () => {
// //     setUser(null); setToken(null);
// //     localStorage.removeItem("token");
// //     localStorage.removeItem("user");
// //   };
// //   return <AuthContext.Provider value={{ user, token, login, logout, loading }}>{children}</AuthContext.Provider>;
// // };
// // export const useAuth = () => useContext(AuthContext);
// ---------------------------------------------------------------------------------------------------------------------
// import { createContext, useContext, useState, useEffect } from "react";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [token, setToken] = useState(localStorage.getItem("token"));
//   const [loading, setLoading] = useState(true);
//   const [pinVerified, setPinVerified] = useState(false);

//   useEffect(() => {
//     const savedUser = localStorage.getItem("user");
//     if (savedUser && token) setUser(JSON.parse(savedUser));
//     setLoading(false);
//   }, []);

//   // Check if 30 mins have passed since last active
//   const isLockRequired = () => {
//     const lastActive = localStorage.getItem("lastActive");
//     if (!lastActive) return true;
//     const diff = Date.now() - parseInt(lastActive);
//     return diff > 30 * 60 * 1000; // 30 minutes
//   };

//   // Call this whenever user does something in the app
//   const updateLastActive = () => {
//     localStorage.setItem("lastActive", Date.now().toString());
//   };

//   const login = (userData, jwtToken) => {
//     setUser(userData);
//     setToken(jwtToken);
//     localStorage.setItem("token", jwtToken);
//     localStorage.setItem("user", JSON.stringify(userData));
//     localStorage.removeItem("lastActive"); // force PIN on first login
//   };

//   const logout = () => {
//     setUser(null);
//     setToken(null);
//     setPinVerified(false);
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     localStorage.removeItem("lastActive");
//   };

//   const verifyPin = () => {
//   // reload updated user from localStorage
//   const savedUser = localStorage.getItem("user");
//   if (savedUser) setUser(JSON.parse(savedUser));
//     setPinVerified(true);
//     updateLastActive();
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         token,
//         login,
//         logout,
//         loading,
//         pinVerified,
//         verifyPin,
//         isLockRequired,
//         updateLastActive,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);


// --------------------------------------------------------------------------------

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const THIRTY_MINS = 30 * 60 * 1000;
const TWENTY_FOUR_HRS = 24 * 60 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const [pinVerified, setPinVerified] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser && token) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  // Call this whenever user does something in the app
  const updateLastActive = () => {
    localStorage.setItem("lastActive", Date.now().toString());
  };

  // Within 30 mins → no PIN needed
  const isWithin30Mins = () => {
    const lastActive = localStorage.getItem("lastActive");
    if (!lastActive) return false;
    return Date.now() - parseInt(lastActive) < THIRTY_MINS;
  };

  // After 24 hours → force full login
  const isSessionExpired = () => {
    const lastActive = localStorage.getItem("lastActive");
    if (!lastActive) return true;
    return Date.now() - parseInt(lastActive) > TWENTY_FOUR_HRS;
  };

  // PIN required if NOT within 30 mins and NOT already verified this session
  const isLockRequired = () => {
    if (pinVerified && isWithin30Mins()) return false; // within 30 mins, verified
    if (pinVerified) return false; // verified this session
    return true; // need PIN
  };

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem("token", jwtToken);
    localStorage.setItem("user", JSON.stringify(userData));
    updateLastActive();
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setPinVerified(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("lastActive");
  };

  const verifyPin = () => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
    setPinVerified(true);
    updateLastActive();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading,
        pinVerified,
        verifyPin,
        isLockRequired,
        isSessionExpired,
        isWithin30Mins,
        updateLastActive,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);