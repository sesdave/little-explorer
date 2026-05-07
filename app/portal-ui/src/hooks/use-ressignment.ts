import { useEffect, useState } from "react";
import api from "@/services/api";

export const useReassignmentOptions = (childId: string | null) => {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!childId) return;

    const fetchOptions = async () => {
      setLoading(true);

      try {
        const res = await api.get(
          `/v1/admin/classes/reassign/options/${childId}`
        );

        setClasses(res.data);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [childId]);

  return { classes, loading };
};