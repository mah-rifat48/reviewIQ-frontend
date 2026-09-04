"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { useTranslation } from "./TranslationProvider";

export default function LanguageTranslator() {
    const [isOpen, setIsOpen] = useState(false);
    const { language, setLanguage, isTranslating } = useTranslation();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (lang: "en" | "ar") => {
        if (lang === language) {
            setIsOpen(false);
            return;
        }
        setLanguage(lang);
        setIsOpen(false);
    };

    return (
        <div className="relative language-translator-dropdown" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isTranslating}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all text-gray-600 hover:text-gray-900 cursor-pointer focus:outline-none disabled:opacity-60 disabled:cursor-wait"
            >
                {isTranslating ? (
                    <Loader2 size={15} className="animate-spin text-blue-500" />
                ) : (
                    <span className="text-base leading-none">{language === "en" ? "🇺🇸" : "🇸🇦"}</span>
                )}
                <span className="text-sm font-semibold">{language === "en" ? "En" : "Ar"}</span>
                <ChevronDown
                    size={13}
                    strokeWidth={3}
                    className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {isOpen && !isTranslating && (
                <div className="absolute right-0 top-full mt-2 w-36 bg-white rounded-xl border border-zinc-100 shadow-xl py-1.5 z-[99999] animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                        onClick={() => handleSelect("en")}
                        className={`w-full px-4 py-2 text-left text-sm font-medium hover:bg-zinc-50 flex items-center gap-3 transition-colors ${language === "en" ? "text-blue-600 bg-blue-50/50" : "text-zinc-600"}`}
                    >
                        <span className="text-base">🇺🇸</span> English
                    </button>
                    <button
                        onClick={() => handleSelect("ar")}
                        className={`w-full px-4 py-2 text-left text-sm font-medium hover:bg-zinc-50 flex items-center gap-3 transition-colors ${language === "ar" ? "text-blue-600 bg-blue-50/50" : "text-zinc-600"}`}
                    >
                        <span className="text-base">🇸🇦</span> Arabic
                    </button>
                </div>
            )}
        </div>
    );
}
