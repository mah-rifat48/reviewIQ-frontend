import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApiAi = createApi({
  reducerPath: "baseApiAi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL_AI,
  }),
  endpoints: () => ({}),
  tagTypes: ["Business", "Goals", "BusinessManagement"],
});
