import { baseApiAi } from "./baseApiAi";

export const signupflowApi = baseApiAi.injectEndpoints({
  endpoints: (builder) => ({
    fetchBusinessData: builder.mutation<any, any>({
      query: (data) => ({
        url: "/businesses/fetch",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Business"],
    }),
    setGoals: builder.mutation<any, any>({
      query: (data) => ({
        url: "/goals_set_up_py",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Goals"],
    }),
  }),
});

export const { useFetchBusinessDataMutation, useSetGoalsMutation } = signupflowApi;
