import { baseApi } from "../../baseApi";

export const enterpriseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createEnterpriseSubscription: builder.mutation<any, {
      plan: "ENTERPRISE";
      userId: string;
      review: string;
      location: string;
      balance: number;
      business: number;
      reportPlan: ("MONTHLY" | "WEEKLY")[];
      competitor: boolean;
      durationDate: string;
      durationsPlan: "MONTHLY";
    }>({
      query: (data) => ({
        url: "/subscription",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User", "Subscription"] as any,
    }),
  }),
});

export const { useCreateEnterpriseSubscriptionMutation } = enterpriseApi;
