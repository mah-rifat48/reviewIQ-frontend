"use client";

import Skeleton from "@/components/ui/Skeleton";

// 4 stat cards in a row
export function StatsCardsSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="size-9 rounded-lg" />
                    </div>
                    <Skeleton className="h-7 w-20" />
                    <Skeleton className="h-3 w-32" />
                </div>
            ))}
        </div>
    );
}

// Generic chart card skeleton
export function ChartSkeleton({ height = 300 }: { height?: number }) {
    return (
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
            <Skeleton className="h-5 w-40 mb-6" />
            <Skeleton className={`w-full rounded-xl`} style={{ height }} />
        </div>
    );
}

// Table skeleton
export function TableSkeleton({ rows = 6, cols = 6 }: { rows?: number; cols?: number }) {
    return (
        <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm overflow-hidden">
            <div className="bg-[#F8FAFC] px-4 py-4 flex gap-8 border-b border-[#E2E8F0]">
                {Array.from({ length: cols }).map((_, i) => (
                    <Skeleton key={i} className="h-3 w-16" />
                ))}
            </div>
            <div className="divide-y divide-[#E2E8F0]">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="px-4 py-4 flex gap-8 items-center">
                        {Array.from({ length: cols }).map((_, j) => (
                            <Skeleton key={j} className="h-4 w-20" />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

// Section card skeleton (for settings-style sections)
export function SectionSkeleton({ rows = 3 }: { rows?: number }) {
    return (
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm space-y-5">
            <Skeleton className="h-5 w-32 mb-2" />
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ))}
        </div>
    );
}

// Page header skeleton
export function PageHeaderSkeleton() {
    return (
        <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
        </div>
    );
}

// Custom skeleton for Users table
export function UsersTableSkeleton({ rows = 8 }: { rows?: number }) {
    return (
        <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full table-auto text-left text-sm">
                    <thead className="bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        <tr>
                            <th className="px-5 py-5 whitespace-nowrap">User Profile</th>
                            <th className="px-5 py-5 whitespace-nowrap">Status</th>
                            <th className="px-5 py-5 whitespace-nowrap">Subscription</th>
                            <th className="px-5 py-5 whitespace-nowrap">Assets</th>
                            <th className="px-5 py-5 whitespace-nowrap">MRR</th>
                            <th className="px-5 py-5 whitespace-nowrap">Last Activity</th>
                            <th className="px-5 py-5 text-right whitespace-nowrap">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                        {Array.from({ length: rows }).map((_, i) => (
                            <tr key={i} className="animate-pulse">
                                <td className="px-5 py-5">
                                    <div className="flex items-center gap-4 min-w-[220px]">
                                        <Skeleton className="size-10 rounded-full flex-shrink-0" />
                                        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                                            <Skeleton className="h-4 w-28 rounded" />
                                            <Skeleton className="h-3 w-40 rounded" />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-5 whitespace-nowrap">
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                </td>
                                <td className="px-5 py-5 whitespace-nowrap">
                                    <div className="flex flex-col gap-1.5">
                                        <Skeleton className="h-4 w-24 rounded" />
                                        <Skeleton className="h-3.5 w-16 rounded" />
                                    </div>
                                </td>
                                <td className="px-5 py-5">
                                    <div className="flex flex-col gap-1.5 min-w-[80px]">
                                        <Skeleton className="h-4 w-16 rounded" />
                                        <Skeleton className="h-3 w-20 rounded" />
                                    </div>
                                </td>
                                <td className="px-5 py-5 whitespace-nowrap">
                                    <Skeleton className="h-4.5 w-14 rounded" />
                                </td>
                                <td className="px-5 py-5 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="size-3.5 rounded-full" />
                                        <Skeleton className="h-3.5 w-18 rounded" />
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <div className="flex items-center justify-end gap-2.5">
                                        <Skeleton className="size-9 rounded-xl" />
                                        <Skeleton className="size-9 rounded-xl" />
                                        <Skeleton className="size-9 rounded-xl" />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Custom skeleton for Support tickets table
export function SupportTableSkeleton({ rows = 8 }: { rows?: number }) {
    return (
        <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full table-auto text-left text-sm">
                    <thead className="bg-[#F8FAFC] text-xs font-semibold uppercase text-gray-500">
                        <tr className="whitespace-nowrap">
                            <th className="px-4 py-4 min-w-[100px]">Ticket ID</th>
                            <th className="px-4 py-4 min-w-[160px]">Customer</th>
                            <th className="px-4 py-4 min-w-[160px]">Subject</th>
                            <th className="px-4 py-4 min-w-[80px]">Priority</th>
                            <th className="px-4 py-4 min-w-[80px]">Status</th>
                            <th className="px-4 py-4 min-w-[90px]">Category</th>
                            <th className="px-4 py-4 min-w-[110px]">Last Update</th>
                            <th className="px-4 py-4 min-w-[60px] text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                        {Array.from({ length: rows }).map((_, i) => (
                            <tr key={i} className="animate-pulse">
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <Skeleton className="h-4 w-16 rounded" />
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex flex-col gap-1.5 min-w-[140px]">
                                        <Skeleton className="h-4 w-28 rounded" />
                                        <Skeleton className="h-3 w-40 rounded" />
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <Skeleton className="h-4 w-36 rounded" />
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <Skeleton className="h-5.5 w-16 rounded-full" />
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <Skeleton className="h-5.5 w-20 rounded-full" />
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <Skeleton className="h-4 w-24 rounded" />
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <Skeleton className="h-4 w-20 rounded" />
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <div className="flex justify-end">
                                        <Skeleton className="size-9 rounded-xl" />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

