import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { Spinner } from 'react-bootstrap';

const ProtectedRoute = () => {
  const { isAuthenticated, loading, checkAuthState } = useAuth();
  const location = useLocation();

  // Check auth state when the component mounts
  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  // Redirect to login if not authenticated, preserving the intended destination
  return isAuthenticated ? 
    <Outlet /> : 
    <Navigate to="/login" state={{ from: location }} replace />;
};

export default ProtectedRoute; 