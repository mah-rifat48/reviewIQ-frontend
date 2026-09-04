"use client";

import React, { useState, useMemo } from "react";
import Skeleton from "@/components/ui/Skeleton";
import { PageHeaderSkeleton, StatsCardsSkeleton, SupportTableSkeleton } from "@/components/admin/AdminSkeletons";
import {
    useGetAdminSupportSummaryQuery,
    useUpdateSupportTicketAdminMutation
} from "@/redux/api/BE/admin/supportApi";
import { toast } from "react-hot-toast";
import {
    Inbox,
    Clock,
    CheckCircle2,
    Timer,
    Search,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Eye
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import TicketDetailsModal from "../../../../../components/admin/support/TicketDetailsModal";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function SupportTickets() {
    const { data: summaryRes, isLoading } = useGetAdminSupportSummaryQuery();
    const [updateTicketStatus] = useUpdateSupportTicketAdminMutation();

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleViewTicket = (tkt: any) => {
        setSelectedTicket(tkt);
        setIsModalOpen(true);
    };

    const handleUpdateStatus = async (id: string, status: string, feedback?: string) => {
        try {
            await updateTicketStatus({ id, status, feedback }).unwrap();
            toast.success("Ticket updated successfully!");
        } catch (err) {
            console.error("Failed to update status", err);
            toast.error("Failed to update ticket.");
        }
    };

    const dynamicStats = useMemo(() => {
        const statsData = summaryRes?.data?.stats;
        return [
            { label: "Open Tickets", value: statsData?.openTickets?.toString() || "0", icon: Inbox, color: "text-cyan-600" },
            { label: "In Progress", value: statsData?.inProgress?.toString() || "0", icon: Clock, color: "text-amber-600" },
            { label: "Resolved Today", value: statsData?.resolvedToday?.toString() || "0", icon: CheckCircle2, color: "text-green-600" },
            { label: "Urgent Tickets", value: statsData?.urgentTickets?.toString() || "0", icon: Timer, color: "text-purple-600" },
        ];
    }, [summaryRes]);

    const formattedTickets = useMemo(() => {
        if (!summaryRes?.data?.tickets) return [];
        return summaryRes.data.tickets.map((tkt: any) => {
            const user = tkt.users?.[0] || {};

            // Format priority (e.g. MEDIUM -> Medium)
            let formattedPriority = "Medium";
            if (tkt.priority) {
                formattedPriority = tkt.priority.charAt(0).toUpperCase() + tkt.priority.slice(1).toLowerCase();
            }

            // Format status (e.g. OPEN -> Open)
            let formattedStatus = "Open";
            if (tkt.status === "IN_PROGRESS") formattedStatus = "In Progress";
            else if (tkt.status === "RESOLVED") formattedStatus = "Resolved";
            else if (tkt.status === "OPEN") formattedStatus = "Open";

            // Format category (e.g. GENERAL_QUESTION -> General question)
            let formattedCategory = tkt.category || "General";
            if (tkt.category) {
                formattedCategory = tkt.category.replace(/_/g, " ").toLowerCase();
                formattedCategory = formattedCategory.charAt(0).toUpperCase() + formattedCategory.slice(1);
            }

            return {
                id: `TKT-${tkt.supportTicketId.slice(0, 4).toUpperCase()}`,
                supportTicketId: tkt.supportTicketId,
                name: user.name || "Unknown",
                email: user.email || "No email provided",
                subject: tkt.subject,
                description: tkt.description,
                priority: formattedPriority,
                status: formattedStatus,
                category: formattedCategory,
                feedback: tkt.feedback || "",
                updated: tkt.updatedAt ? new Date(tkt.updatedAt).toLocaleDateString() : "N/A"
            };
        });
    }, [summaryRes]);

    const filteredTickets = useMemo(() => {
        return formattedTickets.filter((ticket: any) => {
            const matchesSearch =
                ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ticket.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ticket.subject.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === "All Status" || ticket.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [formattedTickets, searchTerm, statusFilter]);

    const totalPages = Math.ceil(filteredTickets.length / itemsPerPage) || 1;
    const paginatedTickets = filteredTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="space-y-8 pb-10">
                <PageHeaderSkeleton />
                <StatsCardsSkeleton />
                <div className="space-y-4">
                    <Skeleton className="h-11 w-full max-w-md rounded-xl" />
                    <SupportTableSkeleton rows={8} />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[#0F172A]">Support Tickets</h1>
                <p className="text-gray-500">Manage customer support requests</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {dynamicStats.map((stat, idx) => (
                    <div key={idx} className="admin-card rounded-xl p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col">
                                <p className="flex items-center gap-2 text-sm font-medium text-gray-500">
                                    <stat.icon className={cn("size-4", stat.color)} />
                                    {stat.label}
                                </p>
                                <p className="mt-2 text-2xl font-bold text-[#0F172A]">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
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
                            setCurrentPage(1);
                        }}
                        className="block w-full rounded-xl border border-blue-100 bg-white py-2 pl-10 pr-3 text-sm text-[#0F172A] placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Search tickets by ID, name or subject..."
                    />
                </div>

                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 text-nowrap rounded-xl border border-blue-100 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        {statusFilter}
                        <ChevronDown className="size-4 text-gray-500" />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 z-10 mt-2 w-48 rounded-xl border border-blue-100 bg-white p-1 shadow-none">
                            {["All Status", "Open", "In Progress", "Resolved"].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => {
                                        setStatusFilter(status);
                                        setCurrentPage(1);
                                        setIsDropdownOpen(false);
                                    }}
                                    className={cn(
                                        "w-full rounded-xl px-4 py-2 text-left text-sm transition-colors cursor-pointer",
                                        statusFilter === status ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
                                    )}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Tickets Table */}
            {/* DESKTOP TABLE – visible from xl upwards */}
            <div className="hidden xl:block overflow-hidden rounded-xl admin-card">
                <div className="overflow-x-auto">
                    <table className="w-full table-auto text-left text-sm">
                        <thead className="bg-[#F8FAFC] text-xs font-semibold uppercase text-gray-500">
                            <tr className="whitespace-nowrap"><th className="px-4 py-4 min-w-[100px]">Ticket ID</th><th className="px-4 py-4 min-w-[160px]">Customer</th><th className="px-4 py-4 min-w-[160px]">Subject</th><th className="px-4 py-4 min-w-[80px]">Priority</th><th className="px-4 py-4 min-w-[80px]">Status</th><th className="px-4 py-4 min-w-[90px]">Category</th><th className="px-4 py-4 min-w-[110px]">Last Update</th><th className="px-4 py-4 min-w-[60px] text-right">Actions</th></tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                            {paginatedTickets.map((tkt: any) => (
                                <tr key={tkt.id} className="hover:bg-gray-50/60 transition-colors">
                                    <td className="px-4 py-4 font-bold text-[#0F172A] whitespace-nowrap">
                                        {tkt.id}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-col min-w-[140px]">
                                            <span className="font-medium text-[#0F172A] truncate max-w-[220px]">
                                                {tkt.name}
                                            </span>
                                            <span className="text-xs text-gray-500 truncate max-w-[220px]">
                                                {tkt.email}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-gray-600 line-clamp-2 max-w-[180px]">
                                        {tkt.subject}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span
                                            className={cn(
                                                "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase",
                                                tkt.priority === "Urgent" && "bg-red-50 text-red-700",
                                                tkt.priority === "High" && "bg-amber-50 text-amber-700",
                                                tkt.priority === "Medium" && "bg-cyan-50 text-cyan-700",
                                                tkt.priority === "Low" && "bg-gray-50 text-gray-700",
                                            )}
                                        >
                                            {tkt.priority}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span
                                            className={cn(
                                                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                                tkt.status === "Open" && "bg-cyan-50 text-cyan-700",
                                                tkt.status === "In Progress" && "bg-amber-50 text-amber-700",
                                                tkt.status === "Resolved" && "bg-green-50 text-green-700",
                                            )}
                                        >
                                            {tkt.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                                        {tkt.category}
                                    </td>
                                    <td className="px-4 py-4 text-gray-500 whitespace-nowrap">
                                        {tkt.updated}
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <button
                                            onClick={() => handleViewTicket(tkt)}
                                            className="rounded bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                                        >
                                            view
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {paginatedTickets.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="py-16 text-center text-gray-500">
                                        No tickets found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* ────────────────────────────────────────────────
          CARDS – mobile & tablet (< xl)
      ──────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:hidden">
                {paginatedTickets.map((tkt: any) => (
                    <div
                        key={tkt.id}
                        className="admin-card rounded-xl p-5 space-y-4 hover:border-cyan-200 transition-colors"
                    >
                        {/* Top row: ID + Status */}
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="font-bold text-[#0F172A]">{tkt.id}</div>
                                <div className="text-sm text-gray-600 mt-0.5">{tkt.name}</div>
                            </div>

                            <span
                                className={cn(
                                    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap",
                                    tkt.status === "Open" && "bg-cyan-50 text-cyan-700",
                                    tkt.status === "In Progress" && "bg-amber-50 text-amber-700",
                                    tkt.status === "Resolved" && "bg-green-50 text-green-700",
                                )}
                            >
                                {tkt.status}
                            </span>
                        </div>

                        {/* Subject */}
                        <div className="text-gray-700 text-sm line-clamp-2">
                            {tkt.subject}
                        </div>

                        {/* Grid with important fields */}
                        <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-50 text-sm">
                            <div className="space-y-0.5">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Priority
                                </p>
                                <span
                                    className={cn(
                                        "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                                        tkt.priority === "Urgent" && "bg-red-50 text-red-700",
                                        tkt.priority === "High" && "bg-amber-50 text-amber-700",
                                        tkt.priority === "Medium" && "bg-cyan-50 text-cyan-700",
                                        tkt.priority === "Low" && "bg-gray-50 text-gray-600",
                                    )}
                                >
                                    {tkt.priority}
                                </span>
                            </div>

                            <div className="space-y-0.5">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Category
                                </p>
                                <p className="text-gray-700">{tkt.category}</p>
                            </div>

                            <div className="space-y-0.5">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Updated
                                </p>
                                <p className="text-gray-600">{tkt.updated}</p>
                            </div>
                        </div>

                        {/* Action */}
                        <div className="flex justify-end">
                            <button
                                onClick={() => handleViewTicket(tkt)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
                            >
                                <Eye className="size-4" />
                                <span className="text-sm font-medium">View</span>
                            </button>
                        </div>
                    </div>
                ))}

                {paginatedTickets.length === 0 && (
                    <div className="col-span-1 md:col-span-2 py-16 flex flex-col items-center justify-center admin-card rounded-xl border-dashed">
                        <p className="text-gray-500 font-medium">No tickets found</p>
                        <p className="text-gray-400 text-sm mt-1">
                            Try changing search or status filter
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages >= 1 && (
                <div className="flex flex-col items-center justify-center gap-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 font-medium text-center order-2">
                        Showing{" "}
                        <span className="text-[#0F172A] font-bold">
                            {(currentPage - 1) * itemsPerPage + 1}
                        </span>{" "}
                        to{" "}
                        <span className="text-[#0F172A] font-bold">
                            {Math.min(currentPage * itemsPerPage, filteredTickets.length)}
                        </span>{" "}
                        of{" "}
                        <span className="text-[#0F172A] font-bold">
                            {filteredTickets.length}
                        </span>{" "}
                        tickets
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

            <TicketDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                ticket={selectedTicket}
                onUpdateStatus={handleUpdateStatus}
            />
        </div>
    );
}
