import { baseApi } from "../../baseApi";

export const adminSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSystemSettings: builder.query<any, void>({
      query: () => "/system",
      providesTags: ["SystemSettings"],
    }),
    updateSystemSettings: builder.mutation<any, any>({
      query: (data) => ({
        url: "/system",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["SystemSettings"],
    }),
  }),
});

export const {
  useGetSystemSettingsQuery,
  useUpdateSystemSettingsMutation,
} = adminSettingsApi;
