import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';

export const useToggleClassVisibility = (
  sessionId: string,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      isClassVisible: boolean,
    ) => {
      const { data } = await api.patch(
        `/v1/sessions/${sessionId}/class-visibility`,
        {
          isClassVisible,
        },
      );

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin-classes'],
      });
    },
  });
};