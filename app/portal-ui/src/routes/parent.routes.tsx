import { RouteObject } from 'react-router-dom';
import { ParentPortalLayout } from '@/layouts/ParentPortalLayout';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { RegistrationPage } from '@/pages/RegistrationPage';
import { getFamilyDashboardData } from '../services/family.service';
import { PaymentPage } from '@/pages/payment/PaymentPage';
import { PaymentVerifying } from '@/pages/payment/PaymentVerifying';
import api from '@/services/api';

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
     // 🧠 NEW: Payment page (Paystack entry point)
    {
      path: 'payment/:applicationId',
      element: <PaymentPage />,
      loader: async ({ params }) => {
        const res = await api.get(`/v1/registrations/applications/pending/${params.applicationId}`);
        return res.data;
      }
    },

    // 🧠 NEW: Verification callback page
    {
      path: 'payment/verifying',
      element: <PaymentVerifying />,
    },
  ]
};