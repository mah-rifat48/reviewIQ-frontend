"use client";

import React, { useMemo } from "react";
import Skeleton from "@/components/ui/Skeleton";
import { PageHeaderSkeleton, StatsCardsSkeleton, ChartSkeleton } from "@/components/admin/AdminSkeletons";
import { useGetBusinessCategoriesQuery } from "@/redux/api/AI/businessCategoryApi";
import {
    useGetDashboardStatisticsQuery,
    useGetDashboardChartsQuery,
    useGetConversionFunnelQuery
} from "@/redux/api/BE/admin/analyticsApi";
import {
    Users,
    TrendingUp,
    Building2,
    BarChart3,
    ArrowUpRight,
    TrendingDown
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell
} from "recharts";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const stats = [
    { label: "Total Users", value: "167", icon: Users, change: "+14", trend: "up", color: "bg-blue-500" },
    { label: "Total MRR", value: "$51.2k", icon: TrendingUp, change: "+5%", trend: "up", color: "bg-blue-600" },
    { label: "Active Businesses", value: "234", icon: Building2, change: "+07", trend: "up", color: "bg-amber-700" },
    { label: "Churn Rate", value: "2.8%", icon: TrendingDown, change: "-5%", trend: "down", color: "bg-red-500" },
];

const areaData = [
    { name: "Jul", users: 45 },
    { name: "Aug", users: 65 },
    { name: "Sep", users: 75 },
    { name: "Oct", users: 95 },
    { name: "Nov", users: 120 },
    { name: "Dec", users: 140 },
    { name: "Jan", users: 167 },
];

const barData = [
    { name: "Jul", processed: 3500 },
    { name: "Aug", processed: 4200 },
    { name: "Sep", processed: 5500 },
    { name: "Oct", processed: 7000 },
    { name: "Nov", processed: 8500 },
    { name: "Dec", processed: 10500 },
    { name: "Jan", processed: 13000 },
];

const pieData = [
    { name: "Restaurant", value: 45, color: "#3B82F6" },
    { name: "Retail", value: 32, color: "#8B5CF6" },
    { name: "Service", value: 28, color: "#10B981" },
    { name: "Healthcare", value: 18, color: "#F59E0B" },
    { name: "Hotel", value: 12, color: "#EF4444" },
];

const funnelData = [
    { label: "Signups", value: 250, percent: "100%", color: "bg-blue-600" },
    { label: "Completed Onboarding", value: 225, percent: "90%", color: "bg-purple-600" },
    { label: "Started Trial", value: 198, percent: "79%", color: "bg-green-600" },
    { label: "Converted to Paid", value: 167, percent: "67%", color: "bg-amber-600" },
];

export default function AnalyticsDashboard() {
    const { data: categoryData } = useGetBusinessCategoriesQuery();
    const { data: statsQueryData, isLoading: statsLoading } = useGetDashboardStatisticsQuery();
    const { data: chartsQueryData } = useGetDashboardChartsQuery();
    const { data: funnelQueryData } = useGetConversionFunnelQuery();

    const COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#14B8A6", "#84CC16"];

    const dynamicPieData = useMemo(() => {
        if (!categoryData?.categories || categoryData.categories.length === 0) return pieData;

        return categoryData.categories.map((cat: any, index: number) => ({
            name: cat.category.charAt(0).toUpperCase() + cat.category.slice(1),
            value: cat.business_count,
            color: COLORS[index % COLORS.length]
        }));
    }, [categoryData]);

    const dynamicStats = useMemo(() => {
        if (!statsQueryData?.data) return stats;
        const data = statsQueryData.data;
        return [
            {
                label: "Total Users",
                value: data.totalUsers?.value?.toLocaleString() || "0",
                icon: Users,
                change: `${data.totalUsers?.trend >= 0 ? "+" : ""}${data.totalUsers?.trend || 0}${data.totalUsers?.isPercentage ? "%" : ""}`,
                trend: data.totalUsers?.trend >= 0 ? "up" : "down",
                color: "bg-blue-500"
            },
            {
                label: "Total MRR",
                value: `$${data.monthlyRevenue?.value?.toLocaleString() || "0"}`,
                icon: TrendingUp,
                change: `${data.monthlyRevenue?.trend >= 0 ? "+" : ""}${data.monthlyRevenue?.trend || 0}${data.monthlyRevenue?.isPercentage ? "%" : ""}`,
                trend: data.monthlyRevenue?.trend >= 0 ? "up" : "down",
                color: "bg-blue-600"
            },
            {
                label: "Active Businesses",
                value: data.activeBusinesses?.value?.toLocaleString() || "0",
                icon: Building2,
                change: `${data.activeBusinesses?.trend >= 0 ? "+" : ""}${data.activeBusinesses?.trend || 0}${data.activeBusinesses?.isPercentage ? "%" : ""}`,
                trend: data.activeBusinesses?.trend >= 0 ? "up" : "down",
                color: "bg-amber-700"
            },
            {
                label: "Churn Rate",
                value: `${data.churnRate?.value || 0}%`,
                icon: TrendingDown,
                change: `${data.churnRate?.trend >= 0 ? "+" : ""}${data.churnRate?.trend || 0}${data.churnRate?.isPercentage ? "%" : ""}`,
                trend: data.churnRate?.trend >= 0 ? "up" : "down",
                color: "bg-red-500"
            }
        ];
    }, [statsQueryData]);

    const dynamicChartData = useMemo(() => {
        if (!chartsQueryData?.data?.revenueGrowth) return areaData;
        return chartsQueryData.data.revenueGrowth.map((item: any) => ({
            name: item.month,
            users: item.users || 0,
            reviews: item.reviews || 0,
            revenue: item.revenue || 0,
            churn: item.churn || 0
        }));
    }, [chartsQueryData]);

    const dynamicFunnelData = useMemo(() => {
        if (!funnelQueryData?.data) return funnelData;
        const data = funnelQueryData.data;
        return [
            { label: "Signups", value: data.signups?.value || 0, percent: "100%", color: "bg-blue-600" },
            { label: "Completed Onboarding", value: data.completedOnboarding?.value || 0, percent: `${data.completedOnboarding?.percentage || 0}%`, color: "bg-purple-600" },
            { label: "Started Trial", value: data.startedTrial?.value || 0, percent: `${data.startedTrial?.percentage || 0}%`, color: "bg-green-600" },
            { label: "Converted to Paid", value: data.convertedToPaid?.value || 0, percent: `${data.convertedToPaid?.percentage || 0}%`, color: "bg-amber-600" },
        ];
    }, [funnelQueryData]);

    const overallConversionRate = funnelQueryData?.data?.overallConversionRate ?? 67;
    const conversionText = funnelQueryData?.data?.conversionText ?? "167 out of 250 signups converted";

    if (statsLoading) {
        return (
            <div className="space-y-8 pb-10">
                <PageHeaderSkeleton />
                <StatsCardsSkeleton />
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <ChartSkeleton height={300} />
                    <ChartSkeleton height={300} />
                </div>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <ChartSkeleton height={300} />
                    </div>
                    <div>
                        <ChartSkeleton height={300} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[#0F172A]">Analytics Dashboard</h1>
                <p className="text-gray-500">Platform performance and insights</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {dynamicStats.map((stat, idx) => (
                    <div key={idx} className="admin-card rounded-xl p-6">
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
                                <ArrowUpRight className="size-3 text-green-500" />
                            ) : (
                                <TrendingDown className="size-3 text-red-500" />
                            )}
                            <span className={cn("text-xs font-semibold", stat.trend === "up" ? "text-green-500" : "text-red-500")}>
                                {stat.change}
                            </span>
                            <span className="text-xs text-gray-400">vs last month</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* User Growth Chart */}
                 <div className="rounded-xl admin-card p-6">
                    <h3 className="text-lg font-bold text-[#0F172A]">User Growth & Churn</h3>
                    <div className="mt-6 h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dynamicChartData}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorChurn" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #BFDBFE', backgroundColor: '#FFFFFF', boxShadow: 'none' }}
                                    labelStyle={{ color: '#000000', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="users" name="Users" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                                <Area type="monotone" dataKey="churn" name="Churn" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorChurn)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Reviews Processed Chart */}
                <div className="rounded-xl admin-card p-6">
                    <h3 className="text-lg font-bold text-[#0F172A]">Reviews Processed</h3>
                    <div className="mt-6 h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dynamicChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #BFDBFE', backgroundColor: '#FFFFFF', boxShadow: 'none' }}
                                    labelStyle={{ color: '#000000', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="reviews" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Business Categories Pie Chart */}
                <div className="rounded-xl admin-card p-6">
                    <h3 className="text-lg font-bold text-[#0F172A]">Business Categories</h3>
                    <div className="mt-6 flex h-[250px] items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={dynamicPieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {dynamicPieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #BFDBFE', backgroundColor: '#FFFFFF', boxShadow: 'none' }}
                                    labelStyle={{ color: '#000000', fontWeight: 'bold' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                        {dynamicPieData.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <div className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-xs text-gray-500">{item.name}</span>
                                <span className="ml-auto text-xs font-semibold text-[#0F172A]">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Conversion Funnel */}
                <div className="rounded-xl admin-card p-6 lg:col-span-2">
                    <h3 className="text-lg font-bold text-[#0F172A]">Conversion Funnel</h3>
                    <div className="mt-6 space-y-6">
                        {dynamicFunnelData.map((item, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">{item.label}</span>
                                    <span className="font-semibold text-[#0F172A]">
                                        {item.value} <span className="ml-1 text-xs text-gray-400">({item.percent})</span>
                                    </span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-gray-100">
                                    <div
                                        className={cn("h-full rounded-full", item.color)}
                                        style={{ width: item.percent }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 rounded-lg bg-blue-50 p-4">
                        <p className="text-xs font-medium text-blue-600">Overall Conversion Rate</p>
                        <p className="mt-1 text-xl font-bold text-blue-700">{overallConversionRate}%</p>
                        <p className="text-[10px] text-blue-500">{conversionText}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}