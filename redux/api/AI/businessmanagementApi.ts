import { baseApiAi } from "./baseApiAi";

export const businessmanagementApi = baseApiAi.injectEndpoints({
    endpoints: (builder) => ({
        getBusinessManagement: builder.query<any, void>({
            query: () => ({
                url: "/businesses/management",
                method: "GET",
            }),
            providesTags: ["BusinessManagement"],
        }),
        getBusinessManagementDetail: builder.query<any, { business_name: string; overlook: string; user_id?: string }>({
            query: ({ business_name, overlook, user_id }) => ({
                url: "/businesses/management/detail",
                method: "GET",
                params: { business_name, overlook, user_id },
            }),
            providesTags: ["BusinessManagement"],
        }),
        updateBusinessStatus: builder.mutation<
            {
                user_id: string;
                business_name: string;
                action: "suspend" | "unsuspend";
                account_status: string;
                is_suspended: boolean;
                updated_count: number;
                count: number;
            },
            { action: "suspend" | "unsuspend"; business_name: string; user_id: string }
        >({
            query: (body) => ({
                url: "/businesses/management",
                method: "PATCH",
                body,
            }),
            invalidatesTags: ["BusinessManagement"],
        }),
        deleteUserBusinesses: builder.mutation<
            {
                user_id: string;
                deleted: {
                    user_businesses: number;
                    business_contexts: number;
                    actionable_recommendations: number;
                    route_hit_events: number;
                    route_hits: number;
                };
                deleted_count: number;
                count: number;
            },
            { user_id: string }
        >({
            query: ({ user_id }) => ({
                url: `/businesses/user/${user_id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["BusinessManagement"],
        }),
    }),
});

export const {
    useGetBusinessManagementQuery,
    useGetBusinessManagementDetailQuery,
    useUpdateBusinessStatusMutation,
    useDeleteUserBusinessesMutation,
} = businessmanagementApi;
