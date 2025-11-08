import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../services/secureApi';

const AdminRoute = () => {
  const isAuthenticated = authService.isAuthenticated();
  const isAdmin = authService.isAdmin();
  const user = authService.getCurrentUser();

  if (!isAuthenticated || !user) {
    // Clear any stale state and redirect to login
    authService.logout();
    return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/portal" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
