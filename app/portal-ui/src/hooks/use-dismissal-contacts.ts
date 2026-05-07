// apps/web/src/hooks/use-dismissal-contacts.ts

import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { queryKeys } from '@/lib/queryKeys';

export const useDismissalContacts = () => {
  return useQuery({
    queryKey: queryKeys.dismissalContacts,

    queryFn: async () => {
      const { data } = await api.get(
        '/v1/dismissal-contacts',
      );

      return data;
    },

    staleTime: 1000 * 60 * 5,
  });
};