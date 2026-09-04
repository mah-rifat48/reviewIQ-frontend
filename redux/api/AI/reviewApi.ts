import { baseApiAi } from "./baseApiAi";

export interface Review {
  author: string;
  rating: number;
  date: string;
  text: string;
  sentiment: string;
  emotions: string[];
  strengths: string[];
}

export interface ReviewAnalysisResponse {
  stats: {
    total_reviews: number;
    avg_ratings: number;
    Positive_sentiments: number;
    negetive_sentiments: number;
  };
  reviews: Review[];
}

export const reviewApi = baseApiAi.injectEndpoints({
  endpoints: (builder) => ({
    getReviewAnalysis: builder.query<ReviewAnalysisResponse, { userId: string; businessName: string; address: string }>({
      query: ({ userId, businessName, address }) =>
        `/reviews/analysis?user_id=${userId}&business_name=${encodeURIComponent(businessName)}&address=${encodeURIComponent(address)}`,
      providesTags: ["Business"],
    }),
  }),
});

export const { useGetReviewAnalysisQuery } = reviewApi;
