// apps/web/src/pages/admin/admin.loader.ts
import api from '@/services/api';

export const adminDashboardLoader = async () => {
  try {
    const response = await api.get('/v1/admin/overview');
    return response.data; // This returns { stats, recentApps }
  } catch (error) {
    console.error("Dashboard failed to load", error);
    return { stats: null, recentApps: [] };
  }
};