"use client";

import React, { useEffect } from "react";
import { X, Calendar, Tag, AlertCircle, User, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface TicketDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticket: any;
}

const CATEGORY_LABELS: Record<string, string> = {
    "GENERAL_QUESTION": "General Question",
    "TECHNICAL_PROBLEM": "Technical Problem",
    "BILLING_AND_PAYMENT_ISSUE": "Billing & Payment",
    "FEATURE_REQUEST": "Feature Request",
    "INTEGRATION_ISSUE": "Integration Issue"
};

export default function TicketDetailsModal({ isOpen, onClose, ticket }: TicketDetailsModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen || !ticket) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">TKT-{ticket.supportTicketId.slice(-4)}</span>
                            <span className={cn(
                                "px-2.5 py-0.5 rounded-md text-[10px] font-bold",
                                ticket.status === "IN_PROGRESS" ? "bg-amber-100 text-amber-600" :
                                    ticket.status === "OPEN" ? "bg-blue-100 text-blue-600" :
                                        "bg-green-100 text-green-600"
                            )}>
                                {ticket.status.replace('_', ' ')}
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">{ticket.subject}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="cursor-pointer p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm">
                                <Tag className="size-4 text-gray-400" />
                                <div>
                                    <p className="text-gray-500 text-xs">Category</p>
                                    <p className="font-semibold text-gray-900">{CATEGORY_LABELS[ticket.category] || ticket.category}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <AlertCircle className="size-4 text-gray-400" />
                                <div>
                                    <p className="text-gray-500 text-xs">Priority</p>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-[10px] font-bold inline-block mt-0.5",
                                        ticket.priority === 'HIGH' ? "bg-red-100 text-red-600" :
                                            ticket.priority === 'MEDIUM' ? "bg-blue-100 text-blue-600" :
                                                "bg-gray-100 text-gray-600"
                                    )}>
                                        {ticket.priority}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm">
                                <Calendar className="size-4 text-gray-400" />
                                <div>
                                    <p className="text-gray-500 text-xs">Created At</p>
                                    <p className="font-semibold text-gray-900">{formatDate(ticket.createdAt)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <User className="size-4 text-gray-400" />
                                <div>
                                    <p className="text-gray-500 text-xs">Created By</p>
                                    <p className="font-semibold text-gray-900">{ticket.users?.[0]?.name || "Me"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                            <MessageSquare className="size-4" />
                            <h3>Description</h3>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {ticket.description}
                        </div>
                    </div>

                    {/* Admin Feedback */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                            <MessageSquare className="size-4 text-blue-500" />
                            <h3>Admin Feedback</h3>
                        </div>
                        <div className="bg-blue-50/30 rounded-2xl p-5 border border-blue-100/50 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {ticket.feedback || "No feedback from admin yet."}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="cursor-pointer px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
