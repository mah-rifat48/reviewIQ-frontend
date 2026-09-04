"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useSearchParams } from "next/navigation";
import { useForgotPasswordMutation } from "@/redux/api/BE/user/authApi";
import { toast } from "react-hot-toast";
import { Suspense } from "react";

function VerifyCodeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "your email";
    
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const [forgotPassword, { isLoading: isResending }] = useForgotPasswordMutation();

    useEffect(() => {
        // Focus first input on mount
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const interval = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) {
            value = value.slice(0, 1);
        }

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").trim().slice(0, 6);
        if (/^\d+$/.test(pastedData)) {
            const newOtp = [...otp];
            for (let i = 0; i < pastedData.length; i++) {
                newOtp[i] = pastedData[i];
            }
            setOtp(newOtp);
            const focusIndex = Math.min(pastedData.length, 5);
            inputRefs.current[focusIndex]?.focus();
        }
    };

    const handleResend = async () => {
        if (timeLeft > 0 || isResending) return;
        try {
            const res = await forgotPassword({ email }).unwrap();
            toast.success(res?.message || "A new code has been sent!");
            setTimeLeft(180);
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to resend code");
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join("");
        if (code.length < 6) {
            toast.error("Please enter the 6-digit code");
            return;
        }
        router.push(`/reset-password?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`);
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

            {/* Verify Code Card */}
            <div className="relative z-10 w-[calc(100%-2rem)] max-w-[600px] user-auth-bg rounded-3xl p-6 sm:p-10 md:p-12 border border-white/50 space-y-6 sm:space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl sm:text-[32px] font-bold text-[#1A1A1A]">Verify OTP</h1>
                    <p className="text-zinc-500 text-sm sm:text-[15px] max-w-[450px] mx-auto leading-relaxed">
                        We have sent you a 6 digit OTP code to your provided email:
                        <br />
                        <span className="font-bold text-zinc-800">{email}</span> please input that code here to proceed.
                    </p>
                </div>

                <div className="flex justify-center">
                    <span className="text-[#FF5B5B] font-bold text-[18px]">{formatTime(timeLeft)}</span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="flex justify-center gap-2 md:gap-4">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el }}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                className="w-12 h-12 md:w-14 md:h-14 text-center text-xl font-bold bg-slate-50/50 rounded-xl border border-zinc-200 focus:border-auth-subtitle-color focus:ring focus:ring-auth-subtitle-color outline-none transition-all text-zinc-800"
                            />
                        ))}
                    </div>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={timeLeft > 0 || isResending}
                            className={`font-bold text-[15px] cursor-pointer ${
                                timeLeft > 0 || isResending
                                    ? "text-zinc-400 cursor-not-allowed"
                                    : "text-auth-subtitle-color hover:underline"
                            }`}
                        >
                            {isResending ? "Resending..." : "Resend"}
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Link
                            href="/forget-password"
                            className="cursor-pointer w-full h-12 bg-white text-auth-subtitle-color rounded-xl font-bold text-[15px] hover:bg-cyan-50 transition-all flex items-center justify-center"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            className="cursor-pointer w-full h-12 bg-auth-subtitle-color text-white rounded-xl font-bold text-[15px] hover:bg-cyan-300 transition-all shadow-lg shadow-blue-200"
                        >
                            Verify
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function VerifyCodePage() {
    return (
        <Suspense fallback={<div className="min-h-screen w-full flex items-center justify-center bg-[#E0F2FE]">Loading...</div>}>
            <VerifyCodeContent />
        </Suspense>
    );
}