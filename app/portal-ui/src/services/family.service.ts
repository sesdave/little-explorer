import { Child } from '@mle/types';
import { useAuthStore } from '@/store/auth.store';

// Matches your simplified Prisma schema (name vs firstName/lastName)
interface FamilyDashboardResponse {
  parentName: string;
  isEmailVerified: boolean;
  children: Child[];
}

export const getFamilyDashboardData = async (): Promise<FamilyDashboardResponse> => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  
  // Get the token directly from your Zustand store
  const token = useAuthStore.getState().token;
  console.log("Sending token:", token);

  const response = await fetch(`${API_URL}/api/v1/family/dashboard`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
  });
  console.log('response entered', response)
  if (!response.ok) {
    // If the token is expired or invalid, the backend will return a 401
    if (response.status === 401) {
       // Optional: you could trigger a logout here
       throw new Error('Your session has expired. Please log in again.');
    }
    throw new Error('Failed to fetch your family adventures.');
  }

  return response.json();
};