"use client";

import React, { useState } from "react";
import {
    X,
    Building2,
    MapPin,
    Star,
    TrendingUp,
    MessageSquare,
    ChevronRight,
    Search
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import toast from "react-hot-toast";

import {
    useGetBusinessManagementDetailQuery,
    useUpdateBusinessStatusMutation,
} from "@/redux/api/AI/businessmanagementApi";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface BusinessDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    business: any;
}

export default function BusinessDetailsModal({ isOpen, onClose, business }: BusinessDetailsModalProps) {
    const [activeTab, setActiveTab] = useState("Overview");

    // Mapping activeTab display name to API overlook parameter
    const overlookParam = activeTab.startsWith("Overview") ? "overview" : 
                          activeTab.startsWith("Locations") ? "locations" : "analytics";

    const { data: detailData, isLoading: detailLoading } = useGetBusinessManagementDetailQuery(
        { 
            business_name: business?.business_name, 
            overlook: overlookParam,
            user_id: business?.owner_id
        },
        { skip: !isOpen || !business?.business_name }
    );

    const [updateStatus, { isLoading: isUpdating }] = useUpdateBusinessStatusMutation();

    const isSuspended = detailData?.overview?.is_suspended ?? business?.is_suspended ?? false;

    const handleToggleSuspension = async () => {
        try {
            const action = isSuspended ? "unsuspend" : "suspend";
            await updateStatus({
                action,
                business_name: business.business_name,
                user_id: business.owner_id,
            }).unwrap();
            
            toast.success(`Business ${action === "suspend" ? "suspended" : "unsuspended"} successfully!`);
        } catch (error) {
            toast.error("Failed to update business status.");
        }
    };

    if (!isOpen || !business) return null;

    const tabs = ["Overview", `Locations (${business.location_count || 0})`, "Analytics"];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between p-6">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 overflow-hidden rounded-xl bg-gray-100">
                            <img
                                src={(business?.primary_photo?.photo_url || business?.photo?.photo_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=400").replace("http://13.63.11.191:8000", "/api/ai")}
                                alt={business.business_name}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-bold text-[#0F172A]">{business.business_name}</h2>
                                <span className={cn(
                                    "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                                    isSuspended ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
                                )}>
                                    {isSuspended ? "suspended" : "active"}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 capitalize">{business.category}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        <X className="size-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 px-6 border-b border-gray-100">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab.startsWith("Overview") ? "Overview" : tab.startsWith("Locations") ? "Locations" : "Analytics")}
                            className={cn(
                                "pb-4 text-sm font-semibold transition-all relative cursor-pointer",
                                (activeTab === "Overview" && tab.startsWith("Overview")) ||
                                    (activeTab === "Locations" && tab.startsWith("Locations")) ||
                                    (activeTab === "Analytics" && tab.startsWith("Analytics"))
                                    ? "text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {detailLoading ? (
                        <div className="space-y-6 animate-pulse">
                            <div className="grid grid-cols-4 gap-4">
                                {Array(4).fill(0).map((_, i) => (
                                    <div key={i} className="h-20 bg-gray-100 rounded-xl" />
                                ))}
                            </div>
                            <div className="h-40 bg-gray-50 rounded-xl" />
                        </div>
                    ) : activeTab === "Overview" && (
                        <>
                            {/* Quick Stats */}
                            <div className="grid grid-cols-4 gap-4">
                                <div className="rounded-xl bg-blue-50 p-4">
                                    <p className="text-[10px] font-bold text-blue-600 uppercase">Total Locations</p>
                                    <p className="mt-1 text-xl font-bold text-blue-900">{business.location_count}</p>
                                </div>
                                <div className="rounded-xl bg-purple-50 p-4">
                                    <p className="text-[10px] font-bold text-purple-600 uppercase">Total Reviews</p>
                                    <p className="mt-1 text-xl font-bold text-purple-900">{business.reviews.toLocaleString()}</p>
                                </div>
                                <div className="rounded-xl bg-amber-50 p-4">
                                    <p className="text-[10px] font-bold text-amber-600 uppercase">Average Rating</p>
                                    <p className="mt-1 text-xl font-bold text-amber-900">{business.ratings}</p>
                                </div>
                                <div className="rounded-xl bg-green-50 p-4">
                                    <p className="text-[10px] font-bold text-green-600 uppercase">Monthly Growth</p>
                                    <p className="mt-1 text-xl font-bold text-green-900">+12%</p>
                                </div>
                            </div>

                            {/* Business Information */}
                            <div className="rounded-xl border border-blue-50 bg-white p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-[#0F172A] mb-4">Business Information</h3>
                                <div className="grid grid-cols-2 gap-y-6">
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Business Owner</p>
                                        <p className="text-sm font-bold text-[#0F172A]">{detailData?.overview?.business_owner_name || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Category</p>
                                        <p className="text-sm font-bold text-[#0F172A] capitalize">{detailData?.overview?.category}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Account Created</p>
                                        <p className="text-sm font-bold text-[#0F172A]">
                                            {detailData?.overview?.account_created ? new Date(detailData.overview.account_created).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : "N/A"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Last Active</p>
                                        <p className="text-sm font-bold text-[#0F172A]">
                                            {detailData?.overview?.last_active ? new Date(detailData.overview.last_active).toLocaleString() : "N/A"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Website</p>
                                        <p className="text-sm font-bold text-blue-600 truncate max-w-[200px]">
                                            <a href={detailData?.overview?.website} target="_blank" rel="noopener noreferrer">
                                                {detailData?.overview?.website || "N/A"}
                                            </a>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Phone</p>
                                        <p className="text-sm font-bold text-[#0F172A]">{detailData?.overview?.phone || "N/A"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="rounded-xl border border-blue-50 bg-white p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-[#0F172A] mb-4">Recent Activity</h3>
                                <div className="space-y-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="flex justify-between items-center py-2 border-b last:border-0 border-gray-50">
                                            <div>
                                                <p className="text-sm font-bold text-[#0F172A]">
                                                    {i % 2 === 0 ? "New location added" : "Monthly report generated"}
                                                </p>
                                                <p className="text-xs text-gray-400">All locations</p>
                                            </div>
                                            <p className="text-xs text-gray-400">2 hours ago</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === "Locations" && (
                        <div className="space-y-4">
                            {detailData?.locations?.length > 0 ? (
                                detailData.locations.map((loc: any, i: number) => (
                                    <div key={i} className="rounded-xl border border-blue-50 bg-white p-6 shadow-sm">
                                        <div className="flex items-start justify-between mb-8">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                                    <MapPin className="size-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-[#0F172A]">{loc.business_name}</h4>
                                                    <p className="text-xs text-gray-500 font-medium mt-0.5">{loc.address || "No address provided"}</p>
                                                </div>
                                            </div>
                                            <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold uppercase text-green-700">
                                                active
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1 tracking-wider">Reviews</p>
                                                <p className="text-sm font-bold text-[#0F172A]">{loc.reviews?.toLocaleString() || 0}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1 tracking-wider">Rating</p>
                                                <div className="flex items-center gap-1.5">
                                                    <Star className="size-3.5 text-amber-500 fill-amber-500" />
                                                    <span className="text-sm font-bold text-[#0F172A]">{loc.rating || 0}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1 tracking-wider">Action</p>
                                                <a 
                                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.business_name + ' ' + (loc.address || ''))}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                                                >
                                                    View Details
                                                    <ChevronRight className="size-3.5" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <MapPin className="size-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500 font-medium">No locations found for this business.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "Analytics" && (
                        <div className="space-y-6">
                            {detailData?.analytics ? (
                                <>
                                    {/* Sentiment Analysis */}
                                    <div className="rounded-xl border border-blue-50 bg-white p-6 shadow-sm">
                                        <h3 className="text-lg font-bold text-[#0F172A] mb-2">Sentiment Analysis</h3>
                                        <p className="text-xs text-gray-400 mb-6 uppercase font-bold tracking-wider">Period: {detailData.analytics.period?.replace(/_/g, " ")}</p>
                                        
                                        <div className="grid grid-cols-3 gap-8 mb-4">
                                            <div>
                                                <p className="text-2xl font-bold text-green-600">{detailData.analytics.avg_sentiment_analysis?.positive || "0%"}</p>
                                                <p className="text-xs text-gray-400 font-medium">Positive</p>
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-amber-500">{detailData.analytics.avg_sentiment_analysis?.neutral || "0%"}</p>
                                                <p className="text-xs text-gray-400 font-medium">Neutral</p>
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-red-500">{detailData.analytics.avg_sentiment_analysis?.negative || "0%"}</p>
                                                <p className="text-xs text-gray-400 font-medium">Negative</p>
                                            </div>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex">
                                            <div className="h-full bg-green-500" style={{ width: detailData.analytics.avg_sentiment_analysis?.positive || "0%" }}></div>
                                            <div className="h-full bg-amber-500" style={{ width: detailData.analytics.avg_sentiment_analysis?.neutral || "0%" }}></div>
                                            <div className="h-full bg-red-500" style={{ width: detailData.analytics.avg_sentiment_analysis?.negative || "0%" }}></div>
                                        </div>
                                        
                                        <div className="mt-6 pt-6 border-t border-gray-50 grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium mb-1">Reviews Analyzed</p>
                                                <p className="text-lg font-bold text-[#0F172A]">{detailData.analytics.reviews_analyzed || 0}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium mb-1">Positive Percentage</p>
                                                <p className="text-lg font-bold text-green-600">{detailData.analytics.positive_review_percentage || 0}%</p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="py-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <TrendingUp className="size-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500 font-medium">No analytics data available yet.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex gap-4 p-6 border-t border-gray-100">
                    <button 
                        onClick={handleToggleSuspension}
                        disabled={isUpdating}
                        className={cn(
                            "rounded-lg border px-6 py-2.5 text-sm font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                            isSuspended 
                                ? "border-green-500 text-green-600 hover:bg-green-50" 
                                : "border-red-500 text-red-600 hover:bg-red-50"
                        )}
                    >
                        {isUpdating ? "Updating..." : (isSuspended ? "Unsuspend Account" : "Suspend Account")}
                    </button>
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-gray-200 px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #E2E8F0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #CBD5E1;
                }
            `}</style>
        </div>
    );
}
