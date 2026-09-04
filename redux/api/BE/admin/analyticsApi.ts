import { baseApi } from "../../baseApi";

export const adminAnalyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStatistics: builder.query<any, void>({
      query: () => "/dashboard/statistics",
      providesTags: ["AdminDashboard"] as any,
    }),
    getDashboardCharts: builder.query<any, void>({
      query: () => "/dashboard/charts",
      providesTags: ["AdminDashboard"] as any,
    }),
    getConversionFunnel: builder.query<any, void>({
      query: () => "/dashboard/conversion-funnel",
      providesTags: ["AdminDashboard"] as any,
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetDashboardStatisticsQuery,
  useGetDashboardChartsQuery,
  useGetConversionFunnelQuery,
} = adminAnalyticsApi;
