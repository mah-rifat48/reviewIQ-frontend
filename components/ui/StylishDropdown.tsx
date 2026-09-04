"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface DropdownOption {
    label: string;
    value: string;
    icon?: React.ReactNode;
}

interface StylishDropdownProps {
    options: DropdownOption[];
    value: string | string[];
    onChange: (value: string | string[]) => void;
    placeholder?: string;
    icon?: React.ReactNode;
    className?: string;
    multiSelect?: boolean;
    selectedColor?: string; // Color for selected text and checkbox
    selectedBgColor?: string; // Background color for selected items
    disabled?: boolean;
    footer?: React.ReactNode;
    position?: "top" | "bottom";
}

const StylishDropdown = ({
    options,
    value,
    onChange,
    placeholder = "Select option",
    icon,
    className,
    multiSelect = false,
    selectedColor = "#0066FF",
    selectedBgColor = "rgb(239 246 255)",
    disabled = false,
    footer,
    position = "bottom"
}: StylishDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const updatePosition = () => {
        if (dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            if (position === "top") {
                setDropdownStyle({
                    position: "fixed",
                    bottom: window.innerHeight - rect.top + 8,
                    left: rect.left,
                    width: rect.width,
                    zIndex: 99999
                });
            } else {
                setDropdownStyle({
                    position: "fixed",
                    top: rect.bottom + 8,
                    left: rect.left,
                    width: rect.width,
                    zIndex: 99999
                });
            }
        }
    };

    useEffect(() => {
        if (isOpen) {
            updatePosition();
            window.addEventListener("scroll", updatePosition, true);
            window.addEventListener("resize", updatePosition);
            return () => {
                window.removeEventListener("scroll", updatePosition, true);
                window.removeEventListener("resize", updatePosition);
            };
        }
    }, [isOpen, position]);

    const isSelected = (val: string) => {
        if (Array.isArray(value)) {
            return value.includes(val);
        }
        return value === val;
    };

    const getSelectedLabels = () => {
        if (Array.isArray(value)) {
            if (value.length === 0) return placeholder;
            return value.map(val => options.find(opt => opt.value === val)?.label).filter(Boolean).join(", ");
        }
        const selected = options.find((opt) => opt.value === value);
        return selected ? selected.label : placeholder;
    };

    const handleSelect = (optionValue: string) => {
        if (multiSelect) {
            const currentValues = Array.isArray(value) ? value : [];
            const newValues = currentValues.includes(optionValue)
                ? currentValues.filter(v => v !== optionValue)
                : [...currentValues, optionValue];
            onChange(newValues);
        } else {
            onChange(optionValue);
            setIsOpen(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
                (!menuRef.current || !menuRef.current.contains(event.target as Node))
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={cn("relative w-full", className)} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={cn(
                    "w-full h-auto py-3 border border-zinc-200 rounded-xl px-4 flex items-center justify-between transition-all outline-none group",
                    disabled ? "bg-zinc-50 cursor-not-allowed opacity-70" : "bg-white focus:bg-white cursor-pointer"
                )}
                style={{
                    ...(!disabled && isOpen && { backgroundColor: 'white', borderColor: selectedColor, boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' })
                }}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    {icon && <div className="text-zinc-400 shrink-0" style={{ color: isOpen ? selectedColor : undefined }}>{icon}</div>}
                    <span className={cn(
                        "text-[14px] leading-tight text-left truncate flex-1",
                        (Array.isArray(value) ? value.length > 0 : value) ? "text-[#1A1A1A] font-medium" : "text-zinc-400"
                    )}>
                        {getSelectedLabels()}
                    </span>
                </div>
                <ChevronDown
                    className="text-zinc-400 transition-transform duration-200 shrink-0 ml-2"
                    style={{
                        transform: isOpen ? 'rotate(180deg)' : undefined,
                        color: isOpen ? selectedColor : undefined
                    }}
                    size={18}
                />
            </button>

            {isOpen && mounted && createPortal(
                <div 
                    ref={menuRef}
                    style={dropdownStyle}
                    className={cn(
                        "bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in duration-200",
                        position === "top" ? "slide-in-from-bottom-2" : "slide-in-from-top-2"
                    )}
                >
                    <div className="max-h-60 overflow-y-auto p-1.5 custom-thin-scrollbar">
                        {options.length > 0 ? (
                            options.map((option) => {
                                const active = isSelected(option.value);
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleSelect(option.value)}
                                        onMouseEnter={(e) => {
                                            if (!active) {
                                                e.currentTarget.style.color = selectedColor;
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!active) {
                                                e.currentTarget.style.color = '';
                                            }
                                        }}
                                        className={cn(
                                            "w-full px-4 py-2.5 my-1 rounded-lg flex items-center gap-3 transition-colors text-left",
                                            active
                                                ? "font-medium"
                                                : "text-zinc-600 hover:bg-zinc-50"
                                        )}
                                        style={{
                                            ...(active && { backgroundColor: selectedBgColor, color: selectedColor })
                                        }}
                                    >
                                        {multiSelect && (
                                            <div
                                                className="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors"
                                                style={{
                                                    backgroundColor: active ? selectedColor : 'white',
                                                    borderColor: active ? selectedColor : 'rgb(212 212 212)'
                                                }}
                                            >
                                                {active && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                            </div>
                                        )}
                                        {option.icon && <div className="shrink-0">{option.icon}</div>}
                                        <span className="text-[14px] truncate flex-1">{option.label}</span>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="px-4 py-3 text-[14px] text-zinc-400 text-center">
                                No options available
                            </div>
                        )}
                    </div>
                    {footer && (
                        <div className="border-t border-zinc-100 p-1.5">
                            {footer}
                        </div>
                    )}
                </div>,
                document.body
            )}
        </div>
    );
};

export default StylishDropdown;
