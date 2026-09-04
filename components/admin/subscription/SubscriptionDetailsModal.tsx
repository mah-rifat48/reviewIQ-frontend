"use client";

import React from "react";
import { X, CreditCard, Calendar, User, Mail, Shield, CheckCircle2, AlertTriangle, Layers, MapPin, Star, Sparkles } from "lucide-react";
import { useGetSubscriptionByIdQuery } from "@/redux/api/BE/admin/subscriptionApi";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SubscriptionDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    subscription: any;
}

export default function SubscriptionDetailsModal({ isOpen, onClose, subscription }: SubscriptionDetailsModalProps) {
    const subId = subscription?.subscriptionId || subscription?.id;
    const { data: response, isLoading, error } = useGetSubscriptionByIdQuery(subId, {
        skip: !subId || !isOpen,
    });

    if (!isOpen || !subscription) return null;

    const subData = response?.data;

    // Loading Skeleton
    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity">
                <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col p-6 animate-pulse space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-xl bg-gray-200" />
                        <div className="flex-1 space-y-2">
                            <div className="h-5 bg-gray-200 rounded w-1/3" />
                            <div className="h-4 bg-gray-100 rounded w-1/2" />
                        </div>
                    </div>
                    <div className="h-px bg-gray-100" />
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-10 bg-gray-100 rounded" />
                        <div className="h-10 bg-gray-100 rounded" />
                    </div>
                </div>
            </div>
        );
    }

    // Error State
    if (error || !subData) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity">
                <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col p-6 items-center text-center space-y-4">
                    <div className="size-12 rounded-full bg-red-50 flex items-center justify-center">
                        <AlertTriangle className="size-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0F172A]">Failed to Load Details</h3>
                    <p className="text-sm text-gray-500">Could not retrieve the subscription details from the server.</p>
                    <button
                        onClick={onClose}
                        className="rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    const createdAtStr = subData.createdAt ? new Date(subData.createdAt).toLocaleDateString("en-US", {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : "N/A";

    const expiryDateStr = subData.durationDate ? new Date(subData.durationDate).toLocaleDateString("en-US", {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : "N/A";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity">
            <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col border border-[var(--primary-brand)]/30">
                {/* Header */}
                <div className="flex items-start justify-between p-6 bg-[#F9FCFF] border-b border-[var(--primary-brand)]/20">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-[var(--primary-brand)]/10 flex items-center justify-center border border-[var(--primary-brand)]/20">
                            <Shield className="size-6 text-[#0891B2]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[#0F172A]">{subData.plan} Plan</h2>
                            <p className="text-xs font-semibold text-[#0891B2]">ID: {subData.subscriptionId}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        <X className="size-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                    {/* User Info from Table */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <User className="size-3" /> Customer
                            </p>
                            <p className="text-sm font-bold text-[#0F172A]">{subscription.name || "Unknown"}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <Mail className="size-3" /> Email
                            </p>
                            <p className="text-sm font-semibold text-gray-600 truncate">{subscription.email || "No email"}</p>
                        </div>
                    </div>

                    <div className="h-px bg-[var(--primary-brand)]/20" />

                    {/* Backend Subscription Parameters */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <CreditCard className="size-3" /> Balance / Cost
                            </p>
                            <p className="text-lg font-black text-[#0F172A]">${subData.balance ?? 0}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <Calendar className="size-3" /> Durations Plan
                            </p>
                            <p className="text-sm font-bold text-[#0891B2] uppercase">{subData.durationsPlan || "NONE"}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Payment Status</p>
                            <span className={cn(
                                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border",
                                subData.paymentStatus === "PAID" && "bg-green-50 text-green-700 border-green-200",
                                subData.paymentStatus === "FAILED" && "bg-red-50 text-red-700 border-red-200",
                                subData.paymentStatus !== "PAID" && subData.paymentStatus !== "FAILED" && "bg-amber-50 text-amber-700 border-amber-200"
                            )}>
                                {subData.paymentStatus || "UNPAID"}
                            </span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <Sparkles className="size-3" /> Competitor Plan
                            </p>
                            <p className="text-sm font-bold text-[#0F172A]">{subData.competitor ? "Included" : "Excluded"}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Created At</p>
                            <p className="text-xs font-bold text-gray-600">{createdAtStr}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Expiration Date</p>
                            <p className="text-xs font-bold text-gray-600">{expiryDateStr}</p>
                        </div>
                    </div>

                    <div className="h-px bg-[var(--primary-brand)]/20" />

                    {/* Real Database Limits & Allowances */}
                    <div className="rounded-xl border border-[var(--primary-brand)]/30 bg-[#F9FCFF] p-4">
                        <h4 className="text-xs font-bold text-[#0891B2] uppercase mb-3 flex items-center gap-2">
                            <CheckCircle2 className="size-3.5 text-[#0891B2]" /> Platform Allowances & Limits
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 rounded-lg bg-[var(--primary-brand)]/10 border border-[var(--primary-brand)]/20">
                                    <Layers className="size-3.5 text-[#0891B2]" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-extrabold text-gray-400 uppercase leading-none">Max Businesses</p>
                                    <p className="text-xs font-bold text-[#0F172A] mt-0.5">{subData.business} allowed</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 rounded-lg bg-[var(--primary-brand)]/10 border border-[var(--primary-brand)]/20">
                                    <MapPin className="size-3.5 text-[#0891B2]" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-extrabold text-gray-400 uppercase leading-none">Max Locations</p>
                                    <p className="text-xs font-bold text-[#0F172A] mt-0.5">{subData.location} allowed</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 rounded-lg bg-[var(--primary-brand)]/10 border border-[var(--primary-brand)]/20">
                                    <Sparkles className="size-3.5 text-[#0891B2]" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-extrabold text-gray-400 uppercase leading-none">Reports Package</p>
                                    <p className="text-xs font-bold text-[#0F172A] mt-0.5">
                                        {subData.reportPlan && subData.reportPlan.length > 0 
                                            ? subData.reportPlan.join(", ") 
                                            : "None"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
