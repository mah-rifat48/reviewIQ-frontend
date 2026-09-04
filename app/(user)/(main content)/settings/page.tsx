"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
    Building2,
    CreditCard,
    Bell,
    User,
    Puzzle,
    Shield,
    X,
    Lock,
    AlertTriangle,
    Eye,
    EyeOff,
    ChevronDown,
    Trash2,
    Save,
    Plus,
    MapPin,
    Globe,
    Phone,
    Check,
    AlertCircle,
    Copy,
    ExternalLink,
    MessageSquare,
    Star,
    Edit,
    StarHalf
} from "lucide-react";
import { cn } from "@/lib/utils";
import StylishDropdown from "@/components/ui/StylishDropdown";
import Image from "next/image";
import { useGetProfileQuery, useUploadProfileImageMutation, useUpdateProfileMutation, useChangePasswordMutation, useDeleteAccountMutation } from "@/redux/api/BE/user/profileApi";
import { useGetBusinessProfileQuery, useUpdateBusinessProfileMutation } from "@/redux/api/AI/businessSettingsApi";
import { getUserIdFromToken, getSubscriptionFromCookie } from "@/utils/authUtils";
import { useLoginMutation } from "@/redux/api/BE/user/authApi";
import { useAuth } from "@/hooks/useAuth";
import { GOOGLE_BUSINESS_CATEGORIES } from "@/constants/businessCategories";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast"; // Assuming toast is used for notifications
import { Loader2, Camera } from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";
import { useGetNotificationSettingsQuery, useUpdateNotificationSettingsMutation } from "@/redux/api/BE/user/notificationApi";
import { useGetMyBillingQuery } from "@/redux/api/BE/user/settingsApi";

import { useGetReviewsQuery, useCreateReviewMutation, useUpdateReviewMutation } from "@/redux/api/BE/reviewsApi";
import { useDeleteUserBusinessesMutation } from "@/redux/api/AI/businessmanagementApi";
import Link from "next/link";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useLazyGetSubscriptionByIdQuery } from "@/redux/api/BE/user/planApi";

// Types
type Tab = "account" | "business" | "integrations" | "notifications" | "billing" | "reviews";

// ----------------------------------------------------------------------
// MODAL COMPONENTS
// ----------------------------------------------------------------------

const ChangePasswordModal = ({ isOpen, onClose, email }: { isOpen: boolean, onClose: () => void, email: string }) => {
    const [changePassword, { isLoading }] = useChangePasswordMutation();
    const [login] = useLoginMutation();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    if (!isOpen) return null;

    const handleUpdatePassword = async () => {
        if (!currentPassword) {
            toast.error("Please enter your current password");
            return;
        }
        if (!newPassword) {
            toast.error("Please enter a new password");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        try {
            await changePassword({
                oldPassword: currentPassword,
                newPassword: newPassword
            }).unwrap();

            // Silently log back in with the new password so the user is NOT logged out
            if (email) {
                try {
                    const result = await login({ email, password: newPassword, role: "USER" }).unwrap();
                    if (result.success) {
                        Cookies.set("accessToken", result.data.accessToken, { expires: 7, path: "/" });
                        Cookies.set("refreshToken", result.data.refreshToken, { expires: 30, path: "/" });
                        if (result.data.subscription) {
                            const encodedSub = btoa(JSON.stringify(result.data.subscription));
                            Cookies.set("subscription", encodedSub, { expires: 7, path: '/' });
                        }
                    }
                } catch (loginErr) {
                    console.error("Silent login failed after password change:", loginErr);
                }
            }

            toast.success("Password changed successfully!");

            // Reset state fields
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            onClose();
        } catch (err: any) {
            console.error("Change password failed:", err);
            toast.error(err?.data?.message || "Failed to change password. Please check your current password.");
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900">Change Password</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                        <X className="size-5 text-gray-500" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Current Password</label>
                        <div className="relative">
                            <input
                                type={showCurrent ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent(!showCurrent)}
                                className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showCurrent ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">New Password</label>
                        <div className="relative">
                            <input
                                type={showNew ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showNew ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                        <div className="relative">
                            <input
                                type={showConfirm ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showConfirm ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-gray-50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="cursor-pointer flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpdatePassword}
                        disabled={isLoading}
                        className="cursor-pointer flex-1 px-4 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <span>{isLoading ? <Loader2 className="size-4 animate-spin" /> : "Update Password"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const DeleteAccountModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const [confirmText, setConfirmText] = useState("");
    const [showConfirmStep, setShowConfirmStep] = useState(false);
    const [deleteAccount, { isLoading }] = useDeleteAccountMutation();
    const [deleteUserBusinesses] = useDeleteUserBusinessesMutation();
    const { logout } = useAuth();

    useEffect(() => {
        if (!isOpen) {
            setConfirmText("");
            setShowConfirmStep(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleDelete = async () => {
        try {
            const userId = getUserIdFromToken();
            // Step 1: delete all business data for this user
            if (userId) {
                await deleteUserBusinesses({ user_id: userId }).unwrap();
            }
            // Step 2: delete the account itself
            await deleteAccount().unwrap();
            toast.success("Account and all associated business data deleted successfully");
            logout("/login");
        } catch (err: any) {
            console.error("Failed to delete account:", err);
            toast.error(err?.data?.message || "Failed to delete account. Please try again.");
        }
    };

    if (showConfirmStep) {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                    <div className="p-8 text-center space-y-6">
                        <div className="size-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                            <AlertTriangle className="size-8 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Are you absolutely sure?</h3>
                            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                                This is your final warning. Once deleted, all your data is gone forever.
                            </p>
                        </div>
                    </div>
                    <div className="p-6 bg-red-50 flex gap-3">
                        <button
                            disabled={isLoading}
                            onClick={() => setShowConfirmStep(false)}
                            className="cursor-pointer flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            Go Back
                        </button>
                        <button
                            disabled={isLoading}
                            onClick={handleDelete}
                            className="cursor-pointer flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                        >
                            <span>{isLoading ? <Loader2 className="size-4 animate-spin" /> : "Yes, Delete"}</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertTriangle className="size-5 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Delete Account</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                        <X className="size-5 text-gray-500" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-600 leading-relaxed">
                        This action is <span className="font-bold text-red-600">permanent</span> and cannot be undone. All your data, businesses, and reports will be deleted immediately.
                    </p>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Type <span className="font-bold">DELETE</span> to confirm</label>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder="DELETE"
                            className="w-full px-4 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                        />
                    </div>
                </div>
                <div className="p-6 bg-red-50 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="cursor-pointer flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={confirmText !== "DELETE" || isLoading}
                        onClick={() => setShowConfirmStep(true)}
                        className="cursor-pointer flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        Delete Permanently
                    </button>
                </div>
            </div>
        </div>
    );
};

const ConfirmSaveModal = ({ isOpen, onClose, onConfirm }: { isOpen: boolean, onClose: () => void, onConfirm: () => void }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-8 text-center space-y-6">
                    <div className="size-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                        <Save className="size-8 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Save Changes?</h3>
                        <p className="text-sm text-gray-500 mt-2 leading-relaxed">Are you sure you want to save these updates to your settings?</p>
                    </div>
                </div>
                <div className="p-6 bg-gray-50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="cursor-pointer flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="cursor-pointer flex-1 px-4 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// SUB-COMPONENTS
// ----------------------------------------------------------------------

interface SettingsProps {
    onOpenPassword: () => void;
    onOpenDelete: () => void;
    onOpenSave: (handler: () => void) => void;
}

// 1. Account Settings
const AccountSettings = ({ onOpenPassword, onOpenDelete, onOpenSave }: SettingsProps) => {
    const { data: profileData, isLoading } = useGetProfileQuery();
    const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
    const user = profileData?.data;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.split("/api/v1")[0];

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState("");

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setEmail(user.email || "");
            setPreviewUrl(user.profileImage ? `${baseUrl}${user.profileImage}` : "");
        }
    }, [user, baseUrl]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSave = async () => {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);

        // Pass original values for backend validation / consistency
        formData.append("phone", user?.phone || "");
        formData.append("address", user?.address || "");
        formData.append("country", user?.country || "");
        formData.append("language", user?.language || "");
        formData.append("operationsRole", user?.operationsRole || "manager");

        if (imageFile) {
            formData.append("image", imageFile);
        }

        try {
            await updateProfile(formData).unwrap();
            toast.success("Account settings updated successfully!");
            setImageFile(null); // Clear selected file after success
        } catch (err: any) {
            console.error("Update failed:", err);
            toast.error(err?.data?.message || "Failed to update account settings. Please try again.");
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="user-card p-6 rounded-2xl space-y-6">
                    <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                        <Skeleton className="size-24 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full rounded-xl" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fadeIn">
            <div>
                <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>
                <div className="user-card p-6 rounded-2xl mt-4 space-y-6">
                    {/* Profile Image Upload */}
                    <div className="flex flex-col items-center sm:flex-row gap-6 pb-6 border-b border-gray-100">
                        <div className="relative group">
                            <div className="size-24 rounded-full overflow-hidden ring-4 ring-blue-50">
                                <img
                                    src={previewUrl || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                                    alt="Profile"
                                    className="size-full object-cover"
                                />
                            </div>
                            {isUpdating && (
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center animate-pulse">
                                    <Loader2 className="size-6 text-white animate-spin" />
                                </div>
                            )}
                            <label className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white shadow-lg cursor-pointer hover:bg-blue-700 transition-colors">
                                <Camera className="size-4" />
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    disabled={isUpdating}
                                />
                            </label>
                        </div>
                        <div className="space-y-1 text-center sm:text-left">
                            <h4 className="font-bold text-gray-900">Profile Picture</h4>
                            <p className="text-sm text-gray-500">JPG, GIF or PNG. Max size of 800K</p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Password</label>
                        <div className="flex gap-3">
                            <input
                                type="password"
                                defaultValue="........"
                                disabled
                                className="w-full px-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl"
                            />
                            <button
                                onClick={onOpenPassword}
                                className="cursor-pointer px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap"
                            >
                                Change Password
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-sm font-bold text-red-500 mb-4">Danger Zone</h3>
                <button
                    onClick={onOpenDelete}
                    className="cursor-pointer px-5 py-2.5 text-sm font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors shadow-sm"
                >
                    Delete Account
                </button>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    onClick={() => onOpenSave(handleSave)}
                    disabled={isUpdating}
                    className="cursor-pointer flex-items-center justify-center gap-2 px-6 py-3 min-w-[160px] text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 flex"
                >
                    <span>
                        {isUpdating ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Save className="size-4" />
                        )}
                    </span>
                    <span>{isUpdating ? "Saving..." : "Save Changes"}</span>
                </button>
            </div>
        </div>
    );
};

// 2. Business Settings
const BusinessSettings = ({ onOpenSave }: Pick<SettingsProps, "onOpenSave">) => {
    const { selectedBusiness, selectedAddress } = useSelector((state: any) => state.business);
    const userId = getUserIdFromToken();

    const { data: profileData, isLoading, isFetching } = useGetBusinessProfileQuery(
        { user_id: userId || "", business_name: selectedBusiness || "", location: selectedAddress || "" },
        { skip: !userId || !selectedBusiness || !selectedAddress }
    );

    const [updateProfile, { isLoading: isUpdating }] = useUpdateBusinessProfileMutation();

    const [businessName, setBusinessName] = useState(selectedBusiness || "");
    const [category, setCategory] = useState("");
    const [location, setLocation] = useState(selectedAddress || "");
    const [mapUrl, setMapUrl] = useState("");
    const [phone, setPhone] = useState("");
    const [website, setWebsite] = useState("");

    const initialCategories = GOOGLE_BUSINESS_CATEGORIES;

    const [categories, setCategories] = useState(initialCategories);

    useEffect(() => {
        if (selectedBusiness) setBusinessName(selectedBusiness);
        if (selectedAddress) setLocation(selectedAddress);
    }, [selectedBusiness, selectedAddress]);

    useEffect(() => {
        if (profileData) {
            setBusinessName(profileData.business_name || "");
            setCategory(profileData.category || "");
            setLocation(profileData.input_location || profileData.location || "");
            setMapUrl(profileData.map_url || "");
            setPhone(profileData.phone_no || "");
            setWebsite(profileData.website || "");

            // If backend category is not in the list, add it
            if (profileData.category) {
                const exists = initialCategories.find(c => c.value.toLowerCase() === profileData.category.toLowerCase());
                if (!exists) {
                    setCategories([
                        ...initialCategories,
                        {
                            label: profileData.category.charAt(0).toUpperCase() + profileData.category.slice(1),
                            value: profileData.category
                        }
                    ]);
                }
            }
        }
    }, [profileData]);

    const handleCopyMapUrl = () => {
        if (mapUrl) {
            navigator.clipboard.writeText(mapUrl);
            toast.success("Google Maps URL copied!");
        }
    };

    const handleCopyWebsite = () => {
        if (website) {
            navigator.clipboard.writeText(website);
            toast.success("Website URL copied!");
        }
    };

    const handleSave = async () => {
        if (!userId || !selectedBusiness || !selectedAddress) return;

        try {
            await updateProfile({
                user_id: userId,
                existing_business_name: selectedBusiness,
                existing_location: selectedAddress,
                new_business_name: businessName,
                category,
                new_location: location,
                map_url: mapUrl,
                phone_no: phone,
                website
            }).unwrap();
            toast.success("Business profile updated successfully!");
        } catch (err: any) {
            console.error("Update failed:", err);
            toast.error(err?.data?.message || "Failed to update business profile");
        }
    };

    // No longer return full-page skeleton here. We'll handle it inline.

    return (
        <div className="space-y-8 animate-fadeIn">
            <div>
                <h2 className="text-xl font-bold text-gray-900">Business Settings</h2>
                <div className="user-card p-6 rounded-2xl mt-4 space-y-6">
                    {/* Business Name */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Business Name</label>
                        <input
                            type="text"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            className="w-full px-4 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>

                    {/* Business Category Dropdown */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Business Category</label>
                        {isLoading || isFetching ? (
                            <Skeleton className="h-10 w-full rounded-xl" />
                        ) : (
                            <StylishDropdown
                                options={categories}
                                value={category}
                                onChange={(val) => setCategory(val as string)}
                                placeholder="Select Category"
                                icon={<Building2 className="size-4" />}
                            />
                        )}
                    </div>

                    {/* Locations Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">Business Location</label>
                        </div>
                        <div className="space-y-3">
                            {/* Address Name */}
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500">Address Name</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="Enter address name..."
                                        className="w-full pl-11 pr-4 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Google Map URL */}
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500">Google Map URL</label>
                                {isLoading || isFetching ? (
                                    <Skeleton className="h-10 w-full rounded-xl" />
                                ) : (
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                            <input
                                                type="text"
                                                value={mapUrl}
                                                onChange={(e) => setMapUrl(e.target.value)}
                                                placeholder="Enter Google Map URL..."
                                                className="w-full pl-11 pr-4 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                            />
                                        </div>
                                        <button
                                            onClick={handleCopyMapUrl}
                                            className="cursor-pointer p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-gray-100 shadow-sm"
                                            title="Copy URL"
                                        >
                                            <Copy className="size-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Phone Number</label>
                        {isLoading || isFetching ? (
                            <Skeleton className="h-10 w-full rounded-xl" />
                        ) : (
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-4 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            />
                        )}
                    </div>

                    {/* Website */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Website</label>
                        {isLoading || isFetching ? (
                            <Skeleton className="h-10 w-full rounded-xl" />
                        ) : (
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                    <input
                                        type="url"
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                        placeholder="https://example.com"
                                        className="w-full pl-11 pr-4 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <button
                                    onClick={handleCopyWebsite}
                                    className="cursor-pointer p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-gray-100 shadow-sm"
                                    title="Copy Website"
                                >
                                    <Copy className="size-5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    onClick={() => onOpenSave(handleSave)}
                    disabled={isUpdating}
                    className="cursor-pointer flex items-center justify-center gap-2 px-6 py-3 min-w-[160px] text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 flex"
                >
                    <span>
                        {isUpdating ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Save className="size-4" />
                        )}
                    </span>
                    <span>{isUpdating ? "Saving..." : "Save Changes"}</span>
                </button>
            </div>
        </div>
    );
};

// 3. Integrations Settings
const IntegrationsSettings = () => {
    const selectedBusiness = useSelector((state: any) => state.business.selectedBusiness);

    return (
        <div className="space-y-6 animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-900">Integrations</h2>

            {/* Google */}
            <div className="user-card p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="size-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        {/* Placeholder for Google Logo */}
                        <Image src="/google_icon.svg" alt="Google" width={24} height={24} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">Google Business Profile</h3>
                        <p className="text-xs text-gray-500 mt-1">Connected to: {selectedBusiness || "None"}</p>
                        <div className="flex items-center gap-1.5 mt-2">
                            <span className="size-1.5 bg-green-500 rounded-full" />
                            <span className="text-xs font-medium text-green-600">Active</span>
                        </div>

                        {/* <div className="mt-4">
                            <label className="text-xs font-medium text-gray-500">Sync Frequency</label>
                            <div className="mt-1 w-32 h-8 border border-gray-200 rounded-lg bg-gray-50"></div>
                        </div> */}
                    </div>
                </div>
                <button className="cursor-pointer px-4 py-2 text-xs font-medium text-red-600 bg-white border border-gray-200 rounded-lg hover:bg-red-50 transition-colors">
                    Disconnect
                </button>
            </div>

            {/* Yelp */}
            {/* <div className="bg-white p-5 rounded-2xl border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="size-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-gray-400">
                        <Shield className="size-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">Yelp</h3>
                        <p className="text-xs text-gray-500 mt-1">Expand your review analysis to Yelp</p>
                        <p className="text-xs text-gray-400 mt-2 font-medium">Coming soon</p>
                    </div>
                </div>
                <button disabled className="px-4 py-2 text-xs font-medium text-gray-400 bg-gray-50 border border-gray-200 rounded-lg cursor-not-allowed">
                    Connect
                </button>
            </div> */}

            {/* TripAdvisor */}
            {/* <div className="bg-white p-5 rounded-2xl border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="size-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-gray-400">
                        <Shield className="size-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">TripAdvisor</h3>
                        <p className="text-xs text-gray-500 mt-1">Include TripAdvisor reviews in your analysis</p>
                        <p className="text-xs text-gray-400 mt-2 font-medium">Coming soon</p>
                    </div>
                </div>
                <button disabled className="px-4 py-2 text-xs font-medium text-gray-400 bg-gray-50 border border-gray-200 rounded-lg cursor-not-allowed">
                    Connect
                </button>
            </div> */}
        </div>
    );
};

// 4. Notifications Settings
// Helper for notification items
const NotificationItem = ({
    title,
    description,
    isActive,
    onToggle
}: {
    title: string;
    description: string;
    isActive: boolean;
    onToggle: () => void;
}) => (
    <div
        onClick={onToggle}
        className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50/50 transition-colors cursor-pointer flex items-center justify-between"
    >
        <div className="flex-1 pr-4">
            <h4 className="text-sm font-bold text-gray-900">{title}</h4>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
        <div className={cn(
            "relative w-11 h-6 transition-colors duration-200 ease-in-out bg-gray-200 rounded-full cursor-pointer",
            isActive ? "bg-[var(--primary-brand)]" : "bg-gray-200"
        )}>
            <div className={cn(
                "absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out shadow-sm",
                isActive ? "translate-x-5" : "translate-x-0"
            )} />
        </div>
    </div>
);

const NotificationSettings = ({ onOpenSave }: Pick<SettingsProps, "onOpenSave">) => {
    const { data: settingsData, isLoading } = useGetNotificationSettingsQuery();
    const [updateSettings, { isLoading: isUpdating }] = useUpdateNotificationSettingsMutation();

    const [preferences, setPreferences] = useState({
        emailMonthlyReports: true,
        emailImportantAlerts: true,
        emailWeeklySummary: false,
        inAppNegativeReview: true,
        inAppRatingDrop: true,
        inAppMonthlyReport: true,
    });

    useEffect(() => {
        if (settingsData?.data) {
            setPreferences({
                emailMonthlyReports: settingsData.data.emailMonthlyReports ?? true,
                emailImportantAlerts: settingsData.data.emailImportantAlerts ?? true,
                emailWeeklySummary: settingsData.data.emailWeeklySummary ?? false,
                inAppNegativeReview: settingsData.data.inAppNegativeReview ?? true,
                inAppRatingDrop: settingsData.data.inAppRatingDrop ?? true,
                inAppMonthlyReport: settingsData.data.inAppMonthlyReport ?? true,
            });
        }
    }, [settingsData]);

    const handleToggle = (key: keyof typeof preferences) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        try {
            await updateSettings(preferences).unwrap();
            toast.success("Notification preferences saved successfully!");
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to save preferences. Please try again.");
            console.error("Failed to update notification settings", error);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-8 animate-fadeIn">
                <Skeleton className="h-8 w-48" />
                <div className="space-y-4">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fadeIn">
            <div>
                <h2 className="text-xl font-bold text-gray-900">Notification Settings</h2>

                <div className="mt-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Email Notifications</h3>
                    <div className="space-y-3">
                        <NotificationItem
                            title="Monthly Reports"
                            description="Receive monthly business intelligence reports"
                            isActive={preferences.emailMonthlyReports}
                            onToggle={() => handleToggle("emailMonthlyReports")}
                        />
                        <NotificationItem
                            title="Important Alerts"
                            description="Rating drops, negative review spikes"
                            isActive={preferences.emailImportantAlerts}
                            onToggle={() => handleToggle("emailImportantAlerts")}
                        />
                        <NotificationItem
                            title="Weekly Summary"
                            description="Quick overview of the week's performance"
                            isActive={preferences.emailWeeklySummary}
                            onToggle={() => handleToggle("emailWeeklySummary")}
                        />
                    </div>
                </div>

                <div className="mt-8">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">In-App Notifications</h3>
                    <div className="space-y-3">
                        <NotificationItem
                            title="New Negative Review"
                            description="Get notified immediately of 1-2 star reviews"
                            isActive={preferences.inAppNegativeReview}
                            onToggle={() => handleToggle("inAppNegativeReview")}
                        />
                        <NotificationItem
                            title="Rating Drop"
                            description="Alert when your overall rating decreases"
                            isActive={preferences.inAppRatingDrop}
                            onToggle={() => handleToggle("inAppRatingDrop")}
                        />
                        <NotificationItem
                            title="Monthly Report Ready"
                            description="Notify when new monthly report is generated"
                            isActive={preferences.inAppMonthlyReport}
                            onToggle={() => handleToggle("inAppMonthlyReport")}
                        />
                    </div>
                </div>
            </div>
            <div className="flex justify-end pt-4">
                <button
                    disabled={isUpdating}
                    onClick={() => onOpenSave(handleSave)}
                    className="cursor-pointer flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-[var(--primary-brand)] rounded-xl hover:bg-[var(--primary-brand-dark)] shadow-md shadow-[var(--primary-brand)]/20 transition-all disabled:opacity-50"
                >
                    <span>{isUpdating ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}</span>
                    <span>{isUpdating ? "Saving..." : "Save Preferences"}</span>
                </button>
            </div>
        </div>
    );
};


// 5. Billing Settings
const BillingSettings = () => {
    const { data: billingData, isLoading } = useGetMyBillingQuery();
    const [getSubscriptionById, { isLoading: isDownloading }] = useLazyGetSubscriptionByIdQuery();

    // Fallback or read from cookies
    const cookieSub = getSubscriptionFromCookie();

    const billingInfo = billingData?.data;
    const currentPlan = cookieSub?.plan || billingInfo?.currentPlan;

    // Adapt usage from cookie. The cookie provides 'location' and 'review' limits.
    // 'used' stats might still need to come from the API (billingInfo?.usage) or default to 0.
    const usage = {
        locations: {
            used: billingInfo?.usage?.locations?.used ?? 0,
            limit: cookieSub?.location ?? billingInfo?.usage?.locations?.limit ?? 1
        },
        reviews: {
            used: billingInfo?.usage?.reviews?.used ?? 0,
            limit: cookieSub?.review ?? billingInfo?.usage?.reviews?.limit ?? 100
        }
    };

    const billingHistory = billingInfo?.billingHistory || [];

    const formatDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        } catch {
            return dateStr;
        }
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
    };

    const handleDownloadInvoice = async (invoice: any) => {
        try {
            const subId = invoice.subscriptionId || invoice.id || cookieSub?.subscriptionId;
            if (!subId) {
                toast.error("Subscription ID not found");
                return;
            }

            const res = await getSubscriptionById(subId).unwrap();
            const subData = res?.data || res;

            const doc = new jsPDF();

            // Try to load logo
            try {
                const img = new window.Image();
                img.src = '/auth_icon.svg';
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                });
                
                // Draw SVG to canvas to convert it to a true PNG format for jsPDF
                const canvas = document.createElement("canvas");
                canvas.width = img.width || 173;
                canvas.height = img.height || 60;
                const ctx = canvas.getContext("2d");
                
                if (ctx) {
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    const imgData = canvas.toDataURL("image/png");
                    
                    const ratio = canvas.width / canvas.height;
                    const newHeight = 12;
                    const newWidth = newHeight * ratio;
                    
                    doc.addImage(imgData, 'PNG', 14, 15, newWidth, newHeight);
                } else {
                    throw new Error("Canvas context unavailable");
                }
            } catch (e) {
                doc.setFontSize(24);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(34, 211, 238); // Cyan
                doc.text("Aimalya", 14, 25);
            }

            // Invoice Header
            doc.setFontSize(20);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(33, 33, 33);
            doc.text("INVOICE", 150, 25);

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100, 100, 100);
            doc.text(`Invoice ID: ${subId.split('-')[0].toUpperCase()}`, 150, 32);
            doc.text(`Date: ${formatDate(invoice.date || subData?.createdAt)}`, 150, 37);
            doc.text(`Status: ${subData?.paymentStatus || invoice.status || "PAID"}`, 150, 42);

            // Billed To Section
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(33, 33, 33);
            doc.text("Billed To:", 14, 45);
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100, 100, 100);
            doc.text(`User ID: ${subData?.userId || "N/A"}`, 14, 51);

            // Main Details Table
            autoTable(doc, {
                startY: 65,
                theme: 'striped',
                headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [248, 250, 252] },
                bodyStyles: { textColor: 50 },
                head: [['Description', 'Amount']],
                body: [
                    [
                        `${subData?.plan} Plan Subscription (${subData?.durationsPlan || "Monthly"})`,
                        formatAmount(invoice.amount || subData?.balance || 0)
                    ],
                ],
            });

            // Feature Details Table
            const previousY = (doc as any).lastAutoTable.finalY + 15;
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(33, 33, 33);
            doc.text("Subscription Details", 14, previousY);

            const featureData = [
                ["Plan", subData?.plan || "N/A"],
                ["Billing Cycle", subData?.durationsPlan || "N/A"],
                ["Total Businesses", subData?.business || "0"],
                ["Locations per Business", subData?.location || "0"],
                ["Review Limits", subData?.review || "0"],
                ["Competitor Analysis", subData?.competitor ? "Included" : "Not Included"],
                ["Report Plans", Array.isArray(subData?.reportPlan) ? subData.reportPlan.join(", ") : (subData?.reportPlan || "None")],
                ["Expiration Date", subData?.durationDate ? formatDate(subData.durationDate) : "N/A"]
            ];

            autoTable(doc, {
                startY: previousY + 5,
                theme: 'plain',
                styles: { cellPadding: 2, fontSize: 10 },
                columnStyles: {
                    0: { fontStyle: 'bold', textColor: 100, cellWidth: 80 },
                    1: { textColor: 50 }
                },
                body: featureData,
            });

            // Footer
            const pageHeight = doc.internal.pageSize.height;
            doc.setFontSize(9);
            doc.setTextColor(150, 150, 150);
            doc.text("Thank you for your business!", 14, pageHeight - 20);
            doc.text("aimalya.com", 14, pageHeight - 15);

            doc.save(`Invoice_${subId.slice(0, 8)}.pdf`);
            toast.success("Invoice downloaded successfully!");
        } catch (error) {
            console.error("Failed to download invoice:", error);
            toast.error("Failed to download invoice");
        }
    };


    if (isLoading) {
        return (
            <div className="space-y-8 animate-fadeIn">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-40 w-full rounded-xl" />
            </div>
        );
    }

    // Determine plan info
    const planName = currentPlan || "Free Tier";
    let planPrice = cookieSub?.balance !== undefined ? formatAmount(Number(cookieSub.balance)) : "$0";
    let planPeriod = cookieSub?.durationsPlan?.toLowerCase() === "yearly" || cookieSub?.durationsPlan?.toLowerCase() === "annually" ? "per year" : "per month";
    let planDesc = "Standard Features";

    if (planName.toUpperCase() === "STARTER") {
        if (cookieSub?.balance === undefined) planPrice = "$49";
        planDesc = "Basic limits and features";
    } else if (planName.toUpperCase() === "PROFESSIONAL") {
        if (cookieSub?.balance === undefined) planPrice = "$149";
        planDesc = "Advanced limits and features";
    } else if (planName.toUpperCase() === "ENTERPRISE") {
        if (cookieSub?.balance === undefined) {
            planPrice = "Custom";
            planPeriod = "custom pricing";
        }
        planDesc = "Premium limits and analytics";
    }

    const expiryDate = cookieSub?.durationDate ? formatDate(cookieSub.durationDate) : null;

    return (
        <div className="space-y-8 animate-fadeIn">
            <div>
                <h2 className="text-xl font-bold text-gray-900">Billing & Subscription</h2>

                <h3 className="text-sm font-bold text-gray-900 mt-6 mb-3">Current Plan</h3>
                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-bold text-gray-900 capitalize">{planName.toLowerCase()}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{planDesc}</p>
                            <div className="flex items-center gap-3 mt-4">
                                {/* <button className="cursor-pointer px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                                    Upgrade Plan
                                </button> */}
                                <Link href="/pricing" className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                    Change Plan
                                </Link>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-gray-900">{planPrice}</div>
                            <div className="text-xs text-gray-500">{planPeriod}</div>
                            {expiryDate && (
                                <div className="text-[11px] font-medium text-amber-600 mt-1">
                                    Expires: {expiryDate}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Plan Limits & Features</h3>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <Building2 className="size-4" />
                                </div>
                                <span className="text-sm font-medium text-gray-900">Total Businesses</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">{cookieSub?.business || 1}</span>
                        </div>

                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                    <MapPin className="size-4" />
                                </div>
                                <span className="text-sm font-medium text-gray-900">Locations per Business</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">{cookieSub?.location || 1}</span>
                        </div>

                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                                    <Globe className="size-4" />
                                </div>
                                <span className="text-sm font-medium text-gray-900">Competitor Analysis</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">
                                {cookieSub?.competitor ? "Included" : "Not Included"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* <div className="mt-8">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Payment Method</h3>
                    <div className="p-4 border border-gray-200 rounded-xl flex items-center justify-between bg-white">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center text-gray-500 border border-gray-300">
                                <CreditCard className="size-4" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">•••• •••• •••• 4242</p>
                                <p className="text-xs text-gray-500">Expires 12/2026</p>
                            </div>
                        </div>
                        <button className="cursor-pointer px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                            Update
                        </button>
                    </div>
                </div> */}

                <div className="mt-8">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Billing History</h3>
                    {billingHistory.length === 0 ? (
                        <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                            <p className="text-sm text-gray-500">No invoice or billing history found.</p>
                        </div>
                    ) : (
                        <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 bg-white">
                            {billingHistory.map((invoice: any, i: number) => (
                                <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-gray-600 font-medium w-28">{formatDate(invoice.date)}</span>
                                        <span className="text-sm font-bold text-gray-900">{formatAmount(invoice.amount)}</span>
                                        <span className={cn(
                                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide",
                                            invoice.status?.toLowerCase() === "paid"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-amber-100 text-amber-700"
                                        )}>
                                            {invoice.status}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleDownloadInvoice(invoice)}
                                        disabled={isDownloading}
                                        className="cursor-pointer text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50"
                                    >
                                        {isDownloading ? "Downloading..." : "Download"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


// ----------------------------------------------------------------------
// REVIEWS SETTINGS
// ----------------------------------------------------------------------

const CreateFeedbackModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const [createReview, { isLoading }] = useCreateReviewMutation();
    const [rating, setRating] = useState(5);
    const [content, setContent] = useState("");
    const [designation, setDesignation] = useState("");
    const [company, setCompany] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!content) {
            toast.error("Please enter a review content");
            return;
        }

        try {
            await createReview({ content, rating, designation, company }).unwrap();
            toast.success("Feedback submitted successfully!");
            setContent("");
            setRating(5);
            setDesignation("");
            setCompany("");
            onClose();
        } catch (err: any) {
            console.error("Create review failed:", err);
            toast.error(err?.data?.message || "Failed to submit feedback");
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <h3 className="text-xl font-bold text-gray-900">Give Your Feedback</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                        <X className="size-5 text-gray-500" />
                    </button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Rating</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className={`p-1 cursor-pointer transition-colors ${rating >= star ? 'text-yellow-400' : 'text-gray-200'}`}
                                >
                                    <Star className="size-8" fill={rating >= star ? "currentColor" : "none"} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Review Content</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Share your experience with us..."
                            rows={4}
                            className="w-full px-4 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Designation (Optional)</label>
                        <input
                            type="text"
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                            placeholder="e.g. Marketing Manager"
                            className="w-full px-4 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Company (Optional)</label>
                        <input
                            type="text"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            placeholder="e.g. Acme Corp"
                            className="w-full px-4 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                </div>
                <div className="p-6 bg-gray-50 flex gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="cursor-pointer flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="cursor-pointer flex-1 px-4 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <span>{isLoading ? <Loader2 className="size-4 animate-spin" /> : "Submit Feedback"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const EditFeedbackModal = ({ isOpen, onClose, review }: { isOpen: boolean, onClose: () => void, review: any }) => {
    const [updateReview, { isLoading }] = useUpdateReviewMutation();
    const [rating, setRating] = useState(5);
    const [content, setContent] = useState("");
    const [designation, setDesignation] = useState("");
    const [company, setCompany] = useState("");

    useEffect(() => {
        if (review) {
            setRating(review.rating || 5);
            setContent(review.content || "");
            setDesignation(review.designation || "");
            setCompany(review.company || "");
        }
    }, [review]);

    if (!isOpen || !review) return null;

    const handleSubmit = async () => {
        if (!content) {
            toast.error("Please enter a review content");
            return;
        }

        try {
            await updateReview({
                id: review.reviewId,
                data: { content, rating, designation, company }
            }).unwrap();
            toast.success("Feedback updated successfully!");
            onClose();
        } catch (err: any) {
            console.error("Update review failed:", err);
            toast.error(err?.data?.message || "Failed to update feedback");
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <h3 className="text-xl font-bold text-gray-900">Edit Feedback</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                        <X className="size-5 text-gray-500" />
                    </button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Rating</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className={`p-1 cursor-pointer transition-colors ${rating >= star ? 'text-yellow-400' : 'text-gray-200'}`}
                                >
                                    <Star className="size-8" fill={rating >= star ? "currentColor" : "none"} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Review Content</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Share your experience with us..."
                            rows={4}
                            className="w-full px-4 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Designation (Optional)</label>
                        <input
                            type="text"
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                            className="w-full px-4 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Company (Optional)</label>
                        <input
                            type="text"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            className="w-full px-4 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                </div>
                <div className="p-6 bg-gray-50 flex gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="cursor-pointer flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="cursor-pointer flex-1 px-4 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <span>{isLoading ? <Loader2 className="size-4 animate-spin" /> : "Save Changes"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const ReviewsSettings = ({ onOpenCreateModal, onOpenEditModal }: { onOpenCreateModal: () => void, onOpenEditModal: (review: any) => void }) => {
    const { data: reviewsResponse, isLoading } = useGetReviewsQuery({ limit: 100, sortOrder: "desc" });
    const userId = getUserIdFromToken();
    const reviews = reviewsResponse?.data || [];

    // Find the single feedback submitted by the current user
    const userReview = reviews.find((r: any) => r.userId === userId);

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="flex justify-between items-center mb-6">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-32 rounded-xl" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-40 w-full rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Your Feedback</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage your submitted feedback</p>
                </div>
                {!userReview && (
                    <button
                        onClick={onOpenCreateModal}
                        className="cursor-pointer flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all"
                    >
                        <Plus className="size-4" />
                        Give your feedback
                    </button>
                )}
            </div>

            {!userReview ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="bg-white size-16 rounded-full flex items-center justify-center mx-auto shadow-sm mb-4">
                        <MessageSquare className="size-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">No feedback yet</h3>
                    <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
                        Share your experience to help us improve.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 hover:shadow-md transition-shadow relative group">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`size-4 ${i < userReview.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-100 text-gray-200"}`} />
                                ))}
                            </div>
                            <button
                                onClick={() => onOpenEditModal(userReview)}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit Feedback"
                            >
                                <Edit className="size-4" />
                            </button>
                        </div>
                        <p className="text-gray-700 text-sm mb-4 line-clamp-3 leading-relaxed">
                            "{userReview.content}"
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="size-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs shrink-0 uppercase">
                                {userReview.user?.name?.charAt(0) || "A"}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-gray-900 truncate">{userReview.user?.name || "Anonymous"}</p>
                                <p className="text-[11px] text-gray-500 truncate">
                                    {[userReview.designation, userReview.company].filter(Boolean).join(" at ") || userReview.user?.email || "User"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


// ----------------------------------------------------------------------
// MAIN PAGE
// ----------------------------------------------------------------------

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("account");
    const { data: profileData } = useGetProfileQuery();

    // Modal States
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isCreateFeedbackOpen, setIsCreateFeedbackOpen] = useState(false);
    const [isEditFeedbackOpen, setIsEditFeedbackOpen] = useState(false);
    const [selectedReviewToEdit, setSelectedReviewToEdit] = useState<any>(null);

    const [onConfirmSave, setOnConfirmSave] = useState<() => void>(() => () => { });

    const handleOpenSaveModal = (handler: () => void) => {
        setOnConfirmSave(() => handler);
        setIsSaveModalOpen(true);
    };

    const tabs = [
        { id: "account", label: "Account", icon: User },
        { id: "business", label: "Business", icon: Building2 },
        { id: "integrations", label: "Integrations", icon: Puzzle },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "billing", label: "Billing", icon: CreditCard },
        { id: "reviews", label: "Review/Feedback", icon: MessageSquare },
    ];

    const renderContent = () => {
        const commonProps = {
            onOpenSave: handleOpenSaveModal,
        };

        switch (activeTab) {
            case "account":
                return (
                    <AccountSettings
                        {...commonProps}
                        onOpenPassword={() => setIsPasswordModalOpen(true)}
                        onOpenDelete={() => setIsDeleteModalOpen(true)}
                    />
                );
            case "business":
                return <BusinessSettings {...commonProps} />;
            case "integrations":
                return <IntegrationsSettings />;
            case "notifications":
                return <NotificationSettings {...commonProps} />;
            case "billing":
                return <BillingSettings />;
            case "reviews":
                return <ReviewsSettings
                    onOpenCreateModal={() => setIsCreateFeedbackOpen(true)}
                    onOpenEditModal={(review) => {
                        setSelectedReviewToEdit(review);
                        setIsEditFeedbackOpen(true);
                    }}
                />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6 pb-8 relative">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your account and preferences</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Sidebar */}
                <div className="w-full md:w-64 shrink-0 space-y-1">
                    <div className="user-card rounded-2xl p-4 sticky top-6">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as Tab)}
                                    className={cn(
                                        "cursor-pointer w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 mb-3",
                                        isActive
                                            ? "bg-[var(--primary-brand)] text-white shadow-md shadow-[var(--primary-brand)]/20 translate-x-1"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    <Icon className="size-4.5" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 min-w-0 w-full">
                    <div className="user-card rounded-2xl p-6 md:p-8 min-h-[600px]">
                        {renderContent()}
                    </div>
                </div>
            </div>

            {/* Modals - Hoisted to top level for correct centering and blur */}
            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                email={profileData?.data?.email || ""}
            />
            <DeleteAccountModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
            />
            <ConfirmSaveModal
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                onConfirm={onConfirmSave}
            />
            <CreateFeedbackModal
                isOpen={isCreateFeedbackOpen}
                onClose={() => setIsCreateFeedbackOpen(false)}
            />
            <EditFeedbackModal
                isOpen={isEditFeedbackOpen}
                onClose={() => {
                    setIsEditFeedbackOpen(false);
                    setTimeout(() => setSelectedReviewToEdit(null), 200);
                }}
                review={selectedReviewToEdit}
            />
        </div>
    );
}
