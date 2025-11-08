import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../services/secureApi';

const StaffRoute = () => {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();
  const isAdmin = user && user.role === 'admin';
  const isStaff = user && user.role === 'staff';

  if (!isAuthenticated || !user) {
    // Clear any stale state and redirect to login
    authService.logout();
    return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
  }

  if (!isAdmin && !isStaff) {
    return <Navigate to="/client-portal" replace />;
  }

  return <Outlet />;
};

export default StaffRoute;
