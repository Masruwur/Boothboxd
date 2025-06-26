import React from "react";
import { Navigate } from "react-router-dom";
import { ACCESS_TOKEN } from "../constants";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem(ACCESS_TOKEN)

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
