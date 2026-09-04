"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutGrid,
    PieChart,
    Lightbulb,
    FileBadge2,
    Users,
    Bell,
    Settings,
    LogOut,
    Store,
    MapPin,
    ChevronDown,
    HistoryIcon,
    Menu,
    X,
    Plus,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Image from "next/image";
import StylishDropdown from "../../ui/StylishDropdown";
import { useAuth } from "@/hooks/useAuth";
import { useGetBusinessNamesQuery, useGetBusinessLocationsQuery } from "@/redux/api/AI/nameFatchingApi";
import { getUserIdFromToken } from "@/utils/authUtils";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedBusiness, setSelectedLocation, setSelectedAddress } from "@/redux/slices/businessSlice";
import AddBusinessModal from "./AddBusinessModal";
import AddLocationModal from "./AddLocationModal";
import { getSubscriptionFromCookie } from "@/utils/authUtils";
import { toast } from "react-hot-toast";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const SupportIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        {/* User round silhouette */}
        <path d="M15 21a6 6 0 0 0-12 0" />
        <circle cx="9" cy="14" r="3.5" />
        {/* Chat bubble with dots */}
        <path d="M17 11.5a3.5 3.5 0 1 0-3.5-3.5c0 .6.15 1.15.4 1.65L12.5 11.5l1.85-.6c.75.4 1.6.6 2.65.6z" />
        <circle cx="16" cy="8" r="0.6" fill="currentColor" />
        <circle cx="18" cy="8" r="0.6" fill="currentColor" />
    </svg>
);

const menuItems = [
    { icon: LayoutGrid, label: "Overview", href: "/dashboard" },
    { icon: PieChart, label: "Review", href: "/review" },
    { icon: Lightbulb, label: "AI Insights", href: "/ai-insights" },
    { icon: FileBadge2, label: "Reports", href: "/reports" },
    { icon: Users, label: "Competitors", href: "/competitors" },
    { icon: SupportIcon, label: "Support", href: "/support" },
    { icon: Bell, label: "Notification", href: "/notification" },
    { icon: Settings, label: "Settings", href: "/settings" },
];


export default function Sidebar() {
    const { logout } = useAuth();
    const pathname = usePathname();
    const userId = getUserIdFromToken();
    const dispatch = useDispatch();

    const selectedShop = useSelector((state: any) => state.business.selectedBusiness);
    const selectedLocation = useSelector((state: any) => state.business.selectedLocation);

    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isAddBusinessModalOpen, setIsAddBusinessModalOpen] = useState(false);
    const [isAddLocationModalOpen, setIsAddLocationModalOpen] = useState(false);

    const subscriptionToken = getSubscriptionFromCookie();

    // Fetch Business Names
    const { data: namesData, isLoading: isLoadingNames } = useGetBusinessNamesQuery(userId || "", {
        skip: !userId,
    });

    // Fetch Business Locations when a shop is selected
    const { data: locationsData, isLoading: isLoadingLocations } = useGetBusinessLocationsQuery(
        { userId: userId || "", businessName: (selectedShop as string) },
        { skip: !userId || !selectedShop }
    );

    const shopOptions = useMemo(() => {
        const names = namesData?.business_names || [];
        const uniqueNames = Array.from(new Set(names));
        return uniqueNames.map((name) => ({
            label: name,
            value: name,
        }));
    }, [namesData]);

    const locationOptions = useMemo(() => {
        const locations = locationsData?.locations || [];
        // Filter unique by google_maps_url to avoid duplicate keys in dropdown
        const uniqueLocations = locations.filter((loc, index, self) =>
            index === self.findIndex((t) => t.google_maps_url === loc.google_maps_url)
        );
        return uniqueLocations.map((loc) => ({
            label: loc.address_or_city,
            value: loc.google_maps_url,
        }));
    }, [locationsData]);

    useEffect(() => {
        if (shopOptions.length > 0 && !selectedShop) {
            dispatch(setSelectedBusiness(shopOptions[0].value));
        }
    }, [shopOptions, selectedShop, dispatch]);

    // Automatically select the first location whenever the shop (and thus locationOptions) changes
    useEffect(() => {
        if (locationOptions.length > 0) {
            dispatch(setSelectedLocation(locationOptions[0].value));
            dispatch(setSelectedAddress(locationOptions[0].label));
        } else {
            dispatch(setSelectedLocation(""));
            dispatch(setSelectedAddress(""));
        }
    }, [locationOptions, dispatch]);

    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth < 1024);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <aside
            className={cn(
                "group fixed left-0 top-0 bottom-0 z-50 transition-all duration-300 ease-in-out border-r border-[#E2E8F0] bg-white text-gray-800 flex flex-col overflow-hidden",
                // On Desktop: Always 256px
                // On Small Device: 72px by default, 256px on toggle (as overlay)
                !isSmallScreen ? "w-64" : (isExpanded ? "w-64 shadow-2xl" : "w-[72px]")
            )}
        >
            {/* Header Section */}
            <div className="flex h-20 items-center px-4 overflow-hidden mb-2 shrink-0 justify-between relative">
                <div className={cn(
                    "flex items-center transition-all duration-300",
                    isSmallScreen && !isExpanded ? "w-0 opacity-0" : "w-auto opacity-100"
                )}>
                    <Link href="/dashboard" className="block">
                        <Image
                            src="/auth_icon.svg"
                            alt="Logo"
                            width={207}
                            height={60}
                            style={{ width: "207px", height: "60px" }}
                            className="object-contain"
                            priority
                        />
                    </Link>
                </div>

                {isSmallScreen && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center justify-center size-10 rounded-xl text-gray-500 hover:bg-gray-100 transition-all border border-gray-100 shadow-sm"
                    >
                        {isExpanded ? <X size={20} /> : <Menu size={20} />}
                    </button>
                )}

                {!isSmallScreen && (
                    <div className="flex items-center justify-center size-10">
                        {/* Placeholder to match spacing if needed, or just leave it */}
                    </div>
                )}
            </div>

            {/* Collapsed Logo (only when small screen and not expanded) */}
            {isSmallScreen && !isExpanded && (
                <div className="absolute top-5 left-4 z-10 transition-all duration-300 w-10 h-10 flex items-center justify-center">
                    <Link href="/dashboard" className="block">
                        <Image
                            src="/admin_logo_small.png"
                            alt="Logo"
                            width={40}
                            height={40}
                            className="w-full h-full object-contain"
                            priority
                        />
                    </Link>
                </div>
            )}

            {/* Context Selectors (Mocked) */}
            <div className={cn(
                "relative z-20 px-4 mb-2 space-y-3 transition-all duration-300 shrink-0",
                isSmallScreen && !isExpanded ? "h-0 opacity-0 pointer-events-none overflow-hidden" : "h-auto opacity-100 overflow-visible"
            )}>
                <StylishDropdown
                    options={shopOptions}
                    value={selectedShop || ""}
                    onChange={(val) => dispatch(setSelectedBusiness(val as string))}
                    icon={<Store className="size-4 shrink-0" />}
                    className="h-10"
                    selectedColor="#06B6D4"
                    selectedBgColor="rgba(34, 211, 238, 0.1)"
                    footer={
                        <button
                            onClick={() => {
                                const limit = Number(subscriptionToken?.business || 1);
                                if (shopOptions.length >= limit) {
                                    toast.error(`You have reached your limit of ${limit} business(es). Upgrade to add more.`);
                                    return;
                                }
                                setIsAddBusinessModalOpen(true);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-[#06B6D4] hover:bg-[var(--primary-brand)]/10 transition-colors whitespace-nowrap cursor-pointer"
                        >
                            <Plus size={16} />
                            Add Business
                        </button>
                    }
                />
                <StylishDropdown
                    options={locationOptions}
                    value={selectedLocation || ""}
                    onChange={(val) => {
                        dispatch(setSelectedLocation(val as string));
                        const selectedOption = locationOptions.find(opt => opt.value === val);
                        if (selectedOption) {
                            dispatch(setSelectedAddress(selectedOption.label));
                        }
                    }}
                    icon={<MapPin className="size-4 shrink-0" />}
                    className="h-10"
                    selectedColor="#06B6D4"
                    selectedBgColor="rgba(34, 211, 238, 0.1)"
                    footer={
                        <button
                            onClick={() => {
                                const limit = Number(subscriptionToken?.location || 1);
                                if (locationOptions.length >= limit) {
                                    toast.error(`You have reached your limit of ${limit} location(s) for this business.`);
                                    return;
                                }
                                setIsAddLocationModalOpen(true);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-[#06B6D4] hover:bg-[var(--primary-brand)]/10 transition-colors whitespace-nowrap cursor-pointer"
                        >
                            <Plus size={16} />
                            Add Location
                        </button>
                    }
                />
            </div>

            {/* Divider */}
            <div className={cn(
                "mx-4 my-2 h-px bg-gray-100 shrink-0",
                isSmallScreen && !isExpanded ? "opacity-0" : "opacity-100"
            )} />

            {/* Navigation Items */}
            <nav className="flex-1 min-h-0 px-3 space-y-1.5 overflow-x-hidden overflow-y-auto custom-scrollbar">
                {menuItems.filter(item => {
                    if (item.label === "Competitors" && subscriptionToken && subscriptionToken.competitor === false) {
                        return false;
                    }
                    return true;
                }).map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "relative flex items-center h-11 rounded-xl transition-all duration-200 cursor-pointer",
                                isActive
                                    ? "bg-[var(--primary-brand)] text-white shadow-lg shadow-[var(--primary-brand)]/20"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <div className="flex items-center justify-center w-11 h-11 flex-shrink-0">
                                <item.icon className="size-5" />
                            </div>
                            <span className={cn(
                                "ml-1 text-sm font-medium transition-all duration-300 whitespace-nowrap",
                                isSmallScreen && !isExpanded ? "opacity-0" : "opacity-100"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto border-t border-gray-100 bg-gray-50/50 p-4 shrink-0">
                <button
                    onClick={() => logout()}
                    className={cn(
                        "w-full flex items-center h-11 rounded-xl transition-all duration-200 cursor-pointer text-red-500 hover:bg-red-50 hover:text-red-600",
                        isSmallScreen && !isExpanded ? "justify-center" : "px-3"
                    )}
                >
                    <div className="flex items-center justify-center w-11 h-11 flex-shrink-0">
                        <LogOut className="size-5" />
                    </div>
                    <span className={cn(
                        "ml-1 text-sm font-medium transition-all duration-300 opacity-0 w-0 overflow-hidden whitespace-nowrap",
                        (!isSmallScreen || isExpanded) && "opacity-100 w-auto ml-1"
                    )}>
                        Logout
                    </span>
                </button>
            </div>

            <AddBusinessModal
                isOpen={isAddBusinessModalOpen}
                onClose={() => setIsAddBusinessModalOpen(false)}
            />
            <AddLocationModal
                isOpen={isAddLocationModalOpen}
                onClose={() => setIsAddLocationModalOpen(false)}
                businessName={selectedShop as string}
            />
        </aside>
    );
}
