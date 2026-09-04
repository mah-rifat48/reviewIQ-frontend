import { baseApi } from "../../baseApi";

export const planSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStarterPlanSettings: builder.query<any, void>({
      query: () => "/plan-settings/starter",
      providesTags: ["PlanSettings" as const],
    }),
    updateStarterPlanSettings: builder.mutation<any, any>({
      query: (data) => ({
        url: "/plan-settings/starter",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["PlanSettings" as const],
    }),
    getProfessionalPlanSettings: builder.query<any, void>({
      query: () => "/plan-settings/professional",
      providesTags: ["PlanSettings" as const],
    }),
    updateProfessionalPlanSettings: builder.mutation<any, any>({
      query: (data) => ({
        url: "/plan-settings/professional",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["PlanSettings" as const],
    }),
  }),
});

export const {
  useGetStarterPlanSettingsQuery,
  useUpdateStarterPlanSettingsMutation,
  useGetProfessionalPlanSettingsQuery,
  useUpdateProfessionalPlanSettingsMutation,
} = planSettingsApi;
