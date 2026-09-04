"use client";

import React, { useState } from "react";
import {
    CheckCheck,
    X,
    AlertTriangle,
    FileText,
    Info,
    TrendingUp,
    TrendingDown,
    Clock,
    Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import Skeleton from "@/components/ui/Skeleton";
import { useSocket, Notification } from "@/context/SocketContext";
import { useRouter } from "next/navigation";

const categories = ["All", "Alerts", "Reports", "Info", "Unread"];

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

export default function NotificationPage() {
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllRead,
        clearAll,
        removeNotification
    } = useSocket();
    const [activeTab, setActiveTab] = useState("All");
    const router = useRouter();

    // Filter Logic
    const filteredNotifications = notifications.filter(n => {
        if (activeTab === "All") return true;
        if (activeTab === "Unread") return n.unread;
        return n.category === activeTab;
    });

    const handleViewAction = (notification: Notification) => {
        markAsRead(notification.id);
        if (notification.type === "report") {
            router.push("/reports");
        } else if (notification.type === "alert") {
            router.push("/dashboard");
        } else if (notification.type === "success" && notification.title?.includes("Subscription")) {
            router.push("/settings?tab=billing");
        } else {
            router.push("/dashboard");
        }
    };

    // Helper to get icon and styles based on type
    const getNotificationStyle = (type: string) => {
        switch (type) {
            case "alert":
                return {
                    bg: "bg-red-50/50",
                    border: "border-red-100",
                    iconRaw: AlertTriangle,
                    iconColor: "text-red-500",
                    btn: "bg-red-600 hover:bg-red-700"
                };
            case "report":
                return {
                    bg: "bg-blue-50/50",
                    border: "border-blue-100",
                    iconRaw: FileText,
                    iconColor: "text-blue-500",
                    btn: "bg-blue-600 hover:bg-blue-700"
                };
            case "warning":
                return {
                    bg: "bg-orange-50/50",
                    border: "border-orange-100",
                    iconRaw: TrendingDown,
                    iconColor: "text-orange-500",
                    btn: "bg-blue-600 hover:bg-blue-700"
                };
            case "success":
                return {
                    bg: "bg-white",
                    border: "border-gray-100",
                    iconRaw: Star,
                    iconColor: "text-green-500",
                    btn: "bg-blue-600 hover:bg-blue-700"
                };
            case "info":
                return {
                    bg: "bg-white",
                    border: "border-gray-100",
                    iconRaw: Info,
                    iconColor: "text-green-500",
                    btn: "bg-blue-600 hover:bg-blue-700"
                };
            default:
                return {
                    bg: "bg-white",
                    border: "border-gray-100",
                    iconRaw: Info,
                    iconColor: "text-gray-500",
                    btn: "bg-blue-600 hover:bg-blue-700"
                };
        }
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-sm text-gray-500 mt-1">You have {unreadCount} unread notifications</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={markAllRead}
                        className="cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <CheckCheck className="size-4" />
                        Mark All Read
                    </button>
                    <button
                        onClick={clearAll}
                        className="cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <X className="size-4" />
                        Clear All
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveTab(cat)}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                            activeTab === cat
                                ? "bg-[var(--primary-brand)] text-white shadow-lg shadow-[var(--primary-brand)]/20"
                                : "bg-white text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200"
                        )}
                    >
                        {cat === "Unread" ? `Unread (${unreadCount})` : cat}
                    </button>
                ))}
            </div>

            {/* Notification List */}
            <div className="space-y-3">
                {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification) => {
                        const style = getNotificationStyle(notification.type);
                        const Icon = style.iconRaw;

                        return (
                            <div
                                key={notification.id}
                                className={cn(
                                    "relative p-5 rounded-2xl border transition-all hover:shadow-sm group",
                                    style.bg,
                                    style.border
                                )}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={cn("mt-0.5 shrink-0", style.iconColor)}>
                                        <Icon className="size-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-sm font-bold text-gray-900">{notification.title}</h3>
                                            {notification.unread && (
                                                <span className="size-2 rounded-full bg-blue-600 animate-pulse" />
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed max-w-4xl">
                                            {notification.message}
                                        </p>
                                        <div className="flex items-center gap-2 mt-3">
                                            <Clock className="size-3.5 text-gray-400" />
                                            <span className="text-xs text-gray-400 font-medium">
                                                {formatRelativeTime(notification.time)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-3 shrink-0 self-end md:self-center mt-4 md:mt-0 ml-auto md:ml-0">
                                        {notification.type === 'report' && (
                                            <button
                                                onClick={() => handleViewAction(notification)}
                                                className={cn(
                                                    "px-4 py-1.5 text-xs font-semibold text-white rounded-lg transition-colors shadow-sm cursor-pointer",
                                                    style.btn
                                                )}
                                            >
                                                View Report
                                            </button>
                                        )}

                                        {notification.unread && (
                                            <button
                                                onClick={() => markAsRead(notification.id)}
                                                className="cursor-pointer hidden sm:block px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                Mark as Read
                                            </button>
                                        )}

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeNotification(notification.id);
                                            }}
                                            className="cursor-pointer text-gray-400 hover:text-gray-600 p-1"
                                        >
                                            <X className="size-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
                        <div className="p-4 bg-gray-50 rounded-full mb-4">
                            <CheckCheck className="size-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">No notifications found.</p>
                        {/* <button
                            onClick={() => setActiveTab("All")}
                            className="mt-2 text-blue-600 text-sm hover:underline"
                        >
                            View all notifications
                        </button> */}
                    </div>
                )}
            </div>
        </div>
    );
}
