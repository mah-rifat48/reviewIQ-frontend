"use client";

import React, { useEffect } from "react";
import { X, Trash2, Loader2, AlertCircle } from "lucide-react";

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading?: boolean;
    title?: string;
    message?: string;
}

export default function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    isLoading = false,
    title = "Delete Support Ticket",
    message = "Are you sure you want to delete this ticket? This action cannot be undone."
}: DeleteConfirmationModalProps) {
    
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-2">
                    <div className="size-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
                        <AlertCircle className="size-6" />
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 pt-4 text-center sm:text-left">
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50/50 flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="cursor-pointer flex-1 px-4 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="cursor-pointer flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Trash2 className="size-4" />
                        )}
                        {isLoading ? "Deleting..." : "Delete Ticket"}
                    </button>
                </div>
            </div>
        </div>
    );
}
