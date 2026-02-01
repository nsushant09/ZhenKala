import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  return isAdmin ? children : <Navigate to="/" />;
};

export default AdminRoute;
