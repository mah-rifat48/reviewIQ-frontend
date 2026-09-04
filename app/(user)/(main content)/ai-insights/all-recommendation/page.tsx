"use client";

import React from "react";
import { useSelector } from "react-redux";
import { useGetAiInsightsQuery, useUpdateRecommendationStatusMutation } from "@/redux/api/AI/aiInsightsApi";
import { getUserIdFromToken } from "@/utils/authUtils";
import { cn } from "@/lib/utils";
import { Settings, ArrowLeft, Loader2, Lightbulb } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function AllRecommendationsPage() {
    const selectedBusiness = useSelector((state: any) => state.business.selectedBusiness);
    const selectedAddress = useSelector((state: any) => state.business.selectedAddress);
    const userId = getUserIdFromToken();

    const { data: insights, isLoading } = useGetAiInsightsQuery(
        { userId: userId || "", businessName: selectedBusiness || "", address: selectedAddress || "" },
        { skip: !userId || !selectedBusiness }
    );

    const [updateStatus] = useUpdateRecommendationStatusMutation();

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

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="size-12 text-blue-600 animate-spin" />
                <p className="text-gray-500 font-medium">Loading recommendations...</p>
            </div>
        );
    }

    if (!insights || !insights.actionable_recommendations || insights.actionable_recommendations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="bg-gray-100 p-6 rounded-full mb-6">
                    <Lightbulb className="size-12 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No Recommendations Found</h2>
                <Link href="/ai-insights" className="text-blue-600 font-medium hover:underline flex items-center gap-2">
                    <ArrowLeft size={16} /> Back to Insights
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <Link href="/ai-insights" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1.5 mb-2 transition-colors">
                        <ArrowLeft size={14} /> Back to Insights
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">All Recommendations</h1>
                    <p className="text-gray-500 text-sm mt-1">Complete list of AI-driven improvements for {selectedBusiness}</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-100">
                    <Settings className="size-4 text-blue-600" />
                    <span className="text-sm font-bold text-blue-900">{insights.actionable_recommendations?.length || 0} Suggestions</span>
                </div>
            </div>

            {/* Recommendations List */}
            <div className="space-y-6">
                {insights.actionable_recommendations?.map((plan, i) => (
                    <div key={i} className="user-card p-6 md:p-8 rounded-3xl transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                            <h4 className="text-lg font-bold text-gray-900">{plan.title}</h4>
                            <span className={cn(
                                "px-3 py-1 rounded-full text-xs font-semibold w-fit",
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
                                <span className="text-xs text-gray-500 font-medium tracking-tight">Evidence</span>
                                <p className="text-sm text-gray-900 font-semibold mt-1">{plan.evidence}</p>
                            </div>
                            <div className="p-4 bg-amber-50 rounded-2xl">
                                <span className="text-xs text-amber-600/80 font-medium tracking-tight">Business Impact</span>
                                <p className="text-sm text-amber-900 font-semibold mt-1">{plan.business_impact}</p>
                            </div>
                            <div className="p-4 bg-green-50 rounded-2xl">
                                <span className="text-xs text-green-600/80 font-medium tracking-tight">Expected Improvement</span>
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
        </div>
    );
}
