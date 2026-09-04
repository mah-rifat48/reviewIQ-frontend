"use client";

import React, { useState, useEffect } from "react";
import Skeleton from "@/components/ui/Skeleton";
import { PageHeaderSkeleton, SectionSkeleton } from "@/components/admin/AdminSkeletons";
import {
    Globe,
    Users,
    Smartphone,
    Bell,
    AlertTriangle,
    Save,
    Loader2,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import toast from "react-hot-toast";
import {
    useGetSystemSettingsQuery,
    useUpdateSystemSettingsMutation,
} from "@/redux/api/BE/admin/settingsApi";

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

export default function SystemSettings() {
    const { data: settingsRes, isLoading } = useGetSystemSettingsQuery();
    const [updateSettings, { isLoading: isSaving }] = useUpdateSystemSettingsMutation();

    const [form, setForm] = useState({
        siteName: "",
        supportEmail: "",
        supportUrl: "",
        supportPhone: "",
        location: "",
        freeTrialDuration: 14,
        planLimitMaxBusiness: 5,
        planLimitMaxLocations: 10,
        emailNotifications: true,
        allowSignups: true,
        isMaintenanceMode: false,
    });

    // Populate form when API data arrives
    useEffect(() => {
        const data = settingsRes?.data;
        if (data) {
            setForm({
                siteName: data.siteName || "",
                supportEmail: data.supportEmail || "",
                supportUrl: data.supportUrl || "",
                supportPhone: data.supportPhone || "",
                location: data.location || "",
                freeTrialDuration: data.freeTrialDuration ?? 14,
                planLimitMaxBusiness: data.planLimitMaxBusiness ?? 5,
                planLimitMaxLocations: data.planLimitMaxLocations ?? 10,
                emailNotifications: data.emailNotifications ?? true,
                allowSignups: data.allowSignups ?? true,
                isMaintenanceMode: data.isMaintenanceMode ?? false,
            });
        }
    }, [settingsRes]);

    const handleInput = (key: keyof typeof form, value: string | number | boolean) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        try {
            await updateSettings(form).unwrap();
            toast.success("Settings saved successfully!");
        } catch (err) {
            toast.error("Failed to save settings. Please try again.");
            console.error("Failed to save settings", err);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-8 pb-12">
                <PageHeaderSkeleton />
                <div className="space-y-8">
                    <SectionSkeleton rows={3} />
                    <SectionSkeleton rows={2} />
                    <SectionSkeleton rows={2} />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[#0F172A]">System Settings</h1>
                <p className="text-gray-500">Configure platform-wide settings</p>
            </div>

            {/* General Settings */}
            <section className="admin-card border border-[var(--primary-brand)]/30 bg-white shadow-none rounded-xl p-6">
                <div className="flex items-center gap-2 border-b border-[#F1F5F9] pb-4">
                    <Globe className="size-5 text-[#0891B2]" />
                    <h3 className="text-lg font-bold text-[#0F172A]">General</h3>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Site Name</label>
                        <input
                            type="text"
                            value={form.siteName}
                            onChange={(e) => handleInput('siteName', e.target.value)}
                            className="w-full rounded-lg border border-[var(--primary-brand)]/30 bg-white p-2.5 text-sm text-[#0F172A] focus:border-[var(--primary-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-brand)]"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Support Email</label>
                        <input
                            type="email"
                            value={form.supportEmail}
                            onChange={(e) => handleInput('supportEmail', e.target.value)}
                            className="w-full rounded-lg border border-[var(--primary-brand)]/30 bg-white p-2.5 text-sm text-[#0F172A] focus:border-[var(--primary-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-brand)]"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Support URL</label>
                        <input
                            type="text"
                            value={form.supportUrl}
                            onChange={(e) => handleInput('supportUrl', e.target.value)}
                            className="w-full rounded-lg border border-[var(--primary-brand)]/30 bg-white p-2.5 text-sm text-[#0F172A] focus:border-[var(--primary-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-brand)]"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Support Phone</label>
                        <input
                            type="text"
                            value={form.supportPhone}
                            onChange={(e) => handleInput('supportPhone', e.target.value)}
                            className="w-full rounded-lg border border-[var(--primary-brand)]/30 bg-white p-2.5 text-sm text-[#0F172A] focus:border-[var(--primary-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-brand)]"
                        />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Location</label>
                        <input
                            type="text"
                            value={form.location}
                            onChange={(e) => handleInput('location', e.target.value)}
                            className="w-full rounded-lg border border-[var(--primary-brand)]/30 bg-white p-2.5 text-sm text-[#0F172A] focus:border-[var(--primary-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-brand)]"
                        />
                    </div>
                </div>
            </section>

            {/* User Management */}
            <section className="admin-card border border-[var(--primary-brand)]/30 bg-white shadow-none rounded-xl p-6">
                <div className="flex items-center gap-2 border-b border-[#F1F5F9] pb-4">
                    <Users className="size-5 text-[#0891B2]" />
                    <h3 className="text-lg font-bold text-[#0F172A]">User Management</h3>
                </div>
                <div className="mt-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-[#0F172A]">Allow New Signups</p>
                            <p className="text-xs text-gray-500">Enable new user registrations</p>
                        </div>
                        <Toggle value={form.allowSignups} onChange={() => handleInput('allowSignups', !form.allowSignups)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Free Trial Duration (Days)</label>
                        <input
                            type="number"
                            value={form.freeTrialDuration}
                            onChange={(e) => handleInput('freeTrialDuration', parseInt(e.target.value) || 0)}
                            className="w-full rounded-lg border border-[var(--primary-brand)]/30 bg-white p-2.5 text-sm text-[#0F172A] focus:border-[var(--primary-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-brand)]"
                        />
                    </div>
                </div>
            </section>

            {/* Platform Limits */}
            {/* <section className="admin-card border border-[var(--primary-brand)]/30 bg-white shadow-none rounded-xl p-6">
                <div className="flex items-center gap-2 border-b border-[#F1F5F9] pb-4">
                    <Smartphone className="size-5 text-[#0891B2]" />
                    <h3 className="text-lg font-bold text-[#0F172A]">Platform Limits</h3>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#0F172A]">Max Businesses Per User</label>
                        <input
                            type="number"
                            value={form.planLimitMaxBusiness}
                            onChange={(e) => handleInput('planLimitMaxBusiness', parseInt(e.target.value) || 0)}
                            className="w-full rounded-lg border border-[var(--primary-brand)]/30 bg-white p-2.5 text-sm text-[#0F172A] focus:border-[var(--primary-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-brand)]"
                        />
                        <p className="text-[10px] text-gray-400 font-medium">For non-enterprise plans</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#0F172A]">Max Locations Per Business</label>
                        <input
                            type="number"
                            value={form.planLimitMaxLocations}
                            onChange={(e) => handleInput('planLimitMaxLocations', parseInt(e.target.value) || 0)}
                            className="w-full rounded-lg border border-[var(--primary-brand)]/30 bg-white p-2.5 text-sm text-[#0F172A] focus:border-[var(--primary-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-brand)]"
                        />
                        <p className="text-[10px] text-gray-400 font-medium">For non-enterprise plans</p>
                    </div>
                </div>
            </section> */}

            {/* Notifications */}
            <section className="admin-card border border-[var(--primary-brand)]/30 bg-white shadow-none rounded-xl p-6">
                <div className="flex items-center gap-2 border-b border-[#F1F5F9] pb-4">
                    <Bell className="size-5 text-[#0891B2]" />
                    <h3 className="text-lg font-bold text-[#0F172A]">Notifications</h3>
                </div>
                <div className="mt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-[#0F172A]">Email Notifications</p>
                            <p className="text-xs text-gray-500">Send automated email notifications</p>
                        </div>
                        <Toggle value={form.emailNotifications} onChange={() => handleInput('emailNotifications', !form.emailNotifications)} />
                    </div>
                </div>
            </section>

            {/* Danger Zone */}
            <section className="admin-card border border-red-200 bg-white shadow-none rounded-xl p-6">
                <div className="flex items-center gap-2 border-b border-red-100 pb-4">
                    <AlertTriangle className="size-5 text-red-600" />
                    <h3 className="text-lg font-bold text-red-600">Danger Zone</h3>
                </div>
                <div className="mt-4 rounded-lg bg-red-50 p-4 border border-red-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-red-700">Maintenance Mode</p>
                            <p className="text-xs text-red-600 opacity-80">
                                {form.isMaintenanceMode
                                    ? "Platform is currently in maintenance mode — users cannot access it"
                                    : "Disable platform access for all users"}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleInput('isMaintenanceMode', !form.isMaintenanceMode)}
                            className={cn(
                                "h-6 w-11 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer",
                                form.isMaintenanceMode ? "bg-red-600" : "bg-gray-200"
                            )}
                        >
                            <div className={cn(
                                "size-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out",
                                form.isMaintenanceMode ? "translate-x-5" : "translate-x-0"
                            )} />
                        </button>
                    </div>
                    {form.isMaintenanceMode && (
                        <p className="mt-3 text-xs font-semibold text-red-700 bg-red-100 rounded-lg px-3 py-2">
                            ⚠ Warning: Enabling maintenance mode will lock out all non-admin users immediately.
                        </p>
                    )}
                </div>
            </section>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 rounded-lg bg-[var(--primary-brand)] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-[var(--primary-brand)]/20 hover:bg-[#06B6D4] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                >
                    {isSaving ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <>
                            <Save className="size-4" />
                            Save All Settings
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
