"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { Search, X, ChevronDown, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { searchIndex, SearchEntry } from "@/lib/searchIndex";
import { useLocationStore } from "@/store/locationStore";

// ── Fuse.js instance ─────────────────────────────────────────────────────────
const fuse = new Fuse(searchIndex, {
  threshold: 0.4,
  keys: [
    { name: "label",    weight: 0.6 },
    { name: "keywords", weight: 0.3 },
    { name: "category", weight: 0.1 },
  ],
  includeScore: true,
  minMatchCharLength: 2,
  ignoreLocation: true,
});

// ── Category pill colours ─────────────────────────────────────────────────────
const CATEGORY_STYLES: Record<string, string> = {
  Doctor:       "bg-blue-100 text-blue-700",
  Medicine:     "bg-accent/10 text-accent",
  Service:      "bg-primary/10 text-primary",
  "Lab Test":   "bg-amber-100 text-amber-700",
  "Health Plan":"bg-purple-100 text-purple-700",
  Page:         "bg-slate-100 text-slate-600",
};

// ── Props ─────────────────────────────────────────────────────────────────────
interface FuzzySearchBarProps {
  /** Extra classes for the outer wrapper */
  className?: string;
  /** Placeholder override */
  placeholder?: string;
  /** Show location selector on the left */
  showLocationSelector?: boolean;
  onLocationClick?: () => void;
}

export default function FuzzySearchBar({
  className = "",
  placeholder = "Search medicines, doctors, lab tests…",
  showLocationSelector = false,
  onLocationClick,
}: FuzzySearchBarProps) {
  const router = useRouter();
  const { selectedCity } = useLocationStore();

  const [query, setQuery]           = useState("");
  const [results, setResults]       = useState<SearchEntry[]>([]);
  const [activeIdx, setActiveIdx]   = useState(-1);
  const [isOpen, setIsOpen]         = useState(false);

  const wrapperRef  = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLInputElement>(null);

  // ── Run Fuse search on every keystroke ──────────────────────────────────
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      setActiveIdx(-1);
      return;
    }
    const hits = fuse.search(query, { limit: 8 }).map((r) => r.item);
    setResults(hits);
    setIsOpen(hits.length > 0);
    setActiveIdx(-1);
  }, [query]);

  // ── Navigate to a result ─────────────────────────────────────────────────
  const navigate = useCallback(
    (entry: SearchEntry) => {
      setQuery("");
      setResults([]);
      setIsOpen(false);
      router.push(entry.route);
    },
    [router]
  );

  // ── Handle Enter / Arrow keys ────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setActiveIdx(-1);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && results[activeIdx]) {
        navigate(results[activeIdx]);
      } else if (results.length > 0) {
        // Top fuzzy match
        navigate(results[0]);
      } else if (query.trim()) {
        // Fallback: medicines search
        router.push(`/medicines?search=${encodeURIComponent(query.trim())}`);
        setQuery("");
        setIsOpen(false);
      }
    }
  };

  // ── Close dropdown on outside click ──────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Fallback Search button route ─────────────────────────────────────────
  const searchButtonHref = results.length > 0
    ? results[0].route
    : query.trim()
      ? `/medicines?search=${encodeURIComponent(query.trim())}`
      : "/medicines";

  // ── Group visible results by category ───────────────────────────────────
  const grouped = results.reduce<Record<string, SearchEntry[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  // Flat list for keyboard index mapping
  const flatList: SearchEntry[] = Object.values(grouped).flat();

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      {/* ── Search bar pill ─────────────────────────────────────────────── */}
      <div className="w-full max-w-2xl bg-white p-2 rounded-2xl shadow-xl flex flex-col md:flex-row items-center gap-2 border border-slate-100">

        {/* Location selector */}
        {showLocationSelector && (
          <div
            onClick={onLocationClick}
            className="flex items-center w-full md:w-auto px-3 border-b md:border-b-0 md:border-r border-slate-100 py-2 md:py-0 select-none cursor-pointer hover:bg-slate-50 rounded-xl transition-all shrink-0"
          >
            <MapPin className="w-5 h-5 text-primary shrink-0 mr-2" />
            <span className="text-sm font-bold text-slate-800 shrink-0 truncate max-w-[100px]">
              {selectedCity}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          </div>
        )}

        {/* Input */}
        <div className="flex items-center flex-1 w-full relative">
          <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            className="flex-1 h-11 text-slate-900 border-none shadow-none focus-visible:ring-0 text-base placeholder:text-slate-400"
          />
          {query.length > 0 && (
            <button
              onClick={() => { setQuery(""); setResults([]); setIsOpen(false); inputRef.current?.focus(); }}
              className="mr-2 p-1 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>

        {/* Search button — navigates to best match on click */}
        <Link href={searchButtonHref} className="w-full md:w-auto shrink-0">
          <Button
            onClick={() => { setIsOpen(false); setQuery(""); }}
            className="w-full md:w-auto h-11 px-8 rounded-xl font-extrabold text-base bg-accent text-white hover:bg-accent-hover shadow-md hover:shadow-lg transition-all active:scale-95 border-none"
          >
            Search
          </Button>
        </Link>
      </div>

      {/* ── Dropdown results ─────────────────────────────────────────────── */}
      {isOpen && results.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-2 max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100] max-h-[400px] overflow-y-auto"
          style={{ scrollbarWidth: "thin" }}
        >
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              {/* Category heading */}
              <div className="px-4 pt-3 pb-1">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${CATEGORY_STYLES[category] ?? "bg-slate-100 text-slate-500"}`}>
                  {category}
                </span>
              </div>

              {/* Result rows */}
              {items.map((item) => {
                const flatIdx = flatList.indexOf(item);
                const isActive = flatIdx === activeIdx;
                return (
                  <button
                    key={item.route + item.label}
                    onMouseEnter={() => setActiveIdx(flatIdx)}
                    onClick={() => navigate(item)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      isActive ? "bg-primary/10 border-l-2 border-primary" : "hover:bg-slate-50"
                    }`}
                  >
                    {/* Category dot */}
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: category === "Doctor" ? "#3B82F6" : category === "Medicine" ? "var(--color-accent)" : category === "Lab Test" ? "#F59E0B" : category === "Health Plan" ? "#9333EA" : "var(--color-primary)" }}
                    />
                    <span className="text-sm font-semibold text-slate-800">{item.label}</span>
                    <span className="ml-auto text-xs text-slate-400 font-medium shrink-0">{item.route}</span>
                  </button>
                );
              })}
            </div>
          ))}

          {/* Footer hint */}
          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-semibold">
              ↑ ↓ Navigate &nbsp;·&nbsp; ↵ Go &nbsp;·&nbsp; Esc Close
            </span>
            <span className="text-[10px] text-primary font-bold">
              {results.length} result{results.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
