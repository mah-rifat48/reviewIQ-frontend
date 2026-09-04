"use client";

import React from "react";
import Image from "next/image";

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    footerText?: string;
    icon?: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
    children,
    title,
    subtitle,
    footerText = "Authorized personnel only • All actions are logged",
    icon,
}) => {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0F172B] via-[#1C398E] to-[#0F172B] relative overflow-hidden font-sans">
            {/* Background Light Effects */}
            {/* The main diagonal light ray coming from top-right */}
            {/* <div
                className="absolute top-[-20%] right-[-10%] w-[100%] h-[150%] bg-gradient-to-b from-blue-500/30 via-transparent to-blue-600/10 blur-[120px] -rotate-45 pointer-events-none origin-top-right transform scale-150"
            ></div> */}

            <div className="z-10 w-full max-w-[500px] px-4 flex flex-col items-center">
                {/* Logo/Icon Container */}
                <div className="mb-6 flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] rounded-2xl flex items-center justify-center p-3 shadow-lg mb-4">
                        {icon || (
                            <svg
                                width="40"
                                height="40"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        )}
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">{title}</h1>
                    {subtitle && <p className="text-blue-200 text-sm mb-2 text-center">{subtitle}</p>}
                </div>

                {/* Auth Card */}
                <div className="w-full bg-[#1e293b]/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
                    {children}
                </div>

                {/* Footer Text */}
                <p className="mt-8 text-blue-300/60 text-xs text-center uppercase tracking-widest">
                    {footerText}
                </p>
            </div>
        </div>
    );
};

export default AuthLayout;
