import { baseApi } from "../../baseApi";

export const adminProfileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminProfile: builder.query<any, void>({
      query: () => "/admin/profile",
      providesTags: ["User"],
    }),
    updateAdminProfile: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: "/admin/profile",
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),
    registerAdmin: builder.mutation<any, any>({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    getAllAdmins: builder.query<any, any>({
      query: (params) => ({
        url: "/admin",
        method: "GET",
        params,
      }),
      providesTags: ["User"],
    }),
    getAdminById: builder.query<any, string>({
      query: (id) => `/admin/${id}`,
      providesTags: ["User"],
    }),
    deleteAdmin: builder.mutation<any, string>({
      query: (id) => ({
        url: `/admin/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAdminProfileQuery,
  useUpdateAdminProfileMutation,
  useRegisterAdminMutation,
  useGetAllAdminsQuery,
  useGetAdminByIdQuery,
  useDeleteAdminMutation,
} = adminProfileApi;
