"use client";

import { Star, Loader2 } from "lucide-react";
import { forwardRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import gsap from "gsap";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Cookies from "js-cookie";
import { useCreateSubscriptionMutation } from "@/redux/api/BE/user/planApi";
import { getUserIdFromToken } from "@/utils/authUtils";
import ContactUsModal from "./ContactUsModal";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface PricingSectionProps {
    isDashboard?: boolean;
}

const PricingSection = forwardRef<HTMLDivElement, PricingSectionProps>(({ isDashboard }, ref) => {
    const router = useRouter();
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [createSubscription] = useCreateSubscriptionMutation();
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);

    const [starterSettings, setStarterSettings] = useState<any>(null);
    const [professionalSettings, setProfessionalSettings] = useState<any>(null);

    useEffect(() => {
        const fetchPlanSettings = async () => {
            const token = Cookies.get("accessToken");
            const headers: Record<string, string> = {
                "accept": "*/*",
            };
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            try {
                const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://aimaliya.sakibalhasa.xyz/api/v1";
                const [starterRes, profRes] = await Promise.all([
                    fetch(`${baseUrl}/plan-settings/starter`, { headers }).then(r => r.json()),
                    fetch(`${baseUrl}/plan-settings/professional`, { headers }).then(r => r.json())
                ]);

                if (starterRes?.success && starterRes?.data) {
                    setStarterSettings(starterRes.data);
                }
                if (profRes?.success && profRes?.data) {
                    setProfessionalSettings(profRes.data);
                }
            } catch (err) {
                console.error("Error fetching plan settings:", err);
            }
        };

        fetchPlanSettings();
    }, []);

    const handlePlanClick = async (planName: string) => {
        setLoadingPlan(planName);
        const userId = getUserIdFromToken();

        if (!userId) {
            toast.error("Please login to purchase this plan", {
                duration: 3000,
                position: "top-center",
                style: {
                    borderRadius: '12px',
                    background: '#1a1a1a',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    zIndex: 9999,
                },
            });

            // Start Page Exit Animation
            const mainElement = document.querySelector('main');
            const navbarElement = document.querySelector('nav');

            if (mainElement) {
                gsap.to([mainElement, navbarElement].filter(Boolean), {
                    opacity: 0,
                    y: -30,
                    duration: 0.8,
                    ease: "power2.inOut",
                    onComplete: () => {
                        router.push("/login");
                    }
                });
            } else {
                setTimeout(() => {
                    router.push("/login");
                }, 1000);
            }
            return;
        }

        if (planName === "Enterprise") {
            setLoadingPlan(null);
            setIsContactModalOpen(true);
            return;
        }

        try {
            const payload = {
                plan: planName.toUpperCase(),
                review: planName === "Starter"
                    ? (starterSettings?.review?.toString() || "500")
                    : (professionalSettings?.review?.toString() || "Unlimited"),
                location: planName === "Starter"
                    ? (starterSettings?.location?.toString() || "5")
                    : (professionalSettings?.location?.toString() || "5"),
                business: planName === "Starter"
                    ? (starterSettings?.business ?? 4)
                    : (professionalSettings?.business ?? 10),
                balance: planName === "Starter"
                    ? (starterSettings?.balance ?? 150)
                    : (professionalSettings?.balance ?? 299),
                reportPlan: planName === "Starter"
                    ? (starterSettings?.reportPlan || ["Weekly"])
                    : (professionalSettings?.reportPlan || ["Monthly", "Weekly"]),
                competitor: planName === "Starter"
                    ? (starterSettings?.competitor ?? false)
                    : (professionalSettings?.competitor ?? true),
                durationDate: "2026-12-31T23:59:59Z",
                durationsPlan: "MONTHLY"
            };

            const res = await createSubscription(payload).unwrap();

            if (res?.data?.url) {
                // Navigate to Stripe Checkout
                window.location.href = res.data.url;
            } else {
                toast.error("Failed to generate checkout link.");
                setLoadingPlan(null);
            }
        } catch (error: any) {
            toast.error(error?.data?.message || "Something went wrong creating your subscription.");
            setLoadingPlan(null);
        }
    };

    // Dynamically build features lists based on API settings while keeping the same UI structure
    const starterBusinessText = starterSettings
        ? `Up to ${starterSettings.business} ${starterSettings.business === 1 ? 'Business' : 'Businesses'}`
        : 'Up to 4 Businesses';

    const starterLocationText = starterSettings
        ? `Up to ${starterSettings.location} ${starterSettings.location === 1 ? 'Location per business' : 'Locations per business'}`
        : 'Up to 5 Locations per business';

    const starterReviewsText = starterSettings
        ? `Up to ${starterSettings.review} reviews/mo`
        : 'Up to 100 reviews/mo';

    const starterReportsText = starterSettings && starterSettings.reportPlan && starterSettings.reportPlan.length > 0
        ? `${starterSettings.reportPlan.join(" + ")} reports`
        : 'Weekly reports';

    const starterList = [
        starterBusinessText,
        starterLocationText,
        starterReviewsText,
        starterReportsText,
        'Basic AI insights'
    ];

    const professionalBusinessText = professionalSettings
        ? `Up to ${professionalSettings.business} ${professionalSettings.business === 1 ? 'Business' : 'Businesses'}`
        : 'Up to 10 Businesses';

    const professionalLocationText = professionalSettings
        ? `Up to ${professionalSettings.location} Locations per business`
        : 'Up to 5 Locations per business';

    const professionalReviewsText = professionalSettings
        ? `${professionalSettings.review === 999999 || typeof professionalSettings.review === 'string' || professionalSettings.review > 99999 ? 'Unlimited' : `Up to ${professionalSettings.review}`} reviews/mo`
        : 'Up to 1000 reviews/mo';

    const professionalReportsText = professionalSettings && professionalSettings.reportPlan && professionalSettings.reportPlan.length > 0
        ? `${professionalSettings.reportPlan.join(" + ")} reports`
        : 'Weekly + Monthly reports';

    const professionalList = [
        professionalBusinessText,
        professionalLocationText,
        professionalReviewsText,
        professionalReportsText,
        'Advanced AI insights',
    ];
    if (professionalSettings ? professionalSettings.competitor : true) {
        professionalList.push('Competitor analysis');
    }

    return (
        <section id="pricing" ref={ref} className={cn(
            "bg-[#f8fafc]",
            isDashboard ? "py-10" : "py-28"
        )}>
            {!isDashboard && (
                <div className="max-w-7xl mx-auto px-6 text-center mb-20 reveal-up">
                    <h2 className="text-[44px] font-extrabold text-[#111111] tracking-tight">Simple, Transparent Pricing</h2>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                {/* Starter */}
                <div className="gsap-pricing-card bg-white p-10 rounded-[40px] border border-gray-100 shadow-none hover:shadow-none transition-all reveal-up">
                    <h3 className="text-[22px] font-black mb-2 tracking-tight text-[#0F172A]">Starter</h3>
                    <div className="flex items-baseline gap-1 mb-8">
                        <span className="text-[48px] font-black tracking-tighter text-[#0F172A]">
                            ${starterSettings?.balance ?? 159}
                        </span>
                        <span className="text-gray-400 font-bold text-[16px]">/mo</span>
                    </div>
                    <ul className="space-y-5 mb-10">
                        {starterList.map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-[14px] text-[#475569] font-bold tracking-tight">
                                <Star size={16} className="text-[#0066FF]" /> {item}
                            </li>
                        ))}
                    </ul>
                    <button
                        onClick={() => handlePlanClick('Starter')}
                        disabled={loadingPlan !== null}
                        className="w-full cursor-pointer py-4 px-6 rounded-2xl border-2 border-gray-100 text-[#0F172A] font-black hover:bg-gray-50 transition-all text-[14px] shadow-sm flex items-center justify-center gap-2"
                    >
                        {loadingPlan === 'Starter' ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : "Get Started"}
                    </button>
                </div>

                {/* Professional - Featured */}
                <div className="gsap-pricing-card bg-[#0066FF] p-10 rounded-[40px] shadow-none lg:scale-110 z-10 relative overflow-hidden reveal-up">
                    <div className="absolute top-5 left-0 w-full text-center">
                        <span className="text-[11px] text-white/90 font-black uppercase tracking-[2px]">Most Popular</span>
                    </div>
                    <h3 className="text-[22px] font-black text-white mt-8 mb-2 tracking-tight">Professional</h3>
                    <div className="flex items-baseline gap-1 mb-8">
                        <span className="text-[48px] font-black text-white tracking-tighter">
                            ${professionalSettings?.balance ?? 299}
                        </span>
                        <span className="text-white/80 font-bold text-[16px]">/mo</span>
                    </div>
                    <ul className="space-y-5 mb-10">
                        {professionalList.map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-[14px] text-white font-bold tracking-tight">
                                <Star size={16} fill="white" className="text-white" /> {item}
                            </li>
                        ))}
                    </ul>
                    <button
                        onClick={() => handlePlanClick('Professional')}
                        disabled={loadingPlan !== null}
                        className="w-full cursor-pointer py-4 px-6 rounded-2xl bg-white text-[#0066FF] font-black hover:bg-blue-50 transition-all text-[14px] shadow-xl flex items-center justify-center gap-2"
                    >
                        {loadingPlan === 'Professional' ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : "Get Started"}
                    </button>
                </div>

                {/* Enterprise */}
                <div className="gsap-pricing-card bg-white p-10 rounded-[40px] border border-gray-100 shadow-none hover:shadow-none transition-all reveal-up">
                    <h3 className="text-[22px] font-black mb-2 tracking-tight text-[#0F172A]">Enterprise</h3>
                    <div className="flex items-baseline gap-1 mb-8">
                        <span className="text-[48px] font-black tracking-tighter text-[#0F172A]">Custom</span>
                    </div>
                    <ul className="space-y-5 mb-10">
                        {[
                            'Unlimited Businesses',
                            'Unlimited Locations',
                            'Unlimited reviews',
                            'Custom reporting',
                            'Dedicated support'
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-[14px] text-[#475569] font-bold tracking-tight">
                                <Star size={16} className="text-[#0066FF]" /> {item}
                            </li>
                        ))}
                    </ul>
                    <button
                        onClick={() => handlePlanClick('Enterprise')}
                        disabled={loadingPlan !== null}
                        className="w-full cursor-pointer py-4 px-6 rounded-2xl border-2 border-gray-100 text-[#0F172A] font-black hover:bg-gray-50 transition-all text-[14px] shadow-sm flex items-center justify-center gap-2"
                    >
                        {loadingPlan === 'Enterprise' ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : "Contact Sales"}
                    </button>
                </div>
            </div>
            <ContactUsModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
                initialSubject="Enterprise Plan Inquiry"
            />
        </section>
    );
});

PricingSection.displayName = "PricingSection";
export default PricingSection;
