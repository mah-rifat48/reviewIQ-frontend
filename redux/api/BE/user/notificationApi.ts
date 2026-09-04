import { baseApi } from "../../baseApi";

export const notificationApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getNotificationSettings: builder.query<any, void>({
            query: () => ({
                url: "/users/notification-settings",
                method: "GET",
            }),
            providesTags: ["NotificationSettings"],
        }),
        updateNotificationSettings: builder.mutation<any, any>({
            query: (body) => ({
                url: "/users/notification-settings",
                method: "PATCH",
                body,
            }),
            invalidatesTags: ["NotificationSettings"],
        }),
    }),
});

export const {
    useGetNotificationSettingsQuery,
    useUpdateNotificationSettingsMutation,
} = notificationApi;
