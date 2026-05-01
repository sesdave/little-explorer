import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { parentRoutes } from './parent.routes';
import { adminRoutes } from './admin.routes';
import { AdminDashboardLayout } from '@/layouts/AdminDashboardLayout';
import { VerifyEmailPage } from '@/components/auth/VerifyEmailPage';

// --- THE BOUNCERS ---

const GuestGuard = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore();
  
  // 🏛️ If user is logged in AND verified, send them away.
  // If they are logged in but NOT verified, let them stay 
  // so they can see the VerificationGate in RegisterPage!
  if (user && user.isEmailVerified) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore();
  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />;
  return <>{children}</>;
};

/**
 * RootRedirect: The Traffic Controller
 * Determines where to send a user when they hit the base URL "/"
 */
const RootRedirect = () => {
  const { user } = useAuthStore();

  if (!user) {
    // 🚩 This is what sends everyone to Login by default
    return <Navigate to="/login" replace />;
  }

  if (!user.isEmailVerified) {
    return <Navigate to="/register" replace />;
  }

  // If already logged in, send them to their respective dashboard
  return user.role === 'ADMIN' 
    ? <Navigate to="/admin" replace /> 
    : <Navigate to="/dashboard" replace />;
};

// --- THE ROUTER ---

export const router = createBrowserRouter([
  // 1. Define the root path behavior
  {
    path: '/',
    element: <RootRedirect />,
  },

  // 2. Auth routes
  { 
    path: '/login', 
    element: <GuestGuard><LoginPage /></GuestGuard> 
  },
  { 
    path: '/register', 
    element: <GuestGuard><RegisterPage /></GuestGuard> 
  },
  { 
    // 🏛️ New verification landing page
    path: '/verify-email', 
    element: <VerifyEmailPage /> 
  },

  // 3. Parent and Admin routes
  parentRoutes,
  {
    path: '/admin',
    element: (
      <AdminGuard>
        <AdminDashboardLayout />
      </AdminGuard>
    ),
    children: adminRoutes.children,
  },

  // 4. Catch-all: Send any broken URLs back to root
  {
    path: '*',
    element: <Navigate to="/" replace />,
  }
]);