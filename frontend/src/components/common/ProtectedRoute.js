import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null; // Optionally render a loading spinner
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute; 