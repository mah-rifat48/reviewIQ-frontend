import { baseApi } from "../../baseApi";

export const planApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createSubscription: builder.mutation<any, any>({
      query: (data) => ({
        url: "/subscription",
        method: "POST",
        body: data,
      }),
    }),
    getSubscriptionById: builder.query<any, string>({
      query: (id) => ({
        url: `/subscription/${id}`,
        method: "GET",
      }),
    }),
  }),
});

export const { useCreateSubscriptionMutation, useGetSubscriptionByIdQuery, useLazyGetSubscriptionByIdQuery } = planApi;
