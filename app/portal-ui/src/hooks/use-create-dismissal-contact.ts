// src/hooks/use-create-dismissal-contact.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '@/services/api';
import { queryKeys } from '@/lib/queryKeys';

export const useCreateDismissalContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post(
        '/v1/dismissal-contacts',
        payload,
      );

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.dismissalContacts,
      });
    },
  });
};