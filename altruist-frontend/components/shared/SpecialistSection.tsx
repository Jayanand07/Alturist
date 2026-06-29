"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

// ── Types ────────────────────────────────────────────────────────────────────

interface SpecialtySummary {
  specialization: string;
  doctorCount: number;
}

// ── Specialty icon images — mapped from a curated Unsplash set ───────────────
// Used as a fallback avatar when no real doctor image is available.
const SPECIALTY_IMAGES: Record<string, string> = {
  "General Physician":   "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&q=80",
  "Pediatrician":        "https://images.unsplash.com/photo-1502740479091-635887520276?w=300&h=300&fit=crop&q=80",
  "Cardiologist":        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=300&fit=crop&q=80",
  "Dermatologist":       "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300&h=300&fit=crop&q=80",
  "Neurologist":         "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&q=80",
  "Gynaecologist":       "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=300&h=300&fit=crop&q=80",
  "Psychiatrist":        "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=300&h=300&fit=crop&q=80",
  "Orthopedic":          "https://images.unsplash.com/photo-1579684453423-f84349ef60b0?w=300&h=300&fit=crop&q=80",
  "ENT Specialist":      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=300&h=300&fit=crop&q=80",
  "Ophthalmologist":     "https://images.unsplash.com/photo-1588776814546-1ffbb2a6e4dc?w=300&h=300&fit=crop&q=80",
  "Diabetologist":       "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=300&h=300&fit=crop&q=80",
  "Oncologist":          "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=300&h=300&fit=crop&q=80",
};

/** Returns an image URL for the given specialty name, with a sensible fallback. */
function getSpecialtyImage(name: string): string {
  return (
    SPECIALTY_IMAGES[name] ??
    `https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=300&h=300&fit=crop&q=80`
  );
}

// ── Skeleton card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white border-none shadow-md rounded-3xl p-4 flex flex-col items-center gap-3 animate-pulse">
      <div className="w-20 h-20 rounded-full bg-slate-200 flex-shrink-0" />
      <div className="space-y-2 w-full flex flex-col items-center">
        <div className="h-3 w-24 bg-slate-200 rounded-full" />
        <div className="h-3 w-16 bg-slate-100 rounded-full" />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SpecialistSection() {
  const { t } = useLanguage();

  const [specialties, setSpecialties] = useState<SpecialtySummary[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchSpecialties() {
      try {
        setStatus("loading");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/doctors/specialties`,
          { signal: controller.signal, cache: "no-store" }
        );
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data: SpecialtySummary[] = await res.json();
        const activeSpecialties = (data || []).filter(spec => spec.doctorCount > 0);
        setSpecialties(activeSpecialties);
        setStatus("success");
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error("[SpecialistSection] Failed to fetch specialties:", err);
        setStatus("error");
      }
    }

    fetchSpecialties();
    return () => controller.abort();
  }, []);

  // ── Loading state — 6 skeletons matching grid ───────────────────────────
  if (status === "loading") {
    return (
      <section className="py-16 bg-white border-y border-slate-100 mb-16">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                {t("specialty.title")}
              </h2>
              <p className="text-slate-500 text-sm font-semibold mt-1">
                {t("specialty.subtitle")}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────
  if (status === "error") {
    return (
      <section className="py-16 bg-white border-y border-slate-100 mb-16">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                {t("specialty.title")}
              </h2>
              <p className="text-slate-500 text-sm font-semibold mt-1">
                {t("specialty.subtitle")}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
            <Stethoscope className="w-12 h-12 text-slate-200" />
            <p className="text-slate-400 text-sm font-semibold">
              Unable to load specialists right now. Please try again later.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // ── Empty state — no verified doctors in the system yet ─────────────────
  if (specialties.length === 0) {
    return null;
  }

  // ── Success state — render real specialty cards ──────────────────────────
  return (
    <section className="py-16 bg-white border-y border-slate-100 mb-16">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t("specialty.title")}
            </h2>
            <p className="text-slate-500 text-sm font-semibold mt-1">
              {t("specialty.subtitle")}
            </p>
          </div>
          <Link href="/consult">
            <Button className="bg-primary-light hover:bg-primary text-primary hover:text-white font-extrabold rounded-xl shadow-sm border-none transition-all active:scale-95">
              {t("specialty.viewAll")} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Specialty cards grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {specialties.map((spec, i) => (
            <motion.div
              key={spec.specialization}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Link href={`/consult?specialty=${encodeURIComponent(spec.specialization)}`}>
                <div className="bg-white border-none shadow-md hover:shadow-2xl hover:bg-emerald-50/10 transition-all cursor-pointer text-center p-4 rounded-3xl group flex flex-col items-center gap-3">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-500/10 shadow-inner group-hover:scale-105 transition-transform flex-shrink-0">
                    <img
                      src={getSpecialtyImage(spec.specialization)}
                      alt={spec.specialization}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-primary transition-colors leading-tight">
                      {spec.specialization}
                    </h3>
                    <p className="text-xs text-primary font-bold mt-1 bg-primary-light px-2.5 py-0.5 rounded-full">
                      {spec.doctorCount} {spec.doctorCount === 1 ? "Doctor" : "Doctors"}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
