"use client";

import React from "react";
import { X, AlertCircle, Ban } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SuspensionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    user: any;
}

export default function SuspensionModal({ isOpen, onClose, onConfirm, user }: SuspensionModalProps) {
    if (!isOpen || !user) return null;

    const isSuspended = user.status === "Suspended";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity animate-in fade-in duration-200">
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="flex items-center justify-center size-16 rounded-full bg-amber-50 text-amber-600 mb-6 mx-auto">
                        <Ban className="size-8" />
                    </div>

                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-bold text-[#0F172A]">
                            {isSuspended ? "Unsuspend Account?" : "Suspend Account?"}
                        </h3>
                        <p className="text-sm text-gray-500 max-w-xs mx-auto">
                            Are you sure you want to {isSuspended ? "unsuspend" : "suspend"} the account for <span className="font-bold text-[#0F172A]">{user.name}</span>?
                            This will {isSuspended ? "restore" : "restrict"} their access to the platform.
                        </p>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={cn(
                                "flex-1 rounded-xl py-3 text-sm font-bold text-white transition-all shadow-lg shadow-amber-100 cursor-pointer",
                                isSuspended ? "bg-green-600 hover:bg-green-700 shadow-green-100" : "bg-amber-600 hover:bg-amber-700 shadow-amber-100"
                            )}
                        >
                            {isSuspended ? "Unsuspend User" : "Suspend User"}
                        </button>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 rounded-lg p-2 text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                    <X className="size-5" />
                </button>
            </div>
        </div>
    );
}
