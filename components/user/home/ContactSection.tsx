"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useGetSystemSettingsQuery, useContactUsMutation } from "@/redux/api/BE/landingApi";
import toast from "react-hot-toast";

export default function ContactSection() {
    const { data: settingsData, isLoading } = useGetSystemSettingsQuery();
    const [contactUs, { isLoading: isSending }] = useContactUsMutation();
    const settings = settingsData?.data;

    // Form states
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await contactUs({ name, email, subject, description }).unwrap();
            toast.success("Inquiry sent successfully.");
            setName("");
            setEmail("");
            setSubject("");
            setDescription("");
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to send inquiry.");
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16 reveal-up">
                <h2 className="text-[44px] font-extrabold text-[#111111] mb-6">
                    Get In Touch
                </h2>
                <p className="text-zinc-500 max-w-2xl mx-auto text-[17px] leading-relaxed">
                    Have questions or need help getting started? Our team is here to assist you.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
                {/* Left Column: Contact Info Cards */}
                <div className="flex flex-col gap-6 h-full">
                    {/* Email Card */}
                    <div className="flex-1 bg-white p-8 rounded-2xl border border-zinc-200 hover:border-[#0066FF] transition-all reveal-up group flex flex-col justify-center">
                        <div className="w-12 h-12 bg-[#0066FF] rounded-xl flex items-center justify-center mb-5 shadow-md shadow-blue-100 group-hover:scale-110 transition-transform">
                            <Mail size={24} className="text-white" />
                        </div>
                        <h3 className="text-[18px] font-bold text-zinc-900 mb-1">Email Us</h3>
                        {isLoading ? (
                            <div className="h-5 w-48 bg-zinc-100 animate-pulse rounded" />
                        ) : (
                            <p className="text-zinc-500 text-[15px]">{settings?.supportEmail || "support@aimalya.com"}</p>
                        )}
                    </div>

                    {/* Phone Card */}
                    <div className="flex-1 bg-white p-8 rounded-2xl border border-zinc-200 hover:border-[#0066FF] transition-all reveal-up group flex flex-col justify-center">
                        <div className="w-12 h-12 bg-[#bfdbfe] rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                            <Phone size={24} className="text-[#1e3a8a]" />
                        </div>
                        <h3 className="text-[18px] font-bold text-zinc-900 mb-1">Call Us</h3>
                        {isLoading ? (
                            <div className="h-5 w-40 bg-zinc-100 animate-pulse rounded" />
                        ) : (
                            <p className="text-zinc-500 text-[15px]">{settings?.supportPhone || "+1234567890"}</p>
                        )}
                    </div>

                    {/* Office Card */}
                    <div className="flex-1 bg-white p-8 rounded-2xl border border-zinc-200 hover:border-[#0066FF] transition-all reveal-up group flex flex-col justify-center">
                        <div className="w-12 h-12 bg-[#bfdbfe] rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                            <MapPin size={24} className="text-[#1e3a8a]" />
                        </div>
                        <h3 className="text-[18px] font-bold text-zinc-900 mb-1">Office</h3>
                        {isLoading ? (
                            <div className="h-5 w-56 bg-zinc-100 animate-pulse rounded" />
                        ) : (
                            <p className="text-zinc-500 text-[15px]">{settings?.location || "Tech Hub, Silicon Valley"}</p>
                        )}
                    </div>
                </div>

                {/* Right Column: Contact Form */}
                <div className="bg-white p-8 lg:p-10 rounded-2xl border border-zinc-200 reveal-up">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-[15px] font-bold text-zinc-700 mb-2">
                                Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                required
                                disabled={isSending}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your full name"
                                className="w-full px-5 py-3.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-[#0066FF] focus:ring-4 focus:ring-blue-50 transition-all text-zinc-600 placeholder:text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-[15px] font-bold text-zinc-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                required
                                disabled={isSending}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="w-full px-5 py-3.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-[#0066FF] focus:ring-4 focus:ring-blue-50 transition-all text-zinc-600 placeholder:text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label htmlFor="subject" className="block text-[15px] font-bold text-zinc-700 mb-2">
                                Subject
                            </label>
                            <input
                                type="text"
                                id="subject"
                                required
                                disabled={isSending}
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="What is this regarding?"
                                className="w-full px-5 py-3.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-[#0066FF] focus:ring-4 focus:ring-blue-50 transition-all text-zinc-600 placeholder:text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label htmlFor="message" className="block text-[15px] font-bold text-zinc-700 mb-2">
                                Message
                            </label>
                            <textarea
                                id="message"
                                required
                                disabled={isSending}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={5}
                                placeholder="Tell us how we can help you..."
                                className="w-full px-5 py-3.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-[#0066FF] focus:ring-4 focus:ring-blue-50 transition-all text-zinc-600 placeholder:text-zinc-400 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={isSending}
                            className="w-full cursor-pointer bg-[#0066FF] text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            {isSending ? (
                                <span className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    Send Message
                                    <Send size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
