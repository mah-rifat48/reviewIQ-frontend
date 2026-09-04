"use client";

import React, { useState } from "react";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import {
    TrendingUp,
    TrendingDown,
    Lightbulb,
    Settings,
    Users,
    Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useSelector } from "react-redux";
import { useGetAiInsightsQuery, useUpdateRecommendationStatusMutation, useGenerateMoreRecommendationsMutation } from "@/redux/api/AI/aiInsightsApi";
import { getUserIdFromToken } from "@/utils/authUtils";
import { toast } from "react-hot-toast";
import Link from "next/link";
import Skeleton from "@/components/ui/Skeleton";

export default function AIInsightsPage() {
    // Get business context from Redux
    const selectedBusiness = useSelector((state: any) => state.business.selectedBusiness);
    const selectedAddress = useSelector((state: any) => state.business.selectedAddress);
    const userId = getUserIdFromToken();

    // Fetch live insights
    const { currentData: insights, isLoading, isFetching } = useGetAiInsightsQuery(
        { userId: userId || "", businessName: selectedBusiness || "", address: selectedAddress || "" },
        { skip: !userId || !selectedBusiness }
    );

    const [updateStatus] = useUpdateRecommendationStatusMutation();
    const [generateMoreRecommendations, { isLoading: isGenerating }] = useGenerateMoreRecommendationsMutation();

    const handleGenerateMore = async () => {
        if (!userId || !selectedBusiness) return;
        try {
            await generateMoreRecommendations({
                userId,
                businessName: selectedBusiness,
                address: selectedAddress || ""
            }).unwrap();
            toast.success("New recommendations generated successfully!");
        } catch (error) {
            toast.error("Failed to generate recommendations.");
        }
    };

    if (isLoading || isFetching) {
        return (
            <div className="space-y-8 pb-12">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>

                {/* Health Score Skeleton */}
                <div className="bg-blue-50/50 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 border border-blue-100">
                    <div className="flex-1 space-y-6">
                        <div className="flex items-start gap-4">
                            <Skeleton className="size-12 rounded-2xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-4 w-64" />
                            </div>
                        </div>
                        <Skeleton className="h-16 w-32" />
                        <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                    <Skeleton className="w-full md:w-[400px] h-48 rounded-2xl" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="user-card p-6 rounded-3xl min-h-[400px]">
                        <Skeleton className="h-6 w-48 mb-6" />
                        <Skeleton className="h-[300px] w-full" />
                    </div>
                    <div className="user-card p-6 rounded-3xl space-y-4">
                        <Skeleton className="h-6 w-32 mb-6" />
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="user-card p-8 rounded-3xl space-y-6">
                            <div className="flex gap-4">
                                <Skeleton className="h-6 w-1/2" />
                                <Skeleton className="h-6 w-24 rounded-full" />
                            </div>
                            <Skeleton className="h-20 w-full" />
                            <div className="grid grid-cols-3 gap-4">
                                <Skeleton className="h-16 w-full rounded-2xl" />
                                <Skeleton className="h-16 w-full rounded-2xl" />
                                <Skeleton className="h-16 w-full rounded-2xl" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!insights) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="bg-gray-100 p-6 rounded-full mb-6">
                    <Lightbulb className="size-12 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No Insights Available</h2>
                <p className="text-gray-500 max-w-md">
                    Please ensure you have selected a business from the sidebar and added your goals and competitors to generate AI insights.
                </p>
            </div>
        );
    }

    // Transform radar data
    const radarData = Object.entries(insights.performance_by_category || {}).map(([category, value]) => ({
        subject: category,
        A: value,
        fullMark: 100
    }));

    const recommendations = insights.actionable_recommendations?.slice(0, 3) || [];

    const handleMarkAsAddressed = async (title: string) => {
        if (!userId) return;
        try {
            await updateStatus({
                userId,
                title,
                status: "read"
            }).unwrap();
            toast.success("Recommendation marked as addressed!");
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Insights & Recommendations</h1>
                <p className="text-gray-500 text-sm mt-1">Data-driven insights to improve your business</p>
            </div>

            {/* Overall Business Health Score */}
            <div className="bg-blue-100/50 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-8 border border-blue-100">
                <div className="flex-1 space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="p-3">
                            <Image src="/magicpen.svg" alt="Magic Pen" width={34} height={34} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Overall Business Health Score</h2>
                            <p className="text-sm text-gray-500 mt-1">Based on customer feedback, sentiment analysis, and performance trends</p>
                        </div>
                    </div>
                    <div className="flex items-end gap-3 mt-4">
                        <span className="text-6xl font-bold text-gray-900">{insights.business_health_score}</span>
                        <span className="text-xl font-medium text-gray-400 mb-2">/100</span>
                    </div>
                    <div className="flex items-center text-sm font-medium text-blue-600 w-fit rounded-full">
                        <TrendingUp className="size-4 mr-1.5" />
                        Live data analysis
                    </div>
                </div>
                
                {/* Business Picture */}
                <div className="w-full md:w-[400px] h-48 rounded-2xl overflow-hidden shadow-lg relative group">
                    <img
                        src={insights.business_picture.photo_url || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2047&auto=format&fit=crop"}
                        alt={selectedBusiness || "Business Image"}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
                        <div className="flex flex-col gap-1.5">
                            {/* <span className="text-white/90 text-xs font-semibold flex items-center gap-1.5">
                                <div className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                                Live Location Data
                            </span> */}
                            {insights.rating && (
                                <RatingStars rating={insights.rating} count={insights.count} />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance & Quick Insights Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Radar Chart */}
                <div className="user-card p-6 rounded-3xl min-h-[400px]">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Performance by Category</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#e5e7eb" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    labelStyle={{ color: '#111827', fontWeight: 'bold' }} 
                                />
                                <Radar
                                    name="Performance"
                                    dataKey="A"
                                    stroke="var(--primary-brand)"
                                    strokeWidth={2}
                                    fill="#52c6d8"
                                    fillOpacity={0.3}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quick Insights */}
                <div className="user-card p-6 rounded-3xl space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Quick Insights</h3>

                    {/* Love */}
                    <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="size-4 text-green-600" />
                            <h4 className="font-bold text-gray-900 text-sm">What Customers Love</h4>
                        </div>
                        <p className="text-sm text-green-800 leading-relaxed">
                            {insights.quick_insights.what_customers_love}
                        </p>
                    </div>

                    {/* Dislike */}
                    <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingDown className="size-4 text-red-600" />
                            <h4 className="font-bold text-gray-900 text-sm">What Customers Dislike</h4>
                        </div>
                        <p className="text-sm text-red-800 leading-relaxed">
                            {insights.quick_insights.what_customers_dislike}
                        </p>
                    </div>

                    {/* Opportunities */}
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="size-4 text-blue-600" />
                            <h4 className="font-bold text-gray-900 text-sm">Emerging Opportunities</h4>
                        </div>
                        <p className="text-sm text-blue-800 leading-relaxed">
                            {insights.quick_insights.emerging_opportunities}
                        </p>
                    </div>
                </div>
            </div>

            {/* Trends Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Emerging Trends */}
                <div className="user-card p-6 rounded-3xl">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Emerging Trends</h3>
                    <div className="space-y-3">
                        {insights.emerging_trends?.map((trend, i) => (
                            <div key={i} className="flex flex-col p-4 bg-green-50/50 rounded-2xl border border-green-100/50">
                                <span className="text-sm font-semibold text-gray-900">{trend.trend}</span>
                                <span className="text-xs text-green-600 font-medium mt-1">{trend.mentions} mentions</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Declining Areas */}
                <div className="user-card p-6 rounded-3xl">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Declining Areas</h3>
                    <div className="space-y-3">
                        {insights.declining_areas?.map((area, i) => (
                            <div key={i} className="flex flex-col p-4 bg-red-50/50 rounded-2xl border border-red-100/50">
                                <span className="text-sm font-semibold text-gray-900">{area.trend}</span>
                                <span className="text-xs text-red-600 font-medium mt-1">{area.mentions} mentions</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Actionable Recommendations */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-gray-100 rounded-lg">
                            <Settings className="size-5 text-gray-700" />
                        </div>
                        <h3 className="sm:text-xl text-lg font-bold text-gray-900">Actionable Recommendations</h3>
                    </div>
                    <Link 
                        href="/ai-insights/all-recommendation"
                        className="sm:text-sm text-xs font-medium text-blue-600 hover:text-blue-700 cursor-pointer text-nowrap"
                    >
                        View All
                    </Link>
                </div>

                {recommendations?.map((plan, i) => (
                    <div key={i} className="user-card p-6 md:p-8 rounded-3xl">
                        <div className="flex items-center gap-4 mb-4">
                            <h4 className="text-lg font-bold text-gray-900">{plan.title}</h4>
                            <span className={cn(
                                "px-3 py-1 rounded-full text-xs font-semibold text-nowrap",
                                plan.priority === "High" ? "bg-red-100 text-red-600" : 
                                plan.priority === "Medium" ? "bg-amber-100 text-amber-600" : 
                                "bg-blue-100 text-blue-600"
                            )}>
                                {plan.priority} Priority
                            </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-6 max-w-4xl leading-relaxed">
                            {plan.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="p-4 bg-gray-50 rounded-2xl">
                                <span className="text-xs text-gray-500 font-medium">Evidence</span>
                                <p className="text-sm text-gray-900 font-semibold mt-1">{plan.evidence}</p>
                            </div>
                            <div className="p-4 bg-amber-50 rounded-2xl">
                                <span className="text-xs text-amber-600/80 font-medium">Business Impact</span>
                                <p className="text-sm text-amber-900 font-semibold mt-1">{plan.business_impact}</p>
                            </div>
                            <div className="p-4 bg-green-50 rounded-2xl">
                                <span className="text-xs text-green-600/80 font-medium">Expected Improvement</span>
                                <p className="text-sm text-green-900 font-semibold mt-1">{plan.expected_improvement || plan.improvement}</p>
                            </div>
                        </div>

                        <div className="bg-blue-100/50 p-6 rounded-2xl border border-blue-100">
                            <h5 className="font-bold text-blue-900 text-sm mb-4">Recommended Actions</h5>
                            <div className="space-y-3 mb-6">
                                {(plan.actions || plan.actions_to_do)?.map((step, j) => (
                                    <div key={j} className="flex items-center gap-3">
                                        <div className="flex items-center justify-center size-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold shrink-0">
                                            {j + 1}
                                        </div>
                                        <span className="text-sm text-gray-700">{step}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => handleMarkAsAddressed(plan.title)}
                            className="cursor-pointer px-6 py-2.5 bg-blue-600 mt-4 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                        >
                            Mark as Addressed
                        </button>
                    </div>
                ))}
            </div>

            {/* Help Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-[#8B5CF6] p-8 md:p-12 text-white">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="max-w-2xl">
                        <h3 className="text-2xl md:text-3xl font-bold mb-3">Need Help Implementing These Changes?</h3>
                        <p className="text-purple-100 text-sm md:text-base leading-relaxed">
                            Our expert consultants can help you implement these recommendations with tailored training programs, operational improvements, and ongoing support.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
                            <div className="flex items-start gap-3">
                                <Users className="size-5 text-white shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-sm">Staff Training</p>
                                    <p className="text-[10px] text-purple-200 mt-0.5">Customer service & efficiency programs</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Settings className="size-5 text-white shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-sm">Operations Consulting</p>
                                    <p className="text-[10px] text-purple-200 mt-0.5">Process optimization & workflows</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Briefcase className="size-5 text-white shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-sm">Performance Programs</p>
                                    <p className="text-[10px] text-purple-200 mt-0.5">Ongoing improvement support</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleGenerateMore}
                        disabled={isGenerating}
                        className="cursor-pointer flex-shrink-0 px-8 py-3 bg-white text-purple-600 font-bold rounded-xl hover:bg-purple-50 transition-all shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? "Generating..." : "Request Solution"}
                    </button>
                </div>

                <div className="absolute top-0 right-0 -mr-20 -mt-20 size-96 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 size-96 rounded-full bg-white/10 blur-3xl" />
            </div>
        </div>
    );
}

function RatingStars({ rating, count }: { rating: number; count?: number }) {
    return (
        <div className="flex items-center gap-1 mt-0.5">
            <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => {
                    const fillPercentage = Math.min(Math.max(rating - i, 0), 1) * 100;
                    return (
                        <div key={i} className="relative size-4">
                            {/* Background (empty) star */}
                            <Star className="absolute inset-0 size-4 text-amber-400/30" />
                            {/* Foreground (filled) star */}
                            <div 
                                className="absolute inset-0 overflow-hidden" 
                                style={{ width: `${fillPercentage}%` }}
                            >
                                <Star className="size-4 fill-amber-400 text-amber-400" />
                            </div>
                        </div>
                    );
                })}
            </div>
            <span className="text-white text-sm font-bold ml-1.5">{rating.toFixed(1)}</span>
            {count && <span className="text-white/70 text-xs ml-1 font-medium">({count} reviews)</span>}
        </div>
    );
}

function Star({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    )
}
