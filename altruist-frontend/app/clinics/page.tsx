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
  Building2,
  Info,
  MapPin,
  Star,
  CheckCircle,
  Video,
  Navigation,
  User
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
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

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

function ClinicCard({ doctor, onBook }: { doctor: any; onBook: (d: any) => void }) {
  const initial = (doctor.clinicName || "C").charAt(0).toUpperCase();
  const color = getAvatarColor(doctor.clinicName || "C");

  return (
    <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 card-hover flex flex-col h-full hover:shadow-xl transition-shadow group">
      <div className="flex items-start gap-4 mb-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}
        >
          <Building2 size={28} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading text-lg font-bold text-[#0F172A] line-clamp-1">{doctor.clinicName}</h3>
          
          {doctor.city && (
            <div className="flex items-center gap-1.5 text-sm text-[#00A87E] font-bold mt-1">
              <MapPin size={14} className="shrink-0" />
              <span>{doctor.city}</span>
            </div>
          )}

          <div className="flex items-center gap-1 mt-2">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            <span className="text-sm text-[#475569] font-bold">
              {doctor.rating?.toFixed(1) || "4.8"}
            </span>
            <span className="text-xs text-slate-400 ml-1">Clinic Rating</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-lg font-bold text-[#0F172A] border border-slate-200">
            {doctor.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-sm text-[#0F172A]">Dr. {doctor.name}</p>
              {doctor.isVerified && <CheckCircle size={14} className="text-[#00A87E] fill-[#00A87E]/10" />}
            </div>
            <p className="text-xs font-bold text-[#475569] truncate">{doctor.specialization}</p>
          </div>
        </div>
      </div>

      <div className="mt-auto border-t border-[#E2E8F0] pt-5">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-[10px] text-[#475569] font-bold uppercase tracking-wider mb-1">In-Person Fee</p>
            <p className="font-display text-2xl font-black text-[#0F172A]">₹{doctor.consultationFee || 500}</p>
          </div>
          {doctor.isAvailable && (
             <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold">Open Today</Badge>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => onBook(doctor)}
            className="w-full h-11 border-[#00A87E] text-[#00A87E] hover:bg-[#E6F7F3] rounded-xl font-bold"
          >
            <User size={16} className="mr-2" />
            Profile
          </Button>
          <Button
            onClick={() => onBook(doctor)}
            className="w-full h-11 bg-[#00A87E] hover:bg-[#007A5C] rounded-xl font-bold transition-all active:scale-95 shadow-md"
          >
            <MapPin size={16} className="mr-2" />
            Book Visit
          </Button>
        </div>
      </div>
    </div>
  );
}

function ClinicSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 animate-pulse flex flex-col h-[380px]">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-16 h-16 rounded-2xl bg-slate-200 shrink-0" />
        <div className="flex-1 space-y-3 pt-1">
          <div className="h-5 bg-slate-200 rounded w-3/4" />
          <div className="h-4 bg-emerald-50 rounded w-24" />
          <div className="h-4 bg-slate-100 rounded w-20" />
        </div>
      </div>
      <div className="h-20 bg-slate-50 rounded-xl mb-6" />
      <div className="mt-auto border-t border-slate-100 pt-5 space-y-4">
        <div className="h-8 bg-slate-200 rounded w-24" />
        <div className="flex gap-3">
          <div className="h-11 bg-slate-200 rounded-xl w-full" />
          <div className="h-11 bg-slate-200 rounded-xl w-full" />
        </div>
      </div>
    </div>
  );
}

export default function ClinicsPage() {
  const router = useRouter();

  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [city, setCity] = useState<string>("all");
  const [specialization, setSpecialization] = useState<string>("all");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState<string>("rating");
  
  const [appliedFilters, setAppliedFilters] = useState({
    city: "all",
    specialization: "all",
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
    queryKey: ["clinics", page, appliedFilters],
    queryFn: async () => {
      const params: any = { page, size: 20 };
      if (appliedFilters.specialization !== "all") params.specialization = appliedFilters.specialization;
      if (appliedFilters.city !== "all") params.city = appliedFilters.city;
      
      const response = await api.get("/doctors/available", { params });
      return response.data;
    },
  });

  const handleUseMyLocation = () => {
    toast.info("Location feature coming soon. Please select a city manually for now.");
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ city, specialization });
    setPage(0);
  };

  const handleBookClick = (doctor: any) => {
    router.push(`/doctors/${doctor.id}`);
  };

  const rawDoctors = data?.content || [];
  
  // Client-side filtering & sorting
  const filteredAndSortedClinics = rawDoctors
    .filter((d: any) => d.isVerified === true && d.clinicName && d.clinicName.trim().length > 0) // Strictly must have a clinic Name
    .filter((d: any) => {
      if (availableOnly && !d.isAvailable) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return d.clinicName?.toLowerCase().includes(query) || 
               d.name?.toLowerCase().includes(query) || 
               d.specialization?.toLowerCase().includes(query);
      }
      return true;
    })
    .sort((a: any, b: any) => {
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "fee") return (a.consultationFee || 0) - (b.consultationFee || 0);
      return 0;
    });

  const totalPages = data?.totalPages || 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Banner tailored for Clinics */}
      <div
        className="relative py-16 lg:py-24 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0F172A 0%, #1e293b 50%, #0F172A 100%)" }}
      >
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
        <div className="max-w-5xl mx-auto px-6 w-full relative z-10 text-center">
          <div className="w-16 h-16 bg-[#00A87E]/20 text-[#00A87E] rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-[#00A87E]/30">
            <Building2 size={32} />
          </div>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-4">
            Find <span className="text-[#00A87E]">Partner Clinics</span> Near You
          </h1>
          <p className="text-slate-300 font-medium text-lg max-w-2xl mx-auto mb-10">
            Locate top-rated medical facilities and book in-person visits with verified Altruist doctors.
          </p>

          {/* Prominent City Search Bar */}
          <div className="bg-white p-2 rounded-2xl shadow-xl max-w-3xl mx-auto flex flex-col md:flex-row gap-2">
            <div className="flex-1 flex items-center px-4 bg-slate-50 rounded-xl border border-slate-100">
              <MapPin size={20} className="text-[#00A87E] shrink-0" />
              <Select value={city} onValueChange={(val) => { setCity(val || 'all'); }}>
                <SelectTrigger className="border-0 shadow-none bg-transparent h-12 text-base font-bold focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="Select your city" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all" className="font-bold">All Cities</SelectItem>
                  {(citiesList || []).map((c: string) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={handleUseMyLocation}
              variant="outline" 
              className="h-14 px-6 rounded-xl font-bold border-slate-200 text-slate-600 hover:text-[#00A87E] hover:bg-[#E6F7F3] transition-colors"
            >
              <Navigation size={18} className="mr-2" />
              Use My Location
            </Button>
            
            <Button 
              onClick={handleApplyFilters}
              className="h-14 px-8 bg-[#00A87E] hover:bg-[#007A5C] text-white font-bold rounded-xl shadow-md transition-transform active:scale-95 text-lg"
            >
              Search
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
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
                  onClick={() => { setCity("all"); setSpecialization("all"); setSearchQuery(""); setAvailableOnly(false); handleApplyFilters(); }}
                >
                  Reset
                </Button>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase text-[#475569] tracking-wider">
                  Search Clinics
                </Label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Clinic or doctor name..."
                    className="pl-9 h-11 rounded-xl border-[#E2E8F0] focus-visible:ring-[#00A87E]"
                  />
                </div>
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

              <div className="flex items-center justify-between p-4 bg-[#E6F7F3] rounded-xl border border-[#00A87E]/10">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold text-[#0F172A]">Open Today</Label>
                  <p className="text-[10px] text-[#00A87E] font-medium">Show available clinics</p>
                </div>
                <Switch 
                  checked={availableOnly} 
                  onCheckedChange={setAvailableOnly} 
                  className="data-[state=checked]:bg-[#00A87E]"
                />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[#00A87E] to-emerald-800 p-6 rounded-3xl text-white shadow-lg space-y-4">
              <Video size={32} className="opacity-50" />
              <h3 className="font-heading font-bold text-xl">Can't travel today?</h3>
              <p className="text-sm text-emerald-100 font-medium">
                Skip the waiting room. Connect with doctors instantly via video call from home.
              </p>
              <Link href="/consult" className="block w-full">
                <Button className="w-full bg-white text-[#00A87E] hover:bg-emerald-50 font-bold rounded-xl h-11 mt-2 shadow-md">
                  Start Video Consult
                </Button>
              </Link>
            </div>
          </div>

          {/* Clinics Grid area */}
          <div className="lg:col-span-3 space-y-6">
            
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-[#E2E8F0]">
              <p className="text-sm font-bold text-slate-500 mb-3 sm:mb-0">
                Found {filteredAndSortedClinics.length} clinics matching your criteria
              </p>
              <div className="flex items-center gap-3">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sort By</Label>
                <Select value={sortBy} onValueChange={(val) => setSortBy(val || 'rating')}>
                  <SelectTrigger className="w-[180px] h-10 rounded-xl bg-slate-50 border-slate-200 font-bold focus:ring-[#00A87E]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-medium">
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="fee">Lowest Visit Fee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => <ClinicSkeleton key={i} />)}
              </div>
            ) : isError ? (
              <div className="bg-white p-12 rounded-3xl text-center space-y-4 border border-red-100 shadow-sm">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
                  <X size={32} />
                </div>
                <h3 className="font-heading text-2xl font-bold text-[#0F172A]">Failed to load clinics</h3>
                <p className="text-[#475569] font-medium">Something went wrong checking our database. Please try again.</p>
              </div>
            ) : filteredAndSortedClinics.length === 0 ? (
              <div className="bg-white p-20 rounded-3xl text-center space-y-6 border border-slate-200 shadow-sm flex flex-col items-center">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                  <Building2 size={48} />
                </div>
                <h3 className="font-heading text-2xl font-bold text-[#0F172A]">
                  No clinics found {appliedFilters.city !== 'all' && `in ${appliedFilters.city}`}
                </h3>
                <p className="text-[#475569] max-w-sm font-medium">
                  We couldn't find any partner clinics matching your criteria. Try a video consultation instead!
                </p>
                <Link href="/consult">
                  <Button
                    className="bg-[#00A87E] hover:bg-[#007A5C] font-bold px-8 h-12 rounded-xl shadow-md mt-2"
                  >
                    <Video size={18} className="mr-2" /> Talk to a Doctor Online
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredAndSortedClinics.map((doctor: any) => (
                    <ClinicCard key={doctor.id} doctor={doctor} onBook={handleBookClick} />
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

          </div>
        </div>
      </div>
    </div>
  );
}
