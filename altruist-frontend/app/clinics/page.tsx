"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin, Search, Navigation, Star, Clock, 
  Navigation2, Stethoscope, ChevronRight, Filter,
  Building2, Video, ChevronDown, CheckCircle2, Award
} from "lucide-react";
import api from "@/lib/axios";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocationStore, INDIAN_CITIES, calculateDistance } from "@/store/locationStore";
import LocationSelectorModal from "@/components/shared/LocationSelectorModal";
import { Badge } from "@/components/ui/badge";


const SPECIALTIES = [
  "General Physician",
  "Dentist",
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "Orthopedics",
];

// ── COMPREHENSIVE CURATED CLINICS DATABASE (FOR REALISTIC PROXIMITY RENDERING!) ──────────
const MOCK_CLINICS = [
  {
    id: "clinic-amritsar-multi",
    name: "Altruist Multispecialty Care Center",
    cityName: "Amritsar",
    address: "45 Mall Road, Opp. Rose Garden, Amritsar, Punjab 143001",
    rating: 4.9,
    isOpen: true,
    specialties: ["General Physician", "Pediatrics", "Cardiology"],
    imageUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&h=300&fit=crop&q=80"
  },
  {
    id: "clinic-jalandhar-cardio",
    name: "Altruist Heart & Skin Care Centre",
    cityName: "Jalandhar",
    address: "12 Model Town Main Road, Jalandhar, Punjab 144003",
    rating: 4.8,
    isOpen: true,
    specialties: ["Cardiology", "Dermatology", "General Physician"],
    imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=300&fit=crop&q=80"
  },
  {
    id: "clinic-ludhiana-child",
    name: "Altruist Pediatric & Dental Hospital",
    cityName: "Ludhiana",
    address: "78 Sarabha Nagar Extension, Ludhiana, Punjab 141001",
    rating: 4.7,
    isOpen: true,
    specialties: ["Pediatrics", "Dentist"],
    imageUrl: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=300&fit=crop&q=80"
  },
  {
    id: "clinic-chandigarh-family",
    name: "Altruist Family Clinic & Diagnostics",
    cityName: "Chandigarh",
    address: "SCO 112-114, Sector 17-C, Opp. Fountain Plaza, Chandigarh 160017",
    rating: 4.9,
    isOpen: true,
    specialties: ["General Physician", "Dentist", "Dermatology"],
    imageUrl: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=300&fit=crop&q=80"
  },
  {
    id: "clinic-delhi-elite",
    name: "Altruist Elite Healthcare Suites",
    cityName: "Delhi",
    address: "H-2 Block, Radial Road 4, Connaught Place, New Delhi 110001",
    rating: 4.9,
    isOpen: true,
    specialties: ["Cardiology", "Dermatology", "Pediatrics", "Orthopedics"],
    imageUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&h=300&fit=crop&q=80"
  }
];

function ClinicListingCard({ clinic, onBook }: { clinic: any; onBook: (c: any) => void }) {
  const { t } = useLanguage();
  const imgUrl = clinic.imageUrl || `https://ui-avatars.com/api/?name=${clinic.name}&background=0d5c3a&color=fff&size=150&font-size=0.33`;
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-5 flex flex-col sm:flex-row gap-6 hover:shadow-lg hover:border-emerald-100 transition-all group overflow-hidden">
      <div className="flex-shrink-0 w-full sm:w-48 h-36 rounded-2xl overflow-hidden bg-slate-50 relative shadow-inner">
        <img 
          src={imgUrl} 
          alt={clinic.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        <Badge className="absolute top-2 left-2 bg-[#0D9373] text-white border-none font-bold text-[9px] tracking-wider uppercase px-2 py-0.5 rounded shadow">
          {clinic.cityName} {t('clinics.hub')}
        </Badge>
      </div>
      
      <div className="flex-1 flex flex-col justify-between py-1 gap-4">
        <div className="space-y-2 text-left">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 leading-snug group-hover:text-[#0D9373] transition-colors">{clinic.name}</h3>
              <div className="flex items-start gap-1.5 mt-1 text-xs text-slate-500 font-semibold leading-normal">
                <MapPin size={14} className="text-[#E8593C] shrink-0 mt-0.5" />
                <span className="line-clamp-2">{clinic.address}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50 text-amber-700 font-black text-xs shrink-0 shadow-sm leading-none">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              {clinic.rating?.toFixed(1) || "4.8"}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {clinic.specialties?.map((spec: string, i: number) => (
              <span key={i} className="text-[9px] font-black text-[#0D9373] bg-[#E7F4F1] px-2.5 py-0.5 rounded-full border-none uppercase tracking-widest">
                {spec}
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-[10px] font-extrabold uppercase tracking-widest leading-none">
          {clinic.isOpen ? (
            <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
              {t('clinics.openNow')}
            </div>
          ) : (
            <div className="flex items-center gap-1 text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
              <Clock size={12} />
              {t('clinics.closed')}
            </div>
          )}
          <div className="flex items-center gap-1 text-slate-500 font-bold">
            <Navigation2 size={12} className="text-slate-400" />
            {clinic.distance} {t('clinics.kmAway')}
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 flex flex-col justify-end w-full sm:w-48 gap-3 sm:border-l sm:border-slate-50 sm:pl-6 pt-4 sm:pt-0">
        <Button 
          onClick={() => onBook(clinic)}
          className="w-full bg-[#E8593C] hover:bg-[#D14A30] text-white font-extrabold h-11 rounded-xl shadow-sm border-none transition-colors active:scale-95 text-xs tracking-wider uppercase">
          {t('consult.bookAppointment')}
        </Button>
        <Button 
          onClick={() => onBook(clinic)}
          variant="outline"
          className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 font-bold h-11 rounded-xl text-xs">
          {t('clinics.viewDetails')}
        </Button>
      </div>
    </div>
  );
}

export default function ClinicsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  
  const { selectedCity, selectedState, selectedLat, selectedLng } = useLocationStore();
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  const [city, setCity] = useState<string>(selectedCity);
  const [searchQuery, setSearchQuery] = useState("");
  const [specialization, setSpecialization] = useState<string>("all");
  const [distance, setDistance] = useState<number>(25);
  const [openToday, setOpenToday] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  
  const [appliedFilters, setAppliedFilters] = useState({
    city: selectedCity,
    specialization: "all",
    distance: 25,
    searchQuery: "",
    ratingFilter: null as number | null
  });

  const { data: citiesList } = useQuery({
    queryKey: ["clinics-cities"],
    queryFn: async () => {
      try {
        return (await api.get("/doctors/cities")).data;
      } catch (e) {
        return [];
      }
    }
  });

  const { data: apiClinics, isLoading } = useQuery({
    queryKey: ["clinics", appliedFilters.city],
    queryFn: async () => {
      try {
        const response = await api.get("/doctors/available", { params: { size: 50, city: appliedFilters.city === "all" ? undefined : appliedFilters.city } });
        const uniqueClinics = new Map();
        response.data.content.forEach((d: any) => {
          if (d.clinicName) {
            if (!uniqueClinics.has(d.clinicName)) {
              uniqueClinics.set(d.clinicName, {
                id: d.id,
                name: d.clinicName,
                cityName: d.city || "Amritsar",
                address: d.clinicAddress || (d.city ? `${d.city} Medical Block` : "Online / Remote"),
                rating: d.rating || 4.8,
                isOpen: true,
                latitude: d.latitude,
                longitude: d.longitude,
                specialties: [d.specialization]
              });
            } else {
              const c = uniqueClinics.get(d.clinicName);
              if (!c.specialties.includes(d.specialization)) c.specialties.push(d.specialization);
            }
          }
        });
        return Array.from(uniqueClinics.values());
      } catch(e) {
        return [];
      }
    },
  });

  // Sync with global location store when user changes city
  useEffect(() => {
    setCity(selectedCity);
    setAppliedFilters((prev) => ({ ...prev, city: selectedCity }));
  }, [selectedCity]);

  const handleApplyFilters = () => {
    setAppliedFilters({ city, specialization, distance, searchQuery, ratingFilter });
  };

  // Compile full clinics database - fall back to realistic mock clinics if backend returns nothing
  const rawClinics = apiClinics && apiClinics.length > 0 ? apiClinics : MOCK_CLINICS;

  // Resolve distances dynamically based on Haversine distance from selected coordinates!
  const clinicsWithDistances = rawClinics.map((clinic: any) => {
    let distanceInKm = 2.4;
    const targetCity = clinic.cityName || "Amritsar";
    const cityInfo = INDIAN_CITIES.find(c => c.name.toLowerCase() === targetCity.toLowerCase());
    
    if (clinic.latitude && clinic.longitude) {
      // Calculate exact distance if clinic has custom lat/lng coordinates in database!
      distanceInKm = calculateDistance(selectedLat, selectedLng, clinic.latitude, clinic.longitude);
    } else if (cityInfo) {
      const dist = calculateDistance(selectedLat, selectedLng, cityInfo.lat, cityInfo.lng);
      // If user is in the same city, mock a highly realistic close distance of 1.0 - 4.5km
      distanceInKm = dist === 0 
        ? parseFloat((((clinic.name.charCodeAt(0) % 3) + 1.2) + (clinic.name.length % 5) * 0.5).toFixed(1))
        : dist;
    }
    
    return {
      ...clinic,
      distance: distanceInKm
    };
  });

  // Filter and sort clinics by proximity distance (closest first!)
  const filteredClinics = clinicsWithDistances.filter((c: any) => {
    if (openToday && !c.isOpen) return false;
    
    if (appliedFilters.searchQuery) {
       const q = appliedFilters.searchQuery.toLowerCase();
       if (!c.name?.toLowerCase().includes(q) && !c.address?.toLowerCase().includes(q)) return false;
    }
    
    if (appliedFilters.specialization !== "all" && !c.specialties?.includes(appliedFilters.specialization)) {
       return false;
    }

    if (appliedFilters.city !== "all" && c.cityName?.toLowerCase() !== appliedFilters.city?.toLowerCase()) {
      return false;
    }
    
    if (appliedFilters.ratingFilter !== null && c.rating < appliedFilters.ratingFilter) {
      return false;
    }

    if (c.distance > appliedFilters.distance) return false;
    
    return true;
  }).sort((a: any, b: any) => a.distance - b.distance);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 font-sans text-slate-900">
      
      {/* 1. Header Section */}
      <div className="bg-white border-b border-slate-200">
        
        {/* Top Location Bar */}
        <div 
          onClick={() => setIsLocationOpen(true)}
          className="border-b border-slate-100 bg-slate-50/50 cursor-pointer hover:bg-slate-100/80 transition-colors"
        >
          <div className="max-w-[1400px] mx-auto px-6 h-10 flex items-center gap-2">
             <MapPin size={14} className="text-[#0d5c3a]" />
             <span className="text-xs font-semibold text-slate-600">{t('clinics.deliveringTo')} <span className="text-[#0d5c3a] font-bold ml-1">{selectedCity}, {selectedState}</span></span>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 py-10 text-left">
          <Badge className="bg-[#E7F4F1] text-[#0D9373] hover:bg-[#E7F4F1] border-none font-bold text-xs px-3 py-1 rounded-md uppercase mb-4">
            {t('clinics.badge')}
          </Badge>
          <h1 className="text-3xl lg:text-4xl font-black text-[#0F172A] tracking-tight mb-2">{t('clinics.title')}</h1>
          <p className="text-slate-500 font-medium text-lg max-w-2xl mb-8">{t('clinics.desc')}</p>
          
          {/* Main Search Bar Card */}
          <div className="bg-white p-3 rounded-2xl shadow-lg border border-slate-100 flex flex-col md:flex-row items-center gap-3 w-full max-w-4xl relative z-10">
            <div className="flex items-center gap-2 w-full md:w-[200px] border-r border-slate-200 pr-3 cursor-pointer" onClick={() => setIsLocationOpen(true)}>
               <MapPin size={20} className="text-slate-400 flex-shrink-0" />
               <span className="font-bold text-slate-700 text-sm truncate pl-1">{selectedCity}</span>
               <ChevronDown size={14} className="text-slate-400 shrink-0 ml-auto" />
            </div>
            
            <div className="flex-1 w-full flex items-center gap-3 px-2">
              <Search size={20} className="text-slate-400" />
              <input 
                type="text"
                placeholder={t('clinics.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                className="w-full h-12 outline-none font-semibold text-slate-850 placeholder:text-slate-400 bg-transparent text-sm"
              />
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Button 
                onClick={() => setIsLocationOpen(true)}
                variant="ghost" 
                className="hidden lg:flex items-center gap-2 text-[#0D9373] hover:text-[#0A7A5F] font-bold hover:bg-[#E7F4F1] h-12 px-4 rounded-xl shrink-0"
              >
                <Navigation size={18} />
                {t('clinics.useMyLocation')}
              </Button>
              <Button 
                onClick={handleApplyFilters}
                className="w-full md:w-32 bg-[#E8593C] hover:bg-[#D14A30] text-white font-extrabold h-12 rounded-xl text-sm shadow-md border-none">
                {t('clinics.search')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Directory Area */}
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Filters Sidebar (280px) */}
          <div className="w-full lg:w-[280px] flex-shrink-0">
             <div className="bg-white rounded-2xl border border-slate-100 p-6 sticky top-8 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-5">
                   <span className="font-black text-[#0F172A] flex items-center gap-2 text-base">
                      <Filter size={16} className="text-[#0D9373]" /> {t('consult.filters')}
                   </span>
                   <button 
                     onClick={() => { 
                       setCity("all"); 
                       setSpecialization("all"); 
                       setDistance(25); 
                       setOpenToday(false); 
                       setSearchQuery(""); 
                       setRatingFilter(null);
                       setAppliedFilters({ city: "all", specialization: "all", distance: 25, searchQuery: "", ratingFilter: null }); 
                     }}
                     className="text-xs font-bold text-[#E8593C] hover:underline hover:text-[#D14A30] border-none bg-transparent cursor-pointer"
                   >
                      {t('clinics.reset')}
                   </button>
                </div>

                <div className="space-y-6 text-left">
                   <div>
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2.5">{t('clinics.clinicName')}</Label>
                     <div className="relative">
                       <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                       <input 
                         type="text"
                          placeholder={t('clinics.enterName')}
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0D9373]"
                       />
                     </div>
                   </div>

                   <div>
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2.5">{t('consult.specialization')}</Label>
                     <Select value={specialization} onValueChange={(v) => { setSpecialization(v || "all"); }}>
                       <SelectTrigger className="w-full h-10 rounded-xl border-slate-200 font-bold focus:ring-[#0D9373] text-xs">
                          <SelectValue placeholder={t('consult.allSpecialties')} />
                       </SelectTrigger>
                       <SelectContent>
                          <SelectItem value="all">{t('consult.allSpecialties')}</SelectItem>
                         {SPECIALTIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                       </SelectContent>
                     </Select>
                   </div>

                   <div className="flex items-center justify-between py-3 border-y border-slate-50">
                      <Label className="font-bold text-slate-700 cursor-pointer text-xs" htmlFor="openToggle">{t('clinics.openToday')}</Label>
                     <Switch 
                       id="openToggle"
                       checked={openToday} 
                       onCheckedChange={setOpenToday}
                       className="data-[state=checked]:bg-[#0D9373]"
                     />
                   </div>

                   <div>
                     <div className="flex justify-between items-center mb-3">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{t('clinics.proximity')}</Label>
                       <span className="font-black text-[#0D9373] text-xs">{distance} km</span>
                     </div>
                     <input 
                        type="range" min="1" max="100" step="5" value={distance}
                        onChange={(e) => setDistance(parseInt(e.target.value))}
                        className="w-full accent-[#0D9373]"
                      />
                      <div className="flex justify-between text-[9px] font-black text-slate-400 mt-1 uppercase tracking-wider">
                        <span>1 km</span><span>100 km</span>
                      </div>
                   </div>

                   <div>
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">{t('clinics.minRating')}</Label>
                     <div className="space-y-2">
                       {[4.8, 4.5, 4.0].map((rate) => (
                         <div key={rate} className="flex items-center gap-2">
                           <Checkbox 
                             id={`rating-${rate}`} 
                             checked={ratingFilter === rate}
                             onCheckedChange={(checked) => setRatingFilter(checked ? rate : null)}
                             className="rounded border-slate-300 data-[state=checked]:bg-[#0D9373] data-[state=checked]:border-[#0D9373]" 
                           />
                           <Label htmlFor={`rating-${rate}`} className="flex items-center gap-1 cursor-pointer font-bold text-slate-600 text-xs">
                              {rate.toFixed(1)} <Star size={12} className="fill-amber-400 text-amber-400 shrink-0" /> {t('clinics.above')}
                           </Label>
                         </div>
                       ))}
                     </div>
                   </div>

                   <Button 
                     onClick={handleApplyFilters}
                     className="w-full h-11 bg-[#E8593C] hover:bg-[#D14A30] text-white font-extrabold rounded-xl shadow-md border-none text-xs tracking-wider uppercase mt-4">
                      {t('consult.applyFilters')}
                   </Button>
                </div>
             </div>
          </div>

          {/* Results Area */}
          <div className="flex-1 space-y-5">
             {filteredClinics.length > 0 && (
                <p className="text-slate-500 font-extrabold text-sm text-left">{t('clinics.showingClinics')} — {filteredClinics.length} ({selectedCity})</p>
             )}

             {isLoading ? (
               <div className="space-y-4">
                 {[1,2,3].map(i => (
                   <div key={i} className="bg-white rounded-3xl border border-slate-100 h-40 animate-pulse"></div>
                 ))}
               </div>
             ) : filteredClinics.length > 0 ? (
               <div className="space-y-4">
                 {filteredClinics.map((clinic: any, i: number) => (
                   <ClinicListingCard key={i} clinic={clinic} onBook={(c) => router.push('/consult')} />
                 ))}
               </div>
             ) : (
               <div className="bg-white rounded-3xl border border-slate-100 p-12 flex flex-col items-center justify-center text-center shadow-md max-w-3xl mx-auto">
                 <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                   <Building2 size={36} className="text-[#0D9373]" />
                 </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">{t('clinics.noClinicsTitle')}</h3>
                  <p className="text-slate-500 font-bold max-w-md mb-8">{t('clinics.noClinicsDesc')}</p>
                 <Button onClick={() => router.push('/consult')} className="bg-[#0D9373] hover:bg-[#0A7A5F] text-white font-extrabold h-12 px-8 rounded-xl flex items-center gap-2 border-none shadow">
                    <Video size={18} /> {t('clinics.consultOnline')}
                 </Button>
               </div>
             )}
          </div>

        </div>
      </div>

      {/* Floating Card at bottom */}
      <div className="max-w-[1400px] mx-auto px-6 mt-10">
         <div className="bg-gradient-to-r from-[#0D9373] to-[#0A7A5F] rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between text-white shadow-xl relative overflow-hidden text-left border border-white/5">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px] opacity-10 pointer-events-none" />
            <div className="relative z-10 space-y-2">
                <h3 className="text-2xl font-black mb-2 flex items-center gap-3">{t('clinics.cantTravel')} <Video className="text-emerald-300 shrink-0" /></h3>
                <p className="font-semibold text-emerald-100 max-w-xl text-sm leading-relaxed">
                  {t('clinics.cantTravelDesc')}
                </p>
            </div>
            <Button onClick={() => router.push('/consult')} className="relative z-10 mt-6 sm:mt-0 bg-white text-[#0D9373] hover:bg-slate-50 font-black h-12 px-8 rounded-xl shadow-lg border-none">
              {t('clinics.consultOnlineNow')}
            </Button>
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
