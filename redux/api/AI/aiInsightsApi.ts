import { baseApiAi } from "./baseApiAi";

export interface QuickInsights {
  what_customers_love: string;
  what_customers_dislike: string;
  emerging_opportunities: string;
}

export interface TrendData {
  trend: string;
  mentions: number;
}

export interface ActionableRecommendation {
  title: string;
  priority: "High" | "Medium" | "Low";
  description: string;
  evidence: string;
  business_impact: string;
  expected_improvement?: string;
  improvement?: string;
  actions?: string[];
  actions_to_do?: string[];
}

export interface BusinessPicture {
  photo_reference: string;
  photo_url: string;
  width: number;
  height: number;
  html_attributions: string[];
}

export interface AiInsightsResponse {
  business_health_score: number;
  quick_insights: QuickInsights;
  emerging_trends: TrendData[];
  declining_areas: TrendData[];
  actionable_recommendations: ActionableRecommendation[];
  business_picture: BusinessPicture;
  performance_by_category: {
    [category: string]: number;
  };
  business_goals: string[];
  rating?: number;
  count?: number;
}

export const aiInsightsApi = baseApiAi.injectEndpoints({
  endpoints: (builder) => ({
    getAiInsights: builder.query<
      AiInsightsResponse,
      { userId: string; businessName: string; address?: string }
    >({
      query: ({ userId, businessName, address }) => {
        let url = `/insights/recommendations?user_id=${userId}&business_name=${encodeURIComponent(businessName)}`;
        if (address) {
          url += `&address=${encodeURIComponent(address)}`;
        }
        return url;
      },
      providesTags: ["Goals"],
    }),
    updateRecommendationStatus: builder.mutation<
      any,
      { userId: string; title: string; status: "read" | "unread" | "addressed" }
    >({
      query: (body) => ({
        url: "/insights/actionable-recommendations/status",
        method: "PATCH",
        body: {
          user_id: body.userId,
          title: body.title,
          status: body.status,
        },
      }),
      invalidatesTags: ["Goals"],
    }),
    generateMoreRecommendations: builder.mutation<
      any,
      { userId: string; businessName: string; address?: string }
    >({
      query: ({ userId, businessName, address }) => {
        let url = `/insights/actionable-recommendations?user_id=${userId}&business_name=${encodeURIComponent(businessName)}`;
        if (address) {
          url += `&address=${encodeURIComponent(address)}`;
        }
        return {
          url,
          method: "GET",
        };
      },
      invalidatesTags: ["Goals"],
    }),
  }),
});

export const { 
  useGetAiInsightsQuery, 
  useUpdateRecommendationStatusMutation,
  useGenerateMoreRecommendationsMutation
} = aiInsightsApi;
