"use client";

import React, { useState, useMemo } from "react";
import Skeleton from "@/components/ui/Skeleton";
import { PageHeaderSkeleton, StatsCardsSkeleton } from "@/components/admin/AdminSkeletons";
import {
    Building2,
    MapPin,
    Star,
    Search,
    ChevronDown,
    MessageSquare,
    TrendingUp,
    ChevronLeft,
    ChevronRight,
    StarHalf
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import BusinessDetailsModal from "../../../../../components/admin/buisnesses/BusinessDetailsModal";

import {
    useGetBusinessManagementQuery,
} from "@/redux/api/AI/businessmanagementApi";
import { useGetUserByIdQuery } from "@/redux/api/BE/admin/userApi";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const StarRating = ({ rating, size = 12 }: { rating: number, size?: number }) => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
        // Calculate the fill percentage for the current star
        const fillPercentage = Math.min(Math.max(rating - (i - 1), 0), 1) * 100;

        stars.push(
            <div key={i} className="relative" style={{ width: size, height: size }}>
                <Star 
                    className="absolute top-0 left-0 text-gray-300" 
                    size={size} 
                />
                <div 
                    className="absolute top-0 left-0 h-full overflow-hidden" 
                    style={{ width: `${fillPercentage}%` }}
                >
                    <Star 
                        className="absolute top-0 left-0 fill-amber-500 text-amber-500" 
                        size={size} 
                    />
                </div>
            </div>
        );
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
};

const BusinessCard = ({ biz, handleViewDetails }: { biz: any, handleViewDetails: (biz: any) => void }) => {
    const { data: userData } = useGetUserByIdQuery(biz.owner_id, { skip: !biz.owner_id });
    const ownerName = userData?.data?.name || biz.owner_name || "N/A";
    const rawImageUrl = biz?.primary_photo?.photo_url || biz?.photo?.photo_url;
    const imageUrl = rawImageUrl 
        ? rawImageUrl.replace("http://13.63.11.191:8000", "/api/ai") 
        : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=400";

    return (
        <div className="group overflow-hidden rounded-xl admin-card">
            <div className="relative h-48 w-full overflow-hidden">
                <img
                    src={imageUrl}
                    alt={biz.business_name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className={cn(
                    "absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                    biz.is_suspended ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
                )}>
                    {biz.is_suspended ? "suspended" : (biz.account_status || "active")}
                </div>
            </div>
            <div className="p-5">
                <div className="flex items-start justify-between">
                    <div>
                        <h4 className="font-bold text-[#0F172A]">{biz.business_name}</h4>
                        <p className="text-xs text-gray-500 capitalize">{biz.category}</p>
                    </div>
                </div>

                <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>Owner:</span>
                        <span className="font-semibold text-[#0F172A]">{ownerName}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>Locations:</span>
                        <span className="font-semibold text-[#0F172A]">{biz.location_count}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>Reviews:</span>
                        <span className="font-semibold text-[#0F172A]">{biz.reviews?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>Rating:</span>
                        <span className="flex items-center gap-1 font-semibold text-amber-500">
                            <StarRating rating={biz.ratings || biz.rating || 0} />
                            <span>{biz.ratings || biz.rating || 0}</span>
                        </span>
                    </div>
                </div>

                <button
                    onClick={() => handleViewDetails(biz)}
                    className="mt-6 w-full rounded-lg border border-blue-100 bg-blue-50 py-2.5 text-xs font-bold text-blue-600 transition-colors hover:bg-blue-600 hover:text-white cursor-pointer"
                >
                    View Details
                </button>
            </div>
        </div>
    );
};

export default function BusinessManagement() {
    const { data: managementData, isLoading } = useGetBusinessManagementQuery();
    
    const [searchTerm, setSearchTerm] = useState("");
    const [businessFilter, setBusinessFilter] = useState("All Businesses");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleViewDetails = (biz: any) => {
        setSelectedBusiness(biz);
        setIsModalOpen(true);
    };

    const stats = [
        { 
            label: "Total Businesses", 
            value: managementData?.total_business?.toString() || "0", 
            icon: Building2, 
            change: "+0.2", 
            trend: "up", 
            color: "text-blue-600", 
            bgColor: "bg-blue-50" 
        },
        { 
            label: "Total Locations", 
            value: managementData?.total_location?.toString() || "0", 
            icon: MapPin, 
            change: "used for business", 
            trend: "neutral", 
            color: "text-purple-600", 
            bgColor: "bg-purple-50" 
        },
        { 
            label: "Avg Rating", 
            value: managementData?.avg_rating?.toString() || "0", 
            icon: Star, 
            change: <StarRating rating={managementData?.avg_rating || 0} />, 
            trend: "neutral", 
            color: "text-amber-600", 
            bgColor: "bg-amber-50" 
        },
        { 
            label: "Total Reviews", 
            value: managementData?.total_reviews?.toLocaleString() || "0", 
            icon: MessageSquare, 
            change: "+0.2", 
            trend: "up", 
            color: "text-green-600", 
            bgColor: "bg-green-50" 
        },
    ];

    const initialBusinesses = managementData?.businesses || [];

    const uniqueBusinesses = useMemo(() => {
        const names = new Set<string>();
        initialBusinesses.forEach((biz: any) => {
            if (biz.business_name) {
                names.add(biz.business_name);
            }
        });
        return ["All Businesses", ...Array.from(names)];
    }, [initialBusinesses]);

    const filteredBusinesses = useMemo(() => {
        return initialBusinesses.filter((biz: any) => {
            const matchesSearch = biz.business_name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesBusiness = businessFilter === "All Businesses" || biz.business_name === businessFilter;
            return matchesSearch && matchesBusiness;
        });
    }, [searchTerm, businessFilter, initialBusinesses]);

    const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage);
    const paginatedBusinesses = filteredBusinesses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="space-y-8 pb-8">
                <PageHeaderSkeleton />
                <StatsCardsSkeleton />
                <div className="space-y-4">
                    <Skeleton className="h-11 w-full max-w-md rounded-xl" />
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {Array(8).fill(0).map((_, idx) => (
                            <div key={idx} className="rounded-xl admin-card p-5 space-y-4">
                                <Skeleton className="h-48 w-full rounded-lg" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/4" />
                                </div>
                                <div className="space-y-2 pt-2">
                                    <Skeleton className="h-3 w-full" />
                                    <Skeleton className="h-3 w-full" />
                                    <Skeleton className="h-3 w-full" />
                                </div>
                                <Skeleton className="h-9 w-full rounded-lg" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[#0F172A]">Business Management</h1>
                <p className="text-gray-500">Overview of all businesses on the platform</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className="admin-card rounded-xl p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <p className="mt-1 text-2xl font-bold text-[#0F172A]">{stat.value}</p>
                            </div>
                            <div className={cn("rounded-lg p-2", stat.bgColor, stat.color)}>
                                <stat.icon className="size-5" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-1">
                            {stat.trend === "up" && <TrendingUp className="size-3 text-green-500" />}
                            <span className={cn(
                                "text-xs font-semibold",
                                stat.trend === "up" ? "text-green-500" : "text-amber-500"
                            )}>
                                {stat.change}
                            </span>
                            {stat.trend === "up" && <span className="text-xs text-gray-400">vs last month</span>}
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
                        className="block w-full rounded-xl border border-blue-100 bg-white py-2 pl-10 pr-3 text-sm text-[#0F172A] placeholder-gray-500 focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                        placeholder="Search business name..."
                    />
                </div>

                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 text-nowrap rounded-xl border border-blue-100 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        {businessFilter}
                        <ChevronDown className="size-4 text-gray-500" />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 z-10 mt-2 w-48 rounded-xl border border-blue-100 bg-white p-1 shadow-none max-h-60 overflow-y-auto custom-scrollbar">
                            {uniqueBusinesses.map((bizName) => (
                                <button
                                    key={bizName}
                                    onClick={() => {
                                        setBusinessFilter(bizName);
                                        setCurrentPage(1);
                                        setIsDropdownOpen(false);
                                    }}
                                    className="w-full rounded-xl px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 cursor-pointer truncate"
                                >
                                    {bizName}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Businesses Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {isLoading ? (
                    Array(4).fill(0).map((_, idx) => (
                        <div key={idx} className="rounded-xl admin-card p-5 animate-pulse">
                            <div className="h-48 bg-gray-200 rounded-lg mb-4" />
                            <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                            <div className="h-3 bg-gray-50 rounded w-1/4" />
                        </div>
                    ))
                ) : paginatedBusinesses.map((biz: any, idx: number) => (
                    <BusinessCard key={idx} biz={biz} handleViewDetails={handleViewDetails} />
                ))}
            </div>

            {paginatedBusinesses.length === 0 && (
                <div className="py-20 text-center text-gray-500 admin-card rounded-xl border-dashed">
                    No businesses found in this location.
                </div>
            )}

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
                            {Math.min(currentPage * itemsPerPage, filteredBusinesses.length)}
                        </span>{" "}
                        of{" "}
                        <span className="text-[#0F172A] font-bold">
                            {filteredBusinesses.length}
                        </span>{" "}
                        businesses
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

            <BusinessDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                business={selectedBusiness}
            />
        </div>
    );
}
