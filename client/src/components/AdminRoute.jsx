import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { isAdminUser } from '../utils/authHelper'; // Import the helper!
import Spinner from './Spinner'; 

const AdminRoute = () => {
  const { user, loading, isAuthenticated } = useSelector((state) => state.auth);

  // 1. Wait for Auth Check to finish
  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
  }

  // 2. If no user, kick to login
  if (!isAuthenticated || !user) {
     return <Navigate to="/login" replace />;
  }

  // 3. Debugging Logs (Remove after fixing)
  if (!isAdminUser(user)) {
      console.warn("Access Denied: User is not Admin. Roles:", user.roles);
  }

  // 4. Check Role using Helper
  return isAdminUser(user) ? <Outlet /> : <Navigate to="/home" replace />;
};

export default AdminRoute;