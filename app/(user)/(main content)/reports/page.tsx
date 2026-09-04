"use client";

import React from "react";
import {
    FileText,
    Calendar,
    Download,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    CheckCircle2,
    Settings,
    ChevronDown,
    MapPin,
    ArrowRight
} from "lucide-react";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import StylishDropdown from "@/components/ui/StylishDropdown";
import { useState, useEffect, useMemo } from "react";
import { useGetMonthlyReportQuery } from "@/redux/api/AI/reportsApi";
import { useSelector } from "react-redux";
import { getUserIdFromToken, getSubscriptionFromCookie } from "@/utils/authUtils";
import { Loader2 } from "lucide-react";
import { downloadReportPDF, downloadReportExcel } from "@/utils/reportExport";
import Skeleton from "@/components/ui/Skeleton";

// Mock Data
const volumeData = [
    { week: "Week 1", volume: 65 },
    { week: "Week 2", volume: 80 },
    { week: "Week 3", volume: 75 },
    { week: "Week 4", volume: 90 },
];

const ratingData = [
    { week: "Week 1", rating: 4.5 },
    { week: "Week 2", rating: 4.6 },
    { week: "Week 3", rating: 4.7 },
    { week: "Week 4", rating: 4.6 },
];

const complaints = [
    { label: "Slow service", count: "23 mentions" },
    { label: "Limited parking", count: "18 mentions" },
    { label: "Noise level", count: "12 mentions" },
];

const praises = [
    { label: "Quality coffee", count: "145 mentions" },
    { label: "Friendly staff", count: "132 mentions" },
    { label: "Cozy atmosphere", count: "98 mentions" },
];

const getRecommendations = (index: number) => {
    const variations = [
        [
            {
                title: "1. Optimize Staff Scheduling During Peak Hours",
                description: "Implement time-slot based staffing to reduce wait times during 11am-1pm and 5pm-7pm periods. Estimated improvement: +12% satisfaction.",
            },
            {
                title: "2. Launch Customer Loyalty Program",
                description: "Address price perception concerns by introducing rewards for repeat customers. Estimated improvement: +7% satisfaction.",
            },
        ],
        [
            {
                title: "1. Improve Review Response Speed",
                description: "Decrease average response time from 48h to under 24h to improve engagement. Estimated improvement: +5% satisfaction.",
            },
            {
                title: "2. Focus on Service Consistency",
                description: "Address fluctuations in service speed reported in recent reviews. Estimated improvement: +8% satisfaction.",
            },
        ]
    ];
    return variations[index % variations.length];
};

const getActionPlan = (index: number) => {
    const plans = [
        [
            "Hire 2 additional staff members for peak hours",
            "Implement mobile pre-ordering system",
            "Launch loyalty program by end of month",
            "Improve review response rate to 80%+",
            "Partner with nearby parking facilities",
        ],
        [
            "Conduct training on customer service benchmarks",
            "A/B test new menu descriptions",
            "Refresh social media review highlights",
            "Integrate automated response templates",
        ]
    ];
    return plans[index % plans.length];
};

const getWeeks = (baseDate: Date) => {
    const weeks = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    for (let i = 0; i < 5; i++) {
        const endDate = new Date(baseDate);
        endDate.setDate(endDate.getDate() - (i * 7));
        
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 7);

        const label = `${startDate.getDate()} ${monthNames[startDate.getMonth()]} - ${endDate.getDate()} ${monthNames[endDate.getMonth()]} ${endDate.getFullYear()}`;
        const generated = `${monthNames[endDate.getMonth()]} ${endDate.getFullYear()}`;

        weeks.push({
            name: `Weekly Report: ${endDate.getDate()} ${monthNames[endDate.getMonth()]}`,
            label,
            generated,
            date: new Date(endDate),
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
        });
    }
    return weeks;
};

const getMonths = (baseDate: Date) => {
    const months = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (let i = 0; i < 5; i++) {
        const endDate = new Date(baseDate);
        endDate.setDate(endDate.getDate() - (i * 30));
        
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 30);
        
        const name = `Monthly Report: ${endDate.getDate()} ${monthNames[endDate.getMonth()]} ${endDate.getFullYear()}`;
        const generated = `${monthNames[endDate.getMonth()]} ${endDate.getFullYear()}`;

        months.push({
            name,
            label: `${startDate.getDate()} ${monthNames[startDate.getMonth()]} - ${endDate.getDate()} ${monthNames[endDate.getMonth()]} ${endDate.getFullYear()}`,
            generated,
            date: new Date(endDate),
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
        });
    }
    return months;
};

export default function ReportsPage() {
    const userId = getUserIdFromToken();
    const { selectedBusiness, selectedAddress } = useSelector((state: any) => state.business);

    const subscriptionToken = getSubscriptionFromCookie();
    const reportPlan = subscriptionToken?.reportPlan || ["WEEKLY", "MONTHLY"];
    const initialViewMode = reportPlan.includes("MONTHLY") ? "Monthly" : "Weekly";

    const [viewMode, setViewMode] = useState<"Weekly" | "Monthly">(initialViewMode);
    const [baseDate, setBaseDate] = useState(new Date());
    const [activeIndex, setActiveIndex] = useState(0);

    const timeframes = useMemo(() => {
        return viewMode === "Weekly" ? getWeeks(baseDate) : getMonths(baseDate);
    }, [viewMode, baseDate]);

    const activeReport = timeframes[activeIndex] || timeframes[0];

    const { currentData: reportData, isLoading, isFetching } = useGetMonthlyReportQuery(
        {
            user_id: userId || "",
            business_name: selectedBusiness || "",
            report_frequency: viewMode.toLowerCase() as "weekly" | "monthly",
            start_date: activeReport?.startDate,
            end_date: activeReport?.endDate,
            address: selectedAddress || "",
        },
        { skip: !userId || !selectedBusiness || !activeReport }
    );

    const dynamicStats = useMemo(() => {
        const kpis = reportData?.kpis;
        
        const formatTrend = (change: number | null | undefined, isPercent: boolean = false) => {
            const val = change ?? 0;
            const sign = val > 0 ? "+" : "";
            return `${sign}${isPercent ? val : val.toFixed(1)}${isPercent ? "%" : ""} vs prev`;
        };

        return [
            { 
                label: "Avg. Rating", 
                value: kpis?.avg_rating.value?.toFixed(1) || "0.0", 
                trend: formatTrend(kpis?.avg_rating.change), 
                color: (kpis?.avg_rating.change || 0) >= 0 ? "text-green-600" : "text-red-500" 
            },
            { 
                label: "Reviews", 
                value: kpis?.reviews.value?.toString() || "0", 
                trend: formatTrend(kpis?.reviews.change, true).replace(".0", ""), 
                color: (kpis?.reviews.change || 0) >= 0 ? "text-green-600" : "text-red-500" 
            },
            { 
                label: "Satisfaction", 
                value: (kpis?.satisfaction.value || 0).toString() + "%", 
                trend: formatTrend(kpis?.satisfaction.change, true), 
                color: (kpis?.satisfaction.change || 0) >= 0 ? "text-green-600" : "text-red-500" 
            },
            { 
                label: "Response Rate", 
                value: (kpis?.response_rate.value || 0).toString() + "%", 
                trend: formatTrend(kpis?.response_rate.change, true), 
                color: (kpis?.response_rate.change || 0) >= 0 ? "text-green-600" : "text-red-500" 
            },
        ];
    }, [reportData]);

    return (
        <div className="flex flex-col lg:flex-row gap-8 pb-12">
            {/* Sidebar List */}
            <div className="w-full lg:w-80 space-y-8 flex-shrink-0">
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="font-bold text-gray-900">All Reports</h3>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full capitalize">
                            {viewMode}
                        </span>
                    </div>
                    <div className="space-y-3">
                        {isLoading || isFetching ? (
                            [...Array(5)].map((_, i) => (
                                <div key={i} className="p-4 user-card rounded-xl space-y-2">
                                    <div className="flex gap-3">
                                        <Skeleton className="size-5 rounded" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-1/2" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : timeframes.map((report, i) => (
                            <div
                                key={i}
                                onClick={() => setActiveIndex(i)}
                                className={cn(
                                    "p-4 rounded-xl border transition-all cursor-pointer group",
                                    activeIndex === i
                                        ? "bg-blue-50 border-blue-200 shadow-sm"
                                        : "user-card hover:shadow-md"
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <FileText className={cn(
                                        "size-5 shrink-0",
                                        activeIndex === i ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                                    )} />
                                    <div className="min-w-0">
                                        <h4 className={cn(
                                            "text-sm font-semibold truncate",
                                            activeIndex === i ? "text-blue-900" : "text-gray-700"
                                        )}>{report.name}</h4>
                                        <p className="text-[11px] text-gray-400 mt-0.5 truncate">{report.label}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={cn(
                                                "text-[10px] px-1.5 py-0.5 rounded font-medium",
                                                activeIndex === i ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                                            )}>Generated</span>
                                            <span className="text-[10px] text-gray-400">{report.generated}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 px-1">Auto-Schedule</h3>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Calendar className="size-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-700">Monthly Report</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-400">1st of month</span>
                                <div className="w-9 h-5 bg-blue-600 rounded-full relative cursor-pointer">
                                    <div className="absolute right-1 top-1 size-3 bg-white rounded-full shadow-sm" />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Settings className="size-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-700">Email Delivery</span>
                            </div>
                            <div className="w-9 h-5 bg-blue-600 rounded-full relative cursor-pointer">
                                <div className="absolute right-1 top-1 size-3 bg-white rounded-full shadow-sm" />
                            </div>
                        </div>
                    </div>
                </div> */}
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{viewMode} Reports</h1>
                        <p className="text-sm text-gray-500 mt-1">Generated business intelligence reports</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="w-40">
                            <StylishDropdown
                                options={[
                                    ...(reportPlan.includes("WEEKLY") ? [{ label: "Weekly View", value: "Weekly" }] : []),
                                    ...(reportPlan.includes("MONTHLY") ? [{ label: "Monthly View", value: "Monthly" }] : [])
                                ]}
                                value={viewMode}
                                onChange={(val) => {
                                    setViewMode(val as "Weekly" | "Monthly");
                                    setActiveIndex(0);
                                }}
                                className="!min-h-[40px] h-10"
                            />
                        </div>
                        <div className="relative">
                            <input
                                type="date"
                                value={baseDate.toISOString().split('T')[0]}
                                onChange={(e) => {
                                    const newDate = new Date(e.target.value);
                                    if (!isNaN(newDate.getTime())) {
                                        setBaseDate(newDate);
                                        setActiveIndex(0);
                                    }
                                }}
                                className="h-10 px-4 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:border-blue-600 cursor-pointer"
                            />
                        </div>
                        <div className="h-8 w-[1px] bg-gray-200 mx-1 hidden sm:block" />
                        <div className="flex gap-2">
                            <button 
                                onClick={() => reportData && downloadReportPDF(reportData, selectedBusiness, selectedAddress)}
                                disabled={!reportData || isFetching}
                                className="text-nowrap cursor-pointer p-2.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50" 
                                title="Download PDF"
                            >
                                <Download className="size-4" />
                            </button>
                            <button 
                                onClick={() => reportData && downloadReportExcel(reportData, selectedBusiness)}
                                disabled={!reportData || isFetching}
                                className="text-nowrap cursor-pointer p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50" 
                                title="Download Excel"
                            >
                                <Download className="size-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="user-card rounded-3xl p-6 md:p-8 space-y-8">
                    {isFetching ? (
                        <div className="space-y-8 animate-pulse">
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-64" />
                                <Skeleton className="h-4 w-48" />
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                                    {[...Array(4)].map((_, i) => (
                                        <Skeleton key={i} className="h-20 w-full rounded-xl" />
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-24 w-full rounded-xl" />
                            </div>
                            <div className="space-y-4">
                                <Skeleton className="h-6 w-48" />
                                <div className="grid grid-cols-2 gap-8">
                                    <Skeleton className="h-48 w-full rounded-xl" />
                                    <Skeleton className="h-48 w-full rounded-xl" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Report Header */}
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{activeReport.name}</h2>
                                <p className="text-sm text-gray-500 mt-1">Period: {activeReport.label}</p>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                                    {dynamicStats.map((stat, i) => (
                                        <div key={i} className="p-4 bg-gray-50 rounded-xl">
                                            <p className="text-xs font-medium text-gray-500">{stat.label}</p>
                                            <h4 className="text-xl font-bold text-gray-900 mt-1">{stat.value}</h4>
                                            <p className={cn("text-[10px] font-bold mt-1", stat.color)}>{stat.trend}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Executive Summary */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-3">1. Executive Summary</h3>
                                <div className="bg-blue-50/50 p-4 rounded-xl text-sm text-blue-900 leading-relaxed border border-blue-100">
                                    {reportData?.executive_summary || "No data available for this period."}
                                </div>
                            </div>

                            {/* Charts */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4">2. Review Volume & Rating Trends</h3>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="h-48 w-full">
                                        <p className="text-xs text-gray-500 mb-2">Review Volume by {viewMode === "Weekly" ? "Period" : "Week"}</p>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={reportData?.review_volume_trend || []}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} labelStyle={{ color: '#111827', fontWeight: 'bold' }} />
                                                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="h-48 w-full">
                                        <p className="text-xs text-gray-500 mb-2">Rating Trend</p>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={reportData?.rating_trend || []}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                                <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} labelStyle={{ color: '#111827', fontWeight: 'bold' }} />
                                                <Line type="monotone" dataKey="rating" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Sentiment Breakdown */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-3">3. Sentiment Breakdown</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-green-50 rounded-xl">
                                        <p className="text-xs font-bold text-green-700">Positive</p>
                                        <p className="text-2xl font-bold text-green-900 mt-1">{reportData?.sentiment_breakdown.positive.percent || 0}%</p>
                                        <p className="text-[10px] text-green-600 mt-1">{reportData?.sentiment_breakdown.positive.count || 0} reviews</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <p className="text-xs font-bold text-gray-600">Neutral</p>
                                        <p className="text-2xl font-bold text-gray-800 mt-1">{reportData?.sentiment_breakdown.neutral.percent || 0}%</p>
                                        <p className="text-[10px] text-gray-500 mt-1">{reportData?.sentiment_breakdown.neutral.count || 0} reviews</p>
                                    </div>
                                    <div className="p-4 bg-red-50 rounded-xl">
                                        <p className="text-xs font-bold text-red-700">Negative</p>
                                        <p className="text-2xl font-bold text-red-900 mt-1">{reportData?.sentiment_breakdown.negative.percent || 0}%</p>
                                        <p className="text-[10px] text-red-600 mt-1">{reportData?.sentiment_breakdown.negative.count || 0} reviews</p>
                                    </div>
                                </div>
                            </div>

                            {/* Lists */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-3">4. Top Complaints</h3>
                                    <div className="space-y-2">
                                        {reportData?.top_complaints && reportData.top_complaints.length > 0 ? (
                                            reportData.top_complaints.map((item: any, i) => (
                                                <div key={i} className="flex justify-between items-center p-3 bg-red-50/50 rounded-lg text-sm">
                                                    <span className="font-semibold text-gray-800">{typeof item === 'object' ? (item.issue || item.complaint || item.label) : item}</span>
                                                    {typeof item === 'object' && item.mentions && (
                                                        <span className="text-[10px] text-gray-500">{item.mentions} mentions</span>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-3 text-sm text-gray-400 italic">No major complaints reported.</div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-3">5. Top Praises</h3>
                                    <div className="space-y-2">
                                        {reportData?.top_praises && reportData.top_praises.length > 0 ? (
                                            reportData.top_praises.map((item: any, i) => (
                                                <div key={i} className="flex justify-between items-center p-3 bg-green-50/50 rounded-lg text-sm">
                                                    <span className="font-semibold text-gray-800">{typeof item === 'object' ? (item.strength || item.praise || item.label) : item}</span>
                                                    {typeof item === 'object' && item.mentions && (
                                                        <span className="text-[10px] text-gray-500">{item.mentions} mentions</span>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-3 text-sm text-gray-400 italic">No major praises reported.</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* AI Recommendations */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-3">6. AI Recommendations</h3>
                                <div className="space-y-3">
                                    {reportData?.ai_recommendations && reportData.ai_recommendations.length > 0 ? (
                                        reportData.ai_recommendations.map((rec, i) => (
                                            <div key={i} className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                                                <h4 className="text-sm font-bold text-blue-900">{rec.title}</h4>
                                                <p className="text-xs text-blue-800/80 mt-1 leading-relaxed">{rec.description}</p>
                                                <p className="text-[10px] font-bold text-blue-600 mt-2 uppercase tracking-wider">{rec.estimated_impact}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-400 italic text-center">No recommendations available.</div>
                                    )}
                                </div>
                            </div>

                            {/* Action Plan */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-3">7. Recommended Action Plan</h3>
                                <div className="space-y-2">
                                    {reportData?.action_plan && reportData.action_plan.length > 0 ? (
                                        reportData.action_plan.map((step, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <div className="flex items-center justify-center size-5 rounded-full bg-blue-600 text-white text-xs flex-shrink-0">
                                                    {i + 1}
                                                </div>
                                                <span className="text-sm text-gray-700 font-medium">{step}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-3 text-sm text-gray-400 italic text-center bg-gray-50 rounded-xl">No action plan generated.</div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
