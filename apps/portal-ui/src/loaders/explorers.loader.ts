import api from "@/services/api";

// apps/web/src/pages/admin/explorers.loader.ts
export const explorersLoader = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  const page = url.searchParams.get("page") || "1";
  const search = url.searchParams.get("search") || "";

  const response = await api.get(`/v1/admin/explorers?page=${page}&search=${search}`);
  return response.data; // Returns { data: [...], meta: {...} }
};