// src/hooks/useAssignedClasses.ts

import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

export const useAssignedClasses =
  () => {
    return useQuery({
      queryKey: ['assigned-classes'],

      queryFn: async () => {
        const { data } =
          await api.get(
            '/v1/family/classes',
          );

        return data;
      },
    });
  };