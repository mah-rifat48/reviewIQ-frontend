import { baseApiAi } from "./baseApiAi";

export const nameFatchingApi = baseApiAi.injectEndpoints({
  endpoints: (builder) => ({
    getBusinessNames: builder.query<{ user_id: string; business_names: string[] }, string>({
      query: (userId) => `/businesses/names?user_id=${userId}`,
      providesTags: ["Business"],
    }),
    getBusinessLocations: builder.query<{ user_id: string; business_name: string; locations: any[] }, { userId: string; businessName: string }>({
      query: ({ userId, businessName }) => `/businesses/locations?user_id=${userId}&business_name=${encodeURIComponent(businessName)}`,
      providesTags: ["Business"],
    }),
  }),
});

export const { useGetBusinessNamesQuery, useGetBusinessLocationsQuery } = nameFatchingApi;
