import api from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';


export const useBroadcast = (target: string, classId?: string) => {
  const queryClient = useQueryClient();

  // 1. Fetch classes for the dropdown
  const { data: classes = [], isLoading: isLoadingClasses } = useQuery({
    queryKey: ['admin', 'classes', 'list'],
    queryFn: async () => {
      const { data } = await api.get('/admin/classes'); // Adjust if this path differs
      return data;
    }
  });

  // 2. Fetch the recipient count (Preview)
  const { data: previewData, isFetching: isCountLoading } = useQuery({
    queryKey: ['admin', 'broadcast', 'preview', target, classId],
    queryFn: async () => {
      const { data } = await api.get('/admin/broadcast/preview', {
        params: { target, classId }
      });
      return data; // returns { count: number }
    },
    enabled: !!target, // Only run if a target is selected
    placeholderData: (previousData) => previousData, 
  });

  // 3. Fetch Broadcast History (The Audit Log)
  const { data: history = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ['admin', 'broadcast', 'history'],
    queryFn: async () => {
      const { data } = await api.get('/admin/broadcast/history');
      return data;
    }
  });

  // 4. Send Mutation
  const { mutateAsync: sendBroadcast, isPending: isSending } = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post('/admin/broadcast/send', payload);
      return data;
    },
    onSuccess: () => {
      // Refresh the history list automatically after sending
      queryClient.invalidateQueries({ queryKey: ['admin', 'broadcast', 'history'] });
    }
  });

  return {
    classes,
    recipientCount: previewData?.count ?? 0,
    history,
    isCountLoading,
    isLoadingClasses,
    isLoadingHistory,
    sendBroadcast,
    isSending
  };
};