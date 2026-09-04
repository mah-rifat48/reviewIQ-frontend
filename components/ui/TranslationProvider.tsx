"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useRef,
    useCallback,
} from "react";
import { usePathname } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
type Language = "en" | "ar";

interface TranslationContextType {
    language: Language;
    isTranslating: boolean;
    setLanguage: (lang: Language) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// ─── Cookie helpers ───────────────────────────────────────────────────────────
const COOKIE_KEY = "aimalya_lang";

function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string) {
    if (typeof document === "undefined") return;
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`;
}

// ─── Translation cache (module-level, persists across route changes) ──────────
const cache = new Map<string, string>();

// ─── Google Cloud Translation API v2 ─────────────────────────────────────────
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_KEY ?? "";
const GOOGLE_TRANSLATE_URL =
    `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`;

// ─── Eastern Arabic numeral converter ───────────────────────────────────────
const WESTERN_TO_ARABIC: Record<string, string> = {
    "0": "٠", "1": "١", "2": "٢", "3": "٣", "4": "٤",
    "5": "٥", "6": "٦", "7": "٧", "8": "٨", "9": "٩",
};

function toArabicNumerals(str: string): string {
    return str.replace(/[0-9]/g, (d) => WESTERN_TO_ARABIC[d]);
}

async function translateText(text: unknown, targetLang: string): Promise<string> {
    // Strict null/undefined guard
    if (text === null || text === undefined) return "";
    const str = String(text).trim();
    if (!str) return str;

    const isArabic = targetLang === "ar";

    // Skip URLs and emails — meaningless to translate
    if (/^https?:\/\//.test(str)) return str;
    if (/^[\w.+-]+@[\w-]+\.[\w.]+$/.test(str)) return str;

    // Pure number/symbol strings (no letters): convert digits locally
    if (!/[a-zA-Z\u0600-\u06FF]/.test(str)) {
        return isArabic ? toArabicNumerals(str) : str;
    }

    const cacheKey = `${targetLang}::${str}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey)!;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
        const res = await fetch(GOOGLE_TRANSLATE_URL, {
            method: "POST",
            signal: controller.signal,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                q: str,
                source: "en",
                target: targetLang,
                format: "text",
            }),
        });
        clearTimeout(timer);
        if (!res.ok) {
            console.warn("[Translate] Google API error:", res.status, await res.text());
            // Even on error, still convert digits in the original
            const fallback = isArabic ? toArabicNumerals(str) : str;
            return fallback;
        }
        const data = await res.json();
        const raw: string = data?.data?.translations?.[0]?.translatedText ?? str;
        // Always convert any remaining Western digits in the translated string
        const translated = isArabic ? toArabicNumerals(raw) : raw;
        cache.set(cacheKey, translated);
        return translated;
    } catch (err) {
        clearTimeout(timer);
        console.warn("[Translate] Request failed:", err);
        return isArabic ? toArabicNumerals(str) : str;
    }
}

// ─── DOM helpers ──────────────────────────────────────────────────────────────
const SKIP_TAGS = new Set([
    "SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "SVG", "MATH", "HEAD",
    "INPUT", "TEXTAREA",
]);

function isTranslatable(node: Text): boolean {
    const parent = node.parentElement;
    if (!parent) return false;
    if (SKIP_TAGS.has(parent.tagName)) return false;
    if (parent.closest("[data-notranslate]")) return false;
    const text = (node.textContent ?? "").trim();
    return text.length >= 1; // include single digits like "4", "0"
}

function collectTextNodes(root: Node): Text[] {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) =>
            isTranslatable(node as Text)
                ? NodeFilter.FILTER_ACCEPT
                : NodeFilter.FILTER_REJECT,
    });
    const nodes: Text[] = [];
    let n: Node | null;
    while ((n = walker.nextNode())) nodes.push(n as Text);
    return nodes;
}

function collectInputs(root: Element): HTMLInputElement[] {
    return Array.from(
        root.querySelectorAll<HTMLInputElement>("input[placeholder], textarea[placeholder]")
    );
}

const BATCH = 8;

async function translateNodes(
    textNodes: Text[],
    inputs: HTMLInputElement[],
    lang: string
) {
    // Save originals (only once, to avoid overwriting with already-translated text)
    for (const n of textNodes) {
        if (!(n as any).__origText) {
            (n as any).__origText = n.textContent ?? "";
        }
    }
    for (const el of inputs) {
        if (!el.dataset.origPlaceholder) {
            el.dataset.origPlaceholder = el.placeholder ?? "";
        }
    }

    // Translate text nodes in batches of BATCH
    for (let i = 0; i < textNodes.length; i += BATCH) {
        const batch = textNodes.slice(i, i + BATCH);
        await Promise.all(
            batch.map(async (node) => {
                const orig = (node as any).__origText;
                // Guard: orig might be empty string or node detached
                if (!orig || !node.parentNode) return;
                const translated = await translateText(orig, lang);
                if (node.parentNode) node.textContent = translated;
            })
        );
    }

    // Translate placeholders in batches
    for (let i = 0; i < inputs.length; i += BATCH) {
        const batch = inputs.slice(i, i + BATCH);
        await Promise.all(
            batch.map(async (el) => {
                const orig = el.dataset.origPlaceholder ?? "";
                if (!orig) return;
                const translated = await translateText(orig, lang);
                el.placeholder = translated;
            })
        );
    }
}

function restoreDOM() {
    if (typeof document === "undefined") return;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n: Node | null;
    while ((n = walker.nextNode())) {
        const t = n as Text;
        if ((t as any).__origText !== undefined) {
            t.textContent = (t as any).__origText;
            delete (t as any).__origText;
        }
    }
    document.body
        .querySelectorAll<HTMLInputElement>(
            "input[data-orig-placeholder], textarea[data-orig-placeholder]"
        )
        .forEach((el) => {
            if (el.dataset.origPlaceholder !== undefined) {
                el.placeholder = el.dataset.origPlaceholder;
                delete el.dataset.origPlaceholder;
            }
        });
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function TranslationProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>("en");
    const [isTranslating, setIsTranslating] = useState(false);
    const pathname = usePathname();

    const currentLang = useRef<Language>("en");
    const observer = useRef<MutationObserver | null>(null);
    const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pendingNodes = useRef<Set<Node>>(new Set());
    const busy = useRef(false); // prevents concurrent translation runs

    // ── Read cookie on mount ──────────────────────────────────────────────────
    useEffect(() => {
        const saved = getCookie(COOKIE_KEY) as Language | null;
        if (saved === "ar") {
            currentLang.current = "ar";
            setLanguageState("ar");
        }
    }, []);

    // ── html[lang] / html[dir] ────────────────────────────────────────────────
    useEffect(() => {
        if (typeof document === "undefined") return;
        document.documentElement.setAttribute("lang", language);
        document.documentElement.setAttribute("dir", "ltr");
    }, [language]);

    // ── Core translation runner ───────────────────────────────────────────────
    const runTranslation = useCallback(async (lang: Language) => {
        if (typeof document === "undefined") return;
        if (busy.current) return;
        busy.current = true;
        setIsTranslating(true);

        // Disconnect observer while we mutate the DOM to prevent feedback loops
        observer.current?.disconnect();

        try {
            if (lang === "en") {
                restoreDOM();
            } else {
                const textNodes = collectTextNodes(document.body);
                const inputs = collectInputs(document.body);
                await translateNodes(textNodes, inputs, lang);
            }
        } catch (err) {
            console.error("[TranslationProvider] Error:", err);
        } finally {
            setIsTranslating(false);
            busy.current = false;
            // Reconnect observer after DOM mutations are done
            if (currentLang.current === "ar" && observer.current) {
                observer.current.observe(document.body, {
                    childList: true,
                    subtree: true,
                });
            }
        }
    }, []);

    // ── Flush newly-added nodes from MutationObserver ─────────────────────────
    const flushPending = useCallback(async () => {
        if (currentLang.current !== "ar" || busy.current) return;
        if (pendingNodes.current.size === 0) return;

        const snapshot = Array.from(pendingNodes.current);
        pendingNodes.current.clear();

        const textNodes: Text[] = [];
        const inputs: HTMLInputElement[] = [];

        for (const node of snapshot) {
            if (!node.isConnected) continue; // skip detached nodes
            if (node.nodeType === Node.TEXT_NODE) {
                if (isTranslatable(node as Text)) textNodes.push(node as Text);
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                textNodes.push(...collectTextNodes(node));
                inputs.push(...collectInputs(node as Element));
            }
        }

        if (textNodes.length > 0 || inputs.length > 0) {
            observer.current?.disconnect();
            try {
                await translateNodes(textNodes, inputs, "ar");
            } finally {
                if (currentLang.current === "ar" && observer.current) {
                    observer.current.observe(document.body, {
                        childList: true,
                        subtree: true,
                    });
                }
            }
        }
    }, []);

    // ── MutationObserver management ───────────────────────────────────────────
    const startObserver = useCallback(() => {
        if (typeof document === "undefined") return;
        if (!observer.current) {
            observer.current = new MutationObserver((mutations) => {
                if (currentLang.current !== "ar") return;
                for (const m of mutations) {
                    m.addedNodes.forEach((node) => {
                        if (node.isConnected) pendingNodes.current.add(node);
                    });
                }
                if (flushTimer.current) clearTimeout(flushTimer.current);
                flushTimer.current = setTimeout(flushPending, 500);
            });
        }
        observer.current.observe(document.body, { childList: true, subtree: true });
    }, [flushPending]);

    const stopObserver = useCallback(() => {
        observer.current?.disconnect();
        if (flushTimer.current) {
            clearTimeout(flushTimer.current);
            flushTimer.current = null;
        }
        pendingNodes.current.clear();
    }, []);

    // ── Re-translate on route change (when Arabic is active) ──────────────────
    useEffect(() => {
        if (currentLang.current !== "ar") return;
        stopObserver();

        const t = setTimeout(async () => {
            await runTranslation("ar");
            startObserver();
        }, 700); // wait for new page DOM to settle

        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    // ── Start/stop observer when language changes ─────────────────────────────
    useEffect(() => {
        if (language === "ar") {
            startObserver();
        } else {
            stopObserver();
        }
        return stopObserver;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [language]);

    // ── Public API ────────────────────────────────────────────────────────────
    const setLanguage = useCallback(
        async (lang: Language) => {
            setCookie(COOKIE_KEY, lang);
            currentLang.current = lang;
            setLanguageState(lang);

            if (lang === "ar") {
                startObserver();
                await runTranslation("ar");
            } else {
                stopObserver();
                await runTranslation("en");
            }
        },
        [runTranslation, startObserver, stopObserver]
    );

    return (
        <TranslationContext.Provider value={{ language, isTranslating, setLanguage }}>
            {children}
        </TranslationContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useTranslation() {
    const ctx = useContext(TranslationContext);
    if (!ctx) throw new Error("useTranslation must be used within a TranslationProvider");
    return ctx;
}
