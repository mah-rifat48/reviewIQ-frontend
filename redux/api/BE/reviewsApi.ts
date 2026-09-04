import { baseApi } from "../baseApi";

export const reviewsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getReviews: builder.query<any, { page?: number; limit?: number; sortOrder?: string; sortBy?: string; rating?: number }>({
            query: (params) => ({
                url: "/reviews",
                method: "GET",
                params,
            }),
            providesTags: ["Review" as any],
        }),
        getReviewById: builder.query<any, string>({
            query: (id) => ({
                url: `/reviews/${id}`,
                method: "GET",
            }),
            providesTags: (_result, _error, id) => [{ type: "Review" as any, id }],
        }),
        createReview: builder.mutation<any, { content: string; rating: number; designation?: string; company?: string }>({
            query: (body) => ({
                url: "/reviews",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Review" as any],
        }),
        updateReview: builder.mutation<any, { id: string; data: { content?: string; rating?: number; designation?: string; company?: string } }>({
            query: ({ id, data }) => ({
                url: `/reviews/${id}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Review" as any],
        }),
    }),
});

export const {
    useGetReviewsQuery,
    useGetReviewByIdQuery,
    useCreateReviewMutation,
    useUpdateReviewMutation,
} = reviewsApi;
