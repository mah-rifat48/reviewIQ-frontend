"use client";

import React, { useState, useEffect } from "react";
import { X, Send, Mail } from "lucide-react";
import { useContactUsMutation } from "@/redux/api/BE/landingApi";
import { useGetProfileQuery } from "@/redux/api/BE/user/profileApi";
import toast from "react-hot-toast";

interface ContactUsModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialSubject?: string;
}

export default function ContactUsModal({ isOpen, onClose, initialSubject = "Enterprise Plan Inquiry" }: ContactUsModalProps) {
    const [contactUs, { isLoading: isSending }] = useContactUsMutation();
    
    // Fetch profile details
    const { data: profileResponse, isLoading: isLoadingProfile } = useGetProfileQuery(undefined, {
        skip: !isOpen,
    });
    const profile = profileResponse?.data;

    // Form states
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState(initialSubject);
    const [description, setDescription] = useState("");

    // Prefill name and email when profile is loaded
    useEffect(() => {
        if (profile) {
            setName(profile.name || "");
            setEmail(profile.email || "");
        }
    }, [profile]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await contactUs({ name, email, subject, description }).unwrap();
            toast.success("Inquiry sent successfully.");
            setDescription("");
            onClose();
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to send inquiry.");
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 transition-opacity animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 border border-zinc-150 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center size-10 rounded-2xl bg-blue-50 text-[#0066FF] border border-blue-100 shrink-0">
                            <Mail className="size-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-extrabold text-zinc-900">
                                Contact Sales
                            </h3>
                            <p className="text-xs text-zinc-500 font-medium">
                                Get a custom quote for our Enterprise Plan
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSending}
                        className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 transition-colors cursor-pointer"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                    {/* Name */}
                    <div className="space-y-1.5">
                        <label htmlFor="modal-name" className="text-xs font-bold text-zinc-700">
                            Name
                        </label>
                        <input
                            type="text"
                            id="modal-name"
                            required
                            readOnly
                            value={name}
                            placeholder={isLoadingProfile ? "Loading name..." : "Your full name"}
                            className="block h-12 w-full rounded-2xl border border-zinc-150 bg-zinc-50 px-4 text-sm text-zinc-500 placeholder-zinc-400 cursor-not-allowed outline-none select-none transition-all"
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <label htmlFor="modal-email" className="text-xs font-bold text-zinc-700">
                            Email
                        </label>
                        <input
                            type="email"
                            id="modal-email"
                            required
                            readOnly
                            value={email}
                            placeholder={isLoadingProfile ? "Loading email..." : "your@email.com"}
                            className="block h-12 w-full rounded-2xl border border-zinc-150 bg-zinc-50 px-4 text-sm text-zinc-500 placeholder-zinc-400 cursor-not-allowed outline-none select-none transition-all"
                        />
                    </div>

                    {/* Subject */}
                    <div className="space-y-1.5">
                        <label htmlFor="modal-subject" className="text-xs font-bold text-zinc-700">
                            Subject
                        </label>
                        <input
                            type="text"
                            id="modal-subject"
                            required
                            disabled={isSending}
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="What is this regarding?"
                            className="block h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-800 placeholder-zinc-400 focus:border-[#0066FF] focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                        />
                    </div>

                    {/* Message / Description */}
                    <div className="space-y-1.5">
                        <label htmlFor="modal-message" className="text-xs font-bold text-zinc-700">
                            Message
                        </label>
                        <textarea
                            id="modal-message"
                            required
                            disabled={isSending}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            placeholder="Tell us about your organization's needs..."
                            className="block w-full rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-800 placeholder-zinc-400 focus:border-[#0066FF] focus:ring-4 focus:ring-blue-50 outline-none transition-all resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="pt-4 flex gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSending}
                            className="flex-1 rounded-2xl border border-zinc-200 py-3.5 text-sm font-bold text-zinc-700 hover:bg-zinc-50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSending}
                            className="flex-1 rounded-2xl py-3.5 text-sm font-bold text-white bg-[#0066FF] hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {isSending ? (
                                <span className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    Send Message
                                    <Send size={16} />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
