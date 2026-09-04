"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
    LayoutGrid,
    Users,
    Crown,
    Briefcase,
    PieChart,
    MessageSquare,
    Settings,
    LogOut,
    UserCircle,
    Sliders,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuth } from "@/hooks/useAuth";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const menuItems = [
    { icon: LayoutGrid, label: "Overview", href: "/admin/dashboard" },
    { icon: Users, label: "User", href: "/admin/users" },
    { icon: Crown, label: "Subscription", href: "/admin/subscription" },
    { icon: Briefcase, label: "Businesses", href: "/admin/businesses" },
    { icon: PieChart, label: "Analytics", href: "/admin/analytics" },
    { icon: MessageSquare, label: "Support", href: "/admin/support" },
    { icon: UserCircle, label: "Profile", href: "/admin/profile" },
    { icon: Sliders, label: "Plan Settings", href: "/admin/plan-settings" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export default function Sidebar() {
    const { logout } = useAuth();
    const pathname = usePathname();
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth < 1024);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <aside
            className={cn(
                "group fixed left-0 top-0 bottom-0 z-50 transition-all duration-300 ease-in-out border-r border-[#1E293B]/20 bg-[#182337] text-white flex flex-col overflow-hidden",
                // On Desktop: Always 256px
                // On Small Device: 72px by default, 256px on hover (as overlay)
                !isSmallScreen ? "w-64" : "w-[72px] hover:w-64 shadow-2xl"
            )}
        >
            {/* Logo Section */}
            <Link href="/admin/dashboard">
                <div className="flex h-20 items-center px-4 overflow-hidden justify-start relative">
                    <div className="flex items-center justify-start flex-shrink-0 w-full">
                        <Image
                            src="/admin_logo.png"
                            alt="Logo"
                            width={207}
                            height={60}
                            className={cn(
                                "h-12 w-auto object-contain transition-all duration-300 max-w-none",
                                isSmallScreen ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                            )}
                            priority
                        />
                        {isSmallScreen && (
                            <div className="absolute left-4 transition-opacity duration-300 group-hover:opacity-0 w-10 h-10 flex items-center justify-center">
                                <Image
                                    src="/admin_logo_small.png"
                                    alt="Logo"
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-contain"
                                    priority
                                />
                            </div>
                        )}
                    </div>
                </div>
            </Link>

            {/* Divider */}
            <div className="mx-4 mb-4 h-[0.8px] bg-white" />

            {/* Navigation Items */}
            <nav className="flex-1 min-h-0 px-3 space-y-1.5 overflow-x-hidden overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group relative flex items-center h-11 rounded-xl transition-all duration-200 cursor-pointer",
                                isActive
                                    ? "bg-[var(--primary-brand)] text-white shadow-lg shadow-[var(--primary-brand)]/20"
                                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                            )}
                        >
                            <div className="flex items-center justify-center w-11 h-11 flex-shrink-0">
                                <item.icon
                                    className={cn(
                                        "size-[20px] transition-colors duration-200",
                                        isActive ? "text-white" : "text-gray-300 group-hover:text-white"
                                    )}
                                />
                            </div>
                            <span className={cn(
                                "ml-2 transition-all duration-300 whitespace-nowrap",
                                isSmallScreen ? "opacity-0 group-hover:opacity-100" : "opacity-100",
                                isActive
                                    ? "text-[16px] leading-[26px] text-white"
                                    : "text-[15px] leading-[24px] text-gray-300 group-hover:text-white"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto border-t border-gray-500/50 m-4 pt-4">
                <button
                    onClick={() => logout("/admin/signin")}
                    className={cn(
                        "w-full flex items-center h-11 rounded-xl transition-all duration-200 cursor-pointer text-red-500 hover:bg-[#1E293B] hover:text-red-400",
                        isSmallScreen ? "justify-center group-hover:justify-start" : "px-3"
                    )}
                >
                    <div className="flex items-center justify-center w-11 h-11 flex-shrink-0 ml-[-12px]">
                        <LogOut className="size-5" />
                    </div>
                    <span className={cn(
                        "text-sm font-medium transition-all duration-300 opacity-0 w-0 overflow-hidden whitespace-nowrap",
                        isSmallScreen ? "group-hover:opacity-100 group-hover:w-auto group-hover:ml-1" : "opacity-100 w-auto ml-1"
                    )}>
                        Logout
                    </span>
                </button>
            </div>
        </aside>
    );
}
