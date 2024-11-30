import React from 'react';
import { useLocation, Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute() {
  const isAuthenticated = !!localStorage.getItem('user');
  const location = useLocation();

  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace state={{ from: location }} />;
}

export default ProtectedRoute;