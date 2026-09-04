"use client";

import React, { useState, useEffect } from "react";
import {
    useGetStarterPlanSettingsQuery,
    useUpdateStarterPlanSettingsMutation,
    useGetProfessionalPlanSettingsQuery,
    useUpdateProfessionalPlanSettingsMutation
} from "@/redux/api/BE/admin/planSettings";
import {
    Save,
    Loader2,
    Sliders
} from "lucide-react";
import toast from "react-hot-toast";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
    return (
        <button
            type="button"
            onClick={onChange}
            className={cn(
                "h-6 w-11 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer",
                value ? "bg-[var(--primary-brand)]" : "bg-gray-200"
            )}
        >
            <div className={cn(
                "size-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out",
                value ? "translate-x-5" : "translate-x-0"
            )} />
        </button>
    );
}

export default function PlanSettings() {
    const { data: starterRes, isLoading: isStarterLoading } = useGetStarterPlanSettingsQuery();
    const { data: professionalRes, isLoading: isProfLoading } = useGetProfessionalPlanSettingsQuery();

    const [updateStarter, { isLoading: isSavingStarter }] = useUpdateStarterPlanSettingsMutation();
    const [updateProfessional, { isLoading: isSavingProf }] = useUpdateProfessionalPlanSettingsMutation();

    const [starterForm, setStarterForm] = useState({
        review: 0,
        location: 0,
        balance: 0,
        business: 0,
        reportPlan: [] as string[],
        competitor: false,
    });

    const [profForm, setProfForm] = useState({
        review: 0,
        location: 0,
        balance: 0,
        business: 0,
        reportPlan: [] as string[],
        competitor: false,
    });

    // Populate forms when data loads
    useEffect(() => {
        if (starterRes?.data) {
            setStarterForm({
                review: starterRes.data.review ?? 0,
                location: starterRes.data.location ?? 0,
                balance: starterRes.data.balance ?? 0,
                business: starterRes.data.business ?? 0,
                reportPlan: starterRes.data.reportPlan ?? [],
                competitor: starterRes.data.competitor ?? false,
            });
        }
    }, [starterRes]);

    useEffect(() => {
        if (professionalRes?.data) {
            setProfForm({
                review: professionalRes.data.review ?? 0,
                location: professionalRes.data.location ?? 0,
                balance: professionalRes.data.balance ?? 0,
                business: professionalRes.data.business ?? 0,
                reportPlan: professionalRes.data.reportPlan ?? [],
                competitor: professionalRes.data.competitor ?? false,
            });
        }
    }, [professionalRes]);

    const handleStarterInput = (key: string, value: any) => {
        setStarterForm(prev => ({ ...prev, [key]: value }));
    };

    const handleProfInput = (key: string, value: any) => {
        setProfForm(prev => ({ ...prev, [key]: value }));
    };

    const handleStarterReportPlanToggle = (plan: string) => {
        const current = [...starterForm.reportPlan];
        const index = current.indexOf(plan);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(plan);
        }
        handleStarterInput("reportPlan", current);
    };

    const handleProfReportPlanToggle = (plan: string) => {
        const current = [...profForm.reportPlan];
        const index = current.indexOf(plan);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(plan);
        }
        handleProfInput("reportPlan", current);
    };

    const saveStarterPlan = async () => {
        try {
            await updateStarter(starterForm).unwrap();
            toast.success("Starter plan updated successfully!");
        } catch (err) {
            toast.error("Failed to update Starter plan settings.");
            console.error(err);
        }
    };

    const saveProfPlan = async () => {
        try {
            await updateProfessional(profForm).unwrap();
            toast.success("Professional plan updated successfully!");
        } catch (err) {
            toast.error("Failed to update Professional plan settings.");
            console.error(err);
        }
    };

    if (isStarterLoading || isProfLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="size-12 animate-spin text-[var(--primary-brand)]" />
                <p className="text-gray-500 font-medium animate-pulse">Loading plan settings...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-16">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#0F172A] flex items-center gap-2">
                        <Sliders className="size-6 text-[var(--primary-brand)]" />
                        Plan Settings
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Configure limitations, pricing parameters, and features for subscription plans</p>
                </div>
            </div>

            {/* Edit Forms Side-By-Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Starter Form */}
                <section className="admin-card border border-gray-100 bg-white rounded-2xl p-6 space-y-6">
                    <div className="border-b border-gray-100 pb-4">
                        <h3 className="text-lg font-bold text-gray-900">Configure Starter Plan</h3>
                        <p className="text-xs text-gray-500">Manage plan limits & properties</p>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Max Businesses</label>
                                <input
                                    type="number"
                                    value={starterForm.business}
                                    onChange={(e) => handleStarterInput('business', parseInt(e.target.value) || 0)}
                                    className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm text-[#0F172A] focus:border-[var(--primary-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-brand)]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Max Locations</label>
                                <input
                                    type="number"
                                    value={starterForm.location}
                                    onChange={(e) => handleStarterInput('location', parseInt(e.target.value) || 0)}
                                    className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm text-[#0F172A] focus:border-[var(--primary-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-brand)]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Monthly Reviews</label>
                                <input
                                    type="number"
                                    value={starterForm.review}
                                    onChange={(e) => handleStarterInput('review', parseInt(e.target.value) || 0)}
                                    className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm text-[#0F172A] focus:border-[var(--primary-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-brand)]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Monthly Balance ($)</label>
                                <input
                                    type="number"
                                    value={starterForm.balance}
                                    onChange={(e) => handleStarterInput('balance', parseInt(e.target.value) || 0)}
                                    className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm text-[#0F172A] focus:border-[var(--primary-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-brand)]"
                                />
                            </div>
                        </div>

                        {/* Report Plan Checklist */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase block">Report Plan Schedules</label>
                            <div className="flex gap-4">
                                {["Weekly", "Monthly"].map(plan => (
                                    <label key={plan} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={starterForm.reportPlan.includes(plan)}
                                            onChange={() => handleStarterReportPlanToggle(plan)}
                                            className="size-4 rounded border-gray-300 text-[var(--primary-brand)] focus:ring-[var(--primary-brand)]"
                                        />
                                        {plan}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Competitor Analysis Toggle */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                            <div>
                                <p className="text-sm font-bold text-gray-900">Competitor Analysis</p>
                                <p className="text-xs text-gray-500">Enable scanning and analysis of competitor reviews</p>
                            </div>
                            <Toggle
                                value={starterForm.competitor}
                                onChange={() => handleStarterInput('competitor', !starterForm.competitor)}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={saveStarterPlan}
                            disabled={isSavingStarter}
                            className="flex items-center gap-2 rounded-xl bg-[var(--primary-brand)] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[var(--primary-brand)]/10 hover:bg-[#06B6D4] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isSavingStarter ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <>
                                    <Save className="size-4" />
                                    Save Starter Plan
                                </>
                            )}
                        </button>
                    </div>
                </section>

                {/* Professional Form */}
                <section className="admin-card border border-gray-100 bg-white rounded-2xl p-6 space-y-6">
                    <div className="border-b border-gray-100 pb-4">
                        <h3 className="text-lg font-bold text-gray-900">Configure Professional Plan</h3>
                        <p className="text-xs text-gray-500">Manage plan limits & properties</p>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Max Businesses</label>
                                <input
                                    type="number"
                                    value={profForm.business}
                                    onChange={(e) => handleProfInput('business', parseInt(e.target.value) || 0)}
                                    className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm text-[#0F172A] focus:border-[var(--primary-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-brand)]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Max Locations</label>
                                <input
                                    type="number"
                                    value={profForm.location}
                                    onChange={(e) => handleProfInput('location', parseInt(e.target.value) || 0)}
                                    className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm text-[#0F172A] focus:border-[var(--primary-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-brand)]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Monthly Reviews</label>
                                <input
                                    type="number"
                                    value={profForm.review}
                                    onChange={(e) => handleProfInput('review', parseInt(e.target.value) || 0)}
                                    className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm text-[#0F172A] focus:border-[var(--primary-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-brand)]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Monthly Balance ($)</label>
                                <input
                                    type="number"
                                    value={profForm.balance}
                                    onChange={(e) => handleProfInput('balance', parseInt(e.target.value) || 0)}
                                    className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm text-[#0F172A] focus:border-[var(--primary-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-brand)]"
                                />
                            </div>
                        </div>

                        {/* Report Plan Checklist */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase block">Report Plan Schedules</label>
                            <div className="flex gap-4">
                                {["Weekly", "Monthly"].map(plan => (
                                    <label key={plan} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={profForm.reportPlan.includes(plan)}
                                            onChange={() => handleProfReportPlanToggle(plan)}
                                            className="size-4 rounded border-gray-300 text-[var(--primary-brand)] focus:ring-[var(--primary-brand)]"
                                        />
                                        {plan}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Competitor Analysis Toggle */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                            <div>
                                <p className="text-sm font-bold text-gray-900">Competitor Analysis</p>
                                <p className="text-xs text-gray-500">Enable scanning and analysis of competitor reviews</p>
                            </div>
                            <Toggle
                                value={profForm.competitor}
                                onChange={() => handleProfInput('competitor', !profForm.competitor)}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={saveProfPlan}
                            disabled={isSavingProf}
                            className="flex items-center gap-2 rounded-xl bg-[var(--primary-brand)] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[var(--primary-brand)]/10 hover:bg-[#06B6D4] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isSavingProf ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <>
                                    <Save className="size-4" />
                                    Save Professional Plan
                                </>
                            )}
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}
