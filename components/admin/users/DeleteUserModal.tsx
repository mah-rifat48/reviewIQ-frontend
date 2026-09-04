"use client";

import React from "react";
import { X, Trash2, AlertCircle } from "lucide-react";

interface DeleteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    user: any;
}

export default function DeleteUserModal({ isOpen, onClose, onConfirm, user }: DeleteUserModalProps) {
    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity animate-in fade-in duration-200">
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="flex items-center justify-center size-16 rounded-full bg-red-50 text-red-600 mb-6 mx-auto">
                        <Trash2 className="size-8" />
                    </div>

                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-bold text-[#0F172A]">Delete User?</h3>
                        <p className="text-sm text-gray-500 max-w-xs mx-auto">
                            Are you absolutely sure you want to delete <span className="font-bold text-[#0F172A]">{user.name}</span>?
                            This action is permanent and cannot be undone.
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
                            className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-700 transition-all shadow-lg shadow-red-100 cursor-pointer"
                        >
                            Delete User
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
