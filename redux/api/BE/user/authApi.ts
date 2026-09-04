import { baseApi } from "../../baseApi";

export interface Subscription {
  subscriptionId: string;
  plan: string;
  review: string;
  location: string;
  business: string;
  balance: number;
  durationsPlan: string;
  durationDate: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  paymentStatus: string;
  stripeSessionId: string | null;
  competitor: boolean;
  reportPlan: any[];
}

export interface AuthResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    subscription: Subscription;
  };
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, any>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    refresh: builder.mutation<any, any>({
      query: (body) => ({
        url: "/auth/refresh",
        method: "POST",
        body,
      }),
    }),
    register: builder.mutation<AuthResponse, any>({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: data,
      }),
    }),
    initiateGoogleRegister: builder.query<{ success: boolean; data: string }, void>({
      query: () => ({
        url: "/auth/google/register",
        method: "GET",
      }),
    }),
    initiateGoogleLogin: builder.query<{ success: boolean; data: string }, void>({
      query: () => ({
        url: "/auth/google/login",
        method: "GET",
      }),
    }),
    googleLoginCallback: builder.query<AuthResponse, string>({
      query: (queryStr) => ({
        url: `/auth/google/login/callback${queryStr}`,
        method: "GET",
      }),
    }),
    getMe: builder.query<any, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
    }),
    forgotPassword: builder.mutation<any, { email: string }>({
      query: (body) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),
    resetPassword: builder.mutation<any, { email: string; code: string; newPassword: string }>({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { 
  useLoginMutation, 
  useRefreshMutation, 
  useRegisterMutation,
  useInitiateGoogleRegisterQuery,
  useInitiateGoogleLoginQuery,
  useGoogleLoginCallbackQuery,
  useGetMeQuery,
  useLazyGetMeQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
