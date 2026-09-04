"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { getSubscriptionFromCookie } from "@/utils/authUtils";
import { usePathname } from "next/navigation";

const PROTECTED_ROUTES = ["/dashboard", "/review", "/ai-insights", "/reports"];

export default function SubscriptionGuard({ children }: { children: React.ReactNode }) {
    const [isMounted, setIsMounted] = useState(false);
    const pathname = usePathname();
    
    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return <div className="min-h-screen" />; // Avoid hydration mismatch

    // Only protect specific routes
    const isProtected = PROTECTED_ROUTES.some(route => pathname?.startsWith(route));
    if (!isProtected) {
        return <>{children}</>;
    }

    const sub = getSubscriptionFromCookie();
    
    const plan = sub?.plan?.toUpperCase() || "NONE";
    const expiryDateStr = sub?.durationDate;
    
    let isExpired = false;
    if (expiryDateStr) {
        const expiryDate = new Date(expiryDateStr);
        if (new Date() > expiryDate) {
            isExpired = true;
        }
    } else {
        if (plan === "NONE") {
            isExpired = true;
        }
    }

    if (!isExpired) {
        return <>{children}</>;
    }

    let message = "Your free trial has ended. Please buy a premium subscription to use the platform.";
    if (plan !== "NONE") {
        message = `Your ${plan.charAt(0) + plan.slice(1).toLowerCase()} plan has expired. Please buy the plan again or upgrade.`;
    }

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 animate-fadeIn">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="size-10 text-amber-600" />
            </div>
            
            <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Access Restricted</h2>
            
            <p className="text-lg text-gray-600 max-w-lg mb-8">
                {message}
            </p>
            
            <Link
                href="/pricing"
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
            >
                View Pricing Plans
                <ArrowRight className="size-5" />
            </Link>
        </div>
    );
}
