import { baseApi } from "../../baseApi";

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyBilling: builder.query<any, void>({
      query: () => "/subscription/my-billing",
      providesTags: ["Subscription"],
    }),
  }),
});

export const { useGetMyBillingQuery } = settingsApi;
