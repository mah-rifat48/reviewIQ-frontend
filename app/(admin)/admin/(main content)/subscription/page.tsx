"use client";

import React, { useState, useMemo } from "react";
import Skeleton from "@/components/ui/Skeleton";
import { PageHeaderSkeleton, StatsCardsSkeleton, ChartSkeleton, TableSkeleton } from "@/components/admin/AdminSkeletons";
import { useGetAllSubscriptionsQuery, useGetSubscriptionStatisticsQuery } from "@/redux/api/BE/admin/subscriptionApi";
import {
    DollarSign,
    CheckCircle,
    Clock,
    AlertTriangle,
    Search,
    ChevronDown,
    Eye,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import SubscriptionDetailsModal from "../../../../../components/admin/subscription/SubscriptionDetailsModal";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const stats = [
    { label: "Total MRR", value: "$580", subValue: "+19.6% from last month", icon: DollarSign, color: "text-green-600" },
    { label: "Active", value: "142", subValue: "85% of total", icon: CheckCircle, color: "text-blue-600" },
    { label: "Trial", value: "18", subValue: "12 converting soon", icon: Clock, color: "text-amber-600" },
    { label: "Past Due", value: "7", subValue: "Needs attention", icon: AlertTriangle, color: "text-red-600" },
];

const revenueData = [
    { name: "Jul", revenue: 12000 },
    { name: "Aug", revenue: 18000 },
    { name: "Sep", revenue: 22000 },
    { name: "Oct", revenue: 26000 },
    { name: "Nov", revenue: 32000 },
    { name: "Dec", revenue: 41000 },
    { name: "Jan", revenue: 52000 },
];

const initialSubscriptions = [
    { id: 1, name: "John Doe", email: "john.doe@example.com", plan: "Professional", status: "Active", amount: "$79", cycle: "monthly", nextBilling: "2026-02-15" },
    { id: 2, name: "Jane Smith", email: "jane.smith@company.com", plan: "Business", status: "Trial", amount: "$149", cycle: "monthly", nextBilling: "2026-01-24" },
    { id: 3, name: "Robert Johnson", email: "robert.j@business.com", plan: "Starter", status: "Active", amount: "$24", cycle: "annual", nextBilling: "2026-11-20" },
    { id: 4, name: "Sarah Williams", email: "sarah.w@enterprise.com", plan: "Enterprise", status: "Active", amount: "$499", cycle: "monthly", nextBilling: "2026-02-05" },
    { id: 5, name: "Emily Davis", email: "emily.d@startup.com", plan: "Professional", status: "Past due", amount: "$79", cycle: "monthly", nextBilling: "2026-01-01" },
    { id: 6, name: "Michael Scott", email: "michael@paper.com", plan: "Starter", status: "Active", amount: "$24", cycle: "monthly", nextBilling: "2026-02-10" },
];

export default function SubscriptionManagement() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Fetch all subscriptions for frontend filtering (to bypass backend nested joins limitations)
    const { data: subsData, isLoading } = useGetAllSubscriptionsQuery({
        page: 1,
        limit: 1000,
    });

    const { data: statsRes } = useGetSubscriptionStatisticsQuery();
    const statsData = statsRes?.data;

    const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleViewSubscription = (sub: any) => {
        setSelectedSubscription(sub);
        setIsModalOpen(true);
    };

    const dynamicStats = useMemo(() => {
        if (!statsData) return stats;
        return [
            { label: "Total MRR", value: `$${statsData.totalMRR?.value || 0}`, subValue: `${statsData.totalMRR?.trend >= 0 ? '+' : ''}${statsData.totalMRR?.trend || 0}% from last month`, icon: DollarSign, color: "text-green-600" },
            { label: "Active", value: `${statsData.active?.value || 0}`, subValue: `${statsData.active?.percentageOfTotal || 0}% of total`, icon: CheckCircle, color: "text-blue-600" },
            { label: "Trial", value: `${statsData.trial?.value || 0}`, subValue: `${statsData.trial?.convertingSoon || 0} converting soon`, icon: Clock, color: "text-amber-600" },
            { label: "Past Due", value: `${statsData.pastDue?.value || 0}`, subValue: "Needs attention", icon: AlertTriangle, color: "text-red-600" },
        ];
    }, [statsData]);

    const dynamicRevenueData = useMemo(() => {
        if (!statsData?.revenueGrowth) return revenueData;
        return statsData.revenueGrowth.map((r: any) => ({
            name: r.month,
            revenue: r.revenue
        }));
    }, [statsData]);

    // Client-side search and status filter
    const filteredSubscriptions = useMemo(() => {
        if (!subsData?.data) return [];
        return subsData.data.filter((sub: any) => {
            const userName = sub.user?.name || "";
            const userEmail = sub.user?.email || "";
            const matchesSearch =
                userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                userEmail.toLowerCase().includes(searchTerm.toLowerCase());

            let status = "Active";
            if (sub.plan === "NONE") status = "Trial";
            if (sub.paymentStatus === "FAILED") status = "Past due";

            const matchesStatus = statusFilter === "All Status" || status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [subsData, searchTerm, statusFilter]);

    // Client-side pagination
    const paginatedSubscriptions = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredSubscriptions.slice(startIndex, startIndex + itemsPerPage).map((sub: any) => {
            let status = "Active";
            if (sub.plan === "NONE") status = "Trial";
            if (sub.paymentStatus === "FAILED") status = "Past due";

            return {
                ...sub,
                id: sub.subscriptionId,
                name: sub.user?.name || "Unknown",
                email: sub.user?.email || "No email provided",
                plan: sub.plan === "NONE" ? "Trial" : sub.plan,
                status: status,
                amount: `$${sub.balance || 0}`,
                cycle: sub.durationsPlan ? sub.durationsPlan.toLowerCase() : "none",
                nextBilling: sub.durationDate ? new Date(sub.durationDate).toLocaleDateString() : "N/A"
            };
        });
    }, [filteredSubscriptions, currentPage]);

    const totalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage) || 1;
    const totalCount = filteredSubscriptions.length;

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="space-y-8 pb-10">
                <PageHeaderSkeleton />
                <StatsCardsSkeleton />
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <ChartSkeleton height={300} />
                    </div>
                    <div>
                        <ChartSkeleton height={300} />
                    </div>
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-11 w-full max-w-md rounded-xl" />
                    <TableSkeleton rows={6} cols={6} />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[#0F172A]">Subscription Management</h1>
                <p className="text-gray-500">Monitor and manage all platform subscriptions</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {dynamicStats.map((stat, idx) => (
                    <div key={idx} className="admin-card rounded-xl p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                    <stat.icon className={cn("size-3", stat.color)} />
                                    {stat.label}
                                </p>
                                <p className={cn("mt-1 text-2xl font-bold", stat.color)}>{stat.value}</p>
                                <p className="mt-1 text-xs text-gray-400">{stat.subValue}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Revenue Chart */}
            <div className="rounded-xl admin-card p-6">
                <h3 className="text-lg font-bold text-[#0F172A]">Monthly Recurring Revenue</h3>
                <div className="mt-6 h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dynamicRevenueData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: '1px solid #BFDBFE', backgroundColor: '#FFFFFF', boxShadow: 'none' }}
                                labelStyle={{ color: '#000000', fontWeight: 'bold' }}
                            />
                            <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between admin-card p-3 rounded-xl">
                <div className="relative w-full max-w-8xl">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="size-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                        }}
                        className="block w-full rounded-xl border border-blue-100 bg-white py-2.5 pl-10 pr-3 text-sm text-[#0F172A] placeholder-gray-500 focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                        placeholder="Search users by name or email..."
                    />
                </div>

                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center text-nowrap gap-2 rounded-lg border border-blue-100 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        {statusFilter}
                        <ChevronDown className="size-4 text-gray-500" />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 z-10 mt-2 w-48 rounded-xl border border-blue-100 bg-white p-1 shadow-none">
                            {["All Status", "Active", "Trial", "Past due"].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => {
                                        setStatusFilter(status);
                                        setCurrentPage(1);
                                        setIsDropdownOpen(false);
                                    }}
                                    className="w-full text-nowrap rounded-md px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                {/* Subscriptions Table */}
                <div className="overflow-hidden rounded-xl admin-card hidden xl:block">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full table-auto text-left text-sm">
                            <thead className="bg-[#F8FAFC] text-xs font-semibold uppercase text-gray-500">
                                <tr className="whitespace-nowrap"><th className="px-5 py-4 min-w-[180px]">User</th><th className="px-5 py-4 min-w-[100px]">Plan</th><th className="px-5 py-4 min-w-[90px]">Status</th><th className="px-5 py-4 min-w-[90px]">Amount</th><th className="px-5 py-4 min-w-[110px]">Billing Cycle</th><th className="px-5 py-4 min-w-[130px]">Next Billing</th><th className="px-5 py-4 min-w-[70px] text-right">Actions</th></tr>
                            </thead>
                            <tbody className="divide-y divide-[#E2E8F0]">
                                {paginatedSubscriptions.map((sub: any) => (
                                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors"><td className="px-5 py-4">
                                            <div className="flex flex-col min-w-[160px]">  {/* prevents crushing name+email */}
                                                <span className="font-medium text-[#0F172A] truncate max-w-[220px]">
                                                    {sub.name}
                                                </span>
                                                <span className="text-xs text-gray-500 truncate max-w-[220px]">
                                                    {sub.email}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
                                            {sub.plan}
                                        </td>

                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <span
                                                className={cn(
                                                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                                    sub.status === "Active" && "bg-green-50 text-green-700",
                                                    sub.status === "Trial" && "bg-blue-50 text-blue-700",
                                                    sub.status === "Past due" && "bg-red-50 text-red-700"
                                                )}
                                            >
                                                {sub.status}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4 font-semibold text-[#0F172A] whitespace-nowrap">
                                            {sub.amount}
                                        </td>

                                        <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                                            {sub.cycle}
                                        </td>

                                        <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                                            {sub.nextBilling}
                                        </td>

                                        <td className="px-5 py-4 text-right whitespace-nowrap">
                                            <button
                                                onClick={() => handleViewSubscription(sub)}
                                                className="flex items-center justify-center size-8 ml-auto rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                                            >
                                                <Eye className="size-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {paginatedSubscriptions.length === 0 && (
                                    <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            No subscriptions found.
                                        </td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:hidden">
                    {paginatedSubscriptions.map((sub: any) => (
                        <div
                            key={sub.id}
                            className="admin-card rounded-xl p-5 space-y-4 hover:border-blue-200 transition-colors"
                        >
                            {/* Header: Name + Email + Status */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex flex-col">
                                    <span className="font-medium text-[#0F172A] text-base">{sub.name}</span>
                                    <span className="text-sm text-gray-500 mt-0.5">{sub.email}</span>
                                </div>
                                <span
                                    className={cn(
                                        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap",
                                        sub.status === "Active" && "bg-green-50 text-green-700",
                                        sub.status === "Trial" && "bg-blue-50 text-blue-700",
                                        sub.status === "Past due" && "bg-red-50 text-red-700"
                                    )}
                                >
                                    {sub.status}
                                </span>
                            </div>

                            {/* Main info grid */}
                            <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-50 text-sm">
                                <div className="space-y-0.5">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Plan</p>
                                    <p className="font-medium text-[#0F172A]">{sub.plan}</p>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Amount</p>
                                    <p className="font-semibold text-[#0F172A]">{sub.amount}</p>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cycle</p>
                                    <p className="text-gray-600">{sub.cycle}</p>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Next Billing</p>
                                    <p className="text-gray-600">{sub.nextBilling}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end pt-2">
                                <button
                                    onClick={() => handleViewSubscription(sub)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                                >
                                    <Eye className="size-4" />
                                    <span className="text-sm font-medium">View</span>
                                </button>
                            </div>
                        </div>
                    ))}

                    {paginatedSubscriptions.length === 0 && (
                        <div className="col-span-1 md:col-span-2 py-16 flex flex-col items-center justify-center admin-card rounded-xl border-dashed">
                            <p className="text-gray-500 font-medium">No subscriptions found</p>
                            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
                        </div>
                    )}
                </div>

            </div>

            {/* Pagination */}
            {totalPages >= 1 && (
                <div className="flex flex-col items-center justify-center gap-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 font-medium text-center order-2">
                        Showing{" "}
                        <span className="text-[#0F172A] font-bold">
                            {totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
                        </span>{" "}
                        to{" "}
                        <span className="text-[#0F172A] font-bold">
                            {Math.min(currentPage * itemsPerPage, totalCount)}
                        </span>{" "}
                        of{" "}
                        <span className="text-[#0F172A] font-bold">
                            {totalCount}
                        </span>{" "}
                        entries
                    </p>

                    <div className="flex items-center justify-center gap-2 order-1">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 disabled:opacity-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="size-5" />
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                className={cn(
                                    "size-8 rounded-lg text-sm transition-colors cursor-pointer",
                                    currentPage === i + 1
                                        ? "bg-blue-50 font-bold text-blue-600 ring-1 ring-blue-100"
                                        : "text-gray-500 hover:bg-gray-100"
                                )}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 disabled:opacity-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="size-5" />
                        </button>
                    </div>
                </div>
            )}

            <SubscriptionDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                subscription={selectedSubscription}
            />
        </div>
    );
}