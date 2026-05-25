"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Search,
  MapPin,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Star,
  ThumbsUp,
  Clock,
  Calendar,
  Video,
  MessageCircle,
  Building2,
  Filter,
  CheckCircle,
  Heart,
  Brain,
  Bone,
  Baby,
  Eye,
  Ear,
  Activity,
  Smile,
  Pill,
  Syringe,
  Microscope,
  Compass,
  Navigation,
  Stethoscope
} from "lucide-react";

import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocationStore, INDIAN_CITIES, calculateDistance } from "@/store/locationStore";
import LocationSelectorModal from "@/components/shared/LocationSelectorModal";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const SPECIALTIES = [
  { name: "General Physician", icon: <Activity className="text-blue-500" size={28} />, bg: "bg-blue-50" },
  { name: "Dermatology", icon: <Smile className="text-pink-500" size={28} />, bg: "bg-pink-50" },
  { name: "Obstetrics", icon: <Baby className="text-rose-500" size={28} />, bg: "bg-rose-50" },
  { name: "Orthopaedics", icon: <Bone className="text-orange-500" size={28} />, bg: "bg-orange-50" },
  { name: "ENT", icon: <Ear className="text-amber-500" size={28} />, bg: "bg-amber-50" },
  { name: "Neurology", icon: <Brain className="text-purple-500" size={28} />, bg: "bg-purple-50" },
  { name: "Cardiology", icon: <Heart className="text-red-500" size={28} />, bg: "bg-red-50" },
  { name: "Urology", icon: <Syringe className="text-teal-500" size={28} />, bg: "bg-teal-50" },
  { name: "Gastroenterology", icon: <Activity className="text-emerald-500" size={28} />, bg: "bg-emerald-50" },
  { name: "Psychiatry", icon: <Brain className="text-indigo-500" size={28} />, bg: "bg-indigo-50" },
  { name: "Paediatrics", icon: <Baby className="text-cyan-500" size={28} />, bg: "bg-cyan-50" },
  { name: "Pulmonology", icon: <Activity className="text-sky-500" size={28} />, bg: "bg-sky-50" },
  { name: "Endocrinology", icon: <Microscope className="text-fuchsia-500" size={28} />, bg: "bg-fuchsia-50" },
  { name: "Nephrology", icon: <Syringe className="text-violet-500" size={28} />, bg: "bg-violet-50" },
  { name: "Neurosurgery", icon: <Brain className="text-purple-600" size={28} />, bg: "bg-purple-100" },
  { name: "Rheumatology", icon: <Bone className="text-orange-600" size={28} />, bg: "bg-orange-100" },
  { name: "Ophthalmology", icon: <Eye className="text-blue-600" size={28} />, bg: "bg-blue-100" },
  { name: "Surgical Gastro", icon: <Activity className="text-emerald-600" size={28} />, bg: "bg-emerald-100" },
  { name: "Infectious Disease", icon: <Microscope className="text-red-600" size={28} />, bg: "bg-red-100" },
  { name: "Psychology", icon: <Smile className="text-indigo-600" size={28} />, bg: "bg-indigo-100" },
  { name: "Medical Oncology", icon: <Pill className="text-pink-600" size={28} />, bg: "bg-pink-100" },
  { name: "Diabetology", icon: <Activity className="text-teal-600" size={28} />, bg: "bg-teal-100" },
  { name: "Dentist", icon: <Smile className="text-cyan-600" size={28} />, bg: "bg-cyan-100" }
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

function DoctorListingCard({ doctor, onConsult }: { doctor: any; onConsult: (d: any) => void }) {
  const { t } = useLanguage();
  const initial = (doctor.name || "D").charAt(0).toUpperCase();
  const color = getAvatarColor(doctor.name || "D");
  const imgUrl = doctor.profilePictureUrl || doctor.profilePicture;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg transition-shadow flex flex-col sm:flex-row gap-6">
      <div className="flex-shrink-0 flex flex-col items-center gap-3">
        {imgUrl ? (
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-emerald-500/10 shadow-sm relative shrink-0">
            <img 
              src={imgUrl} 
              alt={doctor.name} 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-sm shrink-0"
            style={{ backgroundColor: color }}
          >
            {initial}
          </div>
        )}
      </div>
      
      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-[#1e293b]">Dr. {doctor.name}</h3>
              {doctor.isVerified && <CheckCircle size={16} className="text-blue-500 fill-blue-50" />}
            </div>
            <p className="text-sm font-semibold text-[#0d5c3a]">{doctor.specialization}</p>
            <p className="text-sm text-slate-500 font-medium mt-1">{doctor.experienceYears || 5} {t('consult.experienceYears')}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <Star size={16} className="fill-amber-400 text-amber-400" />
              <span className="font-bold text-slate-700">{doctor.rating?.toFixed(1) || "4.8"}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
              <ThumbsUp size={12} className="text-emerald-500" />
              <span>98% ({doctor.totalConsultations || 120} {t('consult.reviews')})</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 bg-slate-50 p-2 rounded-lg w-max">
          <div className="flex items-center gap-1"><Video size={14} className="text-blue-600"/> {t('consult.videoConsult')}</div>
          <div className="flex items-center gap-1 border-l border-slate-300 pl-4"><MessageCircle size={14} className="text-emerald-600"/> {t('consult.chat')}</div>
          <div className="flex items-center gap-1 border-l border-slate-300 pl-4"><Building2 size={14} className="text-orange-600"/> {t('consult.clinicVisit')}</div>
        </div>
        
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-3">
          <MapPin size={14} />
          {doctor.city || "Online"} {doctor.clinicName && `• ${doctor.clinicName}`}
        </div>
      </div>

      <div className="flex-shrink-0 flex flex-col justify-end w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-200 gap-3">
        <div className="text-center sm:text-right">
          <span className="text-xs text-slate-500 font-medium">{t('consult.feeLabel')}</span>
          <p className="text-2xl font-black text-[#1e293b]">₹{doctor.consultationFee || 500}</p>
        </div>
        <Button 
          onClick={() => onConsult(doctor)}
          className="w-full sm:w-48 bg-[#e8593c] hover:bg-[#d6482e] text-white font-bold h-10 shadow-sm rounded-lg">
          {t('consult.bookAppointment')}
        </Button>
        <Button 
          variant="outline"
          onClick={() => onConsult(doctor)}
          className="w-full sm:w-48 border-[#0d5c3a] text-[#0d5c3a] hover:bg-[#0d5c3a] hover:text-white font-bold h-10 rounded-lg">
          {t('consult.consultNow')}
        </Button>
      </div>
    </div>
  );
}

export default function ConsultPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const { selectedCity, selectedLat, selectedLng } = useLocationStore();
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [city, setCity] = useState<string>(selectedCity);
  const [specialization, setSpecialization] = useState<string>("all");
  const [maxFee, setMaxFee] = useState<number>(5000);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState<string>("proximity");
  
  const [appliedFilters, setAppliedFilters] = useState({
    city: selectedCity,
    specialization: "all",
    maxFee: 5000,
  });

  // Sync with global location store when user changes city
  useEffect(() => {
    setCity(selectedCity);
    setAppliedFilters((prev) => ({ ...prev, city: selectedCity }));
    setPage(0);
  }, [selectedCity]);


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

  const { data, isLoading } = useQuery({
    queryKey: ["doctors", page, appliedFilters],
    queryFn: async () => {
      const params: any = { page, size: 20, maxFee: appliedFilters.maxFee };
      if (appliedFilters.specialization !== "all") params.specialization = appliedFilters.specialization;
      if (appliedFilters.city !== "all") params.city = appliedFilters.city;
      
      const response = await api.get("/doctors/available", { params });
      return response.data;
    },
  });

  const handleApplyFilters = () => {
    setAppliedFilters({ city, specialization, maxFee });
    setPage(0);
  };

  const getDoctorDistance = (doc: any) => {
    if (!doc.city) return 9999;
    const docCityInfo = INDIAN_CITIES.find(c => c.name.toLowerCase() === doc.city.toLowerCase());
    if (!docCityInfo) return 9999;
    return calculateDistance(selectedLat, selectedLng, docCityInfo.lat, docCityInfo.lng);
  };

  const rawDoctors = data?.content || [];
  const filteredAndSortedDoctors = rawDoctors
    .filter((d: any) => {
      if (availableOnly && !d.isAvailable) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return d.name?.toLowerCase().includes(query) || 
               d.specialization?.toLowerCase().includes(query);
      }
      return true;
    })
    .sort((a: any, b: any) => {
      if (sortBy === "proximity") {
        const distA = getDoctorDistance(a);
        const distB = getDoctorDistance(b);
        if (distA !== distB) return distA - distB;
        // fallback to rating if distance is equal
        return (b.rating || 0) - (a.rating || 0);
      }
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "fee") return (a.consultationFee || 0) - (b.consultationFee || 0);
      if (sortBy === "experience") return (b.experienceYears || 0) - (a.experienceYears || 0);
      return 0;
    });


  return (
    <div className="min-h-screen bg-white">
      {/* Top Banner / Location / Search */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div 
            onClick={() => setIsLocationOpen(true)}
            className="flex items-center gap-2 text-[#0d5c3a] font-bold text-sm bg-slate-50 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
          >
             <MapPin size={18} />
             <div className="flex flex-col leading-tight">
               <span className="text-[10px] text-slate-500 uppercase">{t('consult.location')}</span>
               <span className="flex items-center gap-1">{selectedCity} <ChevronDown size={14}/></span>
             </div>
          </div>
          
          <div className="flex-1 max-w-2xl relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
             <input 
               type="text"
               placeholder={t('consult.searchPlaceholder')}
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20 focus:border-[#0d5c3a] font-medium transition-all"
             />
          </div>

          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Promo Banner */}
        <div className="bg-[#fff7ed] rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between border border-orange-100 relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <h2 className="text-3xl font-black text-[#1e293b] mb-2">
              {t('consult.bannerTitle')} <span className="text-[#e8593c]">{t('consult.bannerHighlight')}</span>
            </h2>
            <p className="text-orange-800 font-bold mb-6">{t('consult.bannerDiscount')}</p>
            <Button className="bg-[#e8593c] hover:bg-[#d6482e] text-white font-bold rounded-lg px-8 h-12 text-lg shadow-lg">
              {t('consult.consultNow')}
            </Button>
          </div>
          <div className="relative z-10 mt-6 md:mt-0 flex items-center justify-center">
             <div className="w-40 h-40 bg-orange-200/50 rounded-full flex flex-col items-center justify-center border-4 border-white shadow-xl relative animate-pulse">
               <Smile size={80} className="text-orange-500" />
               <div className="absolute top-2 right-2 bg-white rounded-full p-1"><Stethoscope size={24} className="text-[#0d5c3a]" /></div>
             </div>
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-orange-200/40 rounded-full blur-3xl"></div>
        </div>

        {/* Browse by Specialties Grid */}
        <div>
          <h3 className="text-2xl font-black text-[#1e293b] mb-6">{t('consult.browseSpecialties')}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {SPECIALTIES.map((spec, i) => (
              <div key={i} className="group cursor-pointer flex flex-col items-center p-4 rounded-xl border border-slate-100 bg-white hover:border-[#e8593c] hover:shadow-md transition-all">
                <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform", spec.bg)}>
                  {spec.icon}
                </div>
                <span className="text-xs font-bold text-slate-700 text-center">{spec.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Find a Doctor in 3 Easy Steps */}
        <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
          <h3 className="text-xl font-black text-center text-[#1e293b] mb-12">{t('consult.stepsTitle')}</h3>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 relative">
             <div className="hidden md:block absolute top-[40px] left-[15%] right-[15%] h-[2px] bg-slate-200 border-dashed border-t-2"></div>
             
             <div className="flex flex-col items-center relative z-10">
               <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md border-4 border-slate-50 mb-3">
                 <Search className="text-[#0d5c3a]" size={32} />
               </div>
               <span className="font-bold text-slate-700">{t('consult.step1')}</span>
             </div>
             
             <div className="flex flex-col items-center relative z-10">
               <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md border-4 border-slate-50 mb-3">
                 <Calendar className="text-blue-500" size={32} />
               </div>
               <span className="font-bold text-slate-700">{t('consult.step2')}</span>
             </div>
             
             <div className="flex flex-col items-center relative z-10">
               <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md border-4 border-slate-50 mb-3">
                 <MapPin className="text-orange-500" size={32} />
               </div>
               <span className="font-bold text-slate-700">{t('consult.step3')}</span>
             </div>
             
             <div className="flex flex-col items-center relative z-10">
               <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md border-4 border-slate-50 mb-3">
                 <CheckCircle className="text-emerald-500" size={32} />
               </div>
               <span className="font-bold text-slate-700">{t('consult.step4')}</span>
             </div>
          </div>
        </div>

        {/* Main Directory Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-4">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-xl p-5 sticky top-24">
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                <span className="font-black flex items-center gap-2 text-lg text-slate-800"><Filter size={18} className="text-[#0d5c3a]"/> {t('consult.filters')}</span>
                <button 
                  onClick={() => { setCity("all"); setSpecialization("all"); setMaxFee(5000); handleApplyFilters(); }}
                  className="text-sm font-bold text-[#e8593c] hover:underline">{t('consult.clearAll')}</button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <Label className="text-xs font-bold text-slate-500 uppercase mb-2 block">{t('consult.cityLocation')}</Label>
                  <Select value={city} onValueChange={(v) => { setCity(v || "all"); handleApplyFilters(); }}>
                    <SelectTrigger className="rounded-lg border-slate-200 h-10 font-bold focus:ring-[#0d5c3a]">
                      <SelectValue placeholder={t('consult.selectCity')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('consult.allCities')}</SelectItem>
                      {(citiesList || []).map((c: string) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-bold text-slate-500 uppercase mb-2 block">{t('consult.specialization')}</Label>
                  <Select value={specialization} onValueChange={(v) => { setSpecialization(v || "all"); handleApplyFilters(); }}>
                    <SelectTrigger className="rounded-lg border-slate-200 h-10 font-bold focus:ring-[#0d5c3a]">
                      <SelectValue placeholder={t('consult.selectSpecialty')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('consult.allSpecialties')}</SelectItem>
                      {SPECIALTIES.map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-bold text-slate-500 uppercase mb-2 block">{t('consult.maxFee')}</Label>
                  <div className="flex justify-between font-black text-[#0d5c3a] mb-2"><span>₹0</span><span>₹{maxFee}</span></div>
                  <input 
                    type="range" min="0" max="5000" step="100" value={maxFee}
                    onChange={(e) => setMaxFee(parseInt(e.target.value))}
                    onMouseUp={handleApplyFilters}
                    onTouchEnd={handleApplyFilters}
                    className="w-full accent-[#e8593c]"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <Label className="font-bold text-slate-700">{t('consult.availableNow')}</Label>
                  <Switch 
                    checked={availableOnly} 
                    onCheckedChange={setAvailableOnly}
                    className="data-[state=checked]:bg-[#e8593c]"
                  />
                </div>

                <Button 
                  onClick={handleApplyFilters}
                  className="w-full h-11 bg-[#e8593c] hover:bg-[#d6482e] text-white font-bold rounded-lg shadow-sm">
                  {t('consult.applyFilters')}
                </Button>
              </div>
            </div>
          </div>

          {/* Doctors List */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between pb-4 border-b border-slate-200 mb-6">
               <h2 className="text-xl font-black text-slate-800">{filteredAndSortedDoctors.length} {t('consult.doctorsFound')}</h2>
               <div className="flex items-center gap-3">
                 <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('consult.sortBy')}</span>
                 <Select value={sortBy} onValueChange={(v) => setSortBy(v || "proximity")}>
                   <SelectTrigger className="w-[160px] h-9 rounded-lg border-slate-200 font-bold text-slate-700 focus:ring-[#0d5c3a]">
                     <SelectValue />
                   </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="proximity">{t('consult.nearby')}</SelectItem>
                      <SelectItem value="rating">{t('consult.rating')}</SelectItem>
                      <SelectItem value="experience">{t('consult.experience')}</SelectItem>
                      <SelectItem value="fee">{t('consult.fee')}</SelectItem>
                    </SelectContent>
                 </Select>
               </div>
            </div>

            <div className="space-y-4">
              {filteredAndSortedDoctors.map((doc: any) => (
                <DoctorListingCard key={doc.id} doctor={doc} onConsult={(d) => router.push(`/doctors/${d.id}`)} />
              ))}
              {filteredAndSortedDoctors.length === 0 && !isLoading && (
                <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Search size={48} className="mx-auto text-slate-300 mb-4" />
                  <h3 className="text-xl font-bold text-slate-700">{t('consult.noDoctorsTitle')}</h3>
                  <p className="text-slate-500 mt-2 font-medium">{t('consult.noDoctorsDesc')}</p>
                  <Button onClick={() => { setCity("all"); setSpecialization("all"); setMaxFee(5000); setSearchQuery(""); handleApplyFilters(); }} className="mt-6 bg-[#0d5c3a] hover:bg-[#0b5e39] font-bold h-11 px-8 rounded-lg">
                    {t('consult.clearAll')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
      {/* Location Selector Modal */}
      <LocationSelectorModal 
        isOpen={isLocationOpen} 
        onClose={() => setIsLocationOpen(false)} 
      />
    </div>
  );
}
