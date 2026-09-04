import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const getAiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_BASE_URL_AI || process.env.NEXT_PUBLIC_AI_API_URL;
  if (envUrl && envUrl !== 'undefined' && envUrl !== 'null' && envUrl.trim() !== '') {
    return envUrl;
  }
  return "/api/ai";
};

export const baseApiAi = createApi({
  reducerPath: "baseApiAi",
  baseQuery: fetchBaseQuery({
    baseUrl: getAiBaseUrl(),
  }),
  endpoints: () => ({}),
  tagTypes: ["Business", "Goals", "BusinessManagement"],
});
