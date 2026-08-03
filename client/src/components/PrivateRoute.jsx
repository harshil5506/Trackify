// import { Navigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// const PrivateRoute = ({ children }) => {
//   const { token, loading } = useAuth();
//   if (loading) return <div>Loading...</div>;
//   return token ? children : <Navigate to="/login" />;
// };
// export default PrivateRoute;


import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user, token, loading, isLockRequired } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        Loading...
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // If user has no PIN set and isn't already on set-pin page
  if (!user.pin && location.pathname !== "/set-pin") {
    return <Navigate to="/set-pin" replace />;
  }

  // If PIN lock is active and user isn't already on pinlock page
  if (user.pin && isLockRequired() && location.pathname !== "/pinlock") {
    return <Navigate to="/pinlock" replace />;
  }

  return children;
};

export default PrivateRoute;