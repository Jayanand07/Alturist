"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Filter,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  Info,
  MessageSquare,
  Star,
} from "lucide-react";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const SPECIALIZATIONS = [
  "General Physician",
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "Gynecology",
  "Neurology",
  "Orthopedics",
  "Psychiatry",
];

const AVATAR_COLORS: Record<string, string> = {
  A: "#EF4444", B: "#F97316", C: "#F59E0B", D: "#22C55E",
  E: "#14B8A6", F: "#06B6D4", G: "#3B82F6", H: "#6366F1",
  I: "#8B5CF6", J: "#A855F7", K: "#D946EF", L: "#EC4899",
  M: "#F43F5E", N: "#10B981", O: "#0EA5E9", P: "#00A87E",
  Q: "#7C3AED", R: "#DB2777", S: "#059669", T: "#0D9488",
  U: "#2563EB", V: "#7C3AED", W: "#DC2626", X: "#9333EA",
  Y: "#CA8A04", Z: "#65A30D",
};
const getAvatarColor = (name: string) =>
  AVATAR_COLORS[name?.charAt(0)?.toUpperCase() || "A"] || "#00A87E";

function DoctorCardPremium({ doctor, onConsult }: { doctor: any; onConsult: (d: any) => void }) {
  const initial = (doctor.name || "D").charAt(0).toUpperCase();
  const color = getAvatarColor(doctor.name || "D");

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 card-hover flex flex-col">
      <div className="flex items-start gap-4 mb-5">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}
        >
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading text-lg font-bold text-[#0F172A] truncate">Dr. {doctor.name}</h3>
          <Badge className="bg-[#E6F7F3] text-[#00A87E] border-[#00A87E]/20 hover:bg-[#E6F7F3] mt-1 text-xs font-bold">
            {doctor.specialization}
          </Badge>
          <div className="flex items-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} size={12} className={cn("fill-amber-400 text-amber-400", i > 4 && "fill-gray-200 text-gray-200")} />
            ))}
            <span className="text-xs text-[#475569] font-bold ml-1">
              {doctor.rating?.toFixed(1) || "4.8"}
            </span>
          </div>
        </div>
      </div>

      <div className="text-sm text-[#475569] font-medium mb-4">
        ⭐ {doctor.experienceYears || 5} years experience
      </div>

      {doctor.isAvailable && (
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-sm font-bold text-[#10B981]">Available Now</span>
        </div>
      )}

      <div className="mt-auto pt-4 border-t border-[#E2E8F0]">
        <div className="mb-4">
          <p className="text-xs text-[#475569] font-medium uppercase tracking-wider">Consultation fee</p>
          <p className="font-display text-2xl font-bold text-[#0F172A]">₹{doctor.consultationFee || 500}</p>
        </div>
        <Button
          onClick={() => onConsult(doctor)}
          className="w-full h-12 bg-[#00A87E] hover:bg-[#007A5C] rounded-xl font-bold text-base transition-all active:scale-95 gap-2"
        >
          <MessageSquare size={18} />
          Chat &amp; Consult
        </Button>
      </div>
    </div>
  );
}

function DoctorSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 animate-pulse">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-20 h-20 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="h-6 bg-gray-100 rounded-full w-24" />
          <div className="h-3 bg-gray-100 rounded w-20" />
        </div>
      </div>
      <div className="h-4 bg-gray-100 rounded w-32 mb-4" />
      <div className="border-t border-gray-100 pt-4 space-y-3">
        <div className="h-4 bg-gray-100 rounded w-20" />
        <div className="h-7 bg-gray-200 rounded w-16" />
        <div className="h-12 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

export default function ConsultPage() {
  const router = useRouter();

  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [specialization, setSpecialization] = useState<string>("all");
  const [maxFee, setMaxFee] = useState<number>(2000);
  const [availableOnly, setAvailableOnly] = useState(true);
  const [appliedFilters, setAppliedFilters] = useState({
    specialization: "all",
    maxFee: 2000,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["doctors", page, appliedFilters],
    queryFn: async () => {
      const params: any = { page, size: 9, maxFee: appliedFilters.maxFee };
      if (appliedFilters.specialization !== "all")
        params.specialization = appliedFilters.specialization;
      const response = await api.get("/doctors/available", { params });
      return response.data;
    },
  });

  const handleApplyFilters = () => {
    setAppliedFilters({ specialization, maxFee });
    setPage(0);
  };

  // Navigate to full doctor profile where patient books & chats
  const handleConsultClick = (doctor: any) => {
    router.push(`/doctors/${doctor.id}`);
  };

  const doctors = data?.content || [];
  const totalPages = data?.totalPages || 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Dark Hero Banner */}
      <div
        className="relative h-[220px] flex items-end overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0F172A 0%, #064E3B 50%, #0F172A 100%)" }}
      >
        <div className="absolute inset-0 hero-grid-pattern" />
        <div className="max-w-7xl mx-auto px-6 w-full pb-16 relative z-10">
          <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Consult <span className="text-[#00A87E]">Top Doctors</span> Online
          </h1>
          <p className="text-slate-400 font-medium mt-2">
            Chat with verified specialists instantly. Secure, private, and convenient.
          </p>
        </div>
      </div>

      {/* Search Bar Overlapping */}
      <div className="max-w-7xl mx-auto px-6 -mt-7 relative z-20 mb-8">
        <div className="bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-4 flex items-center gap-3">
          <Search size={20} className="text-[#475569] ml-2" />
          <Input
            placeholder="Search by name, speciality..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 shadow-none focus-visible:ring-0 text-base h-10 font-medium"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E2E8F0] space-y-6 sticky top-24">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-[#0F172A] flex items-center gap-2">
                  <Filter size={18} className="text-[#00A87E]" />
                  Filters
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-8 text-[#00A87E] font-bold hover:bg-[#E6F7F3]"
                  onClick={() => { setSpecialization("all"); setMaxFee(2000); handleApplyFilters(); }}
                >
                  Reset
                </Button>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase text-[#475569] tracking-wider">
                  Specialization
                </Label>
                <Select
                  value={specialization}
                  onValueChange={(val: string | null) => setSpecialization(val ?? "all")}
                >
                  <SelectTrigger className="rounded-xl border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white transition-all font-semibold">
                    <SelectValue placeholder="Select Specialization" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">Any Specialty</SelectItem>
                    {SPECIALIZATIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-bold uppercase text-[#475569] tracking-wider">Max Fee</Label>
                  <span className="text-[#00A87E] text-sm font-bold font-display">₹{maxFee}</span>
                </div>
                <input
                  type="range" min="0" max="5000" step="100"
                  value={maxFee}
                  onChange={(e) => setMaxFee(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] font-bold text-[#475569]">
                  <span>₹0</span><span>₹5000+</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#E6F7F3] rounded-xl border border-[#00A87E]/10">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold text-[#0F172A]">Available Now</Label>
                  <p className="text-[10px] text-[#00A87E] font-medium">Show active only</p>
                </div>
                <Switch checked={availableOnly} onCheckedChange={setAvailableOnly} />
              </div>

              <Button
                onClick={handleApplyFilters}
                className="w-full bg-[#00A87E] hover:bg-[#007A5C] font-bold h-12 rounded-xl"
              >
                Apply Filters
              </Button>
            </div>

            <div className="bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] p-6 rounded-2xl text-white shadow-lg space-y-4">
              <Info size={32} className="opacity-50" />
              <h3 className="font-heading font-bold text-lg">Need help choosing?</h3>
              <p className="text-sm text-blue-100 font-medium">
                Talk to our care coordinators for free assistance.
              </p>
              <Button className="w-full bg-white text-[#2563EB] hover:bg-blue-50 font-bold rounded-xl">
                Call +91 800 123 4567
              </Button>
            </div>
          </div>

          {/* Doctors Grid */}
          <div className="lg:col-span-3 space-y-8">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => <DoctorSkeleton key={i} />)}
              </div>
            ) : isError ? (
              <div className="bg-white p-12 rounded-2xl text-center space-y-4 border border-red-100">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
                  <X size={32} />
                </div>
                <h3 className="font-heading text-xl font-bold text-[#0F172A]">Failed to load doctors</h3>
                <p className="text-[#475569]">Something went wrong. Please try again.</p>
              </div>
            ) : doctors.length === 0 ? (
              <div className="bg-white p-20 rounded-2xl text-center space-y-6 border-2 border-dashed border-[#E2E8F0] flex flex-col items-center">
                <div className="w-24 h-24 bg-[#F8FAFC] rounded-full flex items-center justify-center text-gray-300">
                  <Stethoscope size={48} />
                </div>
                <h3 className="font-heading text-2xl font-bold text-[#0F172A]">No doctors found</h3>
                <p className="text-[#475569] max-w-sm font-medium">Try adjusting your filters.</p>
                <Button
                  variant="outline"
                  onClick={() => { setSpecialization("all"); setMaxFee(2000); handleApplyFilters(); }}
                  className="border-[#00A87E] text-[#00A87E] hover:bg-[#E6F7F3] font-bold px-8 h-12 rounded-xl"
                >
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {doctors.map((doctor: any) => (
                    <DoctorCardPremium key={doctor.id} doctor={doctor} onConsult={handleConsultClick} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 pt-8">
                    <Button
                      variant="outline"
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                      className="rounded-xl font-bold gap-2 border-[#E2E8F0]"
                    >
                      <ChevronLeft size={18} /> Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <Button
                          key={i}
                          variant={page === i ? "default" : "ghost"}
                          onClick={() => setPage(i)}
                          className={cn(
                            "h-10 w-10 rounded-xl font-bold",
                            page === i && "bg-[#00A87E] text-white hover:bg-[#007A5C]"
                          )}
                        >
                          {i + 1}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                      disabled={page === totalPages - 1}
                      className="rounded-xl font-bold gap-2 border-[#E2E8F0]"
                    >
                      Next <ChevronRight size={18} />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
