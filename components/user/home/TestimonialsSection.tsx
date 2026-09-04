"use client";

import { Quote, Star } from "lucide-react";
import { forwardRef } from "react";

const TestimonialsSection = forwardRef<HTMLDivElement>((props, ref) => {
    return (
        <section id="testimonials" ref={ref} className="py-28 bg-white">
            <div className="max-w-7xl mx-auto px-6 text-center mb-20 reveal-up">
                <h2 className="text-[44px] font-extrabold text-[#111111] mb-6">Testimonials</h2>
                <p className="text-zinc-500 max-w-3xl mx-auto text-[17px] leading-relaxed">
                    See how businesses use our platform to turn customer feedback into smarter decisions.<br />
                    Real results from real teams who value data-driven growth.
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {[
                    { name: "John Doe", role: "Operations Manager", company: "Retail Brand", content: "This platform helped us quickly spot customer issues and improve our ratings within weeks." },
                    { name: "Sarah Smith", role: "Marketing Lead", company: "Hospitality Company", content: "The AI insights saved us hours of manual review work and gave us clear action steps." },
                    { name: "Mike Johnson", role: "Founder", company: "Multi-Location Business", content: "Easy to use, powerful reports, and incredibly helpful for tracking sentiment across locations." }
                ].map((t, idx) => (
                    <div key={idx} className="gsap-testimonial-card relative bg-white pt-14 pb-10 px-10 rounded-[30px] border border-zinc-100 shadow-sm hover:shadow-xl transition-all duration-500 reveal-up group">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-[#0066FF] rounded-full flex items-center justify-center text-white shadow-xl shadow-blue-200">
                            <Quote size={24} fill="white" />
                        </div>
                        <div className="flex gap-1 mb-3 justify-start">
                            {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="#FACC15" className="text-[#FACC15]" />)}
                        </div>
                        <p className="text-zinc-600 text-[16px] leading-[1.6] mb-5 min-h-[80px]">
                            {t.content}
                        </p>
                        <div className="pt-3 border-t-2 border-blue-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-zinc-100 rounded-full overflow-hidden">
                                <div className="w-full h-full bg-[#E5E5E5] flex items-center justify-center text-zinc-400 font-bold">
                                    {t.name[0]}
                                </div>
                            </div>
                            <div>
                                <h5 className="font-extrabold text-[15px]">{t.name}</h5>
                                <p className="text-zinc-400 text-[12px]">{t.role}</p>
                                <p className="text-zinc-400 text-[12px]">{t.company}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
});

TestimonialsSection.displayName = "TestimonialsSection";
export default TestimonialsSection;
