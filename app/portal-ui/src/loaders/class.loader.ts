import api from "@/services/api";

// apps/web/src/pages/admin/explorers.loader.ts
export const classLoader = async () => {

  const response = await api.get(`/v1/admin/classes/assignments`);
  return response.data; 
};