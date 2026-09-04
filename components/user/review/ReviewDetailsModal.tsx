"use client";

import React, { useEffect } from "react";
import { X, Star, Link as LinkIcon, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming you have a utility for classnames

interface ReviewDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    review: any; // We can define a proper type later
}

export default function ReviewDetailsModal({ isOpen, onClose, review }: ReviewDetailsModalProps) {
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

    if (!isOpen || !review) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-lg h-[80vh] max-h-[700px] shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Review Details</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-thin-scrollbar">
                    {/* User Info & Rating */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-gray-900 text-base">{review.author}</span>
                            <span className="text-gray-400 text-sm flex items-center gap-1">
                                <CalendarIcon className="size-3" />
                                {review.date}
                            </span>
                        </div>
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={cn(
                                        "size-5",
                                        i < Math.floor(review.rating) ? "fill-amber-400 text-amber-400" :
                                            (i === Math.floor(review.rating) && review.rating % 1 !== 0) ? "fill-amber-400 text-amber-400 opacity-50" : "text-gray-200"
                                    )}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Review Text */}
                    <div className="bg-blue-50/50 p-4 rounded-2xl text-gray-700 text-sm leading-relaxed">
                        {review.text}
                    </div>

                    {/* AI Analysis */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">AI Sentiment</h3>
                        <div className={cn(
                            "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium",
                            review.sentiment.toLowerCase() === "positive" ? "bg-green-50 text-green-600" :
                                review.sentiment.toLowerCase() === "negative" ? "bg-red-50 text-red-600" :
                                    "bg-gray-100 text-gray-600"
                        )}>
                            {review.sentiment.toLowerCase() === "positive" ? <ThumbsUp className="size-4" /> :
                                review.sentiment.toLowerCase() === "negative" ? <ThumbsDown className="size-4" /> : null}
                            <span className="capitalize">{review.sentiment}</span> sentiment
                        </div>
                    </div>

                    {/* Emotions */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Detected Emotions</h3>
                        <div className="flex flex-wrap gap-2">
                            {(review.emotions || []).map((emotion: string, i: number) => (
                                <span key={i} className="px-4 py-2 bg-purple-50 text-purple-600 rounded-xl text-sm font-medium">
                                    {emotion}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Strengths */}
                    {review.strengths && review.strengths.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Key Strengths</h3>
                            <div className="flex flex-wrap gap-2">
                                {review.strengths.map((strength: string, i: number) => (
                                    <span key={i} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium capitalize">
                                        {strength}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function CalendarIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
    )
}
