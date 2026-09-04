"use client";

import React from "react";
import { X, User, Mail, Shield, Building2, MapPin, Calendar, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useGetUserByIdQuery } from "@/redux/api/BE/admin/userApi";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface UserDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
}

export default function UserDetailsModal({ isOpen, onClose, user }: UserDetailsModalProps) {
    const userId = user?.userId || user?.id;
    const { data: response, isLoading, error } = useGetUserByIdQuery(userId, {
        skip: !userId || !isOpen,
    });

    if (!isOpen || !user) return null;

    const userData = response?.data;

    // Loading Skeleton
    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity animate-in fade-in duration-200">
                <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col p-6 animate-pulse space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="size-14 rounded-full bg-gray-200" />
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
    if (error || !userData) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity animate-in fade-in duration-200">
                <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col p-6 items-center text-center space-y-4">
                    <div className="size-12 rounded-full bg-red-50 flex items-center justify-center">
                        <AlertTriangle className="size-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0F172A]">Failed to Load Details</h3>
                    <p className="text-sm text-gray-500">Could not retrieve the user details from the server.</p>
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

    // Find active or paid subscription details
    const sortedSubs = userData.subscriptions
        ? [...userData.subscriptions].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        : [];
    const activeSub = sortedSubs[0];
    const activePlan = activeSub ? activeSub.plan : "NONE";
    const activeBalance = activeSub ? activeSub.balance : 0;
    const durationsPlan = activeSub ? activeSub.durationsPlan : "NONE";
    const nextBilling = activeSub?.durationDate ? new Date(activeSub.durationDate).toLocaleDateString("en-US", {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }) : "N/A";

    const lastActiveStr = userData.updatedAt ? new Date(userData.updatedAt).toLocaleDateString("en-US", {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }) : "N/A";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col border border-[var(--primary-brand)]/30 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-start justify-between p-6 bg-[#F9FCFF] border-b border-[var(--primary-brand)]/20">
                    <div className="flex items-center gap-4">
                        <div className="size-14 rounded-full bg-[var(--primary-brand)]/10 flex items-center justify-center border-4 border-white shadow-sm overflow-hidden">
                            <img
                                src={userData.profileImage || `https://ui-avatars.com/api/?name=${userData.name}&background=22D3EE&color=0891B2&bold=true`}
                                alt={userData.name}
                                className="size-full object-cover"
                            />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[#0F172A]">{userData.name}</h2>
                            <p className="text-xs font-semibold text-[#0891B2] flex items-center gap-1.5 mt-0.5">
                                <Mail className="size-3.5" /> {userData.email}
                            </p>
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
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Status & Plan Section */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl border border-[var(--primary-brand)]/20 bg-[#F9FCFF] p-4 space-y-1">
                            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Account Status</p>
                            <span className={cn(
                                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
                                userData.status === "ACTIVE" && "bg-green-50 text-green-700 border-green-200",
                                userData.status === "TRIAL" && "bg-blue-50 text-blue-700 border-blue-200",
                                userData.status === "SUSPENDED" && "bg-red-50 text-red-700 border-red-200"
                            )}>
                                <span className={cn(
                                    "size-1.5 rounded-full animate-pulse",
                                    userData.status === "ACTIVE" && "bg-green-500",
                                    userData.status === "TRIAL" && "bg-blue-500",
                                    userData.status === "SUSPENDED" && "bg-red-500"
                                )} />
                                {userData.status || "TRIAL"}
                            </span>
                        </div>
                        <div className="rounded-xl border border-[var(--primary-brand)]/20 bg-[#F9FCFF] p-4 space-y-1">
                            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Current Plan</p>
                            <div className="flex items-center gap-2">
                                <Shield className="size-4 text-[#0891B2]" />
                                <p className="text-sm font-bold text-[#0F172A]">{activePlan} Plan</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Building2 className="size-3.5 text-[#0891B2]" /> Businesses
                            </p>
                            <p className="text-sm font-bold text-[#0F172A]">{user.businesses ?? 0} active</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                <MapPin className="size-3.5 text-[#0891B2]" /> Locations
                            </p>
                            <p className="text-sm font-bold text-[#0F172A]">{user.locations ?? 0} active</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Calendar className="size-3.5 text-[#0891B2]" /> Next Billing
                            </p>
                            <p className="text-sm font-bold text-[#0F172A]">{nextBilling}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Clock className="size-3.5 text-[#0891B2]" /> Last Active
                            </p>
                            <p className="text-sm font-bold text-[#0F172A]">{lastActiveStr}</p>
                        </div>
                    </div>

                    <div className="h-px bg-[var(--primary-brand)]/20" />

                    {/* Dynamic MRR Section (Lifetime value removed as it does not come from backend) */}
                    <div className="rounded-xl bg-[var(--primary-brand)]/10 p-4 border border-[var(--primary-brand)]/20">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-extrabold text-[#0891B2] uppercase">Monthly Contribution (MRR)</p>
                                <p className="text-lg font-black text-[#0F172A] mt-1">${activeBalance}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-extrabold text-gray-400 uppercase">Billing Cycle</p>
                                <p className="text-xs font-bold text-gray-600 uppercase mt-1">{durationsPlan}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-[var(--primary-brand)]/20 bg-[#F9FCFF]">
                    <button
                        onClick={onClose}
                        className="w-full rounded-xl bg-[#0891B2] py-3.5 text-sm font-bold text-white hover:bg-[#06B6D4] transition-all shadow-md shadow-[var(--primary-brand)]/10 cursor-pointer text-center"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    );
}
