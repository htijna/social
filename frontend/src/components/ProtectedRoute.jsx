import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children, user, adminOnly = false }) {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token || !user) {
    // Redirect to login but save current location for post-login redirection
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    // If admin route and user is not admin, redirect to user dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
