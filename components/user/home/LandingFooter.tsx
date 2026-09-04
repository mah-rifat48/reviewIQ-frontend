"use client";

import { Mail, Phone, MapPin, Twitter, Github, Linkedin, Instagram } from "lucide-react";
import Image from "next/image";

export default function LandingFooter() {
    return (
        <footer className="bg-[#050510] text-white pt-24 pb-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between gap-16 mb-20">
                    <div className="max-w-sm">
                        <div className="flex items-center gap-2 mb-8">
                            <div className="rounded-lg flex items-center justify-center shadow-lg shadow-black">
                                <Image src="/short-logo.svg" alt="Logo" width={50} height={50} />
                            </div>
                            <span className="text-[22px] font-bold tracking-tight">ReviewIQ</span>
                        </div>
                        <p className="text-gray-400 text-[15px] mb-10 leading-relaxed">
                            The complete platform for analyzing reviews and customer feedback. Simple, fast, and helpful.
                        </p>
                        <div className="flex gap-4">
                            {[Twitter, Github, Linkedin, Instagram].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center hover:bg-[#0066FF] transition-all"><Icon size={18} /></a>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-20">
                        <div>
                            <h5 className="font-extrabold text-[17px] mb-8">Quick Links</h5>
                            <ul className="space-y-4 text-gray-400 text-[15px]">
                                <li><a href="#about" className="text-gray-400 hover:text-blue-500 transition-colors">About Us</a></li>
                                <li><a href="#pricing" className="text-gray-400 hover:text-blue-500 transition-colors">Pricing</a></li>
                                <li><a href="#contact" className="text-gray-400 hover:text-blue-500 transition-colors">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-extrabold text-[17px] mb-8">Contact</h5>
                            <ul className="space-y-4 text-gray-400 text-[15px]">
                                <li className="flex gap-3 text-gray-400"><MapPin size={18} className=" flex-shrink-0" /> Dubai, UAE</li>
                                <li className="flex gap-3 text-gray-400"><Phone size={18} className=" flex-shrink-0" /> +44 1234 567 890</li>
                                <li className="flex gap-3 text-gray-400"><Mail size={18} className=" flex-shrink-0" /> info@company.com</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="pt-10 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-6 text-gray-400 text-[12px] font-bold">
                    <p>&copy; 2026 ReviewIQ. All rights reserved.</p>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-gray-400">Terms</a>
                        <a href="#" className="hover:text-gray-400">Privacy Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
