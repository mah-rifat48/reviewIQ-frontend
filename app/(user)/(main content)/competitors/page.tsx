"use client";

import React, { useState, useEffect } from "react";
import { Plus, Zap, AlertCircle, CheckCircle, Award, Target, Building2, MapPin, User, X, Loader2 } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Legend
} from "recharts";
import { cn } from "@/lib/utils";
import { useSelector } from "react-redux";
import { useSetGoalsMutation } from "@/redux/api/AI/signupflowApi";
import { useGetCompetitorAnalysisQuery } from "@/redux/api/AI/competitorsApi";
import { getUserIdFromToken, getSubscriptionFromCookie } from "@/utils/authUtils";
import { useRouter } from "next/navigation";
import StylishDropdown from "@/components/ui/StylishDropdown";
import Skeleton from "@/components/ui/Skeleton";
import { toast } from "react-hot-toast";

// Mock Data


export default function CompetitorsPage() {
    const { selectedBusiness, selectedAddress } = useSelector((state: any) => state.business);
    const userId = getUserIdFromToken();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const subscriptionToken = getSubscriptionFromCookie();
    
    useEffect(() => {
        if (subscriptionToken && subscriptionToken.competitor === false) {
            router.push("/dashboard");
        }
    }, [subscriptionToken, router]);

    if (subscriptionToken && subscriptionToken.competitor === false) {
        return null;
    }
    
    const [form, setForm] = useState({
        competitors: '',
        selectedGoals: [] as string[]
    });

    const [setGoalsApi] = useSetGoalsMutation();

    const { currentData: analysisData, isLoading: isAnalysisLoading, isFetching } = useGetCompetitorAnalysisQuery(
        { userId: userId || "", businessName: selectedBusiness || "", address: selectedAddress || "" },
        { skip: !userId || !selectedBusiness }
    );

    // Transform API data for UI components
    const competitors = analysisData?.cards.map((card, i) => ({
        ...card,
        sentiment: `${card.sentiment}%`,
        response: `${card.response_rate}%`,
        isBusiness: i === 0 // Assuming the first card is the user's business
    })) || [];

    const performanceComparisonData = analysisData ? [
        { 
            name: "Rating", 
            ...Object.fromEntries(analysisData.performance_comparison.rating.map(d => [d.name, (d.value / 5) * 100])) 
        },
        { 
            name: "Volume", 
            ...Object.fromEntries(analysisData.performance_comparison.reviews.map(d => {
                const maxReviews = Math.max(...analysisData.performance_comparison.reviews.map(rd => rd.value), 1);
                return [d.name, (d.value / maxReviews) * 100];
            })) 
        },
        { 
            name: "Sentiment", 
            ...Object.fromEntries(analysisData.performance_comparison.sentiment.map(d => [d.name, d.value])) 
        },
        { 
            name: "Response Rate", 
            ...Object.fromEntries(analysisData.performance_comparison.response_rate.map(d => [d.name, d.value])) 
        },
    ] : [];

    const subjects = ["Service", "Quality", "Atmosphere", "Value", "Cleanliness"];
    const radarData = subjects.map(subject => {
        const row: any = { subject, fullMark: 100 };
        if (analysisData) {
            Object.keys(analysisData.category_radar).forEach(businessName => {
                row[businessName] = (analysisData.category_radar as any)[businessName][subject];
            });
        }
        return row;
    });

    const criteria = analysisData?.criteria_comparison.map(c => ({
        label: c.criteria,
        score: c.my_score,
        competitorAvg: c.competitor_avg,
        leader: `${c.leader.name} (${c.leader.score})`
    })) || [];

    const advantages = analysisData?.competitive_advantages.map(a => ({
        title: a.title,
        desc: a.description,
        action: `Strength: ${a.strength}`
    })) || [];

    const whereCompetitorsExcel = analysisData?.where_competitors_excel.map(e => ({
        title: e.title,
        desc: e.description,
        action: `Opportunity: ${e.opportunity}`
    })) || [];

    const strategicRecs = analysisData?.strategic_recommendations || [];

    const handleSubmit = async () => {
        if (!selectedBusiness || !selectedAddress || !userId) return;
        setIsLoading(true);

        const goalMapping: { [key: string]: string } = {
            "Improve customer satisfaction": "improve_customer_satisfaction",
            "Improve service speed": "improve_service_speed",
            "Increase ratings": "increase_ratings"
        };

        const payload = {
            businesses: [{
                business_name: selectedBusiness,
                location: selectedAddress,
                competitors_urls: form.competitors.split(',')
                    .map((c: string) => c.trim())
                    .filter((c: string) => c !== "")
                    .map((c: string) => c.replace(/^https?:\/\//, '')),
                goals: form.selectedGoals.map((g: string) => goalMapping[g] || g)
            }],
            user_id: userId
        };

        try {
            await setGoalsApi(payload).unwrap();
            setIsModalOpen(false);
            setForm({ competitors: '', selectedGoals: [] });
            toast.success("Competitor data saved successfully!");
        } catch (err: any) {
            console.error("Error saving competitor data:", err);
            toast.error("Failed to save data. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isModalOpen]);

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Competitor Analysis</h1>
                    <p className="text-sm text-gray-500 mt-1">Benchmark your performance against competitors</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus className="size-4" />
                    Add Competitor
                </button>
            </div>

            {isAnalysisLoading || isFetching ? (
                <div className="space-y-8 pb-12">
                    {/* Competitor Cards Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="p-5 user-card rounded-2xl space-y-4">
                                <Skeleton className="h-6 w-3/4" />
                                <div className="space-y-2">
                                    {[...Array(4)].map((_, j) => (
                                        <div key={j} className="flex justify-between">
                                            <Skeleton className="h-3 w-16" />
                                            <Skeleton className="h-3 w-10" />
                                        </div>
                                    ))}
                                </div>
                                <Skeleton className="h-10 w-full rounded-lg mt-4" />
                            </div>
                        ))}
                    </div>

                    {/* Performance Comparison Skeleton */}
                    <div className="user-card p-8 rounded-3xl">
                        <Skeleton className="h-6 w-48 mb-6" />
                        <Skeleton className="h-[300px] w-full" />
                    </div>

                    {/* Criteria Comparison Skeleton */}
                    <div className="user-card p-8 rounded-3xl space-y-8">
                        <Skeleton className="h-6 w-48" />
                        <div className="space-y-6">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                    <Skeleton className="h-2 w-full rounded-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : analysisData ? (
                <>
                {/* Competitor Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {competitors.map((comp, i) => (
                    <div
                        key={i}
                        className={cn(
                            "p-5 rounded-2xl border shadow-sm",
                            comp.isBusiness ? "bg-blue-50/50 border-blue-200" : "user-card"
                        )}
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 mb-4">{comp.name}</h3>
                            {comp.isBusiness && (
                                <div className="mb-2">
                                    <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1.5 rounded-full uppercase">Your Business</span>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 flex items-center gap-1"><span className="text-amber-400">★</span> Rating</span>
                                <span className="font-bold text-gray-900">{comp.rating}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Reviews</span>
                                <span className="font-bold text-gray-900">{comp.reviews}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Sentiment</span>
                                <span className="font-bold text-gray-900">{comp.sentiment}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Response</span>
                                <span className="font-bold text-gray-900">{comp.response}</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => comp.map_url && window.open(comp.map_url, '_blank')}
                            className="cursor-pointer w-full mt-4 py-2 text-sm font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!comp.map_url}
                        >
                            Show on Google
                        </button>
                    </div>
                ))}
            </div>

            {/* Performance Comparison Bar Chart */}
            <div className="user-card p-6 md:p-8 rounded-3xl">
                <h3 className="font-bold text-gray-900 mb-6">Performance Comparison</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={performanceComparisonData} barSize={40}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} labelStyle={{ color: '#111827', fontWeight: 'bold' }} />
                            <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '10px' }} />
                            {competitors.map((comp, idx) => (
                                <Bar 
                                    key={comp.name} 
                                    dataKey={comp.name} 
                                    fill={idx === 0 ? "#3b82f6" : idx === 1 ? "#10b981" : idx === 2 ? "#f59e0b" : "#8b5cf6"} 
                                    name={comp.isBusiness ? `${comp.name} (You)` : comp.name} 
                                    radius={[4, 4, 0, 0]} 
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Category Radar Chart */}
            <div className="user-card p-6 md:p-8 rounded-3xl">
                <h3 className="font-bold text-gray-900 mb-6">Category Performance Radar</h3>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                            <PolarGrid stroke="#e5e7eb" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 500 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ 
                                    borderRadius: '12px', 
                                    border: 'none', 
                                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                    fontSize: '12px'
                                }} 
                                labelStyle={{ color: '#111827', fontWeight: 'bold' }} 
                            />

                            {competitors.map((comp, idx) => (
                                <Radar 
                                    key={comp.name} 
                                    name={comp.name} 
                                    dataKey={comp.name} 
                                    stroke={idx === 0 ? "#3b82f6" : idx === 1 ? "#10b981" : idx === 2 ? "#f59e0b" : "#8b5cf6"} 
                                    fill={idx === 0 ? "#3b82f6" : idx === 1 ? "#10b981" : idx === 2 ? "#f59e0b" : "#8b5cf6"} 
                                    fillOpacity={0.1} 
                                />
                            ))}

                            <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '10px' }} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Criteria Comparison Progress Bars */}
            <div className="user-card p-6 md:p-8 rounded-3xl space-y-8">
                <h3 className="font-bold text-gray-900">Criteria Comparison</h3>
                <div className="space-y-6">
                    {criteria.map((c, i) => (
                        <div key={i} className="space-y-2">
                            <div className="flex justify-between text-sm font-semibold text-gray-700">
                                <span>{c.label}</span>
                                <span className="text-gray-400 font-normal">Leader: {c.leader}</span>
                            </div>
                            <div className="relative h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div className="absolute top-0 bottom-0 bg-gray-400 w-full" style={{ width: `${(c.competitorAvg / 5) * 100}%` }} />
                                <div className="absolute top-0 bottom-0 bg-blue-600 z-10 rounded-full" style={{ width: `${(c.score / 5) * 100}%` }} />
                            </div>
                            <div className="flex justify-between text-sm font-medium">
                                <span className="text-blue-600">Your Score: {c.score}</span>
                                <span className="text-gray-500">Competitor Avg: {c.competitorAvg}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Excel & Advantages Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Where Competitors Excel */}
                <div className="user-card p-6 rounded-3xl">
                    <div className="flex items-center gap-2 mb-6">
                        <AlertCircle className="size-5 text-orange-500" />
                        <h3 className="font-bold text-gray-900">Where Competitors Excel</h3>
                    </div>
                    <div className="space-y-4">
                        {whereCompetitorsExcel.map((item, i) => (
                            <div key={i} className="p-4 bg-orange-50/50 rounded-xl border border-orange-100/50">
                                <h4 className="text-sm font-bold text-orange-900">{item.title}</h4>
                                <p className="text-sm text-gray-600 mt-1 mb-2 leading-relaxed">{item.desc}</p>
                                <span className="text-xs font-medium text-orange-600">{item.action}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Your Competitive Advantages */}
                <div className="user-card p-6 rounded-3xl">
                    <div className="flex items-center gap-2 mb-6">
                        <Award className="size-5 text-green-500" />
                        <h3 className="font-bold text-gray-900">Your Competitive Advantages</h3>
                    </div>
                    <div className="space-y-4">
                        {advantages.map((item, i) => (
                            <div key={i} className="p-4 bg-green-50/50 rounded-xl border border-green-100/50">
                                <h4 className="text-sm font-bold text-green-900">{item.title}</h4>
                                <p className="text-sm text-gray-600 mt-1 mb-2 leading-relaxed">{item.desc}</p>
                                <span className="text-xs font-medium text-green-600">{item.action}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Strategic Recommendations - Purple Section */}
            <div className="bg-[#9333EA] p-6 md:p-8 rounded-3xl text-white">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-white/20 rounded-lg">
                        <Target className="size-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold">Strategic Recommendations</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {strategicRecs.map((rec, i) => (
                        <div key={i} className="p-5 bg-white rounded-xl text-gray-900">
                            <h4 className="font-bold text-sm mb-2">{rec.title}</h4>
                            <p className="text-sm text-gray-500 leading-relaxed">{rec.description}</p>
                        </div>
                    ))}
                </div>
            </div>
            </>
            ) : (
                <div className="h-[400px] flex flex-col items-center justify-center text-gray-500">
                    <AlertCircle className="size-12 mb-4 text-gray-300" />
                    <p>No competitor data found for the selected business.</p>
                </div>
            )}

            {/* Add Competitor Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Add Competitor</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh] custom-thin-scrollbar overflow-x-visible">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[13px] font-bold text-zinc-700 mb-2 block">Business Name</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                                        <input
                                            type="text"
                                            value={selectedBusiness}
                                            disabled
                                            className="w-full h-12 bg-zinc-50 border border-zinc-200 rounded-xl pl-12 pr-4 text-[14px] text-zinc-500 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[13px] font-bold text-zinc-700 mb-2 block">Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                                        <input
                                            type="text"
                                            value={selectedAddress}
                                            disabled
                                            className="w-full h-12 bg-zinc-50 border border-zinc-200 rounded-xl pl-12 pr-4 text-[14px] text-zinc-500 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[13px] font-bold text-zinc-700 mb-2 block">Your Goals</label>
                                    <StylishDropdown
                                        multiSelect
                                        options={[
                                            { label: "Improve customer satisfaction", value: "improve_customer_satisfaction" },
                                            { label: "Improve service speed", value: "improve_service_speed" },
                                            { label: "Increase ratings", value: "increase_ratings" },
                                            { label: "Increase sales", value: "increase_sales" },
                                            { label: "Increase website traffic", value: "increase_website_traffic" },
                                            { label: "Improve brand awareness", value: "improve_brand_awareness" },
                                            { label: "Expand customer base", value: "expand_customer_base" },
                                            { label: "Improve customer retention", value: "improve_customer_retention" },
                                            { label: "Better customer engagement", value: "better_customer_engagement" }
                                        ]}
                                        value={form.selectedGoals}
                                        onChange={(val) => setForm({ ...form, selectedGoals: val as string[] })}
                                        placeholder="Select goals"
                                        selectedColor="#2563EB"
                                        selectedBgColor="#eff6ff"
                                        icon={<Target size={18} className="text-blue-600" />}
                                        position="top"
                                    />
                                </div>

                                <div>
                                    <label className="text-[13px] font-bold text-zinc-700 mb-2 block">Competitors Google Maps URLs (Optional)</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Enter competitor URLs, separated by commas"
                                            className="w-full h-12 bg-white border border-zinc-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl pl-12 pr-4 text-[14px] outline-none transition-all"
                                            value={form.competitors}
                                            onChange={(e) => setForm({ ...form, competitors: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                            >
                                {isLoading && <Loader2 className="size-4 animate-spin" />}
                                Add Competitors
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
