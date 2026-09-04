import { baseApi } from "../../baseApi";

export const adminSupportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminSupportSummary: builder.query<any, void>({
      query: () => "/support-ticket/admin-summary",
      providesTags: (result) =>
        result?.data?.tickets
          ? [
              ...result.data.tickets.map(({ supportTicketId }: any) => ({
                type: "SupportTicket" as const,
                id: supportTicketId,
              })),
              { type: "SupportTicket" as const, id: "LIST" },
            ]
          : [{ type: "SupportTicket" as const, id: "LIST" }],
    }),
    getSupportTicketByIdAdmin: builder.query<any, string>({
      query: (id) => `/support-ticket/${id}`,
      providesTags: (_result, _error, id) => [{ type: "SupportTicket" as const, id }],
    }),
    updateSupportTicketAdmin: builder.mutation<any, { id: string; status: string; feedback?: string }>({
      query: ({ id, status, feedback }) => ({
        url: `/support-ticket/${id}`,
        method: "PATCH",
        body: { status, feedback },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "SupportTicket" as const, id },
        { type: "SupportTicket" as const, id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAdminSupportSummaryQuery,
  useGetSupportTicketByIdAdminQuery,
  useUpdateSupportTicketAdminMutation,
} = adminSupportApi;
