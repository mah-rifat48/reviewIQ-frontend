import { baseApiAi } from "./baseApiAi";

export const businessSettingsApi = baseApiAi.injectEndpoints({
  endpoints: (builder) => ({
    getBusinessProfile: builder.query<any, { user_id: string; business_name: string; location: string }>({
      query: (params) => ({
        url: "/business-profile",
        method: "GET",
        params,
      }),
      providesTags: ["Business"],
    }),
    updateBusinessProfile: builder.mutation<any, {
      user_id: string;
      existing_business_name: string;
      existing_location: string;
      new_business_name?: string;
      category?: string;
      new_location?: string;
      map_url?: string;
      phone_no?: string;
      website?: string;
    }>({
      query: (params) => ({
        url: "/business-profile",
        method: "PATCH",
        params,
      }),
      invalidatesTags: ["Business"],
    }),
  }),
});

export const {
  useGetBusinessProfileQuery,
  useUpdateBusinessProfileMutation,
} = businessSettingsApi;
