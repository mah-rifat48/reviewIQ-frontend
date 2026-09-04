import { baseApi } from "../../baseApi";

export const adminForgetPassApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        adminForgotPassword: builder.mutation<any, { email: string }>({
            query: (body) => ({
                url: "/admin/forgot-password",
                method: "POST",
                body,
            }),
        }),
        adminResetPassword: builder.mutation<any, { email: string; code: string; newPassword: string }>({
            query: (body) => ({
                url: "/admin/reset-password",
                method: "POST",
                body,
            }),
        }),
    }),
});

export const {
    useAdminForgotPasswordMutation,
    useAdminResetPasswordMutation,
} = adminForgetPassApi;
