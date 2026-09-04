"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import Skeleton from "@/components/ui/Skeleton";
import { PageHeaderSkeleton, StatsCardsSkeleton, UsersTableSkeleton } from "@/components/admin/AdminSkeletons";
import { useGetUsersQuery, useGetUserStatisticsQuery, useDeleteUserMutation, useSuspendUserMutation } from "@/redux/api/BE/admin/userApi";
import {
  Users,
  DollarSign,
  Clock,
  AlertCircle,
  Search,
  ChevronDown,
  Eye,
  Trash2,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  Mail,
  Building2,
  Calendar,
  Ban,
  Crown,
  Unlock,
  MoreVertical,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import UserDetailsModal from "../../../../../components/admin/users/UserDetailsModal";
import SuspensionModal from "../../../../../components/admin/users/SuspensionModal";
import DeleteUserModal from "../../../../../components/admin/users/DeleteUserModal";
import AddEnterpriseModal from "../../../../../components/admin/users/AddEnterpriseModal";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper to construct profile image URL
const getProfileImageUrl = (user: any) => {
  if (user.profileImage) {
    if (user.profileImage.startsWith('http')) return user.profileImage;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace('/api/v1', '') || 'https://aimaliya.sakibalhasa.xyz';
    return `${baseUrl}${user.profileImage}`;
  }
  if (user.avatar) return user.avatar;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff&bold=true`;
};

// Custom scrollbar refinement for premium feel
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    height: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #E2E8F0;
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #CBD5E1;
  }
`;

const stats = [
  {
    label: "Total Users",
    value: "167",
    icon: Users,
    change: "+14",
    trend: "up",
    color: "bg-blue-500",
  },
  {
    label: "Active User",
    value: "125",
    icon: DollarSign,
    change: "+5%",
    trend: "up",
    color: "bg-blue-600",
  },
  {
    label: "Trial User",
    value: "23",
    icon: Clock,
    change: "+07",
    trend: "up",
    color: "bg-amber-700",
  },
  {
    label: "Suspended User",
    value: "09",
    icon: AlertCircle,
    change: "-5%",
    trend: "down",
    color: "bg-red-500",
  },
];

const initialUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    status: "Active",
    plan: "Professional",
    businesses: "2 businesses",
    locations: "5 locations",
    mrr: "$79/mo",
    lastActive: "2 hours ago",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@company.com",
    status: "Trial",
    plan: "Business",
    businesses: "3 businesses",
    locations: "8 locations",
    mrr: "$149/mo",
    lastActive: "1 day ago",
  },
  {
    id: 3,
    name: "Robert Johnson",
    email: "robert.j@business.com",
    status: "Active",
    plan: "Starter",
    businesses: "1 businesses",
    locations: "1 locations",
    mrr: "$29/mo",
    lastActive: "5 hours ago",
  },
  {
    id: 4,
    name: "Sarah Williams",
    email: "sarah.w@enterprise.com",
    status: "Active",
    plan: "Enterprise",
    businesses: "5 businesses",
    locations: "25 locations",
    mrr: "$499/mo",
    lastActive: "30 min ago",
  },
  {
    id: 5,
    name: "Michael Brown",
    email: "michael.b@startup.com",
    status: "Suspended",
    plan: "Professional",
    businesses: "1 businesses",
    locations: "2 locations",
    mrr: "$0/mo",
    lastActive: "2 weeks ago",
  },
  {
    id: 6,
    name: "Alice Green",
    email: "alice@example.com",
    status: "Active",
    plan: "Starter",
    businesses: "1 businesses",
    locations: "1 locations",
    mrr: "$29/mo",
    lastActive: "1 hour ago",
  },
  {
    id: 7,
    name: "Steve White",
    email: "steve@test.com",
    status: "Active",
    plan: "Professional",
    businesses: "2 businesses",
    locations: "4 locations",
    mrr: "$79/mo",
    lastActive: "3 hours ago",
  },
];

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // reset to page 1 on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: usersData, isLoading, isFetching } = useGetUsersQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch || undefined,
    status: statusFilter === "All Status" ? undefined : statusFilter.toUpperCase()
  });

  const { data: statsData } = useGetUserStatisticsQuery();
  const [deleteUser] = useDeleteUserMutation();
  const [suspendUser] = useSuspendUserMutation();

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isSuspensionModalOpen, setIsSuspensionModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEnterpriseModalOpen, setIsEnterpriseModalOpen] = useState(false);
  const [activeActionUserId, setActiveActionUserId] = useState<string | null>(null);
  const [actionMenuCoords, setActionMenuCoords] = useState<{ top: number; left: number; width: number } | null>(null);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const actionButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const computeActionMenuCoords = (button: HTMLButtonElement | null) => {
    if (!button) return null;
    const rect = button.getBoundingClientRect();
    const width = 176;
    const dropdownHeight = 210;
    let left = rect.right - width;
    left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
    let top = rect.bottom + 8;
    if (top + dropdownHeight > window.innerHeight - 8) {
      top = rect.top - dropdownHeight - 8;
    }
    return { top, left, width };
  };

  const handleToggleActionMenu = (userId: string) => {
    if (activeActionUserId === userId) {
      setActiveActionUserId(null);
      setActionMenuCoords(null);
      return;
    }
    const button = actionButtonRefs.current[userId];
    setActiveActionUserId(userId);
    setActionMenuCoords(computeActionMenuCoords(button));
  };

  // Close any active actions menu when clicking outside
  useEffect(() => {
    setPortalRoot(document.body);

    const handleGlobalClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest(".actions-dropdown-container")) {
        return;
      }
      setActiveActionUserId(null);
      setActionMenuCoords(null);
    };
    document.addEventListener("mousedown", handleGlobalClick);
    return () => {
      document.removeEventListener("mousedown", handleGlobalClick);
    };
  }, []);

  const handleViewDetails = (user: any) => {
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
  };

  const handleOpenSuspension = (user: any) => {
    setSelectedUser(user);
    setIsSuspensionModalOpen(true);
  };

  const handleOpenDelete = (user: any) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleOpenEnterprise = (user: any) => {
    setSelectedUser(user);
    setIsEnterpriseModalOpen(true);
  };

  const handleConfirmSuspension = async () => {
    if (!selectedUser?.userId) return;
    const isCurrentlySuspended = selectedUser.status === "Suspended";
    try {
      await suspendUser({
        id: selectedUser.userId,
        suspend: !isCurrentlySuspended
      }).unwrap();
      toast.success(`User ${isCurrentlySuspended ? "unsuspended" : "suspended"} successfully!`);
    } catch (err: any) {
      toast.error(err?.data?.message || `Failed to ${isCurrentlySuspended ? "unsuspend" : "suspend"} user`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser?.userId) return;
    try {
      await deleteUser(selectedUser.userId).unwrap();
      toast.success("User deleted successfully!");
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete user");
    }
  };

  const dynamicStats = useMemo(() => {
    if (!statsData?.data) return stats;
    const d = statsData.data;
    return [
      {
        label: "Total Users",
        value: d.totalUsers?.value?.toString() || "0",
        icon: Users,
        change: `${d.totalUsers?.trend > 0 ? '+' : ''}${d.totalUsers?.trend || 0}${d.totalUsers?.isPercentage ? '%' : ''}`,
        trend: d.totalUsers?.trend >= 0 ? "up" : "down",
        color: "bg-[#2F80ED]",
      },
      {
        label: "Active User",
        value: d.activeUsers?.value?.toString() || "0",
        icon: DollarSign,
        change: `${d.activeUsers?.trend > 0 ? '+' : ''}${d.activeUsers?.trend || 0}${d.activeUsers?.isPercentage ? '%' : ''}`,
        trend: d.activeUsers?.trend >= 0 ? "up" : "down",
        color: "bg-[#2F66B1]",
      },
      {
        label: "Trial User",
        value: d.trialUsers?.value?.toString() || "0",
        icon: Clock,
        change: `${d.trialUsers?.trend > 0 ? '+' : ''}${d.trialUsers?.trend || 0}${d.trialUsers?.isPercentage ? '%' : ''}`,
        trend: d.trialUsers?.trend >= 0 ? "up" : "down",
        color: "bg-[#826C2B]",
      },
      {
        label: "Suspended User",
        value: d.suspendedUsers?.value?.toString() || "0",
        icon: AlertCircle,
        change: `${d.suspendedUsers?.trend > 0 ? '+' : ''}${d.suspendedUsers?.trend || 0}${d.suspendedUsers?.isPercentage ? '%' : ''}`,
        trend: d.suspendedUsers?.trend >= 0 ? "up" : "down",
        color: "bg-red-500",
      },
    ];
  }, [statsData]);

  const paginatedUsers = useMemo(() => {
    if (!usersData?.data) return [];

    let sourceData = usersData.data;

    // Apply frontend filtering as fallback
    if (statusFilter !== "All Status") {
      sourceData = sourceData.filter((user: any) => {
        const s = user.status === "TRIAL" ? "Trial" : user.status === "ACTIVE" ? "Active" : "Suspended";
        return s === statusFilter;
      });
    }

    return sourceData.map((user: any) => {
      const sub = user.subscriptions && user.subscriptions.length > 0
        ? user.subscriptions[user.subscriptions.length - 1]
        : { plan: "NONE", business: "0", location: "0", balance: 0 };

      const statusFormat = user.status === "TRIAL" ? "Trial" : user.status === "ACTIVE" ? "Active" : "Suspended";

      return {
        ...user,
        id: user.userId,
        userId: user.userId,
        name: user.name || "Unknown",
        email: user.email,
        status: statusFormat,
        plan: sub.plan,
        businesses: `${sub.business || 0} businesses`,
        locations: `${sub.location || 0} locations`,
        mrr: `$${sub.balance || 0}/mo`,
        lastActive: new Date(user.updatedAt).toLocaleDateString(),
      };
    });
  }, [usersData, statusFilter]);

  const totalPages = usersData?.meta?.lastPage || 1;
  const totalUsersCount = usersData?.meta?.total || 0;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6 md:space-y-8 pb-10">
        <PageHeaderSkeleton />
        <StatsCardsSkeleton />
        <div className="space-y-4">
          <Skeleton className="h-11 w-full max-w-md rounded-xl" />
          <UsersTableSkeleton rows={8} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-[#0F172A]">User Management</h1>
        <p className="text-gray-500 text-sm">
          Manage all platform users and their subscriptions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dynamicStats.map((stat, idx) => (
          <div
            key={idx}
            className="admin-card rounded-xl p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="mt-1 text-2xl font-bold text-[#0F172A]">
                  {stat.value}
                </p>
              </div>
              <div
                className={cn(
                  "rounded-xl p-2.5 text-white shadow-none",
                  stat.color,
                )}
              >
                <stat.icon className="size-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5">
              <div
                className={cn(
                  "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold",
                  stat.trend === "up"
                    ? "bg-green-50 text-green-600"
                    : "bg-red-50 text-red-600",
                )}
              >
                {stat.trend === "up" ? (
                  <TrendingUp className="size-3" />
                ) : (
                  <TrendingDown className="size-3" />
                )}
                {stat.change}
              </div>
              <span className="text-[10px] text-gray-400 font-medium">
                vs last month
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between admin-card p-3 rounded-xl">
        <div className="relative w-full max-w-8xl">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Search className="size-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
            className="block h-11 w-full rounded-xl border border-blue-100 bg-white pl-10 pr-4 text-sm text-[#0F172A] placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-none"
            placeholder="Search users by name or email..."
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-blue-100 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer shadow-none md:w-auto min-w-[140px]"
          >
            <span className="flex items-center gap-2">
              {/* <span className="size-2 rounded-full bg-blue-500" /> */}
              {statusFilter}
            </span>
            <ChevronDown
              className={cn(
                "size-4 text-gray-400 transition-transform",
                isDropdownOpen && "rotate-180",
              )}
            />
          </button>

          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 z-20 mt-2 w-full origin-top-right rounded-xl border border-blue-100 bg-white p-1.5 shadow-none md:w-48 animate-in fade-in zoom-in duration-200">
                {["All Status", "Active", "Suspended"].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setCurrentPage(1);
                        setIsDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full rounded-lg px-3 py-2 gap-2 my-0.5 flex items-center text-left text-sm font-medium transition-all cursor-pointer",
                        statusFilter === status
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      )}
                    >
                      {status}
                    </button>
                  ),
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile & Tablet Card View (Visible below lg screens) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:hidden">
        {paginatedUsers.map((user: any) => (
          <div
            key={user.id}
            className="admin-card rounded-xl p-5 space-y-4 hover:border-blue-200 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={getProfileImageUrl(user)}
                  alt={user.name}
                  className="size-10 rounded-full object-cover shrink-0"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#0F172A]">
                    {user.name}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Mail className="size-3" /> {user.email}
                  </span>
                </div>
              </div>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                  user.status === "Active" && "bg-green-50 text-green-700",
                  user.status === "Trial" && "bg-blue-50 text-blue-700",
                  user.status === "Suspended" && "bg-red-50 text-red-700",
                )}
              >
                {user.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-50">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Plan
                </p>
                <p className="text-sm font-semibold text-gray-700">
                  {user.plan}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Revenue
                </p>
                <p className="text-sm font-bold text-green-600">{user.mrr}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50/50 rounded-lg p-3">
              <div className="flex items-center gap-1.5">
                <Building2 className="size-3.5 text-blue-500" />
                <span className="font-medium">{user.businesses}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="size-3.5 text-amber-500" />
                <span>{user.lastActive}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => handleViewDetails(user)}
                className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg bg-blue-50 text-blue-600 font-bold text-xs hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
              >
                <Eye className="size-4" /> View
              </button>
              <button
                onClick={() => handleOpenSuspension(user)}
                className={cn(
                  "flex items-center justify-center size-10 rounded-lg transition-all cursor-pointer",
                  user.status === "Suspended"
                    ? "bg-green-50 text-green-600 hover:bg-green-600 hover:text-white"
                    : "bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white"
                )}
                title={user.status === "Suspended" ? "Unsuspend User" : "Suspend User"}
              >
                {user.status === "Suspended" ? <Unlock className="size-4" /> : <Ban className="size-4" />}
              </button>
              <button
                onClick={() => handleOpenDelete(user)}
                className="flex items-center justify-center size-10 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View (Visible from lg screens up) */}
      <div className="hidden xl:block overflow-visible rounded-2xl admin-card">
        <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
        <div className="overflow-x-auto overflow-y-visible custom-scrollbar">
          <div className="min-w-full overflow-visible">
            <table className="w-full table-auto text-left text-sm">
              <thead className="bg-[#F8FAFC] text-sm font-bold text-gray-500 border-b border-[#E2E8F0]">
                <tr><th className="px-5 py-4 whitespace-nowrap">User</th><th className="px-5 py-4 whitespace-nowrap">Status</th><th className="px-5 py-4 whitespace-nowrap">Plan</th><th className="px-5 py-4 whitespace-nowrap">Businesses</th><th className="px-5 py-4 whitespace-nowrap">MRR</th><th className="px-5 py-4 whitespace-nowrap">Last Active</th><th className="px-5 py-4 whitespace-nowrap text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {paginatedUsers.map((user: any, idx: number) => {
                  return (
                    <tr
                      key={user.id}
                      className="group hover:bg-gray-50/50 transition-all border-b border-[#E2E8F0] last:border-b-0"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getProfileImageUrl(user)}
                            alt={user.name}
                            className="size-10 rounded-full object-cover shrink-0"
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-sm text-[#0F172A] truncate">
                              {user.name}
                            </span>
                            <span className="text-xs text-gray-500 truncate">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider capitalize",
                            user.status === "Active" && "bg-green-100 text-green-700",
                            user.status === "Trial" && "bg-blue-100 text-blue-700",
                            user.status === "Suspended" && "bg-red-100 text-red-700"
                          )}
                        >
                          {user.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {user.plan === "Enterprise" && <Crown className="size-4 text-amber-500" />}
                          <span className="text-[#0F172A] font-bold text-sm">
                            {user.plan}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-[#0F172A] font-bold text-sm">
                            {user.businesses}
                          </span>
                          <span className="text-xs text-gray-400">
                            {user.locations}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-bold text-green-600 text-sm">
                          {user.mrr}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-xs text-gray-500">
                          {user.lastActive}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end">
                          <div className="relative actions-dropdown-container">
                            <button
                              ref={(el) => {
                                actionButtonRefs.current[user.id] = el;
                              }}
                              onClick={() => handleToggleActionMenu(user.id)}
                              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-all cursor-pointer focus:outline-none"
                            >
                              <MoreVertical className="size-4" />
                            </button>

                            {activeActionUserId === user.id && portalRoot && actionMenuCoords && createPortal(
                              <div
                                className="actions-dropdown-container fixed z-50"
                                style={{ top: actionMenuCoords.top, left: actionMenuCoords.left, width: actionMenuCoords.width }}
                              >
                                <div className="rounded-xl border border-blue-50 bg-white p-1.5 shadow-xl text-left animate-in fade-in zoom-in-95 duration-100">
                                  <button
                                    onClick={() => {
                                      handleViewDetails(user);
                                      setActiveActionUserId(null);
                                      setActionMenuCoords(null);
                                    }}
                                    className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
                                  >
                                    <Eye className="size-3.5 text-blue-500" />
                                    View Details
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleOpenSuspension(user);
                                      setActiveActionUserId(null);
                                      setActionMenuCoords(null);
                                    }}
                                    className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
                                  >
                                    {user.status === "Suspended" ? (
                                      <>
                                        <Unlock className="size-3.5 text-green-500" />
                                        Unsuspend User
                                      </>
                                    ) : (
                                      <>
                                        <Ban className="size-3.5 text-amber-500" />
                                        Suspend User
                                      </>
                                    )}
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleOpenDelete(user);
                                      setActiveActionUserId(null);
                                      setActionMenuCoords(null);
                                    }}
                                    className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-all cursor-pointer"
                                  >
                                    <Trash2 className="size-3.5 text-red-500" />
                                    Delete User
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleOpenEnterprise(user);
                                      setActiveActionUserId(null);
                                      setActionMenuCoords(null);
                                    }}
                                    className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#0891B2] transition-all cursor-pointer border-t border-gray-100 mt-1 pt-2"
                                  >
                                    <Crown className="size-3.5 text-amber-500" />
                                    Add Enterprise
                                  </button>
                                </div>
                              </div>,
                              portalRoot,
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {paginatedUsers.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center admin-card rounded-2xl border-dashed">
          <div className="size-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
            <Search className="size-8 text-gray-300" />
          </div>
          <p className="text-gray-500 font-bold">No results found</p>
          <p className="text-gray-400 text-sm">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-col items-center justify-center gap-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 font-medium text-center order-2">
          Showing{" "}
          <span className="text-[#0F172A] font-bold">
            {totalUsersCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
          </span>{" "}
          to{" "}
          <span className="text-[#0F172A] font-bold">
            {Math.min(currentPage * itemsPerPage, totalUsersCount)}
          </span>{" "}
          of{" "}
          <span className="text-[#0F172A] font-bold">
            {totalUsersCount}
          </span>{" "}
          users
        </p>

        {totalPages >= 1 && (
          <div className="flex items-center justify-center gap-1.5 order-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="flex items-center justify-center size-9 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 transition-all cursor-pointer shadow-sm disabled:cursor-not-allowed"
            >
              <ChevronLeft className="size-5" />
            </button>

            <div className="flex items-center gap-1.5">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={cn(
                    "size-9 rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm",
                    currentPage === i + 1
                      ? "bg-blue-50 font-bold text-blue-600 ring-1 ring-blue-100"
                      : "text-gray-500 hover:bg-gray-100"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="flex items-center justify-center size-9 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 transition-all cursor-pointer shadow-sm disabled:cursor-not-allowed"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        )}
      </div>

      <UserDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        user={selectedUser}
      />

      <SuspensionModal
        isOpen={isSuspensionModalOpen}
        onClose={() => setIsSuspensionModalOpen(false)}
        onConfirm={handleConfirmSuspension}
        user={selectedUser}
      />

      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        user={selectedUser}
      />

      <AddEnterpriseModal
        isOpen={isEnterpriseModalOpen}
        onClose={() => setIsEnterpriseModalOpen(false)}
        user={selectedUser}
      />
    </div>
  );
}