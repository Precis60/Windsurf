import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../services/secureApi';

const AdminRoute = () => {
  const isAuthenticated = authService.isAuthenticated();
  const isAdmin = authService.isAdmin();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return isAdmin ? <Outlet /> : <Navigate to="/portal" />;
};

export default AdminRoute;
