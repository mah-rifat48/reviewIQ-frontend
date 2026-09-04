"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, User, Briefcase, Loader2 } from "lucide-react";
import { useRegisterMutation } from "@/redux/api/BE/user/authApi";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import { useEffect } from "react";

export default function SignupPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const error = searchParams.get("error");
        if (error) {
            toast.error(decodeURIComponent(error), { position: "top-right" });
            // Clean up URL
            const url = new URL(window.location.href);
            url.searchParams.delete("error");
            window.history.replaceState({}, "", url.pathname);
        }
    }, []);
    
    // Form state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        businessName: "",
        password: "",
        confirmPassword: ""
    });

    const [register, { isLoading }] = useRegisterMutation();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { placeholder, value } = e.target;
        const nameMap: { [key: string]: string } = {
            "Full Name": "name",
            "Business Email": "email",
            "Business Name": "businessName",
            "Password": "password",
            "Confirm Password": "confirmPassword"
        };
        const fieldName = nameMap[placeholder];
        if (fieldName) {
            setFormData(prev => ({ ...prev, [fieldName]: value }));
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            const result = await register({
                email: formData.email,
                password: formData.password,
                name: formData.name,
                role: "USER",
                operationsRole: formData.businessName
            }).unwrap();

            if (result.success) {
                Cookies.set("accessToken", result.data.accessToken, { expires: 7, path: '/' });
                Cookies.set("refreshToken", result.data.refreshToken, { expires: 30, path: '/' });
                
                // Save subscription encoded in cookies
                if (result.data.subscription) {
                    const encodedSub = btoa(JSON.stringify(result.data.subscription));
                    Cookies.set("subscription", encodedSub, { expires: 7, path: '/' });
                }

                toast.success(result.message || "Account created successfully!");
                router.push("/account-setup");
            } else {
                toast.error(result.message || "Registration failed");
            }
        } catch (err: any) {
            console.error("Signup failed:", err);
            toast.error(err?.data?.message || "Registration failed. Please try again.");
        }
    };

    const handleGoogleSignup = () => {
        // Redirecting directly to the backend endpoint for Google Auth
        window.location.href = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/google/register`;
    };

    return (
        <div className="min-h-screen w-full relative content-center flex items-center justify-center overflow-hidden bg-[#E0F2FE]">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/auth-bg.png"
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

            {/* Signup Card */}
            <div className="relative z-10 w-[calc(100%-2rem)] max-w-[550px] user-auth-bg rounded-3xl p-6 sm:p-10 md:p-12 border border-white/50 space-y-6 sm:space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl sm:text-[32px] font-bold text-[#1A1A1A]">Create Account</h1>
                    <p className="text-auth-subtitle-color font-medium text-sm sm:text-[15px]">Start analysing your reviews today</p>
                </div>

                <form className="space-y-4" onSubmit={handleSignup}>
                    {/* Full Name */}
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-auth-subtitle-color transition-colors pl-1">
                            <User size={20} />
                        </div>
                        <input
                            type="text"
                            required
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full bg-white h-12 rounded-xl pl-12 pr-4 text-[15px] border border-transparent focus:border-auth-subtitle-color focus:ring focus:ring-auth-subtitle-color outline-none transition-all placeholder:text-zinc-400 shadow-sm"
                        />
                    </div>

                    {/* Business Email */}
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-auth-subtitle-color transition-colors pl-1">
                            <Mail size={20} />
                        </div>
                        <input
                            type="email"
                            required
                            placeholder="Business Email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full bg-white h-12 rounded-xl pl-12 pr-4 text-[15px] border border-transparent focus:border-auth-subtitle-color focus:ring focus:ring-auth-subtitle-color outline-none transition-all placeholder:text-zinc-400 shadow-sm"
                        />
                    </div>

                    {/* Business Name */}
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-auth-subtitle-color transition-colors pl-1">
                            <Briefcase size={20} />
                        </div>
                        <input
                            type="text"
                            required
                            placeholder="Business Name"
                            value={formData.businessName}
                            onChange={handleInputChange}
                            className="w-full bg-white h-12 rounded-xl pl-12 pr-4 text-[15px] border border-transparent focus:border-auth-subtitle-color focus:ring focus:ring-auth-subtitle-color outline-none transition-all placeholder:text-zinc-400 shadow-sm"
                        />
                    </div>

                    {/* Password */}
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-auth-subtitle-color transition-colors pl-1">
                            <Lock size={20} />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full bg-white h-12 rounded-xl pl-12 pr-12 text-[15px] border border-transparent focus:border-auth-subtitle-color focus:ring focus:ring-auth-subtitle-color outline-none transition-all placeholder:text-zinc-400 shadow-sm"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} className="text-cyan-300 cursor-pointer" /> : <Eye size={20} className="text-cyan-300 cursor-pointer" />}
                        </button>
                    </div>

                    {/* Confirm Password */}
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-auth-subtitle-color transition-colors pl-1">
                            <Lock size={20} />
                        </div>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full bg-white h-12 rounded-xl pl-12 pr-12 text-[15px] border border-transparent focus:border-auth-subtitle-color focus:ring focus:ring-auth-subtitle-color outline-none transition-all placeholder:text-zinc-400 shadow-sm"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                        >
                            {showConfirmPassword ? <EyeOff size={20} className="text-cyan-300 cursor-pointer" /> : <Eye size={20} className="text-cyan-300 cursor-pointer" />}
                        </button>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="terms"
                            required
                            className="w-4 h-4 rounded cursor-pointer"
                            style={{ accentColor: 'var(--primary-brand)' }}
                        />
                        <label htmlFor="terms" className="text-[14px] text-zinc-500 font-medium">
                            I accept the <Link href="#" className="text-auth-subtitle-color font-bold hover:underline">Terms & Privacy Policy</Link>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="cursor-pointer w-full h-12 bg-auth-subtitle-color hover:bg-cyan-300 text-white rounded-xl font-bold text-[15px] transition-all shadow-lg shadow-blue-200 mt-4 disabled:opacity-50"
                    >
                        <span>{isLoading ? "Creating Account..." : "Create Account"}</span>
                    </button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white rounded-full text-zinc-500 font-medium">Or continue with</span>
                    </div>
                </div>

                <button
                    onClick={handleGoogleSignup}
                    className="cursor-pointer w-full flex items-center justify-center gap-3 h-12 bg-white border border-zinc-200 rounded-xl font-bold text-[15px] text-zinc-800 hover:bg-zinc-50 transition-all shadow-sm"
                >
                    <Image src="/google_icon.svg" alt="Google" width={24} height={24} />
                    Sign up with Google
                </button>

                <p className="text-center text-[14px] text-zinc-500 font-medium">
                    Already have an account?{' '}
                    <Link href="/login" className="text-auth-subtitle-color font-bold hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}