// src/components/AdminRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ color: 'white', textAlign: 'center', paddingTop: '5rem' }}>Carregando sistema...</div>;
  }

  // Se não tiver usuário, manda pro login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se tiver usuário, libera o acesso (já que todos agora são "admins" no front)
  return children;
};

export default AdminRoute;