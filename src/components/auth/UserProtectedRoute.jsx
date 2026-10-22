import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function UserProtectedRoute({ children }) {
  const { isUserAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-body flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-3 border-brand-teal border-t-transparent animate-spin" />
          <span className="text-xs font-semibold text-brand-dark">Verifying Reception Session...</span>
        </div>
      </div>
    );
  }

  // Redirect specifically to /user/login if not authenticated as user
  if (!isUserAuthenticated) {
    return <Navigate to="/user/login" state={{ from: location }} replace />;
  }

  return children;
}
