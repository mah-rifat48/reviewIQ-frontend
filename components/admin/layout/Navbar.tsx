"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useGetAdminProfileQuery } from "@/redux/api/BE/admin/profileApi";
import { useSocket } from "@/context/SocketContext";
import { Bell, Clock, Check, X, Trash2 } from "lucide-react";
import LanguageTranslator from "@/components/ui/LanguageTranslator";

const formatRelativeTime = (isoString: string) => {
    try {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    } catch (e) {
        return "Recent";
    }
};

export default function Navbar() {
    const { data: profileData } = useGetAdminProfileQuery();
    const admin = profileData?.data;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.split("/api/v1")[0] || "";
    
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllRead,
        clearAll,
        removeNotification
    } = useSocket();

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const displayImage = admin?.profileImage
        ? `${baseUrl}${admin.profileImage}`
        : "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";

    return (
        <nav className="sticky top-0 z-30 flex py-4 h-20 w-full items-center justify-between border-b border-blue-50 bg-white/80 backdrop-blur-md px-4 md:px-6 lg:px-8 transition-all">
            <div className="flex items-center gap-4">
                {/* Search field removed */}
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                {/* Language Selector */}
                <LanguageTranslator />

                {/* Notifications Bell & Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="relative flex items-center justify-center size-10 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all cursor-pointer focus:outline-none"
                    >
                        <Bell className="size-5" />
                        {unreadCount > 0 && (
                            <span className="absolute right-2 top-2 size-2.5 rounded-full border-2 border-white bg-red-500 ring-4 ring-transparent animate-pulse" />
                        )}
                    </button>

                    {/* Notification Dropdown Modal */}
                    {isOpen && (
                        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-[var(--primary-brand)]/20 shadow-2xl p-4 z-50 flex flex-col space-y-3">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                <h3 className="text-sm font-black text-gray-900">Admin Notifications</h3>
                                <div className="flex items-center gap-2">
                                    {notifications.length > 0 && (
                                        <>
                                            <button
                                                onClick={markAllRead}
                                                className="text-[11px] font-bold text-[#0891B2] hover:underline cursor-pointer"
                                            >
                                                Mark all read
                                            </button>
                                            <span className="text-gray-300 text-xs">|</span>
                                            <button
                                                onClick={clearAll}
                                                className="text-[11px] font-bold text-red-500 hover:underline cursor-pointer"
                                            >
                                                Clear all
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {notifications.length > 0 ? (
                                <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
                                    {notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            className={`p-3 rounded-xl border transition-all ${
                                                n.unread 
                                                    ? "bg-[var(--primary-brand)]/5 border-[var(--primary-brand)]/20" 
                                                    : "bg-gray-50/50 border-gray-100"
                                            }`}
                                        >
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="space-y-1">
                                                    <p className={`text-xs font-bold ${n.unread ? "text-gray-900" : "text-gray-600"}`}>
                                                        {n.title}
                                                    </p>
                                                    <p className="text-[11px] text-gray-500 leading-relaxed">
                                                        {n.message}
                                                    </p>
                                                    <div className="flex items-center gap-1 mt-1.5 text-[9px] text-gray-400 font-medium">
                                                        <Clock className="size-3" />
                                                        <span>{formatRelativeTime(n.time)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    {n.unread && (
                                                        <button
                                                            onClick={() => markAsRead(n.id)}
                                                            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-green-600 transition-colors cursor-pointer"
                                                            title="Mark as read"
                                                        >
                                                            <Check className="size-3.5" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => removeNotification(n.id)}
                                                        className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <Bell className="size-8 text-gray-300 mb-2 animate-bounce" />
                                    <p className="text-xs text-gray-400 font-medium">No new notifications</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Profile Section */}
                <Link
                    href="/admin/profile"
                    className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-100 h-10 cursor-pointer hover:opacity-80 transition-opacity"
                >
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-semibold text-gray-900 leading-none">{admin?.name || "Admin"}</p>
                        <p className="text-[11px] text-gray-400 mt-1 font-medium">{admin?.role || "Administrator"}</p>
                    </div>
                    <img
                        src={displayImage}
                        alt="Profile"
                        className="size-10 rounded-full object-cover ring-2 ring-gray-100"
                    />
                </Link>
            </div>
        </nav>
    );
}
