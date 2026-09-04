"use client";

import React, { useState } from "react";
import AuthLayout from "@/components/admin/auth/AuthLayout";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserCircle, Loader2 } from "lucide-react";
import { useAdminForgotPasswordMutation } from "@/redux/api/BE/admin/forgetPassApi";
import { toast } from "react-hot-toast";

const ForgetPasswordPage = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [forgotPassword, { isLoading }] = useAdminForgotPasswordMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email) {
            toast.error("Please enter your email address");
            return;
        }

        try {
            await forgotPassword({ email }).unwrap();
            toast.success("OTP sent to your email!");
            sessionStorage.setItem("adminResetEmail", email);
            router.push("/admin/verify-otp");
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to send OTP. Please try again.");
            console.error("Forgot password error:", error);
        }
    };

    return (
        <AuthLayout
            title="Forgot Password!"
            subtitle="Do you forgot your password. It's ease to reset, just provide your email address. We'll send you a OTP code."
            icon={
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    <path d="M12 15v3"></path>
                    <path d="M10 16h4"></path>
                </svg>
            }
        >
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-white text-sm mb-2 ml-1" htmlFor="email">
                        Email
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white transition-colors">
                            <UserCircle className="size-5" />
                        </div>
                        <input
                            className="w-full bg-[#334155]/50 border border-white/5 rounded-xl py-4 pl-12 pr-4 !text-white placeholder-blue-300/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-[#334155]/80 transition-all text-sm"
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@reviewiq.com"
                        />
                    </div>
                </div>

                <div className="flex gap-4">
                    <Link
                        href="/admin/signin"
                        className="flex-1 border border-white/20 text-white font-semibold py-4 rounded-xl hover:bg-white/5 transition-all text-center flex items-center justify-center cursor-pointer"
                    >
                        Cancel
                    </Link>
                    <button
                        className="flex-[1.5] bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] hover:from-[#6d28d9] hover:to-[#4338ca] text-white font-semibold py-4 rounded-xl shadow-lg shadow-blue-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading && <Loader2 className="size-5 animate-spin" />}
                        Send OTP
                    </button>
                </div>
            </form>
        </AuthLayout>
    );
};

export default ForgetPasswordPage;
