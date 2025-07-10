import React from "react";
import { Navigate } from "react-router-dom";
import { ACCESS_TOKEN } from "../constants";
import { jwtDecode } from "jwt-decode";

function isValidAdminId(id) {
  return /^22\d{5}$/.test(id);
}


const AdminRoute = ({ children }) => {
  const token = localStorage.getItem(ACCESS_TOKEN)
  if (!token) {
    return <Navigate to="/login" />;
  }
  const data = jwtDecode(token)
  const admin_id = data.user_id
  if(!isValidAdminId(admin_id)){
    return <Navigate to="/login" />;
  }
  return children;
};

export default AdminRoute;
