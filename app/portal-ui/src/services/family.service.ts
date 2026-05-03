import { Child } from '@mle/types';
import api from '@/services/api';

interface FamilyDashboardResponse {
  parentName: string;
  isEmailVerified: boolean;
  children: Child[];
}

export const getFamilyDashboardData = async (): Promise<FamilyDashboardResponse> => {
  try {
    const { data } = await api.get('/v1/family/dashboard');
    return data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      'Failed to fetch your family adventures.';

    throw new Error(message);
  }
};