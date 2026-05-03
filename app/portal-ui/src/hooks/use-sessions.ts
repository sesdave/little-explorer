import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api'; 
import { toast } from 'react-hot-toast';
import { SessionEntity, SessionStatus } from '@mle/types';

interface SessionClassesResponse {
  id: string;
  name: string;
  classes: {
    id: string;
    title: string;
    capacity?: number;
    _count?: {
      registrations: number;
    };
  }[];
}

export const useSessionClasses = (sessionId?: string) => {
  const { data, isLoading, ...rest } = useQuery({
    queryKey: ['session', sessionId, 'classes'],
    enabled: !!sessionId,
    queryFn: async () => {
      const { data } = await api.get(`/v1/sessions/${sessionId}/classes`);
      return data;
    },
  });

  const classes =
    data?.classes?.map((c: any) => ({
      ...c,
      title: c.name, // 👈 map backend → frontend
      isFull: c.capacity
        ? (c._count?.registrations ?? 0) >= c.capacity
        : false,
      spotsLeft: c.capacity
        ? Math.max(0, c.capacity - (c._count?.registrations ?? 0))
        : null,
    })) || [];

  return {
    classes,
    sessionName: '', // 👈 optional (you’re not returning it anymore)
    isLoading,
    ...rest,
  };
};
export const useSessions = () => {
  const queryClient = useQueryClient();
  const queryKey = ['sessions', 'list'];

  // 1. Fetching Logic
  // Explicitly typing useQuery ensures 'sessions' is SessionEntity[] | undefined
  const { data: sessions, isLoading, ...rest } = useQuery<SessionEntity[]>({
    queryKey,
    queryFn: async () => {
      const { data } = await api.get('/v1/sessions');
      return data;
    },
  });

  // 2. Computed Selector
  // Helps components find the active session without re-filtering
  const activeSession = sessions?.find(s => s.isActive);

  // 3. System Activation Mutation
  const { mutate: activateSession, isPending: isActivating } = useMutation({
    mutationFn: async (sessionId: string) => {
      const { data } = await api.post(`/v1/sessions/${sessionId}/activate`);
      return data;
    },

    // Staff Engineer Pattern: Optimistic UI
    // Update the local cache before the server responds so the switch feels instant
    onMutate: async (sessionId) => {
      // Stop outgoing refetches so they don't overwrite our optimistic state
      await queryClient.cancelQueries({ queryKey });

      // Save previous state for rollback on error
      const previousSessions = queryClient.getQueryData<SessionEntity[]>(queryKey);

      // Locally flip the isActive flag
      queryClient.setQueryData(queryKey, (old: SessionEntity[] | undefined) => {
        if (!old) return [];
        return old.map(s => ({
          ...s,
          isActive: s.id === sessionId,
          // If we activate it, we assume it moves to Registration status
          status: s.id === sessionId ? SessionStatus.REGISTRATION : s.status
        }));
      });

      return { previousSessions };
    },

    // Roll back to the previous state if the API call fails
    onError: (err, sessionId, context) => {
      if (context?.previousSessions) {
        queryClient.setQueryData(queryKey, context.previousSessions);
      }
      toast.error('Failed to activate session. Check server logs.');
    },

    // Always refetch after success or failure to ensure we match the DB
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('System scope updated successfully.');
    }
  });

  return {
    sessions,
    activeSession,
    isLoading,
    activateSession,
    isActivating,
    ...rest
  };
};