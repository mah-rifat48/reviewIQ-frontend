"use client";

import React, { useState, useEffect } from "react";
import AuthLayout from "@/components/admin/auth/AuthLayout";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAdminForgotPasswordMutation } from "@/redux/api/BE/admin/forgetPassApi";

const VerifyOTPPage = () => {
    const router = useRouter();
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [timer, setTimer] = useState(179); // 2:59 in seconds
    const [resendOtp, { isLoading: isResending }] = useAdminForgotPasswordMutation();

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return false;
        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
        if (element.nextSibling && element.value !== "") {
            (element.nextSibling as HTMLInputElement).focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").trim();
        const pastedDigits = pastedData.replace(/\D/g, "").slice(0, 6).split("");
        
        if (pastedDigits.length > 0) {
            const newOtp = [...otp];
            for (let i = 0; i < pastedDigits.length; i++) {
                newOtp[i] = pastedDigits[i];
            }
            setOtp(newOtp);
            
            const focusIndex = pastedDigits.length < 6 ? pastedDigits.length : 5;
            const targetElement = e.currentTarget.parentElement?.children[focusIndex] as HTMLInputElement;
            if (targetElement) {
                targetElement.focus();
            }
        }
    };

    const handleResend = async () => {
        const email = sessionStorage.getItem("adminResetEmail");
        if (!email) {
            toast.error("Email not found. Please try requesting a new OTP.");
            router.push("/admin/forget-password");
            return;
        }

        try {
            await resendOtp({ email }).unwrap();
            toast.success("A new OTP has been sent to your email.");
            setTimer(179);
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to resend OTP.");
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join("");
        if (code.length !== 6) {
            toast.error("Please enter the full 6-digit code");
            return;
        }
        
        sessionStorage.setItem("adminResetOtp", code);
        router.push("/admin/reset-password");
    };

    return (
        <AuthLayout
            title="Verify OTP"
            subtitle="We have sent you a 6 digit OTP code to your provided email. Please input that code here to proceed."
            icon={
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    <path d="M12 15v3"></path>
                    <path d="M10 16h4"></path>
                </svg>
            }
        >
            <form className="flex flex-col items-center" onSubmit={handleSubmit}>
                <div className="text-[#ef4444] font-bold text-lg mb-6">{formatTime(timer)}</div>

                <div className="flex justify-between w-full gap-2 mb-8">
                    {otp.map((data, index) => (
                        <input
                            key={index}
                            type="text"
                            maxLength={1}
                            className="w-12 h-14 bg-white rounded-xl text-center text-xl font-bold text-[#1e293b] focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all shadow-inner"
                            value={data}
                            onChange={(e) => handleChange(e.target, index)}
                            onFocus={(e) => e.target.select()}
                            onPaste={handlePaste}
                            placeholder="-"
                        />
                    ))}
                </div>

                <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending || timer > 0}
                    className="text-blue-200/60 text-sm hover:text-white transition-colors mb-8 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isResending ? "Resending..." : "Resend"}
                </button>

                <div className="flex gap-4 w-full">
                    <Link
                        href="/admin/signin"
                        className="flex-1 border border-white/20 text-white font-semibold py-4 rounded-xl hover:bg-white/5 transition-all text-center flex items-center justify-center cursor-pointer"
                    >
                        Cancel
                    </Link>
                    <button
                        className="flex-[1.5] bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] hover:from-[#6d28d9] hover:to-[#4338ca] text-white font-semibold py-4 rounded-xl shadow-lg shadow-blue-900/40 transition-all flex items-center justify-center cursor-pointer"
                        type="submit"
                    >
                        Verify
                    </button>
                </div>
            </form>
        </AuthLayout>
    );
};

export default VerifyOTPPage;
