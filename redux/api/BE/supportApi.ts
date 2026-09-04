import { baseApi } from "../baseApi";

export const supportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createSupportTicket: builder.mutation<any, any>({
      query: (data) => ({
        url: "/support-ticket",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "SupportTicket" as const, id: "LIST" }],
    }),
    getAllSupportTickets: builder.query<any, any>({
      query: (params) => ({
        url: "/support-ticket",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ supportTicketId }: any) => ({
                type: "SupportTicket" as const,
                id: supportTicketId,
              })),
              { type: "SupportTicket" as const, id: "LIST" },
            ]
          : [{ type: "SupportTicket" as const, id: "LIST" }],
    }),
    getMySupportTickets: builder.query<any, void>({
      query: () => ({
        url: "/support-ticket/my-tickets",
        method: "GET",
      }),
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
    getSupportTicketById: builder.query<any, string>({
      query: (id) => ({
        url: `/support-ticket/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "SupportTicket" as const, id }],
    }),
    updateSupportTicket: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/support-ticket/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "SupportTicket" as const, id },
        { type: "SupportTicket" as const, id: "LIST" },
      ],
    }),
    deleteSupportTicket: builder.mutation<any, string>({
      query: (id) => ({
        url: `/support-ticket/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: () => [{ type: "SupportTicket" as const, id: "LIST" }],
    }),
  }),
});

export const {
  useCreateSupportTicketMutation,
  useGetAllSupportTicketsQuery,
  useGetMySupportTicketsQuery,
  useGetSupportTicketByIdQuery,
  useUpdateSupportTicketMutation,
  useDeleteSupportTicketMutation,
} = supportApi;
