import { baseApiAi } from "./baseApiAi";

export interface CompetitorCardData {
  name: string;
  rating: number;
  reviews: number;
  sentiment: number;
  response_rate: number;
  criteria: {
    service: number;
    quality: number;
    atmosphere: number;
    value: number;
    cleanliness: number;
  };
  isBusiness?: boolean;
  map_url?: string;
}

export interface PerformanceComparison {
  rating: { name: string; value: number }[];
  reviews: { name: string; value: number }[];
  sentiment: { name: string; value: number }[];
  response_rate: { name: string; value: number }[];
}

export interface CategoryRadar {
  [businessName: string]: {
    Service: number;
    Quality: number;
    Atmosphere: number;
    Value: number;
    Cleanliness: number;
  };
}

export interface CriteriaComparisonData {
  criteria: string;
  my_score: number;
  competitor_avg: number;
  leader: {
    name: string;
    score: number;
  };
}

export interface WhereCompetitorsExcelData {
  title: string;
  description: string;
  opportunity: string;
  evidence_id: string;
  leader: string;
  metric: string;
  competitor_value: number;
  my_value: number;
  gap: number;
  relationship: string;
}

export interface CompetitiveAdvantageData {
  title: string;
  description: string;
  strength: string;
  my_score: number;
  competitor_avg: number;
}

export interface StrategicRecommendationData {
  title: string;
  description: string;
}

export interface CompetitorAnalysisResponse {
  business_goals: string[];
  report_frequency: string | null;
  cards: CompetitorCardData[];
  performance_comparison: PerformanceComparison;
  category_radar: CategoryRadar;
  criteria_comparison: CriteriaComparisonData[];
  where_competitors_excel: WhereCompetitorsExcelData[];
  competitive_advantages: CompetitiveAdvantageData[];
  strategic_recommendations: StrategicRecommendationData[];
}

export const competitorsApi = baseApiAi.injectEndpoints({
  endpoints: (builder) => ({
    getCompetitorAnalysis: builder.query<
      CompetitorAnalysisResponse,
      { userId: string; businessName: string; address?: string }
    >({
      query: ({ userId, businessName, address }) => {
        let url = `/competitors/analysis?user_id=${userId}&business_name=${encodeURIComponent(businessName)}`;
        if (address) {
          url += `&address=${encodeURIComponent(address)}`;
        }
        return url;
      },
      providesTags: ["Goals"],
    }),
  }),
});

export const { useGetCompetitorAnalysisQuery } = competitorsApi;
