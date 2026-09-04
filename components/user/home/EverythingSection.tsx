"use client";

import { CircleCheckBig } from "lucide-react";
import { forwardRef } from "react";

const EverythingSection = forwardRef<HTMLDivElement>((props, ref) => {
    return (
        <section id="everything" ref={ref} className="py-20 bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-6 text-center mb-16 reveal-up">
                <h2 className="text-[38px] font-extrabold text-[#111111]">Everything You Need</h2>
            </div>

            <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
                {[
                    { title: "Sentiment Analysis", desc: "Track positive, neutral, and negative sentiment trends" },
                    { title: "Theme Detection", desc: "Identify recurring issues and strengths automatically" },
                    { title: "Multi-Location Support", desc: "Manage and compare multiple business locations" },
                    { title: "Response Rate Tracking", desc: "Monitor which reviews have been replied to" },
                    { title: "Custom Alerts", desc: "Get notified of rating drops or negative review spikes" },
                    { title: "Export Reports", desc: "Download PDF and Excel reports anytime" }
                ].map((feature, idx) => (
                    <div key={idx} className="gsap-everything-item flex gap-4 items-center px-2 sm:px-6 lg:px-0 reveal-up">
                        <div className="mt-1 flex-shrink-0 w-6 h-6 flex items-center justify-center">
                            <CircleCheckBig size={24} className="text-[#10B981]" strokeWidth={3} />
                        </div>
                        <div className="text-left">
                            <h4 className="text-[16px] font-bold mb-1 text-zinc-900">{feature.title}</h4>
                            <p className="text-zinc-500 text-[14px]">{feature.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
});

EverythingSection.displayName = "EverythingSection";
export default EverythingSection;
