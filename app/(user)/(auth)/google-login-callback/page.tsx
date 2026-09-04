"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGoogleLoginCallbackQuery } from "@/redux/api/BE/user/authApi";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";

function CallbackHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryStr = "?" + searchParams.toString();
    
    // We only trigger the query if there is a 'code' in the URL from Google
    const hasCode = searchParams.get("code");
    
    const { data, isSuccess, isError, error, isLoading } = useGoogleLoginCallbackQuery(queryStr, {
        skip: !hasCode
    });

    useEffect(() => {
        if (isSuccess && data) {
            Cookies.set("accessToken", data.data.accessToken, { expires: 7, path: "/" });
            Cookies.set("refreshToken", data.data.refreshToken, { expires: 30, path: "/" });
            
            if (data.data.subscription) {
                const encodedSub = btoa(JSON.stringify(data.data.subscription));
                Cookies.set("subscription", encodedSub, { expires: 7, path: '/' });
            }
            
            toast.success("Successfully logged in with Google!");
            router.push("/dashboard");
        }

        if (isError) {
            console.error("Google login failed:", error);
            const errorMsg = (error as any)?.data?.message || "Google login failed. Please try again.";
            toast.error(errorMsg);
            router.push("/login");
        }
    }, [isSuccess, isError, data, error, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#E0F2FE]">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF] mx-auto mb-4"></div>
                <p className="text-zinc-600 font-medium">Authenticating with Google...</p>
            </div>
        </div>
    );
}

export default function GoogleLoginCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#E0F2FE]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF] mx-auto mb-4"></div>
                </div>
            </div>
        }>
            <CallbackHandler />
        </Suspense>
    );
}
