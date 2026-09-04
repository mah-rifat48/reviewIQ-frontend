"use client";

import React, { useState, useEffect } from "react";
import { 
    X, 
    Building2, 
    MapPin, 
    Phone, 
    Globe, 
    Link as LinkIcon,
    Loader2 
} from "lucide-react";
import { getUserIdFromToken } from "@/utils/authUtils";
import { toast } from "react-hot-toast";
import { useAddLocationMutation } from "@/redux/api/AI/addlocationApi";
import { useDispatch } from "react-redux";
import { setSelectedLocation, setSelectedAddress } from "@/redux/slices/businessSlice";

interface AddLocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    businessName: string;
}

export default function AddLocationModal({ isOpen, onClose, businessName }: AddLocationModalProps) {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        location: "",
        maps_url: "",
        phone_no: "",
        website: ""
    });

    const [addLocation, { isLoading }] = useAddLocationMutation();

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData({
                location: "",
                maps_url: "",
                phone_no: "",
                website: ""
            });
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        const userId = getUserIdFromToken();
        if (!userId) {
            toast.error("Session expired. Please login again.");
            return;
        }

        if (!formData.location.trim()) {
            toast.error("Location (Address/City) is required");
            return;
        }
        if (!formData.maps_url.trim()) {
            toast.error("Google Maps URL is required");
            return;
        }

        const payload = {
            business_name: businessName,
            location: formData.location,
            maps_url: formData.maps_url,
            phone_no: formData.phone_no,
            user_id: userId,
            website: formData.website,
        };

        try {
            const response = await addLocation(payload).unwrap();
            toast.success("Location added successfully!");
            
            // Automatically select the new location
            // The response contains the saved location details
            if (response?.location?.map_url) {
                dispatch(setSelectedLocation(response.location.map_url));
                dispatch(setSelectedAddress(response.location.input_location || response.location.location));
            }
            
            onClose();
        } catch (err: any) {
            console.error("Error adding location:", err);
            const errorMessage = err?.data?.detail?.[0]?.msg || err?.data?.message || err?.message || "Failed to add location. Please try again.";
            toast.error(errorMessage);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 sm:p-6">
            <div className="bg-white rounded-[24px] w-full max-w-lg shadow-2xl animate-fadeIn relative overflow-hidden flex flex-col">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 sm:px-8 pt-8 pb-4 bg-white shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm shrink-0">
                            <MapPin className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-[20px] sm:text-[22px] font-bold text-[#1A1A1A] leading-tight">Add Business Location</h2>
                            <p className="text-[13px] sm:text-[14px] text-zinc-500 font-medium">Expand your business reach</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2.5 hover:bg-zinc-100 rounded-xl transition-all duration-200 text-zinc-400 hover:text-zinc-700 shrink-0 self-start"
                    >
                        <X size={22} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Form Content */}
                <div className="p-6 sm:p-8 space-y-5 overflow-y-auto max-h-[60vh] custom-thin-scrollbar">
                    
                    {/* Business Name (Read Only) */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Target Business</label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                            <input
                                type="text"
                                readOnly
                                value={businessName}
                                className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 text-[14px] font-semibold text-zinc-600 outline-none cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Location (Address/City) */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Location (Address / City) *</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                            <input
                                type="text"
                                placeholder="Uttara, Dhaka"
                                className="w-full h-11 bg-white border border-zinc-200 rounded-xl pl-10 pr-4 text-[14px] focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all placeholder:text-zinc-400"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Google Maps URL */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Google Maps URL *</label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                            <input
                                type="text"
                                placeholder="https://maps.app.goo.gl/..."
                                className="w-full h-11 bg-white border border-zinc-200 rounded-xl pl-10 pr-4 text-[14px] focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all placeholder:text-zinc-400"
                                value={formData.maps_url}
                                onChange={(e) => setFormData({ ...formData, maps_url: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Phone Number */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="+880..."
                                    className="w-full h-11 bg-white border border-zinc-200 rounded-xl pl-10 pr-4 text-[14px] focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all placeholder:text-zinc-400"
                                    value={formData.phone_no}
                                    onChange={(e) => setFormData({ ...formData, phone_no: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Website */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Website</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="https://..."
                                    className="w-full h-11 bg-white border border-zinc-200 rounded-xl pl-10 pr-4 text-[14px] focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all placeholder:text-zinc-400"
                                    value={formData.website}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 sm:px-8 py-6 border-t border-zinc-100 bg-white flex justify-end gap-3 shrink-0">
                    <button 
                        onClick={onClose} 
                        className="cursor-pointer px-6 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 font-bold hover:bg-zinc-50 transition-all text-[14px]"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={isLoading} 
                        className="cursor-pointer bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 text-[14px] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Adding...
                            </>
                        ) : (
                            "Add Location"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
