"use client";

import Image from "next/image";

import { forwardRef } from "react";

const HeroSection = forwardRef<HTMLDivElement>((props, ref) => {
    return (
        <section id="home" ref={ref} className="relative min-h-screen flex items-center pt-20 overflow-hidden">
            {/* Full Width Background Image */}
            <div className="absolute inset-0 w-full h-full">
                <Image
                    src="/landing_img.svg"
                    alt="Hero Background"
                    fill
                    className="object-cover"
                    priority
                    unoptimized
                />
            </div>

            {/* Content Overlay */}
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Left Column - Text Content */}
                    <div className="hero-text">
                        <h1 className="text-[42px] lg:text-[48px] font-extrabold text-[#1A1A1A] leading-[1.15] mb-6 text-wrap">
                            Turn Customer Reviews into Business Growth
                        </h1>
                        <p className="text-[16px] text-zinc-600 mb-10 max-w-[480px] leading-[1.65]">
                            AI-powered insights from your Google reviews. Understand your customers, outperform competitors, and make data-driven improvements.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <a
                                href="#pricing"
                                onClick={(e) => {
                                    e.preventDefault();
                                    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="bg-[#0066FF] text-white px-8 py-3.5 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 text-[15px] cursor-pointer"
                            >
                                Start Free Trial
                            </a>
                            <a
                                href="#contact"
                                onClick={(e) => {
                                    e.preventDefault();
                                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="bg-white text-zinc-700 border-2 border-zinc-200 px-8 py-3.5 rounded-lg font-bold hover:bg-zinc-50 transition-all text-[15px] cursor-pointer"
                            >
                                Request Demo
                            </a>
                        </div>
                    </div>

                    {/* Right Column - Empty space for the background image to show through */}
                    <div className="hero-cards relative hidden lg:block h-[500px]">
                        {/* Background image shows the dashboard cards */}
                    </div>
                </div>
            </div>
        </section>
    );
});

HeroSection.displayName = "HeroSection";
export default HeroSection;
