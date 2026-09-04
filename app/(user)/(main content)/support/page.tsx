"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, Plus, Mail, Phone, ChevronDown, ChevronLeft, ChevronRight, Loader2, Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import CreateTicketModal from "@/components/user/support/CreateTicketModal";
import EditTicketModal from "@/components/user/support/EditTicketModal";
import TicketDetailsModal from "@/components/user/support/TicketDetailsModal";
import DeleteConfirmationModal from "@/components/user/support/DeleteConfirmationModal";
import Image from "next/image";
import { useGetMySupportTicketsQuery, useDeleteSupportTicketMutation } from "@/redux/api/BE/supportApi";
import { useGetSystemSettingsQuery } from "@/redux/api/BE/landingApi";
import toast from "react-hot-toast";
import Skeleton from "@/components/ui/Skeleton";

const ITEMS_PER_PAGE = 10;

function StatusDropdown({
    value,
    onChange
}: {
    value: string,
    onChange: (val: string) => void
}) {
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

    const options = [
        { label: "All Status", value: "" },
        { label: "Open", value: "OPEN" },
        { label: "In Progress", value: "IN_PROGRESS" },
        { label: "Resolved", value: "RESOLVED" }
    ];

    const currentOption = options.find(o => o.value === value);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="cursor-pointer flex items-center justify-between px-3 py-2.5 text-sm bg-white border border-gray-100 rounded-lg min-w-[140px] hover:bg-gray-50 transition-all text-gray-500"
            >
                <span>{currentOption?.label || "Status"}</span>
                <ChevronDown className={cn("size-4 transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-1 w-full bg-white rounded-lg border border-gray-100 shadow-lg z-20 py-1 animate-in fade-in zoom-in-95 duration-100">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={cn(
                                "w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-50 cursor-pointer",
                                value === option.value ? "text-blue-600 font-medium" : "text-gray-700"
                            )}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function SupportPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editTicketData, setEditTicketData] = useState<any>(null);

    const { data: ticketsResponse, isLoading, isFetching } = useGetMySupportTicketsQuery();
    const { data: systemRes } = useGetSystemSettingsQuery();
    const systemData = systemRes?.data;

    const [deleteTicket, { isLoading: isDeleting }] = useDeleteSupportTicketMutation();

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setTicketToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleEdit = (e: React.MouseEvent, ticket: any) => {
        e.stopPropagation();
        setEditTicketData(ticket);
        setIsEditModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!ticketToDelete) return;
        try {
            await deleteTicket(ticketToDelete).unwrap();
            toast.success("Ticket deleted successfully");
            setIsDeleteModalOpen(false);
            setTicketToDelete(null);
        } catch (error) {
            toast.error("Failed to delete ticket");
        }
    };

    // Reset pagination
    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter]);

    const rawTickets = ticketsResponse?.data?.tickets || [];
    const stats = ticketsResponse?.data?.stats || { totalTickets: 0, open: 0, inProgress: 0, resolved: 0 };

    const filteredTickets = rawTickets.filter((t: any) => {
        const matchSearch = t.subject.toLowerCase().includes(search.toLowerCase()) || 
                            t.description.toLowerCase().includes(search.toLowerCase()) ||
                            t.supportTicketId.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter ? t.status === statusFilter : true;
        return matchSearch && matchStatus;
    });

    const totalPages = Math.max(Math.ceil(filteredTickets.length / ITEMS_PER_PAGE), 1);
    const tickets = filteredTickets.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getCategoryLabel = (cat: string) => {
        return cat.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Support Center</h1>
                    <p className="text-sm text-gray-500 mt-1">Get help with your {systemData?.siteName || "Aimalya"} account</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus className="size-4" />
                    New Ticket
                </button>
            </div>

            <div className="flex flex-col-reverse xl:flex-row gap-8">
                <div className="flex-1 space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="user-card p-5 rounded-2xl">
                            <p className="font-semibold text-gray-900 text-sm">Total Tickets</p>
                            <h2 className="text-2xl font-bold text-gray-900 mt-3">{stats.totalTickets}</h2>
                        </div>
                        <div className="user-card p-5 rounded-2xl">
                            <p className="font-semibold text-gray-900 text-sm">Open</p>
                            <h2 className="text-2xl font-bold text-blue-600 mt-3">{stats.open}</h2>
                        </div>
                        <div className="user-card p-5 rounded-2xl">
                            <p className="font-semibold text-gray-900 text-sm">In Progress</p>
                            <h2 className="text-2xl font-bold text-amber-500 mt-3">{stats.inProgress}</h2>
                        </div>
                        <div className="user-card p-5 rounded-2xl">
                            <p className="font-semibold text-gray-900 text-sm">Resolved</p>
                            <h2 className="text-2xl font-bold text-green-500 mt-3">{stats.resolved}</h2>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 user-card p-2 rounded-xl">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search tickets..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-10 w-full bg-blue-50/50 rounded-lg pl-10 pr-4 text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 border-transparent border outline-none transition-all placeholder:text-gray-400"
                            />
                        </div>
                        <StatusDropdown value={statusFilter} onChange={setStatusFilter} />
                    </div>

                    {/* Tickets List */}
                    <div className="space-y-4 min-h-[400px]">
                        {isLoading || isFetching ? (
                            <>
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="user-card p-6 rounded-2xl space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="h-4 w-16" />
                                            <Skeleton className="h-4 w-20" />
                                            <Skeleton className="h-4 w-14" />
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-6 w-3/4" />
                                                <Skeleton className="h-4 w-1/4" />
                                            </div>
                                            <Skeleton className="size-8 rounded-lg" />
                                        </div>
                                        <Skeleton className="h-3 w-32 mt-4" />
                                    </div>
                                ))}
                            </>
                        ) : tickets.length > 0 ? (
                            tickets.map((ticket: any) => (
                                <div
                                    key={ticket.supportTicketId}
                                    onClick={() => setSelectedTicket(ticket)}
                                    className="bg-blue-50/20 p-6 rounded-2xl border border-blue-100 hover:border-blue-200 transition-colors cursor-pointer group"
                                >
                                    <div className="flex items-start w-full">
                                        <div className="flex justify-between items-start w-full">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">TKT-{ticket.supportTicketId.slice(-4)}</span>

                                                    <span className={cn(
                                                        "px-2.5 py-0.5 rounded-md text-[10px] font-bold",
                                                        ticket.status === "IN_PROGRESS" ? "bg-amber-100 text-amber-600" :
                                                            ticket.status === "OPEN" ? "bg-blue-100 text-blue-600" :
                                                                "bg-green-100 text-green-600"
                                                    )}>
                                                        {ticket.status.replace('_', ' ')}
                                                    </span>

                                                    <span className={cn(
                                                        "px-2.5 py-0.5 rounded-md text-[10px] font-bold",
                                                        ticket.priority === 'HIGH' ? "bg-red-100 text-red-600" :
                                                            ticket.priority === 'MEDIUM' ? "bg-blue-100 text-blue-600" :
                                                                "bg-gray-100 text-gray-600"
                                                    )}>
                                                        {ticket.priority}
                                                    </span>
                                                </div>

                                                <h3 className="text-base font-bold text-gray-900 truncate pr-4 group-hover:text-blue-600 transition-colors">{ticket.subject}</h3>
                                                <p className="text-xs text-gray-500 mt-1">{getCategoryLabel(ticket.category)}</p>
                                                <p className="text-xs text-gray-400 mt-4">Created {formatDate(ticket.createdAt)}</p>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => handleEdit(e, ticket)}
                                                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                                                    title="Edit Ticket"
                                                >
                                                    <Pencil className="size-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDelete(e, ticket.supportTicketId)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                                                    title="Delete Ticket"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 user-card rounded-2xl border-dashed">
                                <p className="text-gray-500 font-medium">No tickets found.</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-4">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="cursor-pointer flex items-center px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="size-3 mr-1" />
                                Previous
                            </button>

                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={cn(
                                        "size-8 rounded-lg text-xs font-medium transition-all",
                                        currentPage === i + 1
                                            ? "bg-blue-100 text-blue-600"
                                            : "text-gray-500 hover:bg-gray-100"
                                    )}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="cursor-pointer flex items-center px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                                <ChevronRight className="size-3 ml-1" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Sidebar */}
                <div className="w-full xl:w-[360px] flex-shrink-0">
                    <div className="bg-blue-100/50 rounded-3xl p-6 md:p-8 space-y-8 sticky top-24 border border-blue-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="relative size-48 mb-6">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Image src="/support_img.svg" alt="Support" width={200} height={200} />
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Get help with your {systemData?.siteName || "Aimalya"} account</h3>
                        </div>

                        <div className="bg-white/50 rounded-2xl p-4 md:p-6 backdrop-blur-sm space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-gray-900 font-bold">
                                    <Mail className="size-5" />
                                    <h3>Email Support</h3>
                                </div>
                                <p className="text-xs text-gray-500">Reach out to our team directly</p>
                                <a href={`mailto:${systemData?.supportEmail || "support@example.com"}`} className="block text-green-600 font-medium hover:underline">
                                    {systemData?.supportEmail || "support@example.com"}
                                </a>
                            </div>

                            <div className="h-px bg-gray-200" />

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-gray-900 font-bold">
                                    <Phone className="size-5" />
                                    <h3>Phone Support</h3>
                                </div>
                                <p className="text-xs text-gray-500">Available for Business & Enterprise plans</p>
                                <a href={`tel:${systemData?.supportPhone || "+18001436156"}`} className="block text-blue-600 font-medium hover:underline">
                                    {systemData?.supportPhone || "+1 (800)1436156"}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <CreateTicketModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
                <EditTicketModal 
                    isOpen={isEditModalOpen} 
                    onClose={() => setIsEditModalOpen(false)} 
                    ticket={editTicketData} 
                />
                <TicketDetailsModal
                    isOpen={!!selectedTicket}
                    onClose={() => setSelectedTicket(null)}
                    ticket={selectedTicket}
                />
                <DeleteConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => {
                        setIsDeleteModalOpen(false);
                        setTicketToDelete(null);
                    }}
                    onConfirm={confirmDelete}
                    isLoading={isDeleting}
                />
            </div>
        </div>
    );
}

