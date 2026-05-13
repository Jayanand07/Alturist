"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
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
  MapPin,
  CheckCircle,
  Building2,
  Globe2
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
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";


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
  const languages = doctor.languages ? doctor.languages.split(",").map((l: string) => l.trim()) : [];

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 card-hover flex flex-col h-full hover:shadow-xl transition-shadow">
      <div className="flex items-start gap-4 mb-4">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}
        >
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-lg font-bold text-[#0F172A] truncate">Dr. {doctor.name}</h3>
            {doctor.isVerified && (
              <CheckCircle size={16} className="text-[#00A87E] fill-[#00A87E]/20" />
            )}
          </div>
          <Badge className="bg-[#E6F7F3] text-[#00A87E] border-[#00A87E]/20 hover:bg-[#E6F7F3] mt-1 text-xs font-bold truncate max-w-full">
            {doctor.specialization}
          </Badge>
          <div className="flex items-center gap-1 mt-2">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            <span className="text-sm text-[#475569] font-bold">
              {doctor.rating?.toFixed(1) || "4.8"}
            </span>
            <span className="text-xs text-slate-400 ml-1">({doctor.totalConsultations || 0} reviews)</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-5">
        {doctor.city && (
          <div className="flex items-center gap-2 text-sm text-[#475569] font-medium">
            <MapPin size={16} className="text-slate-400 shrink-0" />
            <span>📍 {doctor.city}</span>
          </div>
        )}
        
        {doctor.clinicName && (
          <div className="flex items-start gap-2 text-sm text-[#475569] font-medium">
            <Building2 size={16} className="text-slate-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2">Practices at <span className="font-bold">{doctor.clinicName}</span></span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-[#475569] font-medium">
          <Stethoscope size={16} className="text-slate-400 shrink-0" />
          <span>{doctor.experienceYears || 5} years experience</span>
        </div>
        
        {languages.length > 0 && (
          <div className="flex items-start gap-2 pt-1">
            <Globe2 size={16} className="text-slate-400 shrink-0 mt-0.5" />
            <div className="flex flex-wrap gap-1">
              {languages.map((lang: string, i: number) => (
                <Badge key={i} variant="secondary" className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0">
                  {lang}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {doctor.isAvailable ? (
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-sm font-bold text-[#10B981]">Available Now</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
          <span className="text-sm font-bold text-slate-500">Currently Offline</span>
        </div>
      )}

      <div className="mt-auto pt-4 border-t border-[#E2E8F0]">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-[10px] text-[#475569] font-bold uppercase tracking-wider mb-1">Consultation fee</p>
            <p className="font-display text-2xl font-black text-[#0F172A]">₹{doctor.consultationFee || 500}</p>
          </div>
        </div>
        <Button
          onClick={() => onConsult(doctor)}
          className="w-full h-12 bg-[#00A87E] hover:bg-[#007A5C] rounded-xl font-bold text-base transition-all active:scale-95 gap-2 shadow-md"
        >
          <MessageSquare size={18} />
          Book Consult
        </Button>
      </div>
    </div>
  );
}

function DoctorSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 animate-pulse flex flex-col h-[380px]">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-20 h-20 rounded-full bg-slate-200 shrink-0" />
        <div className="flex-1 space-y-3 pt-2">
          <div className="h-5 bg-slate-200 rounded w-3/4" />
          <div className="h-6 bg-emerald-50 rounded-full w-24" />
          <div className="h-4 bg-slate-100 rounded w-20" />
        </div>
      </div>
      <div className="space-y-3 mb-6">
        <div className="h-4 bg-slate-100 rounded w-full" />
        <div className="h-4 bg-slate-100 rounded w-5/6" />
        <div className="h-4 bg-slate-100 rounded w-4/6" />
      </div>
      <div className="mt-auto border-t border-slate-100 pt-4 space-y-4">
        <div className="h-8 bg-slate-200 rounded w-20" />
        <div className="h-12 bg-slate-200 rounded-xl w-full" />
      </div>
    </div>
  );
}

export default function ConsultPage() {
  const router = useRouter();

  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [city, setCity] = useState<string>("all");
  const [specialization, setSpecialization] = useState<string>("all");
  const [maxFee, setMaxFee] = useState<number>(2000);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState<string>("rating");
  
  const [appliedFilters, setAppliedFilters] = useState({
    city: "all",
    specialization: "all",
    maxFee: 2000,
  });

  const { data: citiesList } = useQuery({
    queryKey: ["cities"],
    queryFn: async () => {
      try {
        return (await api.get("/doctors/cities")).data;
      } catch (e) {
        return [];
      }
    }
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["doctors", page, appliedFilters],
    queryFn: async () => {
      const params: any = { page, size: 20, maxFee: appliedFilters.maxFee };
      if (appliedFilters.specialization !== "all") params.specialization = appliedFilters.specialization;
      if (appliedFilters.city !== "all") params.city = appliedFilters.city;
      
      const response = await api.get("/doctors/available", { params });
      return response.data;
    },
  });

  const handleCitySelect = (val: string | null) => {
    if (!val || val === "nearby") {
      toast.info("Location access coming soon");
      setCity("all");
    } else {
      setCity(val);
    }
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ city, specialization, maxFee });
    setPage(0);
  };

  const handleConsultClick = (doctor: any) => {
    router.push(`/doctors/${doctor.id}`);
  };

  const rawDoctors = data?.content || [];
  
  // Client-side filtering & sorting
  const filteredAndSortedDoctors = rawDoctors
    .filter((d: any) => d.isVerified === true) // Frontend guard for verified only
    .filter((d: any) => {
      // Client-side availability filter
      if (availableOnly && !d.isAvailable) return false;
      // Client-side search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return d.name?.toLowerCase().includes(query) || 
               d.specialization?.toLowerCase().includes(query) ||
               d.clinicName?.toLowerCase().includes(query);
      }
      return true;
    })
    .sort((a: any, b: any) => {
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "fee") return (a.consultationFee || 0) - (b.consultationFee || 0);
      if (sortBy === "experience") return (b.experienceYears || 0) - (a.experienceYears || 0);
      return 0;
    });

  const totalPages = data?.totalPages || 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Dark Hero Banner */}
      <div
        className="relative h-[220px] flex items-end overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0F172A 0%, #064E3B 50%, #0F172A 100%)" }}
      >
        <div className="absolute inset-0 hero-grid-pattern opacity-20" />
        <div className="max-w-7xl mx-auto px-6 w-full pb-16 relative z-10">
          <h1 className="font-heading text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Consult <span className="text-[#00A87E]">Top Doctors</span> Online
          </h1>
          <p className="text-slate-300 font-medium mt-3 text-lg">
            Chat with verified specialists instantly. Secure, private, and convenient.
          </p>
        </div>
      </div>

      {/* Search Bar Overlapping */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20 mb-8">
        <div className="bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-2 flex items-center gap-3 h-16">
          <Search size={24} className="text-[#475569] ml-4" />
          <Input
            placeholder="Search by doctor name, specialty, or clinic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 shadow-none focus-visible:ring-0 text-lg font-medium h-full px-2 placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#E2E8F0] space-y-6 sticky top-24">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="font-heading font-bold text-xl text-[#0F172A] flex items-center gap-2">
                  <Filter size={20} className="text-[#00A87E]" />
                  Filters
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-8 text-[#00A87E] font-bold hover:bg-[#E6F7F3] rounded-lg"
                  onClick={() => { setCity("all"); setSpecialization("all"); setMaxFee(2000); handleApplyFilters(); }}
                >
                  Reset
                </Button>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase text-[#475569] tracking-wider">
                  City Location
                </Label>
                <Select value={city} onValueChange={handleCitySelect}>
                  <SelectTrigger className="rounded-xl border-[#E2E8F0] h-11 bg-[#F8FAFC] hover:bg-white transition-all font-semibold focus:ring-[#00A87E]">
                    <SelectValue placeholder="Select City" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="nearby" className="text-[#00A87E] font-bold py-3"><div className="flex items-center"><MapPin size={16} className="mr-2"/> Nearby to You</div></SelectItem>
                    <SelectItem value="all" className="font-bold">Anywhere (Online)</SelectItem>
                    {(citiesList || []).map((c: string) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase text-[#475569] tracking-wider">
                  Specialization
                </Label>
                <Select value={specialization} onValueChange={(val) => setSpecialization(val || 'all')}>
                  <SelectTrigger className="rounded-xl border-[#E2E8F0] h-11 bg-[#F8FAFC] hover:bg-white transition-all font-semibold focus:ring-[#00A87E]">
                    <SelectValue placeholder="Select Specialization" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all" className="font-bold">Any Specialty</SelectItem>
                    {SPECIALIZATIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-5 pt-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-bold uppercase text-[#475569] tracking-wider">Max Fee</Label>
                  <span className="bg-[#E6F7F3] text-[#00A87E] px-2 py-1 rounded-md text-sm font-bold font-display">₹{maxFee}</span>
                </div>
                <input
                  type="range" min="0" max="5000" step="100"
                  value={maxFee}
                  onChange={(e) => setMaxFee(parseInt(e.target.value))}
                  className="w-full accent-[#00A87E]"
                />
                <div className="flex justify-between text-[10px] font-bold text-[#475569]">
                  <span>₹0</span><span>₹5000+</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#E6F7F3] rounded-xl border border-[#00A87E]/10">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold text-[#0F172A]">Available Now</Label>
                  <p className="text-[10px] text-[#00A87E] font-medium">Show doctors currently online</p>
                </div>
                <Switch 
                  checked={availableOnly} 
                  onCheckedChange={setAvailableOnly} 
                  className="data-[state=checked]:bg-[#00A87E]"
                />
              </div>

              <Button
                onClick={handleApplyFilters}
                className="w-full bg-[#00A87E] hover:bg-[#007A5C] font-bold h-12 rounded-xl shadow-md active:scale-95 transition-all"
              >
                Apply Filters
              </Button>
            </div>

            <div className="bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] p-6 rounded-3xl text-white shadow-lg space-y-4">
              <Info size={32} className="opacity-50" />
              <h3 className="font-heading font-bold text-xl">Need help choosing?</h3>
              <p className="text-sm text-blue-100 font-medium">
                Talk to our care coordinators for free assistance in finding the right specialist.
              </p>
              <Button className="w-full bg-white text-[#2563EB] hover:bg-blue-50 font-bold rounded-xl h-11 mt-2">
                Call +91 800 123 4567
              </Button>
            </div>
          </div>

          {/* Doctors Grid area */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Sorting Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-[#E2E8F0]">
              <p className="text-sm font-bold text-slate-500 mb-3 sm:mb-0">
                Showing {filteredAndSortedDoctors.length} verified doctors
              </p>
              <div className="flex items-center gap-3">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sort By</Label>
                <Select value={sortBy} onValueChange={(val) => setSortBy(val || 'rating')}>
                  <SelectTrigger className="w-[180px] h-10 rounded-xl bg-slate-50 border-slate-200 font-bold focus:ring-[#00A87E]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-medium">
                    <SelectItem value="rating">Best Rated</SelectItem>
                    <SelectItem value="experience">Most Experienced</SelectItem>
                    <SelectItem value="fee">Lowest Fee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => <DoctorSkeleton key={i} />)}
              </div>
            ) : isError ? (
              <div className="bg-white p-12 rounded-3xl text-center space-y-4 border border-red-100 shadow-sm">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
                  <X size={32} />
                </div>
                <h3 className="font-heading text-2xl font-bold text-[#0F172A]">Failed to load doctors</h3>
                <p className="text-[#475569] font-medium">Something went wrong checking our medical registry. Please try again.</p>
              </div>
            ) : filteredAndSortedDoctors.length === 0 ? (
              <div className="bg-white p-20 rounded-3xl text-center space-y-6 border border-slate-200 shadow-sm flex flex-col items-center">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                  <Stethoscope size={48} />
                </div>
                <h3 className="font-heading text-2xl font-bold text-[#0F172A]">No verified doctors found</h3>
                <p className="text-[#475569] max-w-sm font-medium">Try adjusting your filters or search terms to find available specialists.</p>
                <Button
                  variant="outline"
                  onClick={() => { setCity("all"); setSpecialization("all"); setMaxFee(2000); setSearchQuery(""); setAvailableOnly(false); handleApplyFilters(); }}
                  className="border-[#00A87E] text-[#00A87E] hover:bg-[#E6F7F3] font-bold px-8 h-12 rounded-xl"
                >
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredAndSortedDoctors.map((doctor: any) => (
                    <DoctorCardPremium key={doctor.id} doctor={doctor} onConsult={handleConsultClick} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 pt-8">
                    <Button
                      variant="outline"
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                      className="rounded-xl font-bold gap-2 border-[#E2E8F0] h-11 px-5"
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
                            "h-11 w-11 rounded-xl font-bold text-base",
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
                      className="rounded-xl font-bold gap-2 border-[#E2E8F0] h-11 px-5"
                    >
                      Next <ChevronRight size={18} />
                    </Button>
                  </div>
                )}
              </>
            )}
            
            {/* Find Nearest Clinic Callout */}
            <div className="mt-12">
              <Link href="/clinics">
                <Card className="border border-[#00A87E]/20 bg-gradient-to-r from-[#E6F7F3] to-white shadow-sm hover:shadow-md transition-shadow cursor-pointer rounded-3xl overflow-hidden group">
                  <CardContent className="p-8 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-[#00A87E]/10 text-[#00A87E] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <MapPin size={32} />
                      </div>
                      <div>
                        <h3 className="font-heading text-2xl font-bold text-[#0F172A] mb-1">Looking for an in-person appointment?</h3>
                        <p className="text-[#475569] font-medium">Find Altruist partner clinics near you for physical examinations.</p>
                      </div>
                    </div>
                    <Button className="bg-[#00A87E] hover:bg-[#007A5C] font-bold rounded-xl h-11 px-6 shrink-0 hidden md:flex">
                      Find Nearest Clinic
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
