import { baseApiAi } from "./baseApiAi";

export interface KPIData {
  value: number | null;
  change: number | null;
}

export interface ReportResponse {
  report_title: string;
  period: string;
  date_range: {
    start_date: string;
    end_date: string;
  };
  report_frequency: string;
  reviews_in_period: number;
  total_reviews_available: number;
  kpis: {
    avg_rating: KPIData;
    reviews: KPIData;
    satisfaction: KPIData;
    response_rate: KPIData;
  };
  executive_summary: string;
  review_volume_trend: { period: string; count: number }[];
  rating_trend: { period: string; rating: number }[];
  sentiment_breakdown: {
    positive: { percent: number; count: number };
    neutral: { percent: number; count: number };
    negative: { percent: number; count: number };
  };
  top_complaints: { issue?: string; complaint?: string; mentions?: number }[];
  top_praises: { strength?: string; praise?: string; mentions?: number }[];
  ai_recommendations: { title: string; description: string; estimated_impact: string }[];
  action_plan: string[];
  business_goals: string[];
  saved_report_frequency: string | null;
  count: number;
}

export const reportsApi = baseApiAi.injectEndpoints({
  endpoints: (builder) => ({
    getMonthlyReport: builder.query<
      ReportResponse,
      {
        user_id: string;
        business_name: string;
        report_frequency: "monthly" | "weekly";
        start_date: string;
        end_date: string;
        address: string;
      }
    >({
      query: (params) => ({
        url: "/reports/monthly",
        method: "GET",
        params,
      }),
      providesTags: ["Business"],
    }),
  }),
});

export const { useGetMonthlyReportQuery } = reportsApi;
