import { baseApi } from "../../baseApi";

export const adminDashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStatistics: builder.query<any, void>({
      query: () => "/dashboard/statistics",
      providesTags: ["AdminDashboard"],
    }),
    getDashboardCharts: builder.query<any, void>({
      query: () => "/dashboard/charts",
      providesTags: ["AdminDashboard"],
    }),
    getActivityLogs: builder.query<any, any>({
      query: (params) => ({
        url: "/activity-log",
        method: "GET",
        params,
      }),
      providesTags: ["ActivityLog"],
    }),
    getActivityLogById: builder.query<any, string>({
      query: (id) => `/activity-log/${id}`,
      providesTags: ["ActivityLog"],
    }),
  }),
});

export const {
  useGetDashboardStatisticsQuery,
  useGetDashboardChartsQuery,
  useGetActivityLogsQuery,
  useGetActivityLogByIdQuery,
} = adminDashboardApi;
