import { baseApi } from "../../baseApi";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<any, {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: string;
      search?: string;
      role?: string;
      status?: string;
    }>({
      query: (params) => {
        const query = new URLSearchParams();
        if (params.page) query.append("page", params.page.toString());
        if (params.limit) query.append("limit", params.limit.toString());
        if (params.sortBy) query.append("sortBy", params.sortBy);
        if (params.sortOrder) query.append("sortOrder", params.sortOrder);
        if (params.search) query.append("search", params.search);
        if (params.role) query.append("role", params.role);
        if (params.status) query.append("status", params.status);

        return `/users?${query.toString()}`;
      },
      providesTags: ["User"],
    }),
    getUserStatistics: builder.query<any, void>({
      query: () => "/users/statistics",
      providesTags: ["User"],
    }),
    getUserById: builder.query<any, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: "User", id }],
    }),
    deleteUser: builder.mutation<any, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
    suspendUser: builder.mutation<any, { id: string; suspend: boolean }>({
      query: ({ id, suspend }) => ({
        url: `/users/${id}/suspend`,
        method: "PATCH",
        body: { suspend },
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserStatisticsQuery,
  useGetUserByIdQuery,
  useDeleteUserMutation,
  useSuspendUserMutation,
} = userApi;
