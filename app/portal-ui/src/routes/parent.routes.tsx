import { RouteObject } from 'react-router-dom';
import { ParentPortalLayout } from '@/layouts/ParentPortalLayout';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { RegistrationPage } from '@/pages/RegistrationPage';
import { getFamilyDashboardData } from '../services/family.service';

export const parentRoutes: RouteObject = {
  path: '/dashboard', // 👈 ADD THE SLASH HERE
  element: <ParentPortalLayout />,
  errorElement: <div className="p-10 font-bold text-red-500">Something went wrong!</div>,
  children: [
    {
      index: true,
      element: <DashboardPage />,
      loader: async () => await getFamilyDashboardData(),
    },
    { 
      path: 'register', 
      element: <RegistrationPage />,
      loader: async () => await getFamilyDashboardData(),
    },
  ]
};