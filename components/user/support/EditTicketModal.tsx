"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, ChevronDown, Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpdateSupportTicketMutation } from "@/redux/api/BE/supportApi";
import { toast } from "react-hot-toast";

interface EditTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticket: any;
}

const CATEGORY_MAP: Record<string, string> = {
    "General Question": "GENERAL_QUESTION",
    "Integration Issue": "INTEGRATION_ISSUE",
    "Billing & Payment": "BILLING_AND_PAYMENT_ISSUE",
    "Feature Request": "FEATURE_REQUEST",
    "Technical Problem": "TECHNICAL_PROBLEM"
};

const REVERSE_CATEGORY_MAP: Record<string, string> = Object.entries(CATEGORY_MAP).reduce((acc, [key, value]) => ({ ...acc, [value]: key }), {});

// Custom Dropdown for Modal
function ModalDropdown({
    label,
    options,
    value,
    onChange
}: {
    label: string,
    options: string[],
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

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 bg-blue-50/30 border border-blue-100 rounded-xl hover:bg-blue-50/50 transition-all cursor-pointer"
            >
                <span className={value ? "text-gray-900" : "text-gray-400"}>
                    {value || label}
                </span>
                <ChevronDown className={cn("size-4 text-gray-400 transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-xl border border-gray-100 shadow-xl z-50 py-1 animate-in fade-in zoom-in-95 duration-100 max-h-60 overflow-y-auto">
                    {options.map((option) => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => {
                                onChange(option);
                                setIsOpen(false);
                            }}
                            className={cn(
                                "w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 cursor-pointer",
                                value === option ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700"
                            )}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function EditTicketModal({ isOpen, onClose, ticket }: EditTicketModalProps) {
    const [subject, setSubject] = useState("");
    const [category, setCategory] = useState("");
    const [priority, setPriority] = useState("");
    const [description, setDescription] = useState("");

    const [updateTicket, { isLoading }] = useUpdateSupportTicketMutation();

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

    useEffect(() => {
        if (ticket && isOpen) {
            setSubject(ticket.subject || "");
            setCategory(REVERSE_CATEGORY_MAP[ticket.category] || "");
            setPriority(ticket.priority?.charAt(0).toUpperCase() + ticket.priority?.slice(1).toLowerCase() || "");
            setDescription(ticket.description || "");
        }
    }, [ticket, isOpen]);

    const handleSubmit = async () => {
        if (!subject || !category || !priority || !description) {
            toast.error("Please fill in all fields");
            return;
        }

        const payload = {
            subject,
            category: CATEGORY_MAP[category],
            priority: priority.toUpperCase(),
            description,
        };

        try {
            await updateTicket({ id: ticket.supportTicketId, data: payload }).unwrap();
            toast.success("Ticket updated successfully");
            onClose();
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to update ticket");
        }
    };

    if (!isOpen || !ticket) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-2">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Edit Support Ticket</h2>
                        <p className="text-sm text-gray-500 mt-1">Update ticket details</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">Subject</label>
                        <input
                            type="text"
                            placeholder="Enter Issue name"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full px-4 py-3 text-sm bg-blue-50/30 border border-blue-100 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-400"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">Category</label>
                        <ModalDropdown
                            label="Select Category"
                            options={Object.keys(CATEGORY_MAP)}
                            value={category}
                            onChange={setCategory}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">Priority</label>
                        <ModalDropdown
                            label="Select Priority"
                            options={["High", "Medium", "Low"]}
                            value={priority}
                            onChange={setPriority}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">Description</label>
                        <textarea
                            placeholder="Please provide as much detail as possible..."
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 text-sm bg-blue-50/30 border border-blue-100 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-400 resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="cursor-pointer flex-1 px-4 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="cursor-pointer flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Save className="size-4" />
                            )}
                            {isLoading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
