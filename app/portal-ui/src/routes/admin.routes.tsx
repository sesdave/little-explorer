import { RouteObject } from 'react-router-dom';
import { AdminOverviewPage } from '@/pages/admin/AdminOverviewPage';
import { SessionManagerPage } from '@/pages/session/SessionManagerPage';
import { ClassBuilderPage } from '@/pages/session/ClassBuilderPage'
import { adminDashboardLoader } from '@/loaders/admin.loader';
import { ExplorersPage } from '@/pages/admin/ExplorersPage';
import { explorersLoader } from '@/loaders/explorers.loader';


export const adminRoutes: RouteObject = {
  // We keep this as a simple object to export the children
  children: [
    {
      index: true,
      element: <AdminOverviewPage />,
      loader: async () => await adminDashboardLoader(),
    },
    {
      path: 'sessions',
      // This is the parent "Manager" view
      element: <SessionManagerPage />,
    },
    {
      // Dynamic route for the builder
      path: 'sessions/:sessionId/builder',
      element: <ClassBuilderPage />,
    },
    {
        path: 'explorers', // 👈 The route the StatCard navigates to
        element: <ExplorersPage />,
        loader: explorersLoader, // 👈 Fetches paginated data
      },
  ],
};