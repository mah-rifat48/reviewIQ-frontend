"use client";

import React, { useState } from "react";
import AuthLayout from "@/components/admin/auth/AuthLayout";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, UserCircle, Lock } from "lucide-react";
import { useLoginMutation } from "@/redux/api/BE/user/authApi";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";

const SignInPage = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [login, { isLoading }] = useLoginMutation();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await login({ email, password, role: "ADMIN" }).unwrap();
            if (result.success) {
                Cookies.set("accessToken", result.data.accessToken, { expires: 7, path: "/" });
                Cookies.set("refreshToken", result.data.refreshToken, { expires: 30, path: "/" });
                toast.success("Successfully logged in as Admin!");
                router.push("/admin/dashboard");
            } else {
                toast.error(result.message || "Login failed. Please check your credentials.");
            }
        } catch (err: any) {
            console.error("Login failed:", err);
            toast.error(err?.data?.message || "Something went wrong. Please try again.");
        }
    };

    return (
        <AuthLayout title="Admin Portal" subtitle="ReviewIQ Management System">
            <form className="space-y-6" onSubmit={handleLogin}>
                <div>
                    <label className="block text-white text-sm mb-2 ml-1" htmlFor="email">
                        Admin Email
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white transition-colors">
                            <UserCircle className="size-5" />
                        </div>
                        <input
                            className="w-full bg-[#334155]/50 border border-white/5 rounded-xl py-4 pl-12 pr-4 !text-white placeholder-blue-300/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-[#334155]/80 transition-all text-sm"
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@reviewiq.com"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-white text-sm mb-2 ml-1" htmlFor="password">
                        Password
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white transition-colors">
                            <Lock className="size-5" />
                        </div>
                        <input
                            className="w-full bg-[#334155]/50 border border-white/5 rounded-xl py-4 pl-12 pr-12 !text-white placeholder-blue-300/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-[#334155]/80 transition-all text-sm"
                            id="password"
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-blue-300/50 hover:text-blue-400 transition-colors cursor-pointer"
                        >
                            {showPassword ? (
                                <EyeOff size={20} />
                            ) : (
                                <Eye size={20} />
                            )}
                        </button>
                    </div>
                    <div className="flex justify-end mt-4">
                        <Link
                            href="/admin/forget-password"
                            className="text-red-400 text-sm hover:underline transition-all"
                        >
                            Forgot Password
                        </Link>
                    </div>
                </div>

                <button
                    className="w-full bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] hover:from-[#6d28d9] hover:to-[#4338ca] text-white font-semibold py-4 rounded-xl shadow-lg shadow-blue-900/40 transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
                    type="submit"
                    disabled={isLoading}
                >
                    <span>
                        {isLoading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" />
                            </svg>
                        )}
                    </span>
                    <span>{isLoading ? "Signing In..." : "Sign In"}</span>
                </button>

            </form>
        </AuthLayout>
    );
};

export default SignInPage;
