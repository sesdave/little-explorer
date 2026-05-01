import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api'; // Your Axios instance
import { toast } from 'react-hot-toast';

export const useClasses = (sessionId: string) => {
  const queryClient = useQueryClient();
  const queryKey = ['sessions', sessionId, 'classes'];

  // 1. Fetching Logic
  const { data: classes, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await api.get(`/v1/sessions/${sessionId}/classes`);
      return data;
    },
    enabled: !!sessionId, // Only fetch if we have an ID
  });

  // 2. Bulk Update Mutation (Optimistic)
  const { mutate: updateBulkClasses, isPending: isSaving } = useMutation({
    mutationFn: async (updatedClasses: any[]) => {
      const { data } = await api.patch(`/v1/admin/classes/bulk`, {
        classes: updatedClasses,
      });
      return data;
    },
    
    // Principal Level Optimization: Optimistic Update
    onMutate: async (newClasses) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousClasses = queryClient.getQueryData(queryKey);

      // Optimistically update to the new value
      queryClient.setQueryData(queryKey, (old: any) => {
        // Merge the updates into the existing list
        return old.map((c: any) => {
          const update = newClasses.find((u: any) => u.id === c.id);
          return update ? { ...c, ...update, isDirty: false } : c;
        });
      });

      return { previousClasses };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, newClasses, context) => {
      queryClient.setQueryData(queryKey, context?.previousClasses);
      toast.error('Failed to sync changes to the server.');
    },

    // Always refetch after error or success to ensure we are in sync with DB
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Inventory synced successfully!');
    },
  });

  return {
    classes,
    isLoading,
    updateBulkClasses,
    isSaving,
  };
};