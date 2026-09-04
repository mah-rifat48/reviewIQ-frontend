"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { useSearchParams } from "next/navigation";
import { useResetPasswordMutation } from "@/redux/api/BE/user/authApi";
import { toast } from "react-hot-toast";
import { Suspense } from "react";

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";
    const code = searchParams.get("code") || "";

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [resetPassword, { isLoading }] = useResetPasswordMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email || !code) {
            toast.error("Invalid reset request. Please start again from the Forgot Password page.");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long.");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        try {
            const res = await resetPassword({ email, code, newPassword }).unwrap();
            toast.success(res?.message || "Password reset successful! Please login.");
            router.push("/login");
        } catch (err: any) {
            console.error("Error resetting password:", err);
            toast.error(err?.data?.message || err?.message || "Failed to reset password. Please try again.");
        }
    };

    return (
        <div className="min-h-screen w-full relative content-center flex items-center justify-center overflow-hidden bg-[#E0F2FE]">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/forgot-bg.png"
                    alt="Background"
                    fill
                    className="object-cover"
                    priority
                    quality={100}
                />
            </div>

            {/* Brand Logo (Top Left) */}
            <div className="hidden md:flex absolute top-8 left-8 z-10 items-center gap-2">
                <Image src="/auth_icon.svg" alt="Logo" width={207} height={60} />
            </div>

            {/* Reset Password Card */}
            <div className="relative z-10 w-[calc(100%-2rem)] max-w-[600px] user-auth-bg rounded-3xl p-6 sm:p-10 md:p-12 border border-white/50 space-y-6 sm:space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl sm:text-[32px] font-bold text-[#1A1A1A]">Reset Password</h1>
                    <p className="text-zinc-500 text-sm sm:text-[15px] leading-relaxed">
                        You are all set.
                        <br />
                        Now it's time to create a new password.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* New Password */}
                    <div className="space-y-2">
                        <label className="text-[15px] font-medium text-zinc-700 block">New Password:</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Type your password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-slate-50/50 h-12 rounded-xl px-4 pr-12 text-[15px] border border-zinc-200 focus:border-auth-subtitle-color focus:ring focus:ring-auth-subtitle-color outline-none transition-all placeholder:text-zinc-400"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} className="text-cyan-300 cursor-pointer" /> : <Eye size={20} className="text-cyan-300 cursor-pointer" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <label className="text-[15px] font-medium text-zinc-700 block">Confirm Password:</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Type your password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-slate-50/50 h-12 rounded-xl px-4 pr-12 text-[15px] border border-zinc-200 focus:border-auth-subtitle-color focus:ring focus:ring-auth-subtitle-color outline-none transition-all placeholder:text-zinc-400"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff size={20} className="text-cyan-300 cursor-pointer"/> : <Eye size={20} className="text-cyan-300 cursor-pointer" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="cursor-pointer w-full h-12 bg-auth-subtitle-color text-white rounded-xl font-bold text-[15px] hover:bg-cyan-300 transition-all shadow-lg shadow-blue-200 mt-4 disabled:opacity-50"
                    >
                        <span>{isLoading ? "Resetting..." : "Reset"}</span>
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen w-full flex items-center justify-center bg-[#E0F2FE]">Loading...</div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}