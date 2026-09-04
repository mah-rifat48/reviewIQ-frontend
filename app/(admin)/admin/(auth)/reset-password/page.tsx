"use client";

import React, { useState, useEffect } from "react";
import AuthLayout from "@/components/admin/auth/AuthLayout";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAdminResetPasswordMutation } from "@/redux/api/BE/admin/forgetPassApi";

const ResetPasswordPage = () => {
    const router = useRouter();
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    const [resetPassword, { isLoading }] = useAdminResetPasswordMutation();

    useEffect(() => {
        const email = sessionStorage.getItem("adminResetEmail");
        const otp = sessionStorage.getItem("adminResetOtp");
        
        if (!email || !otp) {
            toast.error("Session expired. Please restart the password reset process.");
            router.push("/admin/forget-password");
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newPassword || !confirmPassword) {
            toast.error("Please fill in all password fields.");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        const email = sessionStorage.getItem("adminResetEmail");
        const code = sessionStorage.getItem("adminResetOtp");

        if (!email || !code) {
            toast.error("Session missing. Please restart the password reset process.");
            router.push("/admin/forget-password");
            return;
        }

        try {
            await resetPassword({ email, code, newPassword }).unwrap();
            toast.success("Password reset successfully! Please log in.");
            
            sessionStorage.removeItem("adminResetEmail");
            sessionStorage.removeItem("adminResetOtp");
            
            router.push("/admin/signin");
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to reset password. Please check your OTP and try again.");
            console.error("Reset password error:", error);
        }
    };

    return (
        <AuthLayout
            title="Reset Password"
            subtitle="You are all set. Now it's time to create a new password."
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
                    <label className="block text-white text-sm mb-2 ml-1" htmlFor="new-password">
                        New Password
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white transition-colors">
                            <Lock className="size-5" />
                        </div>
                        <input
                            className="w-full bg-[#334155]/50 border border-white/5 rounded-xl py-4 pl-12 pr-12 !text-white placeholder-blue-300/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-[#334155]/80 transition-all text-sm"
                            id="new-password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            type={showNewPassword ? "text" : "password"}
                            placeholder="admin123"
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-blue-300/50 hover:text-blue-400 transition-colors cursor-pointer"
                        >
                            {showNewPassword ? (
                                <EyeOff size={20} />
                            ) : (
                                <Eye size={20} />
                            )}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-white text-sm mb-2 ml-1" htmlFor="confirm-password">
                        Confirm Password
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white transition-colors">
                            <Lock className="size-5" />
                        </div>
                        <input
                            className="w-full bg-[#334155]/50 border border-white/5 rounded-xl py-4 pl-12 pr-12 !text-white placeholder-blue-300/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-[#334155]/80 transition-all text-sm"
                            id="confirm-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="admin123"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-blue-300/50 hover:text-blue-400 transition-colors cursor-pointer"
                        >
                            {showConfirmPassword ? (
                                <EyeOff size={20} />
                            ) : (
                                <Eye size={20} />
                            )}
                        </button>
                    </div>
                </div>

                <button
                    className="w-full bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] hover:from-[#6d28d9] hover:to-[#4338ca] text-white font-semibold py-4 rounded-xl shadow-lg shadow-blue-900/40 transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
                    type="submit"
                    disabled={isLoading}
                >
                    {isLoading && <Loader2 className="size-5 animate-spin" />}
                    Reset
                </button>
            </form>
        </AuthLayout>
    );
};

export default ResetPasswordPage;
