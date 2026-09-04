"use client";

import React, { useState } from "react";
import { 
    X, 
    Building2, 
    MapPin, 
    Trash2, 
    Plus, 
    Loader2 
} from "lucide-react";
import StylishDropdown from "@/components/ui/StylishDropdown";
import { useFetchBusinessDataMutation } from "@/redux/api/AI/signupflowApi";
import { useGetBusinessNamesQuery } from "@/redux/api/AI/nameFatchingApi";
import { GOOGLE_BUSINESS_CATEGORIES } from "@/constants/businessCategories";
import { getUserIdFromToken, getSubscriptionFromCookie } from "@/utils/authUtils";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setSelectedBusiness, setSelectedLocation, setSelectedAddress } from "@/redux/slices/businessSlice";

interface Location {
    id: string;
    name: string; // Google Maps URL
    address: string; // Address / City
}

interface Business {
    id: string;
    name: string;
    category: string;
    locations: Location[];
}

interface AddBusinessModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddBusinessModal({ isOpen, onClose }: AddBusinessModalProps) {
    const [businesses, setBusinesses] = useState<Business[]>([
        { id: Date.now().toString(), name: '', category: '', locations: [{ id: Date.now().toString() + 'l1', name: '', address: '' }] }
    ]);

    const [fetchBusinessData, { isLoading }] = useFetchBusinessDataMutation();
    const dispatch = useDispatch();

    const userId = getUserIdFromToken();
    const { data: namesData } = useGetBusinessNamesQuery(userId || "", {
        skip: !userId,
    });

    const addBusiness = () => {
        const subscriptionToken = getSubscriptionFromCookie();
        const limit = Number(subscriptionToken?.business || 1);
        
        const existingNames = namesData?.business_names || [];
        const uniqueNamesCount = new Set(existingNames).size;
        
        if (uniqueNamesCount + businesses.length >= limit) {
            toast.error(`You have reached your limit of ${limit} business(es). Upgrade to add more.`);
            return;
        }

        setBusinesses([...businesses, { 
            id: Date.now().toString(), 
            name: '', 
            category: '', 
            locations: [{ id: Date.now().toString() + 'l', name: '', address: '' }] 
        }]);
    };

    const addLocation = (bizIndex: number) => {
        const subscriptionToken = getSubscriptionFromCookie();
        const limit = Number(subscriptionToken?.location || 1);
        if (businesses[bizIndex].locations.length >= limit) {
            toast.error(`You have reached your limit of ${limit} location(s) for this business.`);
            return;
        }
        const newBusinesses = [...businesses];
        newBusinesses[bizIndex].locations.push({ id: Date.now().toString(), name: '', address: '' });
        setBusinesses(newBusinesses);
    };

    const removeLocation = (bizIndex: number, locIndex: number) => {
        const newBusinesses = [...businesses];
        if (newBusinesses[bizIndex].locations.length > 1) {
            newBusinesses[bizIndex].locations.splice(locIndex, 1);
            setBusinesses(newBusinesses);
        } else {
            toast.error("At least one location is required");
        }
    };

    const removeBusiness = (bizIndex: number) => {
        if (businesses.length > 1) {
            const newBusinesses = [...businesses];
            newBusinesses.splice(bizIndex, 1);
            setBusinesses(newBusinesses);
        } else {
            toast.error("At least one business is required");
        }
    };

    const handleSubmit = async () => {
        const userId = getUserIdFromToken();
        if (!userId) {
            toast.error("Session expired. Please login again.");
            return;
        }

        for (const biz of businesses) {
            if (!biz.name.trim()) {
                toast.error("Business name is required");
                return;
            }
            if (!biz.category) {
                toast.error(`Please select a category for ${biz.name}`);
                return;
            }
            for (const loc of biz.locations) {
                if (!loc.name.trim()) {
                    toast.error(`Google Maps URL is required for ${biz.name}`);
                    return;
                }
                if (!loc.address.trim()) {
                    toast.error(`Address/City is required for ${biz.name}`);
                    return;
                }
            }
        }

        const payload = {
            user_id: userId,
            businesses: businesses.map(b => ({
                name: b.name,
                category: b.category.toLowerCase(),
                locations: b.locations.map(l => ({
                    address_or_city: l.address,
                    google_maps_url: l.name
                }))
            }))
        };

        try {
            await fetchBusinessData(payload).unwrap();
            toast.success("Businesses added successfully!");
            
            // Auto select the newly added business and location
            if (businesses.length > 0) {
                const addedBiz = businesses[businesses.length - 1];
                dispatch(setSelectedBusiness(addedBiz.name));
                if (addedBiz.locations.length > 0) {
                    dispatch(setSelectedLocation(addedBiz.locations[0].name));
                    dispatch(setSelectedAddress(addedBiz.locations[0].address));
                }
            }

            onClose();
            setBusinesses([{ id: Date.now().toString(), name: '', category: '', locations: [{ id: Date.now().toString() + 'l1', name: '', address: '' }] }]);
        } catch (err: any) {
            console.error("Error adding business:", err);
            const errorMessage = err?.data?.detail?.[0]?.msg || err?.data?.message || err?.message || "Failed to save business data. Please try again.";
            toast.error(errorMessage);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 sm:p-6">
            <div className="bg-white rounded-[24px] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-fadeIn relative">
                
                {/* Header (Matching step 3 style but adapted for modal) */}
                <div className="flex items-center justify-between px-6 sm:px-10 pt-8 pb-4 bg-white relative z-20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm shrink-0">
                            <Building2 className="text-[var(--primary-brand)]" size={24} />
                        </div>
                        <div>
                            <h2 className="text-[20px] sm:text-[24px] font-bold text-[#1A1A1A] leading-tight">Add New Business</h2>
                            <p className="text-[13px] sm:text-[14px] text-zinc-500 font-medium">Business Profile Setup</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2.5 hover:bg-zinc-100 rounded-xl transition-all duration-200 text-zinc-400 hover:text-zinc-700 shrink-0 self-start"
                    >
                        <X size={22} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Content (Scrollable) */}
                <div className="flex-1 overflow-y-auto px-6 sm:px-10 pb-10 pt-2 custom-thin-scrollbar relative z-10">
                    
                    <div className="flex items-center justify-between mb-4 mt-2">
                        <h3 className="font-bold text-[#1A1A1A] text-[15px]">Business Structure</h3>
                        <button 
                            onClick={addBusiness} 
                            className="bg-[var(--primary-brand)] text-white px-3 py-1.5 rounded-lg text-[12px] font-bold flex items-center gap-1 hover:bg-cyan-300 cursor-pointer transition-all shadow-sm shadow-cyan-200"
                        >
                            <Plus size={14} /> Add Business
                        </button>
                    </div>

                    <div className="space-y-6 pb-6">
                        {businesses.map((biz, bIdx) => (
                            <div key={biz.id} className="relative border border-zinc-200 rounded-2xl p-4 sm:p-6 bg-zinc-50/30 transition-all duration-300" style={{ zIndex: 50 - bIdx }}>
                                {businesses.length > 1 && (
                                    <button 
                                        onClick={() => removeBusiness(bIdx)}
                                        className="absolute top-4 right-4 bg-white border border-zinc-200 p-2 rounded-full text-zinc-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm z-10"
                                        title="Remove Business"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}

                                <div className="mb-4 pb-4 border-b border-zinc-100">
                                    <h4 className="text-[13px] font-bold text-[#1A1A1A] mb-3">Business Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[11px] font-semibold text-zinc-500 mb-1 block">Business Name</label>
                                            <div className="relative">
                                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                                <input
                                                    type="text"
                                                    placeholder="XYZ Food Corner"
                                                    className="w-full h-10 bg-white border border-zinc-200 rounded-lg pl-9 pr-3 text-[13px] focus:border-[#0066FF] outline-none transition-colors"
                                                    value={biz.name}
                                                    onChange={(e) => {
                                                        const newBiz = [...businesses];
                                                        newBiz[bIdx].name = e.target.value;
                                                        setBusinesses(newBiz);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-semibold text-zinc-500 mb-1 block">Business Category</label>
                                            <div className="relative">
                                                <StylishDropdown
                                                    options={GOOGLE_BUSINESS_CATEGORIES}
                                                    value={biz.category}
                                                    onChange={(val) => {
                                                        const newBiz = [...businesses];
                                                        newBiz[bIdx].category = val as string;
                                                        setBusinesses(newBiz);
                                                    }}
                                                    placeholder="Select category"
                                                    selectedColor="var(--primary-brand)"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-[13px] font-bold text-[#1A1A1A]">Location</h4>
                                        <button 
                                            onClick={() => addLocation(bIdx)} 
                                            className="cursor-pointer text-[var(--primary-brand)] hover:text-cyan-600 text-[11px] font-bold flex items-center gap-1 hover:underline transition-colors"
                                        >
                                            <Plus size={12} /> Add Location
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="hidden sm:grid grid-cols-[1fr_1fr_24px] gap-4 px-2 mb-1">
                                            <label className="text-[11px] font-semibold text-zinc-500">Business Location URL</label>
                                            <label className="text-[11px] font-semibold text-zinc-500">Address / City</label>
                                        </div>
                                        {biz.locations.map((loc, lIdx) => (
                                            <div key={loc.id} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_24px] gap-3 sm:gap-4 items-center">
                                                <div className="relative">
                                                    <label className="text-[11px] font-semibold text-zinc-500 mb-1 block sm:hidden">Business Location URL</label>
                                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 sm:mt-0 mt-3" size={14} />
                                                    <input
                                                        type="text"
                                                        placeholder="Google Maps Business URL"
                                                        className="w-full h-10 bg-white border border-zinc-200 rounded-lg pl-9 pr-3 text-[13px] focus:border-[#0066FF] outline-none transition-colors"
                                                        value={loc.name}
                                                        onChange={(e) => {
                                                            const newBiz = [...businesses];
                                                            newBiz[bIdx].locations[lIdx].name = e.target.value;
                                                            setBusinesses(newBiz);
                                                        }}
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <label className="text-[11px] font-semibold text-zinc-500 mb-1 block sm:hidden">Address / City</label>
                                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 sm:mt-0 mt-3" size={14} />
                                                    <input
                                                        type="text"
                                                        placeholder="Address or City"
                                                        className="w-full h-10 bg-white border border-zinc-200 rounded-lg pl-9 pr-3 text-[13px] focus:border-[#0066FF] outline-none transition-colors"
                                                        value={loc.address}
                                                        onChange={(e) => {
                                                            const newBiz = [...businesses];
                                                            newBiz[bIdx].locations[lIdx].address = e.target.value;
                                                            setBusinesses(newBiz);
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex justify-end sm:block">
                                                    <button 
                                                        onClick={() => removeLocation(bIdx, lIdx)} 
                                                        className="cursor-pointer text-red-400 hover:text-red-600 transition-colors p-2 sm:p-0"
                                                        title="Remove Location"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 sm:px-10 py-5 border-t border-zinc-100 bg-white flex justify-end gap-4 relative z-20">
                    <button 
                        onClick={onClose} 
                        className="cursor-pointer px-6 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 font-bold hover:bg-zinc-50 transition-all text-[14px]"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={isLoading} 
                        className="cursor-pointer bg-[var(--primary-brand)] text-white px-8 py-2.5 rounded-xl font-bold hover:bg-cyan-300 transition-all shadow-lg shadow-cyan-200/50 text-[14px] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Business"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
