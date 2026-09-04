"use client";

import React from "react";
import Link from "next/link";
import { Star, ThumbsUp, MessageSquare, Reply, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Loader2, X } from "lucide-react";
import { useGetProfileQuery } from "@/redux/api/BE/user/profileApi";
import { useLazyGetMeQuery } from "@/redux/api/BE/user/authApi";
import { useGetDashboardOverviewQuery } from "@/redux/api/AI/dashboardApi";
import { useSelector } from "react-redux";
import { getUserIdFromToken, getSubscriptionFromCookie } from "@/utils/authUtils";
import Skeleton from "@/components/ui/Skeleton";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";
import { GrowthData } from "@/redux/api/AI/dashboardApi";

// Mock Data for Charts
const sentimentData = [
    { month: "Jan", positive: 65, neutral: 25, negative: 10 },
    { month: "Feb", positive: 68, neutral: 20, negative: 12 },
    { month: "Mar", positive: 75, neutral: 18, negative: 7 },
    { month: "Apr", positive: 82, neutral: 12, negative: 6 },
    { month: "May", positive: 85, neutral: 10, negative: 5 },
    { month: "Jun", positive: 80, neutral: 14, negative: 6 },
    { month: "Jul", positive: 88, neutral: 8, negative: 4 },
    { month: "Aug", positive: 90, neutral: 7, negative: 3 },
    { month: "Sep", positive: 86, neutral: 9, negative: 5 },
    { month: "Oct", positive: 84, neutral: 10, negative: 6 },
    { month: "Nov", positive: 89, neutral: 7, negative: 4 },
    { month: "Dec", positive: 92, neutral: 5, negative: 3 },
];

const performanceData = [
    { label: "Service", value: 4.5, change: "+0.3" },
    { label: "Quality", value: 4.7, change: "+0.1" },
    { label: "Atmosphere", value: 4.3, change: "-0.1" },
    { label: "Value", value: 4.2, change: "+0.2" },
    { label: "Cleanliness", value: 4.6, change: "+0.4" },
];

const keyIssues = [
    { label: "Slow service during peak hours", mentions: 23, trend: "up", change: "15%", severity: "High" },
    { label: "Limited parking", mentions: 18, trend: "down", change: "5%", severity: "Medium" },
    { label: "Noise level", mentions: 12, trend: "up", change: "2%", severity: "Low" },
    { label: "Price concerns", mentions: 8, trend: "down", change: "3%", severity: "Medium" },
];

const keyStrengths = [
    { label: "Friendly staff", mentions: 145, trend: "up" },
    { label: "Quality coffee", mentions: 132, trend: "up" },
    { label: "Cozy atmosphere", mentions: 98, trend: "down" },
    { label: "Great location", mentions: 76, trend: "up" },
];

export default function DashboardPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const hasUrlTokens = !!(searchParams.get('accessToken') && searchParams.get('refreshToken'));
    const [isTokenProcessing, setIsTokenProcessing] = React.useState(hasUrlTokens);
    const { data: profileData } = useGetProfileQuery(undefined, { skip: isTokenProcessing });
    const [getMe] = useLazyGetMeQuery();
    const user = profileData?.data;
    const userId = getUserIdFromToken();
    const [subscription, setSubscription] = React.useState(getSubscriptionFromCookie());
    const isNonePlan = subscription?.plan === "NONE";
    const [isBannerVisible, setIsBannerVisible] = React.useState(false);

    const paymentToastShown = React.useRef(false);

    // Save Google OAuth tokens if present in URL
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const accessToken = params.get('accessToken');
            const refreshToken = params.get('refreshToken');
            const userStr = params.get('user');
            const subscriptionParams = params.get('subscription');
            
            let updated = false;

            if (accessToken) {
                Cookies.set('accessToken', accessToken, { expires: 7, path: '/' });
                updated = true;
            }
            if (refreshToken) {
                Cookies.set('refreshToken', refreshToken, { expires: 30, path: '/' });
                updated = true;
            }
            if (userStr) {
                Cookies.set('user', userStr, { expires: 7, path: '/' });
                updated = true;
            }
            if (subscriptionParams) {
                try {
                    const encodedSub = btoa(subscriptionParams);
                    Cookies.set('subscription', encodedSub, { expires: 7, path: '/' });
                } catch (e) {
                    Cookies.set('subscription', subscriptionParams, { expires: 7, path: '/' });
                }
                updated = true;
            }

            if (updated) {
                window.history.replaceState({}, document.title, window.location.pathname);
            }
            setIsTokenProcessing(false);
        }
    }, []);

    React.useEffect(() => {
        if ((searchParams.get("success") === "true" || searchParams.get("session_id")) && !paymentToastShown.current) {
            paymentToastShown.current = true;

            setTimeout(() => {
                toast.success("Payment completed successfully! You are now a premium user.", { duration: 5000 });
            }, 500); // slight delay to ensure it shows after render

            // Polling mechanism to wait for Stripe Webhook to update the backend
            let attempts = 0;
            const pollSubscription = async () => {
                try {
                    const res: any = await getMe().unwrap();
                    let newSubscription = res?.data?.subscription;

                    if (newSubscription && newSubscription.plan && newSubscription.plan !== "NONE") {
                        const encodedSub = btoa(JSON.stringify(newSubscription));
                        Cookies.set("subscription", encodedSub, { expires: 7, path: '/' });
                        setSubscription(newSubscription);
                    } else if (attempts < 6) {
                        attempts++;
                        setTimeout(pollSubscription, 2500); // Retry every 2.5s
                    }
                } catch (error) {
                    console.error("Failed to poll for updated subscription:", error);
                }
            };

            // Hold a few seconds before hitting the API the first time to let Stripe webhook update the DB
            setTimeout(() => {
                pollSubscription();
            }, 3000);

            // Clean up the URL without triggering a router reload
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
        }
    }, [searchParams, getMe]);

    React.useEffect(() => {
        const isDismissed = sessionStorage.getItem("upgrade_banner_dismissed");
        if (isDismissed !== "true" && isNonePlan) {
            setIsBannerVisible(true);
        } else {
            setIsBannerVisible(false);
        }
    }, [isNonePlan]);

    const handleDismissBanner = () => {
        setIsBannerVisible(false);
        sessionStorage.setItem("upgrade_banner_dismissed", "true");
    };
    const { selectedBusiness, selectedAddress } = useSelector((state: any) => state.business);

    const { currentData: dashboardData, isLoading: isLoadingDashboard, isFetching } = useGetDashboardOverviewQuery(
        {
            user_id: userId || "",
            business_name: selectedBusiness || "",
            address: selectedAddress || ""
        },
        { skip: !userId || !selectedBusiness || !selectedAddress }
    );

    const overview = dashboardData?.overview;
    const sentimentTrend = dashboardData?.sentiment_trend || [];
    const performanceCriteria = dashboardData?.performance_criteria_with_growth;

    const GrowthIndicator = ({ growth }: { growth?: GrowthData }) => {
        if (!growth) return null;
        const isUp = growth.direction === "up";
        const isDown = growth.direction === "down";

        return (
            <div className={cn(
                "flex items-center mt-4 text-xs font-medium",
                isUp ? "text-green-600" : isDown ? "text-red-600" : "text-gray-500"
            )}>
                {isUp ? <TrendingUp className="size-3 mr-1" /> : isDown ? <TrendingDown className="size-3 mr-1" /> : null}
                <span>{growth.display}</span>
                <span className="text-gray-400 ml-1">vs last month</span>
            </div>
        );
    };

    if (isLoadingDashboard || isFetching) {
        return (
            <div className="space-y-8 pb-8">
                {/* Header Skeleton */}
                <div className="space-y-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>

                {/* Stats Cards Skeleton */}
                <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="p-6 user-card rounded-2xl space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-8 w-16" />
                                </div>
                                <Skeleton className="size-10 rounded-lg" />
                            </div>
                            <Skeleton className="h-4 w-32 mt-4" />
                        </div>
                    ))}
                </div>

                {/* Chart Skeleton */}
                <div className="user-card p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-8 w-24" />
                    </div>
                    <Skeleton className="h-[350px] w-full" />
                </div>

                {/* Performance Criteria Skeleton */}
                <div className="user-card p-6 rounded-2xl space-y-6">
                    <Skeleton className="h-6 w-48 mb-6" />
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="grid grid-cols-[100px_1fr_60px_80px] gap-4 items-center">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-2 w-full rounded-full" />
                            <Skeleton className="h-4 w-10 ml-auto" />
                            <Skeleton className="h-4 w-16 ml-auto" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-8">
            {/* Upgrade Banner */}
            {isNonePlan && isBannerVisible && (
                <div className="bg-[var(--primary-brand)] rounded-3xl p-8 text-white shadow-2xl shadow-cyan-100 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                    {/* Abstract Shapes */}
                    <div className="absolute top-0 right-0 -mt-12 -mr-12 size-48 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 -mb-12 -ml-12 size-32 bg-white/10 rounded-full blur-2xl" />

                    <button
                        onClick={handleDismissBanner}
                        className="absolute top-2.5 right-2.5 p-1.5 hover:bg-white/10 rounded-full transition-colors z-20 cursor-pointer"
                    >
                        <X className="size-5 text-white" />
                    </button>

                    <div className="flex items-center gap-6 relative z-10">
                        <div className="p-4 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 shadow-inner">
                            <TrendingUp className="size-8 text-white drop-shadow-md" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">Upgrade to Premium</h2>
                            <p className="text-cyan-50 text-sm mt-2 max-w-lg font-medium opacity-90">
                                You are currently exploring Aimalya on the Free plan. Unlock unlimited locations, detailed AI competitor analysis, and priority support today!
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/pricing"
                        className="bg-white text-[#0891B2] px-10 py-4 rounded-2xl font-black text-sm hover:bg-cyan-50 transition-all hover:scale-105 hover:shadow-xl shadow-lg relative z-10 cursor-pointer whitespace-nowrap"
                    >
                        View Upgrade Plans
                    </Link>
                </div>
            )}

            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Welcome back, {user?.name || "User"}</h1>
                <p className="text-gray-500 font-medium mt-1">{selectedBusiness || "Select a Business"} - {selectedAddress || "Overview Dashboard"}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                {/* Overall Rating */}
                <div className="p-6 user-card rounded-2xl">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Overall Rating</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-2">{overview?.overall_rating || "0.0"}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Star className="size-5 fill-blue-600" />
                        </div>
                    </div>
                    <GrowthIndicator growth={overview?.growth?.overall_rating} />
                </div>

                {/* Satisfaction Index */}
                <div className="p-6 user-card rounded-2xl">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Satisfaction Index</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-2">{overview?.satisfaction_index || "0"}%</h3>
                        </div>
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <ThumbsUp className="size-5" />
                        </div>
                    </div>
                    <GrowthIndicator growth={overview?.growth?.satisfaction_index} />
                </div>

                {/* Review Volume */}
                <div className="p-6 user-card rounded-2xl">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Review Volume</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-2">{overview?.review_volume || "0"}</h3>
                        </div>
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                            <MessageSquare className="size-5" />
                        </div>
                    </div>
                    <GrowthIndicator growth={overview?.growth?.review_volume} />
                </div>

                {/* Response Rate */}
                {/* <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Response Rate</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-2">{overview?.response_rate || "0"}%</h3>
                        </div>
                        <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                            <Reply className="size-5" />
                        </div>
                    </div>
                    <div className="flex items-center mt-4 text-xs font-medium text-gray-500">
                        <span>No change vs last month</span>
                    </div>
                </div> */}
            </div>

            {/* Sentiment Trend Chart */}
            <div className="user-card p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Sentiment Trend</h3>

                    {/* Floating Legend / Stats Mockup similar to image */}
                    {/* <div className="hidden sm:flex items-center gap-4 bg-white border border-gray-100 px-3 py-2 rounded-lg shadow-sm text-xs">
                        <div className="text-red-500">Negative: 10%</div>
                        <div className="text-gray-500">Neutral: 22%</div>
                        <div className="text-blue-500">Positive: 68%</div>
                    </div> */}
                </div>

                <div className="h-[350px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sentimentTrend.length > 0 ? sentimentTrend : sentimentData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorNeutral" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#94A3B8" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="period"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                unit="%"
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '16px',
                                    border: '1px solid #f1f5f9',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                    padding: '12px'
                                }}
                                labelStyle={{ color: '#111827', fontWeight: 'bold' }}
                                cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }}
                            />
                            <Legend
                                verticalAlign="top"
                                align="right"
                                height={36}
                                iconType="circle"
                                formatter={(value) => <span className="text-xs font-semibold text-gray-600 capitalize">{value}</span>}
                            />
                            <Area
                                type="monotone"
                                dataKey="positive"
                                stroke="#10B981"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorPositive)"
                                animationDuration={1500}
                            />
                            <Area
                                type="monotone"
                                dataKey="neutral"
                                stroke="#94A3B8"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorNeutral)"
                                animationDuration={1500}
                            />
                            <Area
                                type="monotone"
                                dataKey="negative"
                                stroke="#EF4444"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorNegative)"
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Performance by Criteria */}
            <div className="user-card p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance by Criteria</h3>
                <div className="space-y-6">
                    {(performanceCriteria ? Object.entries(performanceCriteria) : performanceData.map(d => [d.label, { score: d.value, growth: { display: d.change, direction: d.change.startsWith("+") ? "up" : "down" } }])).map(([label, data]: any) => (
                        <div key={label} className="grid grid-cols-[100px_1fr_60px_80px] gap-x-2 gap-y-4 items-center text-sm">
                            <span className="font-medium text-gray-700">{label}</span>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[var(--primary-brand)] rounded-full"
                                    style={{ width: `${(data.score / 5) * 100}%` }}
                                />
                            </div>
                            <span className="font-bold text-gray-900 text-right">{data.score}</span>
                            <div className={cn(
                                "text-xs text-right font-medium flex items-center justify-end text-[var(--primary-brand)]"
                            )}>
                                {data.growth.direction === "up" && <TrendingUp className="size-3 mr-1" />}
                                {data.growth.direction === "down" && <TrendingDown className="size-3 mr-1" />}
                                {data.growth.display}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Key Issues */}
                <div className="user-card p-6 rounded-2xl">
                    <div className="flex items-center gap-2 mb-6">
                        <AlertCircle className="size-5 text-red-500" />
                        <h3 className="text-lg font-semibold text-gray-900">Key Issues</h3>
                    </div>
                    <div className="space-y-4">
                        {(overview?.key_issues || []).map((issue: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{issue.issue}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-gray-500">{issue.mentions} mentions</span>
                                        <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-medium">
                                            High
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center text-xs font-medium text-red-500">
                                    <TrendingUp className="size-3 mr-1" />
                                </div>
                            </div>
                        ))}
                        {!overview?.key_issues?.length && <p className="text-sm text-gray-500 text-center py-4">No significant issues found.</p>}
                    </div>
                </div>

                {/* Key Strengths */}
                <div className="user-card p-6 rounded-2xl">
                    <div className="flex items-center gap-2 mb-6">
                        <CheckCircle className="size-5 text-green-500" />
                        <h3 className="text-lg font-semibold text-gray-900">Key Strengths</h3>
                    </div>
                    <div className="space-y-4">
                        {(overview?.key_strengths || []).map((strength: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-green-50/50 rounded-xl hover:bg-green-50 transition-colors">
                                <div>
                                    <p className="text-sm font-medium text-gray-900 capitalize">{strength.strength}</p>
                                    <p className="text-xs text-gray-500 mt-1">{strength.mentions} mentions</p>
                                </div>
                                <div className="flex items-center text-xs font-medium text-green-600">
                                    <TrendingUp className="size-3 mr-1" />
                                </div>
                            </div>
                        ))}
                        {!overview?.key_strengths?.length && <p className="text-sm text-gray-500 text-center py-4">No specific strengths listed.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

function cn(...inputs: (string | undefined | null | false)[]) {
    return inputs.filter(Boolean).join(" ");
}
