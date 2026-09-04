"use client";

import React, { useEffect, Suspense } from "react";
import PricingSection from "@/components/user/home/PricingSection";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";

function PricingContent() {
    const searchParams = useSearchParams();

    useEffect(() => {
        if (searchParams.get("canceled") === "true" || searchParams.get("fail") === "true" || searchParams.get("error")) {
            setTimeout(() => {
                toast.error("Payment failed or was canceled. Please try again.", { duration: 5000 });
            }, 500); // slight delay to ensure it shows after render
            
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
        }
    }, [searchParams]);

    return (
        <div className="pb-10">
            <div className="mb-10">
                <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Subscription Plans</h1>
                <p className="text-gray-500 font-medium mt-1">Choose the plan that best fits your business needs.</p>
            </div>
            
            <div className="overflow-hidden">
                <PricingSection isDashboard={true} />
            </div>
        </div>
    );
}

export default function PricingPage() {
    return (
        <Suspense fallback={<div>Loading plans...</div>}>
            <PricingContent />
        </Suspense>
    );
}
