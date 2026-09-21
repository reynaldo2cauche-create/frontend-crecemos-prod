import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, roles }) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    return <Navigate to="/intranet" replace />;
  }

  if (roles && roles.length > 0) {
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem('user'));
    } catch {
      user = null;
    }
    if (!roles.includes(user?.rol?.id)) {
      return <Navigate to="/intranet/agenda" replace />;
    }
  }

  return children;
};

export default PrivateRoute; 