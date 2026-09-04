"use client";

import { Search, Bell } from "lucide-react";
import Link from "next/link";
import { useGetProfileQuery } from "@/redux/api/BE/user/profileApi";
import { useSocket } from "@/context/SocketContext";
import LanguageTranslator from "@/components/ui/LanguageTranslator";

export default function Navbar() {
    const { data: profileData } = useGetProfileQuery();
    const user = profileData?.data;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.split("/api/v1")[0];
    const { unreadCount } = useSocket();

    return (
        <nav className="sticky top-0 z-30 flex h-20 py-4 w-full items-center justify-between border-b border-[#E2E8F0] bg-white/80 backdrop-blur-md px-4 md:px-6 lg:px-8 transition-all">
            <div className="flex items-center gap-4">
                {/* Search field removed */}
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                {/* Language Selector */}
                <LanguageTranslator />

                {/* Notifications */}
                <Link href="/notification" className="relative flex items-center justify-center size-10 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all cursor-pointer">
                    <Bell className="size-5" />
                    {unreadCount > 0 && (
                        <span className="absolute right-2 top-2 size-2.5 rounded-full border-2 border-white bg-red-500 ring-4 ring-transparent animate-pulse" />
                    )}
                </Link>

                {/* Profile Section */}
                <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-100 h-10">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-semibold text-gray-900 leading-none">{user?.name || "User"}</p>
                    </div>
                    <img
                        src={user?.profileImage ? `${baseUrl}${user.profileImage}` : "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                        alt="Profile"
                        className="size-10 rounded-full object-cover ring-2 ring-gray-100"
                    />
                </div>
            </div>
        </nav>
    );
}
