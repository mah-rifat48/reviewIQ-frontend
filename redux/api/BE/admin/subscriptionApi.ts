import { baseApi } from "../../baseApi";

export const adminSubscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllSubscriptions: builder.query<any, {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: string;
      search?: string;
      plan?: string;
      paymentStatus?: string;
      durationsPlan?: string;
    }>({
      query: (params) => {
        const query = new URLSearchParams();
        if (params.page) query.append("page", params.page.toString());
        if (params.limit) query.append("limit", params.limit.toString());
        if (params.sortBy) query.append("sortBy", params.sortBy);
        if (params.sortOrder) query.append("sortOrder", params.sortOrder);
        if (params.search) query.append("search", params.search);
        if (params.plan) query.append("plan", params.plan);
        if (params.paymentStatus) query.append("paymentStatus", params.paymentStatus);
        if (params.durationsPlan) query.append("durationsPlan", params.durationsPlan);

        return `/subscription?${query.toString()}`;
      },
      providesTags: ["Subscription"] as any, // Add Subscription tag if not in baseApi, or reuse existing
    }),
    getSubscriptionStatistics: builder.query<any, void>({
      query: () => "/subscription/statistics",
      providesTags: ["Subscription"] as any,
    }),
    getSubscriptionById: builder.query<any, string>({
      query: (id) => `/subscription/${id}`,
      providesTags: ["Subscription"] as any,
    }),
  }),
});

export const {
  useGetAllSubscriptionsQuery,
  useGetSubscriptionStatisticsQuery,
  useGetSubscriptionByIdQuery,
} = adminSubscriptionApi;
