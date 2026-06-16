import React, { useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProtectedRoute = ({ children }) => {
  const { user, token, loading } = useContext(AuthContext);

  useEffect(() => {
    if (!loading && !token) {
      toast.error('Please login to access this feature', {
        style: {
          border: '1px solid #111111',
          padding: '16px',
          color: '#111111',
          fontFamily: '"Satoshi", sans-serif',
          fontWeight: '600',
          borderRadius: '0px',
        },
        iconTheme: {
          primary: '#111111',
          secondary: '#ffffff',
        },
      });
    }
  }, [loading, token]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#f2f2f2]">
        <div className="animate-spin rounded-full h-12 w-12" style={{ border: '3px solid #d9d9d9', borderTopColor: '#111111' }}></div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
