// src/hooks/use-update-dismissal-contact.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '@/services/api';
import { queryKeys } from '@/lib/queryKeys';

export const useUpdateDismissalContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: any) => {
      const { data } = await api.patch(
        `/v1/dismissal-contacts/${id}`,
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