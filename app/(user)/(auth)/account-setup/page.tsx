"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    Building2,
    MapPin,
    Trash2,
    Plus,
    CheckCircle2,
    Loader2,
    TrendingUp,
    Globe,
    Target,
    User,
    Pencil,
    Settings2,
    SettingsIcon
} from "lucide-react";
import StylishDropdown from "@/components/ui/StylishDropdown";
import { useFetchBusinessDataMutation, useSetGoalsMutation } from "@/redux/api/AI/signupflowApi";
import { getUserIdFromToken, getSubscriptionFromCookie } from "@/utils/authUtils";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setSelectedBusiness } from "@/redux/slices/businessSlice";
import Cookies from "js-cookie";
import { GOOGLE_BUSINESS_CATEGORIES } from "@/constants/businessCategories";


interface Location {
    id: string;
    name: string;
    address: string;
}

interface Business {
    id: string;
    name: string;
    category: string;
    locations: Location[];
}


const Stepper = ({ currentStep }: { currentStep: number }) => {
    const steps = [
        { id: 1, label: "Welcome" },
        { id: 2, label: "Connect" },
        { id: 3, label: "Structure" },
        { id: 4, label: "Goal" },
        { id: 5, label: "Sync" },
    ];

    return (
        <div className="flex items-center justify-center gap-2 mb-10 w-full max-w-2xl mx-auto px-4">
            {steps.map((step, idx) => (
                <div key={step.id} className="flex items-center">
                    <div className={`flex items-center gap-2 ${step.id <= currentStep ? "text-auth-subtitle-color" : "text-zinc-300"}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${step.id <= currentStep ? "bg-auth-subtitle-color text-white border-auth-subtitle-color" : "bg-zinc-100 text-zinc-400 border-zinc-200"}`}>
                            {step.id}
                        </div>
                        <span className="text-[12px] text-black font-medium hidden sm:block">{step.label}</span>
                    </div>
                    {idx < steps.length - 1 && (
                        <div className={`w-8 h-[1px] mx-2 sm:mx-4 ${step.id < currentStep ? "bg-auth-subtitle-color" : "bg-black"}`} />
                    )}
                </div>
            ))}
        </div>
    );
};

const StepWelcome = ({ onNext }: { onNext: () => void }) => (
    <div className="text-center py-10">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm">
            <TrendingUp className="text-auth-subtitle-color" size={32} />
        </div>
        <h2 className="text-[28px] font-bold text-[#1A1A1A] mb-3">Welcome to ReviewIQ, Jane Cooper!</h2>
        <p className="text-zinc-500 max-w-md mx-auto mb-10 text-[15px] leading-relaxed">
            We'll analyze your Google reviews and turn them into actionable insights.
            This setup will only take a few minutes.
        </p>
        <button
            onClick={onNext}
            className="bg-auth-subtitle-color hover:bg-cyan-300 text-white px-10 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-200 cursor-pointer"
        >
            Connect Your Business
        </button>
    </div>
);

const StepConnect = ({ onNext, onBack }: { onNext: () => void, onBack: () => void }) => (
    <div className="py-6">
        <div className="text-center mb-10">
            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Image src="/step2.png" alt="Google" width={24} height={24} />
            </div>
            <h2 className="text-[24px] font-bold text-[#1A1A1A]">Connect Your Google Business</h2>
        </div>

        <div className="flex flex-col gap-4 max-w-md mx-auto mb-12">
            <button
                onClick={onNext}
                className="cursor-pointer w-full bg-white border border-zinc-100 hover:border-auth-subtitle-color hover:bg-blue-50/30 p-6 rounded-2xl flex flex-col items-center gap-2 transition-all group"
            >
                <span className="font-bold text-[#1A1A1A] group-hover:text-auth-subtitle-color">Manual Entry</span>
                <span className="text-[13px] text-zinc-400">Paste Google Maps link</span>
            </button>

            {/* <button
                className="cursor-pointer w-full bg-white border border-zinc-100 p-6 rounded-2xl flex flex-col items-center gap-3 transition-all relative overflow-hidden"
            >
                <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z" fill="#4285F4" />
                        <path d="M12.24 24.0008C15.4765 24.0008 18.2059 22.9382 20.1945 21.1039L16.3275 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.24 24.0008Z" fill="#34A853" />
                        <path d="M5.50253 14.3003C5.00236 12.8099 5.00236 11.1961 5.50253 9.70575V6.61481H1.51649C-0.18551 10.0056 -0.18551 14.0004 1.51649 17.3912L5.50253 14.3003Z" fill="#FBBC05" />
                        <path d="M12.24 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.0344664 12.24 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61049L5.50264 9.70143C6.45505 6.86181 9.10947 4.74966 12.24 4.74966Z" fill="#EA4335" />
                    </svg>
                    <span className="font-bold text-[#1A1A1A]">Connect with Google</span>
                </div>
                <span className="text-[12px] text-zinc-400">Click below to authenticate with your Google Business Profile account</span>
            </button> */}
        </div>

        <div className="flex justify-start">
            <button onClick={onBack} className="cursor-pointer px-8 py-3 rounded-xl border border-zinc-200 text-zinc-600 font-bold hover:bg-zinc-50 transition-all text-[14px]">
                Back
            </button>
        </div>
    </div>
);

const StepStructure = ({ businesses, setBusinesses, onNext, onBack, isLoading }: { businesses: Business[], setBusinesses: React.Dispatch<React.SetStateAction<Business[]>>, onNext: () => void, onBack: () => void, isLoading: boolean }) => {
    const addBusiness = () => {
        const subscriptionToken = getSubscriptionFromCookie();
        const limit = Number(subscriptionToken?.business || 1);

        if (businesses.length >= limit) {
            toast.error(`You have reached your limit of ${limit} business(es). Upgrade to add more.`);
            return;
        }

        setBusinesses([...businesses, { id: Date.now().toString(), name: '', category: '', locations: [{ id: Date.now().toString() + 'l', name: '', address: '' }] }]);
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
        newBusinesses[bizIndex].locations.splice(locIndex, 1);
        setBusinesses(newBusinesses);
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

    return (
        <div>
            <div className="text-center mb-8">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <Image src="/step3.svg" alt="Google" width={24} height={24} />
                </div>
                <h2 className="text-[24px] font-bold text-[#1A1A1A]">Business Profile Setup</h2>
            </div>

            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-[#1A1A1A]">Business Structure</h3>
                <button onClick={addBusiness} className="bg-auth-subtitle-color text-white px-3 py-1.5 rounded-lg text-[12px] font-bold flex items-center gap-1 hover:bg-cyan-300 cursor-pointer">
                    <Plus size={14} /> Add Business
                </button>
            </div>

            <div className="space-y-6 mb-10 max-h-[320px] overflow-y-auto pr-2 scrollbar-hide">
                {businesses.map((biz, bIdx) => (
                    <div key={biz.id} className="relative border border-zinc-200 rounded-2xl p-6 bg-white/50" style={{ zIndex: 50 - bIdx }}>
                        {businesses.length > 1 && (
                            <button 
                                onClick={() => removeBusiness(bIdx)}
                                className="cursor-pointer absolute top-2 right-2 bg-white border border-zinc-200 p-2 rounded-full text-zinc-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm z-10"
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
                                            className="w-full h-10 bg-white border border-zinc-200 rounded-lg pl-9 pr-3 text-[13px] focus:border-[#0066FF] outline-none"
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
                                <button onClick={() => addLocation(bIdx)} className="cursor-pointer text-auth-subtitle-color hover:text-cyan-600 text-[11px] font-bold flex items-center gap-1 hover:underline">
                                    <Plus size={12} /> Add Location
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div className="grid grid-cols-[1fr_1fr_24px] gap-4 px-2 mb-1">
                                    <label className="text-[11px] font-semibold text-zinc-500">Business Location</label>
                                    <label className="text-[11px] font-semibold text-zinc-500">Address / City</label>
                                </div>
                                {biz.locations.map((loc, lIdx) => (
                                    <div key={loc.id} className="grid grid-cols-[1fr_1fr_24px] gap-4 items-center">
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                                            <input
                                                type="text"
                                                placeholder="Google Maps Business URL"
                                                className="w-full h-10 bg-white border border-zinc-200 rounded-lg pl-9 pr-3 text-[13px] focus:border-[#0066FF] outline-none"
                                                value={loc.name}
                                                onChange={(e) => {
                                                    const newBiz = [...businesses];
                                                    newBiz[bIdx].locations[lIdx].name = e.target.value;
                                                    setBusinesses(newBiz);
                                                }}
                                            />
                                        </div>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                                            <input
                                                type="text"
                                                placeholder="Address or City"
                                                className="w-full h-10 bg-white border border-zinc-200 rounded-lg pl-9 pr-3 text-[13px] focus:border-[#0066FF] outline-none"
                                                value={loc.address}
                                                onChange={(e) => {
                                                    const newBiz = [...businesses];
                                                    newBiz[bIdx].locations[lIdx].address = e.target.value;
                                                    setBusinesses(newBiz);
                                                }}
                                            />
                                        </div>
                                        <button onClick={() => removeLocation(bIdx, lIdx)} className="cursor-pointer text-red-400 hover:text-red-600 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between mt-8">
                <button onClick={onBack} className="cursor-pointer px-8 py-3 rounded-xl border border-zinc-200 text-zinc-600 font-bold hover:bg-zinc-50 transition-all text-[14px]">
                    Back
                </button>
                <button onClick={onNext} disabled={isLoading} className="cursor-pointer bg-auth-subtitle-color text-white px-10 py-3 rounded-xl font-bold hover:bg-cyan-300 transition-all shadow-lg shadow-blue-200 text-[14px] disabled:opacity-50">
                    <span>{isLoading ? "Saving..." : "Continue"}</span>
                </button>
            </div>
        </div>
    );
};

const StepGoal = ({
    goals,
    setGoals,
    businesses,
    onNext,
    onBack,
    savedGoals,
    setSavedGoals,
    isLoading
}: {
    goals: any,
    setGoals: (g: any) => void,
    businesses: Business[],
    onNext: () => void,
    onBack: () => void,
    savedGoals: any[],
    setSavedGoals: (g: any[]) => void,
    isLoading: boolean
}) => {
    const handleSave = () => {
        if (!goals.businessName || !goals.location) return;
        setSavedGoals([...savedGoals, { ...goals, id: Date.now().toString() }]);
        setGoals({
            businessName: '',
            location: '',
            competitors: '',
            frequency: 'Monthly',
            selectedGoals: []
        });
    };

    const handleEdit = (id: string) => {
        const goalToEdit = savedGoals.find(g => g.id === id);
        if (goalToEdit) {
            setGoals({
                businessName: goalToEdit.businessName,
                location: goalToEdit.location,
                competitors: goalToEdit.competitors,
                frequency: goalToEdit.frequency,
                selectedGoals: goalToEdit.selectedGoals
            });
            setSavedGoals(savedGoals.filter(g => g.id !== id));
        }
    };

    const handleDelete = (id: string) => {
        setSavedGoals(savedGoals.filter(g => g.id !== id));
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1 w-full">
                {/* header */}
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="text-auth-subtitle-color" size={24} />
                    </div>
                    <h2 className="text-[24px] font-bold text-[#1A1A1A]">Business Profile Setup</h2>
                </div>

                <div className="space-y-6">
                    <h3 className="font-bold text-[#1A1A1A] border-b border-zinc-100 pb-2">Goals & Preferences</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-[13px] font-bold text-zinc-700 mb-2 block">Business Name</label>
                            <StylishDropdown
                                options={businesses
                                    .filter(b => {
                                        if (b.name.trim() === '') return false;
                                        // Allow selecting business if it has locations not yet saved
                                        const savedLocationsForBiz = savedGoals.filter(sg => sg.businessName === b.name).map(sg => sg.location);
                                        return b.locations.some(l => !savedLocationsForBiz.includes(l.address));
                                    })
                                    .map(b => ({ label: b.name, value: b.name }))}
                                value={goals.businessName}
                                onChange={(val) => setGoals({ ...goals, businessName: val as string, location: '' })}
                                placeholder="Select business"
                                selectedColor="var(--primary-brand)"
                                selectedBgColor="#ecf9fbff"
                                icon={<Building2 size={18} className="text-auth-subtitle-color" />}
                            />
                        </div>

                        <div>
                            <label className="text-[13px] font-bold text-zinc-700 mb-2 block">Location</label>
                            <StylishDropdown
                                options={businesses
                                    .find(b => b.name === goals.businessName)
                                    ?.locations
                                    .filter(l => !savedGoals.some(sg => sg.businessName === goals.businessName && sg.location === l.address))
                                    .map(l => ({ label: l.address, value: l.address })) || []}
                                value={goals.location}
                                onChange={(val) => setGoals({ ...goals, location: val as string })}
                                placeholder="Select location"
                                selectedColor="var(--primary-brand)"
                                selectedBgColor="#ecf9fbff"
                                icon={<MapPin size={18} className="text-auth-subtitle-color" />}
                                disabled={!goals.businessName}
                            />
                        </div>


                        <div>
                            <label className="text-[13px] font-bold text-zinc-700 mb-2 block">Competitors Google Maps URLs (Optional)</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Enter competitor Google Maps URLs, separated by commas"
                                    className="w-full h-12 bg-white border border-zinc-200 focus:bg-white focus:border-auth-subtitle-color rounded-xl pl-12 pr-4 text-[14px] outline-none transition-all placeholder:text-zinc-400"
                                    value={goals.competitors}
                                    onChange={(e) => setGoals({ ...goals, competitors: e.target.value })}
                                />
                            </div>
                            <p className="text-[11px] text-zinc-400 mt-1 pl-1">You can add more later</p>
                        </div>

                        {/* <div>
                            <label className="text-[13px] font-bold text-zinc-700 mb-2 block">Report Frequency</label>
                            <StylishDropdown
                                options={[
                                    { label: "Monthly", value: "Monthly" },
                                    { label: "Weekly", value: "Weekly" },
                                ]}
                                value={goals.frequency}
                                onChange={(val) => setGoals({ ...goals, frequency: val as string })}
                                placeholder="Select frequency"
                                icon={<TrendingUp size={18} />}
                            />
                        </div> */}

                        <div>
                            <label className="text-[13px] font-bold text-zinc-700 mb-2 block">Your Goals (Select all that apply)</label>
                            <StylishDropdown
                                multiSelect
                                options={[
                                    { label: "Improve customer satisfaction", value: "improve_customer_satisfaction" },
                                    { label: "Improve service speed", value: "improve_service_speed" },
                                    { label: "Increase ratings", value: "increase_ratings" },
                                    { label: "Increase sales", value: "increase_sales" },
                                    { label: "Improve brand awareness", value: "improve_brand_awareness" },
                                    { label: "Expand customer base", value: "expand_customer_base" },
                                    { label: "Improve customer retention", value: "improve_customer_retention" },
                                    { label: "Better customer engagement", value: "better_customer_engagement" }
                                ]}
                                value={goals.selectedGoals}
                                onChange={(val) => setGoals({ ...goals, selectedGoals: val as string[] })}
                                placeholder="Select goals"
                                selectedColor="var(--primary-brand)"
                                selectedBgColor="#ecf9fbff"
                                icon={<Target size={18} className="text-cyan-400" />}
                                position="top"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end mt-4">
                        <button
                            onClick={handleSave}
                            disabled={!goals.businessName || !goals.location}
                            className="bg-auth-subtitle-color text-white px-8 py-2.5 rounded-xl font-bold hover:bg-cyan-300 transition-all shadow-md shadow-blue-100 text-[14px] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus size={18} /> Save Goal
                        </button>
                    </div>
                </div>

                <div className="flex justify-between mt-12 pt-6 border-t border-zinc-100">
                    <button onClick={onBack} className="px-8 py-3 rounded-xl border border-zinc-200 text-zinc-600 font-bold hover:bg-zinc-50 transition-all text-[14px] cursor-pointer">
                        Back
                    </button>
                    <button
                        onClick={onNext}
                        disabled={isLoading}
                        className="bg-auth-subtitle-color text-white px-10 py-3 rounded-xl font-bold hover:bg-cyan-300 transition-all shadow-lg shadow-blue-200 text-[14px] cursor-pointer disabled:opacity-50"
                    >
                        <span>{isLoading ? "Starting Analysis..." : "Start Analysis"}</span>
                    </button>
                </div>
            </div>

            {/* Saved Goals Side Panel */}
            {savedGoals.length > 0 && (
                <div className="w-full lg:w-[320px] lg:sticky lg:top-0 space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                        <h3 className="font-bold text-zinc-700">Saved Goals</h3>
                        <span className="bg-blue-50 text-auth-subtitle-color text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {savedGoals.length}
                        </span>
                    </div>
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {savedGoals.map((goal) => (
                            <div key={goal.id} className="bg-white border border-zinc-100 rounded-xl p-4 shadow-sm flex flex-col gap-3 group transition-all hover:border-auth-subtitle-color/30">
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col overflow-hidden">
                                        <div className="flex items-center gap-2">
                                            <Building2 size={14} className="text-auth-subtitle-color shrink-0" />
                                            <span className="font-bold text-[14px] text-gray-700 truncate">{goal.businessName}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <MapPin size={12} className="text-zinc-400 shrink-0" />
                                            <span className="text-[11px] text-zinc-500 truncate">{goal.location}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 shrink-0">
                                        <button
                                            onClick={() => handleEdit(goal.id)}
                                            className="p-1.5 text-zinc-400 hover:text-auth-subtitle-color hover:bg-blue-50 rounded-lg transition-all"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(goal.id)}
                                            className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                    <div className="flex items-center gap-1 bg-blue-50 text-auth-subtitle-color px-2 py-0.5 rounded-full text-[10px] font-medium">
                                        <TrendingUp size={10} /> {goal.frequency}
                                    </div>
                                    {goal.selectedGoals.map((g: string, i: number) => (
                                        <div key={i} className="flex items-center gap-1 bg-zinc-50 text-zinc-600 px-2 py-0.5 rounded-full text-[10px] font-medium">
                                            <Target size={10} /> {g}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const StepSync = ({ router, isLoading }: { router: any, isLoading: boolean }) => {
    useEffect(() => {
        if (!isLoading) {
            const timer = setTimeout(() => {
                router.push('/dashboard');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [router, isLoading]);

    return (
        <div className="text-center py-10">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-8 animate-pulse">
                <Loader2 className="text-auth-subtitle-color animate-spin" size={32} />
            </div>
            <h2 className="text-[24px] font-bold text-[#1A1A1A] mb-4">Setting Up Your Dashboard</h2>
            <p className="text-zinc-500 text-[14px] mb-8">We're fetching your reviews and analyzing the data. This may take a minute.</p>

            <div className="max-w-xs mx-auto space-y-3">
                <div className="h-1.5 w-full bg-blue-100 rounded-full overflow-hidden mb-6">
                    <div className="h-full bg-auth-subtitle-color rounded-full w-2/3 animate-pulse" />
                </div>

                <div className="flex items-center gap-2 text-[13px] text-zinc-500">
                    <CheckCircle2 size={16} className="text-auth-subtitle-color" /> Fetching reviews
                </div>
                <div className="flex items-center gap-2 text-[13px] text-zinc-500">
                    <CheckCircle2 size={16} className="text-auth-subtitle-color" /> Analyzing sentiment
                </div>
                <div className="flex items-center gap-2 text-[13px] text-zinc-500">
                    <CheckCircle2 size={16} className="text-auth-subtitle-color" /> Detecting themes
                </div>
                <div className="flex items-center gap-2 text-[13px] text-zinc-500">
                    <span className="w-4 h-4 rounded-full border-2 border-zinc-200 border-t-auth-subtitle-color animate-spin" /> Generating insights
                </div>
            </div>
        </div>
    );
};


export default function AccountSetupPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [businesses, setBusinesses] = useState<Business[]>([
        { id: '1', name: '', category: '', locations: [{ id: 'l1', name: '', address: '' }] }
    ]);
    const [goals, setGoals] = useState({
        businessName: '',
        location: '',
        competitors: '',
        frequency: 'Monthly',
        selectedGoals: [] as string[]
    });
    const [savedGoals, setSavedGoals] = useState<any[]>([]);
    const dispatch = useDispatch();

    // Save Google OAuth tokens if present in URL
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const accessToken = params.get('accessToken');
            const refreshToken = params.get('refreshToken');
            const userStr = params.get('user');
            const subscription = params.get('subscription');

            let updated = false;

            if (accessToken) {
                Cookies.set('accessToken', accessToken, { expires: 7, path: '/' });
                updated = true;
            }
            if (refreshToken) {
                Cookies.set('refreshToken', refreshToken, { expires: 30, path: '/' });
                updated = true;
            }
            if (userStr) {
                Cookies.set('user', userStr, { expires: 7, path: '/' });
                updated = true;
            }
            if (subscription) {
                try {
                    const encodedSub = btoa(subscription);
                    Cookies.set('subscription', encodedSub, { expires: 7, path: '/' });
                } catch (e) {
                    Cookies.set('subscription', subscription, { expires: 7, path: '/' });
                }
                updated = true;
            }

            if (updated) {
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }
    }, []);

    // Mutations
    const [fetchBusinessData, { isLoading: isFetchingBusiness }] = useFetchBusinessDataMutation();
    const [setGoalsApi, { isLoading: isSettingGoals }] = useSetGoalsMutation();

    const handleStep3Next = async () => {
        const userId = getUserIdFromToken();
        if (!userId) {
            alert("Session expired. Please login again.");
            router.push("/login");
            return;
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
            setStep(4);
        } catch (err: any) {
            console.error("Error fetching business data:", err);
            const errorMessage = err?.data?.detail?.[0]?.msg || err?.data?.message || err?.message || "Failed to save business data. Please try again.";
            alert(errorMessage);
        }
    };

    const handleStep4Next = async () => {
        if (savedGoals.length === 0) {
            alert("Please save at least one goal.");
            return;
        }

        const userId = getUserIdFromToken();
        if (!userId) return;

        setStep(5);

        try {
            // Goal mapping fallback to ensure snake_case
            const goalMapping: { [key: string]: string } = {
                "Improve customer satisfaction": "improve_customer_satisfaction",
                "Increase review volume": "increase_ratings",
                "Monitor competitors": "monitor_competitors",
                "Improve service speed": "improve_service_speed",
                "Increase ratings": "increase_ratings"
            };

            const businessesPayload = savedGoals.map(goal => ({
                business_name: goal.businessName,
                location: goal.location,
                competitors_urls: goal.competitors.split(',')
                    .map((c: string) => c.trim())
                    .filter((c: string) => c !== "")
                    .map((c: string) => c.replace(/^https?:\/\//, '')), // Strip http:// and https://
                goals: goal.selectedGoals.map((g: string) => goalMapping[g] || g)
            }));

            const payload = {
                businesses: businessesPayload,
                user_id: userId
            };

            console.log("Sending bulk goals payload:", JSON.stringify(payload, null, 2));
            await setGoalsApi(payload).unwrap();

            // Auto select the first set up business for the dashboard
            if (savedGoals.length > 0) {
                dispatch(setSelectedBusiness(savedGoals[0].businessName));
            }

            router.push("/dashboard");
        } catch (err: any) {
            console.error("Error setting goals:", err);
            const detail = err?.data?.detail;
            const errorMessage = typeof detail === 'string'
                ? detail
                : detail?.[0]?.msg || err?.data?.message || err?.message || "Failed to save goals. Please try again.";
            alert(errorMessage);
            setStep(4);
        }
    };

    return (
        <div className="min-h-screen w-full relative content-center flex items-center justify-center overflow-hidden bg-[#E0F2FE]">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/auth-bg.png"
                    alt="Background"
                    fill
                    className="object-cover"
                    priority
                    quality={100}
                />
            </div>

            {/* Brand Logo */}
            <div className="hidden md:flex absolute top-8 left-8 z-10 items-center gap-2">
                <Image src="/auth_icon.svg" alt="Logo" width={207} height={60} />
            </div>

            {/* Content Container */}
            <div className={`relative z-10 w-full user-auth-bg rounded-3xl border border-white/60 p-6 sm:p-10 md:p-12 ${step === 4 ? "max-w-5xl" : "max-w-4xl"} flex flex-col items-center transition-all duration-500`}>
                <Stepper currentStep={step} />

                <div className="w-[calc(100%-2rem)] sm:w-full min-h-[500px] flex flex-col justify-center">
                    {step === 1 && <StepWelcome onNext={() => setStep(2)} />}
                    {step === 2 && <StepConnect onNext={() => setStep(3)} onBack={() => setStep(1)} />}
                    {step === 3 && (
                        <StepStructure
                            businesses={businesses}
                            setBusinesses={setBusinesses}
                            onNext={handleStep3Next}
                            onBack={() => setStep(2)}
                            isLoading={isFetchingBusiness}
                        />
                    )}
                    {step === 4 && (
                        <StepGoal
                            goals={goals}
                            setGoals={setGoals}
                            businesses={businesses}
                            onNext={handleStep4Next}
                            onBack={() => setStep(3)}
                            savedGoals={savedGoals}
                            setSavedGoals={setSavedGoals}
                            isLoading={isSettingGoals}
                        />
                    )}
                    {step === 5 && <StepSync router={router} isLoading={isSettingGoals} />}
                </div>
            </div>
        </div>
    );
}