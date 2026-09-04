"use client";

import React, { useState, useEffect } from "react";
import { Camera, Loader2, Save, UserCircle, Plus, X, Trash2, Eye, Search, Mail, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeaderSkeleton, SectionSkeleton } from "@/components/admin/AdminSkeletons";
import toast from "react-hot-toast";
import {
    useGetAdminProfileQuery,
    useUpdateAdminProfileMutation,
    useRegisterAdminMutation,
    useGetAllAdminsQuery,
    useDeleteAdminMutation,
} from "@/redux/api/BE/admin/profileApi";

export default function AdminProfile() {
    const { data: profileRes, isLoading } = useGetAdminProfileQuery();
    const [updateProfile, { isLoading: isSaving }] = useUpdateAdminProfileMutation();
    const admin = profileRes?.data;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.split("/api/v1")[0] || "";

    const [name, setName] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState("");

    const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
    const [newAdminData, setNewAdminData] = useState({ name: "", email: "", password: "", role: "ADMIN" });
    const [registerAdmin, { isLoading: isRegistering }] = useRegisterAdminMutation();

    // Admin List state
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [selectedAdminForView, setSelectedAdminForView] = useState<any>(null);
    const [selectedAdminForDelete, setSelectedAdminForDelete] = useState<any>(null);

    const [deleteAdmin] = useDeleteAdminMutation();

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data: adminsRes, isLoading: isAdminsLoading } = useGetAllAdminsQuery({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch || undefined,
    });

    // Populate form fields once data loads
    useEffect(() => {
        if (admin) {
            setName(admin.name || "");
            setPreviewUrl(admin.profileImage ? `${baseUrl}${admin.profileImage}` : "");
        }
    }, [admin, baseUrl]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("Name cannot be empty");
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        if (imageFile) {
            formData.append("image", imageFile);
        }

        try {
            await updateProfile(formData).unwrap();
            toast.success("Profile saved successfully!");
            setImageFile(null); // Clear selected file state
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to save profile. Please try again.");
            console.error("Failed to save admin profile:", err);
        }
    };

    const handleRegisterAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await registerAdmin(newAdminData).unwrap();
            toast.success("ADMIN account created successfully.");
            setIsAddAdminModalOpen(false);
            setNewAdminData({ name: "", email: "", password: "", role: "ADMIN" });
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to create admin. Please try again.");
            console.error("Failed to create admin:", err);
        }
    };

    const handleDeleteAdmin = async () => {
        if (!selectedAdminForDelete?.adminId) return;
        try {
            await deleteAdmin(selectedAdminForDelete.adminId).unwrap();
            toast.success("Admin deleted successfully.");
            setSelectedAdminForDelete(null);
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to delete admin.");
            console.error("Failed to delete admin:", err);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-8 pb-12">
                <PageHeaderSkeleton />
                <div className="space-y-8">
                    <SectionSkeleton rows={3} />
                </div>
            </div>
        );
    }

    const defaultAvatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";

    const getAdminAvatarUrl = (item: any) => {
        if (item.profileImage) {
            if (item.profileImage.startsWith('http')) return item.profileImage;
            return `${baseUrl}${item.profileImage}`;
        }
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || "Admin")}&background=0891B2&color=fff&bold=true`;
    };

    const adminsList = adminsRes?.data || [];
    const meta = adminsRes?.meta;
    const totalPages = meta?.lastPage || 1;

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#0F172A]">Admin Profile</h1>
                    <p className="text-gray-500">Manage your administrative details and account credentials</p>
                </div>
                <button 
                    onClick={() => setIsAddAdminModalOpen(true)}
                    className="flex items-center gap-2 rounded-lg bg-[var(--primary-brand)] px-4 py-2 text-sm font-bold text-white shadow-md shadow-[var(--primary-brand)]/20 hover:bg-[#06B6D4] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                    <Plus className="size-4" />
                    Add new admin
                </button>
            </div>

            {/* Profile Section Card */}
            <form onSubmit={handleSave} className="space-y-8">
                <section className="admin-card border border-[var(--primary-brand)]/30 bg-white shadow-none rounded-xl p-6">
                    {/* Header bar */}
                    <div className="flex items-center gap-2 border-b border-[#F1F5F9] pb-4">
                        <UserCircle className="size-5 text-[#0891B2]" />
                        <h3 className="text-lg font-bold text-[#0F172A]">Account Information</h3>
                    </div>

                    <div className="mt-6 flex flex-col md:flex-row gap-8 items-start">
                        {/* Profile Image Column */}
                        <div className="flex flex-col items-center gap-3 shrink-0 mx-auto md:mx-0">
                            <div className="relative group">
                                <div className="size-32 rounded-full overflow-hidden ring-4 ring-[var(--primary-brand)]/10 shadow-inner">
                                    <img
                                        src={previewUrl || defaultAvatar}
                                        alt="Admin Avatar"
                                        className="size-full object-cover"
                                    />
                                </div>
                                <label className="absolute bottom-0 right-0 p-2.5 bg-[var(--primary-brand)] rounded-full text-white shadow-lg cursor-pointer hover:bg-[#06B6D4] transition-colors border-2 border-white">
                                    <Camera className="size-4.5" />
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        disabled={isSaving}
                                    />
                                </label>
                            </div>
                            <div className="text-center">
                                <h4 className="text-sm font-bold text-[#0F172A]">Avatar Photo</h4>
                                <p className="text-xs text-gray-400 mt-0.5">JPG, JPEG or PNG</p>
                            </div>
                        </div>

                        {/* Input Fields Column */}
                        <div className="flex-1 w-full space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full rounded-lg border border-[var(--primary-brand)]/30 bg-white p-3 text-sm text-[#0F172A] focus:border-[var(--primary-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-brand)] transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                                <input
                                    type="email"
                                    value={admin?.email || ""}
                                    disabled
                                    className="w-full rounded-lg border border-[var(--primary-brand)]/20 bg-gray-50 p-3 text-sm text-gray-400 cursor-not-allowed outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Role</label>
                                    <input
                                        type="text"
                                        value={admin?.role || "ADMIN"}
                                        disabled
                                        className="w-full rounded-lg border border-[var(--primary-brand)]/20 bg-gray-50 p-3 text-sm text-gray-400 cursor-not-allowed outline-none uppercase font-semibold tracking-wide"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Member Since</label>
                                    <input
                                        type="text"
                                        value={admin?.createdAt ? new Date(admin.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : ""}
                                        disabled
                                        className="w-full rounded-lg border border-[var(--primary-brand)]/20 bg-gray-50 p-3 text-sm text-gray-400 cursor-not-allowed outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Save Changes Action */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex items-center gap-2 rounded-lg bg-[var(--primary-brand)] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-[var(--primary-brand)]/20 hover:bg-[#06B6D4] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        {isSaving ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <>
                                <Save className="size-4" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Admin List / Management Section */}
            <div className="space-y-6">
                <div className="flex flex-col gap-1 border-t border-gray-150 pt-8">
                    <h2 className="text-xl font-bold text-[#0F172A]">Platform Admins</h2>
                    <p className="text-gray-500 text-sm">
                        View and manage administrative roles and permissions
                    </p>
                </div>

                {/* Search Bar */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between admin-card p-3 rounded-xl border border-[var(--primary-brand)]/20 bg-white">
                    <div className="relative w-full">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                            <Search className="size-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block h-11 w-full rounded-xl border border-blue-100 bg-white pl-10 pr-4 text-sm text-[#0F172A] placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                            placeholder="Search admins by name or email..."
                        />
                    </div>
                </div>

                {/* Table */}
                {isAdminsLoading ? (
                    <div className="flex items-center justify-center py-20 admin-card rounded-2xl bg-white border border-[var(--primary-brand)]/20">
                        <Loader2 className="size-8 animate-spin text-[var(--primary-brand)]" />
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl admin-card border border-[var(--primary-brand)]/20 bg-white">
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto text-left text-sm">
                                <thead className="bg-[#F8FAFC] text-sm font-bold text-gray-500 border-b border-[#E2E8F0]">
                                    <tr>
                                        <th className="px-5 py-4 whitespace-nowrap">Admin</th>
                                        <th className="px-5 py-4 whitespace-nowrap">Role</th>
                                        <th className="px-5 py-4 whitespace-nowrap">Joined Date</th>
                                        <th className="px-5 py-4 whitespace-nowrap text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E2E8F0]">
                                    {adminsList.map((item: any) => (
                                        <tr key={item.adminId} className="group hover:bg-gray-50/50 transition-all border-b border-[#E2E8F0] last:border-b-0">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={getAdminAvatarUrl(item)}
                                                        alt={item.name}
                                                        className="size-10 rounded-full object-cover shrink-0"
                                                    />
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-bold text-sm text-[#0F172A] truncate">
                                                            {item.name}
                                                        </span>
                                                        <span className="text-xs text-gray-500 truncate">
                                                            {item.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider capitalize border ${
                                                    item.role === "SUPER_ADMIN" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-blue-50 text-blue-700 border-blue-200"
                                                }`}>
                                                    {item.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <span className="text-xs text-gray-500">
                                                    {new Date(item.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setSelectedAdminForView(item)}
                                                        className="flex items-center justify-center size-9 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                                                        title="View Details"
                                                    >
                                                        <Eye className="size-4.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedAdminForDelete(item)}
                                                        disabled={item.role === "SUPER_ADMIN"}
                                                        className="flex items-center justify-center size-9 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-gray-155 disabled:text-gray-400"
                                                        title={item.role === "SUPER_ADMIN" ? "Super Admins cannot be deleted" : "Delete Admin"}
                                                    >
                                                        <Trash2 className="size-4.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {adminsList.length === 0 && (
                            <div className="py-20 flex flex-col items-center justify-center bg-white">
                                <div className="size-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                                    <Search className="size-8 text-gray-300" />
                                </div>
                                <p className="text-gray-500 font-bold">No admins found</p>
                                <p className="text-gray-400 text-sm">
                                    Try adjusting your search criteria
                                </p>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-[#E2E8F0] bg-white px-5 py-4">
                                <div className="flex flex-1 justify-between sm:hidden">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="inline-flex items-center justify-center rounded-xl border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50 cursor-pointer"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="ml-3 inline-flex items-center justify-center rounded-xl border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50 cursor-pointer"
                                    >
                                        Next
                                    </button>
                                </div>
                                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Page <span className="font-bold text-gray-900">{currentPage}</span> of{" "}
                                            <span className="font-bold text-gray-900">{totalPages}</span>
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="inline-flex gap-1.5" aria-label="Pagination">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="inline-flex items-center justify-center size-9 rounded-lg border border-blue-50 bg-white text-gray-500 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50 transition-all cursor-pointer"
                                            >
                                                <ChevronLeft className="size-4" />
                                            </button>
                                            {Array.from({ length: totalPages }).map((_, i) => (
                                                <button
                                                    key={i + 1}
                                                    onClick={() => setCurrentPage(i + 1)}
                                                    className={`inline-flex items-center justify-center size-9 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                        currentPage === i + 1
                                                            ? "bg-blue-50 text-blue-600 border border-blue-100"
                                                            : "border border-transparent text-gray-500 hover:bg-gray-50"
                                                    }`}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                className="inline-flex items-center justify-center size-9 rounded-lg border border-blue-50 bg-white text-gray-500 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50 transition-all cursor-pointer"
                                            >
                                                <ChevronRight className="size-4" />
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Add Admin Modal */}
            {isAddAdminModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl relative">
                        <button
                            onClick={() => setIsAddAdminModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                            <X className="size-5" />
                        </button>
                        <h2 className="text-xl font-bold text-[#0F172A] mb-6">Add New Admin</h2>
                        
                        <form onSubmit={handleRegisterAdmin} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newAdminData.name}
                                    onChange={(e) => setNewAdminData({ ...newAdminData, name: e.target.value })}
                                    className="w-full rounded-lg border border-[var(--primary-brand)]/30 bg-white p-3 text-sm text-[#0F172A] focus:border-[var(--primary-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-brand)] transition-all"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={newAdminData.email}
                                    onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
                                    className="w-full rounded-lg border border-[var(--primary-brand)]/30 bg-white p-3 text-sm text-[#0F172A] focus:border-[var(--primary-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-brand)] transition-all"
                                    placeholder="abc@gmail.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={newAdminData.password}
                                    onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
                                    className="w-full rounded-lg border border-[var(--primary-brand)]/30 bg-white p-3 text-sm text-[#0F172A] focus:border-[var(--primary-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-brand)] transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                            
                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddAdminModalOpen(false)}
                                    className="px-4 py-2 rounded-lg text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isRegistering}
                                    className="flex items-center gap-2 rounded-lg bg-[var(--primary-brand)] px-4 py-2 text-sm font-bold text-white shadow-md shadow-[var(--primary-brand)]/20 hover:bg-[#06B6D4] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                                >
                                    {isRegistering ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        "Create Admin"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Admin Details Modal */}
            <AdminDetailsModal
                isOpen={!!selectedAdminForView}
                onClose={() => setSelectedAdminForView(null)}
                admin={selectedAdminForView}
            />

            {/* Delete Admin Confirmation Modal */}
            <DeleteAdminModal
                isOpen={!!selectedAdminForDelete}
                onClose={() => setSelectedAdminForDelete(null)}
                onConfirm={handleDeleteAdmin}
                admin={selectedAdminForDelete}
            />
        </div>
    );
}

interface AdminDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    admin: any;
}

function AdminDetailsModal({ isOpen, onClose, admin }: AdminDetailsModalProps) {
    if (!isOpen || !admin) return null;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.split("/api/v1")[0] || "";
    const profileImageUrl = admin.profileImage
        ? (admin.profileImage.startsWith('http') ? admin.profileImage : `${baseUrl}${admin.profileImage}`)
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.name || "Admin")}&background=0891B2&color=fff&bold=true`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity animate-in fade-in duration-200">
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col border border-[var(--primary-brand)]/30 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-start justify-between p-6 bg-[#F9FCFF] border-b border-[var(--primary-brand)]/20">
                    <div className="flex items-center gap-4">
                        <div className="size-14 rounded-full bg-[var(--primary-brand)]/10 flex items-center justify-center border-4 border-white shadow-sm overflow-hidden">
                            <img
                                src={profileImageUrl}
                                alt={admin.name}
                                className="size-full object-cover"
                            />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[#0F172A]">{admin.name}</h2>
                            <p className="text-xs font-semibold text-[#0891B2] flex items-center gap-1.5 mt-0.5">
                                <Mail className="size-3.5" /> {admin.email}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <div className="rounded-xl border border-[var(--primary-brand)]/20 bg-[#F9FCFF] p-4 space-y-1">
                        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Role</p>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                            admin.role === "SUPER_ADMIN" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}>
                            {admin.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                        </span>
                    </div>

                    <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-400 font-bold uppercase tracking-wider">Member Since</span>
                            <span className="font-semibold text-gray-700">
                                {new Date(admin.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-400 font-bold uppercase tracking-wider">Last Updated</span>
                            <span className="font-semibold text-gray-700">
                                {new Date(admin.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-[var(--primary-brand)]/20 bg-[#F9FCFF]">
                    <button
                        onClick={onClose}
                        className="w-full rounded-xl bg-[#0891B2] py-3 text-sm font-bold text-white hover:bg-[#06B6D4] transition-all shadow-md shadow-[var(--primary-brand)]/10 cursor-pointer text-center"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    );
}

interface DeleteAdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    admin: any;
}

function DeleteAdminModal({ isOpen, onClose, onConfirm, admin }: DeleteAdminModalProps) {
    if (!isOpen || !admin) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity animate-in fade-in duration-200">
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 border border-red-150">
                <div className="p-6">
                    <div className="flex items-center justify-center size-16 rounded-full bg-red-50 text-red-600 mb-6 mx-auto">
                        <Trash2 className="size-8" />
                    </div>

                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-bold text-[#0F172A]">Delete Admin Account?</h3>
                        <p className="text-sm text-gray-500 max-w-xs mx-auto">
                            Are you absolutely sure you want to delete <span className="font-bold text-[#0F172A]">{admin.name}</span> ({admin.email})?
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
                            Delete Admin
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
