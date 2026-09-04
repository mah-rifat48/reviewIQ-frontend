"use client";

import React, { useState } from "react";
import { X, Crown } from "lucide-react";
import { useCreateEnterpriseSubscriptionMutation } from "@/redux/api/BE/user/enterpriseApi";
import toast from "react-hot-toast";

interface AddEnterpriseModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
}

export default function AddEnterpriseModal({ isOpen, onClose, user }: AddEnterpriseModalProps) {
    const [createEnterpriseSubscription, { isLoading }] = useCreateEnterpriseSubscriptionMutation();

    // Form states
    const [review, setReview] = useState("1000");
    const [location, setLocation] = useState("5");
    const [business, setBusiness] = useState(1);
    const [balance, setBalance] = useState(100);
    const [reportPlan, setReportPlan] = useState<("WEEKLY" | "MONTHLY")[]>(["WEEKLY", "MONTHLY"]);
    const [competitor, setCompetitor] = useState(true);

    if (!isOpen || !user) return null;

    const handleReportPlanChange = (plan: "WEEKLY" | "MONTHLY") => {
        if (reportPlan.includes(plan)) {
            setReportPlan(reportPlan.filter((p) => p !== plan));
        } else {
            setReportPlan([...reportPlan, plan]);
        }
    };

    const handleConfirm = async (e: React.FormEvent) => {
        e.preventDefault();

        // Calculate dynamic duration date (1 month from now)
        const d = new Date();
        d.setMonth(d.getMonth() + 1);
        const durationDate = d.toISOString();

        const payload = {
            plan: "ENTERPRISE" as const,
            userId: user.userId || user.id,
            review,
            location,
            balance,
            business,
            reportPlan,
            competitor,
            durationDate,
            durationsPlan: "MONTHLY" as const,
        };

        try {
            await createEnterpriseSubscription(payload).unwrap();
            onClose();
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to assign Enterprise plan.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 border border-cyan-100 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center size-10 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100 shrink-0">
                            <Crown className="size-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[#0F172A]">
                                Add Enterprise Plan
                            </h3>
                            <p className="text-xs text-gray-500">
                                Assign enterprise license to <span className="font-semibold">{user.name}</span>
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleConfirm} className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* Review Number */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700">Reviews Limit</label>
                        <input
                            type="text"
                            required
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            className="block h-11 w-full rounded-xl border border-blue-50 bg-white px-4 text-sm text-[#0F172A] placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                            placeholder="e.g. 1000 or Unlimited"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Locations Limit */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">Locations per Business</label>
                            <input
                                type="text"
                                required
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="block h-11 w-full rounded-xl border border-blue-50 bg-white px-4 text-sm text-[#0F172A] placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                placeholder="e.g. 5"
                            />
                        </div>

                        {/* Business Limit */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">Businesses Limit</label>
                            <input
                                type="number"
                                required
                                min={1}
                                value={business}
                                onChange={(e) => setBusiness(Number(e.target.value))}
                                className="block h-11 w-full rounded-xl border border-blue-50 bg-white px-4 text-sm text-[#0F172A] placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                placeholder="e.g. 1"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Balance */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">Monthly Balance ($)</label>
                            <input
                                type="number"
                                required
                                min={0}
                                value={balance}
                                onChange={(e) => setBalance(Number(e.target.value))}
                                className="block h-11 w-full rounded-xl border border-blue-50 bg-white px-4 text-sm text-[#0F172A] placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                placeholder="e.g. 100"
                            />
                        </div>

                        {/* Competitor Analysis Toggle */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">Competitor Analysis</label>
                            <div className="flex items-center h-11">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={competitor}
                                        onChange={(e) => setCompetitor(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                                    <span className="ml-3 text-sm font-medium text-gray-700">
                                        {competitor ? "Enabled" : "Disabled"}
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Report Plan Multiselect checkboxes */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 block">Report Plans</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer font-medium">
                                <input
                                    type="checkbox"
                                    checked={reportPlan.includes("WEEKLY")}
                                    onChange={() => handleReportPlanChange("WEEKLY")}
                                    className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500 size-4 cursor-pointer"
                                />
                                Weekly Reports
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer font-medium">
                                <input
                                    type="checkbox"
                                    checked={reportPlan.includes("MONTHLY")}
                                    onChange={() => handleReportPlanChange("MONTHLY")}
                                    className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500 size-4 cursor-pointer"
                                />
                                Monthly Reports
                            </label>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 flex gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 rounded-xl py-3 text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {isLoading ? (
                                <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                "Create Subscription"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
