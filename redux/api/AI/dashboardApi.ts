import { baseApiAi } from "./baseApiAi";

export interface GrowthData {
  value: number;
  display: string;
  unit: string;
  direction: "up" | "down" | "flat";
  label: string;
  percent_change: number | null;
  percent_display: string | null;
}

export interface DashboardOverviewResponse {
  overview: {
    overall_rating: number;
    review_volume: number;
    response_rate: number;
    satisfaction_index: number;
    growth: {
      overall_rating: GrowthData;
      satisfaction_index: GrowthData;
      review_volume: GrowthData;
    };
    key_strengths: { strength: string; mentions: number }[];
    key_issues: { issue: string; mentions: number }[];
  };
  sentiment_trend: { period: string; positive: number; neutral: number; negative: number }[];
  performance_criteria: {
    Service: number;
    Quality: number;
    Value: number;
    Cleanliness: number;
    Atmosphere: number;
  };
  performance_criteria_with_growth: {
    Service: { score: number; growth: GrowthData };
    Quality: { score: number; growth: GrowthData };
    Cleanliness: { score: number; growth: GrowthData };
    Atmosphere: { score: number; growth: GrowthData };
    Value: { score: number; growth: GrowthData };
  };
  count: number;
}

export const dashboardApi = baseApiAi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardOverview: builder.query<DashboardOverviewResponse, { user_id: string; business_name: string; address: string }>({
      query: (params) => ({
        url: "/dashboard/overview",
        method: "GET",
        params,
      }),
      providesTags: ["Business"],
    }),
  }),
});

export const { useGetDashboardOverviewQuery } = dashboardApi;
