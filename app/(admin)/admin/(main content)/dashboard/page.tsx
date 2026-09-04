"use client";

import React from "react";
import {
    Users,
    DollarSign,
    Building2,
    AlertCircle,
    TrendingUp,
    TrendingDown,
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import {
    useGetDashboardStatisticsQuery,
    useGetDashboardChartsQuery,
    useGetActivityLogsQuery,
} from "@/redux/api/BE/admin/dashboardApi";

function timeAgo(date: Date) {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
}

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const PIE_COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"];

export default function AdminDashboard() {
    const { data: statsData, isLoading: statsLoading } = useGetDashboardStatisticsQuery();
    const { data: chartsData, isLoading: chartsLoading } = useGetDashboardChartsQuery();
    const { data: logsData, isLoading: logsLoading } = useGetActivityLogsQuery({ limit: 5 });

    const stats = statsData?.data ? [
        { 
            label: "Total Users", 
            value: statsData.data.totalUsers.value.toString(), 
            icon: Users, 
            change: `${statsData.data.totalUsers.trend > 0 ? "+" : ""}${statsData.data.totalUsers.trend}${statsData.data.totalUsers.isPercentage ? "%" : ""}`, 
            trend: statsData.data.totalUsers.trend >= 0 ? "up" : "down", 
            color: "bg-[#2F80ED]" 
        },
        { 
            label: "Monthly Revenue", 
            value: `$${statsData.data.monthlyRevenue.value}`, 
            icon: DollarSign, 
            change: `${statsData.data.monthlyRevenue.trend > 0 ? "+" : ""}${statsData.data.monthlyRevenue.trend}${statsData.data.monthlyRevenue.isPercentage ? "%" : ""}`, 
            trend: statsData.data.monthlyRevenue.trend >= 0 ? "up" : "down", 
            color: "bg-[#2F66B1]" 
        },
        { 
            label: "Active Businesses", 
            value: statsData.data.activeBusinesses.value.toString(), 
            icon: Building2, 
            change: `${statsData.data.activeBusinesses.trend > 0 ? "+" : ""}${statsData.data.activeBusinesses.trend}${statsData.data.activeBusinesses.isPercentage ? "%" : ""}`, 
            trend: statsData.data.activeBusinesses.trend >= 0 ? "up" : "down", 
            color: "bg-[#826C2B]" 
        },
        { 
            label: "Support Tickets", 
            value: statsData.data.supportTickets.value.toString(), 
            icon: AlertCircle, 
            change: `${statsData.data.supportTickets.trend > 0 ? "+" : ""}${statsData.data.supportTickets.trend}${statsData.data.supportTickets.isPercentage ? "%" : ""}`, 
            trend: statsData.data.supportTickets.trend >= 0 ? "up" : "down", 
            color: "bg-red-500" 
        },
    ] : [];

    const areaData = chartsData?.data?.revenueGrowth || [];
    const pieData = chartsData?.data?.planDistribution?.map((item: any) => ({
        ...item,
        name: item.name === "NONE" ? "Free" : item.name
    })) || [];

    const getActivityIcon = (status: string) => {
        switch (status) {
            case "new_user": return { icon: TrendingUp, color: "text-blue-500" };
            case "payment": return { icon: DollarSign, color: "text-green-500" };
            default: return { icon: AlertCircle, color: "text-amber-500" };
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[#0F172A]">Admin Dashboard</h1>
                <p className="text-gray-500">Welcome back! Here's what's happening with your platform.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {statsLoading ? (
                    Array(4).fill(0).map((_, idx) => (
                        <div key={idx} className="admin-card rounded-xl p-6 animate-pulse">
                            <div className="h-10 bg-gray-200 rounded w-1/2 mb-4" />
                            <div className="h-6 bg-gray-100 rounded w-1/4" />
                        </div>
                    ))
                ) : (
                    stats.map((stat, idx) => (
                        <div key={idx} className="admin-card border border-blue-100 bg-white shadow-none rounded-xl p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                    <p className="mt-1 text-2xl font-bold text-[#0F172A]">{stat.value}</p>
                                </div>
                                <div className={cn("rounded-lg p-2 text-white", stat.color)}>
                                    <stat.icon className="size-5" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-1">
                                {stat.trend === "up" ? (
                                    <TrendingUp className="size-3 text-green-500" />
                                ) : (
                                    <TrendingDown className="size-3 text-red-500" />
                                )}
                                <span className={cn("text-xs font-semibold", stat.trend === "up" ? "text-green-500" : "text-red-500")}>
                                    {stat.change}
                                </span>
                                <span className="text-xs text-gray-400">vs last month</span>
                             </div>
                        </div>
                    ))
                )}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Revenue & User Growth Chart */}
                <div className="admin-card border border-blue-100 bg-white shadow-none rounded-xl p-6 lg:col-span-2">
                    <h3 className="text-lg font-bold text-[#0F172A]">Revenue & User Growth</h3>
                    <div className="mt-6 h-[300px] w-full">
                        {chartsLoading ? (
                            <div className="h-full w-full bg-gray-50 animate-pulse rounded-lg" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={areaData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#94A3B8' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#94A3B8' }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #BFDBFE', backgroundColor: '#FFFFFF', boxShadow: 'none' }}
                                        labelStyle={{ color: '#000000', fontWeight: 'bold' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#3B82F6"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                        name="Revenue ($)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="users"
                                        stroke="#10B981"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorUsers)"
                                        name="Users"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Plan Distribution Chart */}
                <div className="admin-card border border-blue-100 bg-white shadow-none rounded-xl p-6">
                    <h3 className="text-lg font-bold text-[#0F172A]">Plan Distribution</h3>
                    <div className="mt-6 flex h-[250px] items-center justify-center">
                        {chartsLoading ? (
                            <div className="size-40 rounded-full border-8 border-gray-100 animate-spin border-t-blue-500" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #BFDBFE', backgroundColor: '#FFFFFF', boxShadow: 'none' }}
                                        labelStyle={{ color: '#000000', fontWeight: 'bold' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-1">
                        {pieData.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2">
                                <div className="size-2 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                                <span className="text-xs text-gray-500">{item.name}</span>
                                <span className="ml-auto text-xs font-semibold text-[#0F172A]">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="admin-card border border-blue-100 bg-white shadow-none rounded-xl p-6">
                <h3 className="text-lg font-bold text-[#0F172A]">Recent Activity</h3>
                <div className="mt-6 space-y-6">
                    {logsLoading ? (
                        Array(5).fill(0).map((_, idx) => (
                            <div key={idx} className="flex items-start gap-4 animate-pulse">
                                <div className="size-8 rounded-lg bg-gray-200" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                                    <div className="h-3 bg-gray-50 rounded w-1/4" />
                                </div>
                            </div>
                        ))
                    ) : logsData?.data?.length > 0 ? (
                        logsData.data.map((log: any) => {
                            const { icon: Icon, color } = getActivityIcon(log.status);
                            return (
                                <div 
                                    key={log.activityLogId} 
                                    className="flex items-start gap-4"
                                >
                                    <div className={cn("mt-1 flex size-8 items-center justify-center rounded-lg bg-gray-50", color)}>
                                        <Icon className="size-4" />
                                    </div>
                                    <div className="flex flex-1 flex-col">
                                        <p className="text-sm font-medium text-[#0F172A]">
                                            {log.title}
                                        </p>
                                        <span className="text-xs text-gray-400">
                                            {timeAgo(new Date(log.createdAt))}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-center text-gray-500 text-sm py-4">No recent activity found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}