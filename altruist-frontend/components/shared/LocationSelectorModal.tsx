"use client";

import React, { useState } from "react";
import { 
  MapPin, Navigation, Search, Check, 
  X, Loader2, Landmark, Compass, AlertCircle
} from "lucide-react";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLocationStore, INDIAN_CITIES } from "@/store/locationStore";

interface LocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_CITIES = [
  "Amritsar", "Delhi", "Mumbai", "Bangalore", 
  "Hyderabad", "Pune", "Chennai", "Kolkata"
];

export default function LocationSelectorModal({ isOpen, onClose }: LocationSelectorModalProps) {
  const { 
    selectedCity, 
    setCity, 
    detectLocation, 
    isDetecting 
  } = useLocationStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const filteredCities = INDIAN_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCity = (cityName: string) => {
    setCity(cityName);
    setSearchQuery("");
    setErrorMsg(null);
    setSuccessMsg(null);
    onClose();
  };

  const handleDetectLocation = () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    detectLocation(
      (cityName) => {
        setSuccessMsg(`Detected closest city: ${cityName}!`);
        setTimeout(() => {
          setSuccessMsg(null);
          onClose();
        }, 1200);
      },
      (error) => {
        setErrorMsg(error);
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl border border-slate-100 p-6 bg-white gap-6">
        <DialogHeader className="relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E7F4F1] text-[#0D9373] flex items-center justify-center">
              <MapPin className="w-5 h-5 animate-float" />
            </div>
            <div>
              <DialogTitle className="font-heading text-xl font-extrabold text-slate-900 leading-tight">
                Select Your Location
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-xs font-semibold">
                Access local pricing, doctors, and express same-day delivery
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Browser Geolocation Button */}
        <div className="space-y-4">
          <Button
            type="button"
            disabled={isDetecting}
            onClick={handleDetectLocation}
            className="w-full h-12 bg-gradient-to-r from-[#0D9373] to-[#0A7A5F] hover:from-[#0A7A5F] hover:to-[#08614C] text-white font-extrabold rounded-2xl flex items-center justify-center gap-2.5 shadow-md border-none active:scale-95 transition-all"
          >
            {isDetecting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Detecting GPS Coordinates...
              </>
            ) : (
              <>
                <Navigation className="w-5 h-5" />
                Use Current Location (GPS)
              </>
            )}
          </Button>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2 text-xs text-red-600 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-start gap-2 text-xs text-emerald-700 font-semibold">
              <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-1">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-100" />
          </div>
          <span className="relative px-3 bg-white text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Or select manually
          </span>
        </div>

        {/* Popular Cities Quick Select */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
            Popular Cities
          </h4>
          <div className="flex flex-wrap gap-2">
            {POPULAR_CITIES.map((cityName) => {
              const isSelected = selectedCity.toLowerCase() === cityName.toLowerCase();
              return (
                <Badge
                  key={cityName}
                  onClick={() => handleSelectCity(cityName)}
                  className={`cursor-pointer px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all border ${
                    isSelected
                      ? "bg-[#E7F4F1] text-[#0D9373] border-[#0D9373] hover:bg-[#E7F4F1]"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  {cityName}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Search All Cities Autocomplete */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
            Search All Cities of India
          </h4>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by city or state name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 border-slate-200 focus:border-[#0D9373] rounded-2xl text-slate-800 text-sm font-semibold"
            />
          </div>

          {/* Search Result List */}
          <div className="max-h-[160px] overflow-y-auto divide-y divide-slate-50 border border-slate-100 rounded-2xl scrollbar-thin">
            {filteredCities.length > 0 ? (
              filteredCities.map((city) => {
                const isSelected = selectedCity.toLowerCase() === city.name.toLowerCase();
                return (
                  <button
                    key={city.name}
                    type="button"
                    onClick={() => handleSelectCity(city.name)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50 transition-colors focus:outline-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <Landmark className="w-4 h-4 text-slate-400" />
                      <div>
                        <span className="text-sm font-bold text-slate-800 block leading-tight">
                          {city.name}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">
                          {city.state}, India
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#0D9373] shrink-0" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs font-semibold text-slate-400 flex flex-col items-center gap-1">
                <Compass className="w-6 h-6 text-slate-300 animate-spin" />
                <span>No official matching city found.</span>
                <button
                  onClick={() => handleSelectCity(searchQuery)}
                  className="text-[#0D9373] hover:underline font-extrabold mt-1 text-xs"
                >
                  Use "{searchQuery}" anyway
                </button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
