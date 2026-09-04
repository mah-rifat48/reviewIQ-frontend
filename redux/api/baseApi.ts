import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
  prepareHeaders: (headers) => {
    const token = Cookies.get("accessToken");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  // Check if it's an auth-related request (login, refresh, etc.)
  const url = typeof args === "string" ? args : args.url;
  const isAuthRequest = url?.includes("/auth/login") || url?.includes("/auth/refresh") || url?.includes("/auth/change-password");

  if (result.error && result.error.status === 401 && !isAuthRequest) {
    // try to get a new token
    const refreshToken = Cookies.get("refreshToken");
    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: "/auth/refresh",
          method: "POST",
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const { accessToken, refreshToken: newRefreshToken } = (refreshResult.data as any).data;
        Cookies.set("accessToken", accessToken, { path: "/" });
        Cookies.set("refreshToken", newRefreshToken, { path: "/" });

        // retry the initial query
        result = await baseQuery(args, api, extraOptions);
      } else {
        // refresh failed, logout
        Cookies.remove("accessToken", { path: "/" });
        Cookies.remove("refreshToken", { path: "/" });
        
        if (typeof window !== "undefined") {
          const isAdmin = window.location.pathname.startsWith("/admin");
          window.location.href = isAdmin ? "/admin/signin" : "/login";
        }
      }
    } else {
      // no refresh token, logout
      Cookies.remove("accessToken", { path: "/" });
      Cookies.remove("refreshToken", { path: "/" });
      
      if (typeof window !== "undefined") {
        const isAdmin = window.location.pathname.startsWith("/admin");
        window.location.href = isAdmin ? "/admin/signin" : "/login";
      }
    }
  }
  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
  tagTypes: ["User", "SupportTicket", "AdminDashboard", "ActivityLog", "Subscription", "SystemSettings", "Review", "NotificationSettings", "PlanSettings"] as const,
});
