"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useForgotPasswordMutation } from "@/redux/api/BE/user/authApi";
import { toast } from "react-hot-toast";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = React.useState("");
    const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await forgotPassword({ email }).unwrap();
            toast.success(res?.message || "Password reset code sent to your email");
            router.push(`/verify-code?email=${encodeURIComponent(email)}`);
        } catch (err: any) {
            console.error("Error requesting reset code:", err);
            const errorMessage = err?.data?.message || err?.message || "Something went wrong. Please try again.";
            toast.error(errorMessage);
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

            {/* Forgot Password Card */}
            <div className="relative z-10 w-[calc(100%-2rem)] max-w-[600px] user-auth-bg rounded-3xl p-6 sm:p-10 md:p-12 border border-white/50 space-y-6 sm:space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl sm:text-[32px] font-bold text-[#1A1A1A]">Forgot Password!</h1>
                    <p className="text-zinc-500 text-sm sm:text-[15px] max-w-[400px] mx-auto leading-relaxed">
                        Do you forgot your password. It's ease to reset, just provide your email
                        address. We'll send you a OTP code.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2">
                        <label className="text-[15px] font-medium text-zinc-700 block">E-mail:</label>
                        <input
                            type="email"
                            placeholder="e.g. example@email.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-50/50 h-12 rounded-xl px-4 text-[15px] border border-zinc-200 focus:border-auth-subtitle-color focus:ring focus:ring-auth-subtitle-color outline-none transition-all placeholder:text-zinc-400"
                        />
                    </div>
 
                    <div className="grid grid-cols-2 gap-4">
                        <Link
                            href="/login"
                            className="w-full h-12 bg-white text-auth-subtitle-color rounded-xl font-bold text-[15px] hover:bg-cyan-50 transition-all flex items-center justify-center"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="cursor-pointer w-full h-12 bg-auth-subtitle-color hover:bg-cyan-300 text-white rounded-xl font-bold text-[15px] transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
                        >
                            <span>{isLoading ? "Sending..." : "Send OTP"}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}