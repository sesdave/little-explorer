// src/hooks/use-delete-dismissal-contact.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '@/services/api';
import { queryKeys } from '@/lib/queryKeys';

export const useDeleteDismissalContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(
        `/v1/dismissal-contacts/${id}`,
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.dismissalContacts,
      });
    },
  });
};