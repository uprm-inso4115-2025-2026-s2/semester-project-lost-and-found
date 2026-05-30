import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

const RequireAuth: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { user, loading, isGuest } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  if (!user || isGuest) {
    return <Navigate to="/login" state={{ from: location, guestBlocked: isGuest }} replace />;
  }

  return children;
};

export default RequireAuth;