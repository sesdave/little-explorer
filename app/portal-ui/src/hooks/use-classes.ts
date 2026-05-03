import api from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useClasses = (sessionId: string) => {
  const queryClient = useQueryClient();
  const queryKey = ['sessions', sessionId, 'classes'];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await api.get(`/v1/sessions/${sessionId}/classes`);
      return res.data;
    },
    enabled: !!sessionId,
  });

  // ✅ Normalize shape (CRITICAL)
  const classes = Array.isArray(data?.classes) ? data.classes : [];

  // Optional but useful
  const sessionName = data?.sessionName ?? '';

  const { mutate: updateBulkClasses, isPending: isSaving } = useMutation({
    mutationFn: async (updatedClasses: any[]) => {
      const { data } = await api.patch(`/v1/admin/classes/bulk`, {
        classes: updatedClasses,
      });
      return data;
    },

    onMutate: async (newClasses) => {
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: any) => {
        const oldClasses = Array.isArray(old?.classes) ? old.classes : [];

        return {
          ...old,
          classes: oldClasses.map((c: any) => {
            const update = newClasses.find((u: any) => u.id === c.id);
            return update ? { ...c, ...update, isDirty: false } : c;
          }),
        };
      });

      return { previousData };
    },

    onError: (err, newClasses, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      toast.error('Failed to sync changes to the server.');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Inventory synced successfully!');
    },
  });

  return {
    classes,
    sessionName,
    isLoading,
    updateBulkClasses,
    isSaving,
  };
};