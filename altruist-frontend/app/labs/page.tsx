"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, ShieldCheck, Clock, Activity, Target, 
  Microscope, Heart, Syringe, Brain, Bone, Baby, 
  Pill, FileText, ChevronRight, Plus, CheckCircle2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import LabBookingModal from "@/components/shared/LabBookingModal";

const CATEGORIES = [
  "All", "Full Body Checkup", "Diabetes", "Heart", "Blood Studies", "Vitamin", "Thyroid"
];

const HEALTH_CHECKS = [
  { name: "Full Body Checkup", icon: <Activity className="text-blue-500" size={32} />, color: "bg-blue-50" },
  { name: "Diabetes", icon: <Syringe className="text-red-500" size={32} />, color: "bg-red-50" },
  { name: "Heart", icon: <Heart className="text-rose-500" size={32} />, color: "bg-rose-50" },
  { name: "Blood Studies", icon: <Microscope className="text-purple-500" size={32} />, color: "bg-purple-50" },
  { name: "Vitamin", icon: <Pill className="text-orange-500" size={32} />, color: "bg-orange-50" },
  { name: "Thyroid", icon: <Target className="text-teal-500" size={32} />, color: "bg-teal-50" },
  { name: "Kidney", icon: <Activity className="text-amber-500" size={32} />, color: "bg-amber-50" },
  { name: "Liver", icon: <Activity className="text-lime-500" size={32} />, color: "bg-lime-50" },
  { name: "Women's Health", icon: <Baby className="text-pink-500" size={32} />, color: "bg-pink-50" },
  { name: "Senior Citizen", icon: <Bone className="text-slate-500" size={32} />, color: "bg-slate-100" },
  { name: "Fever", icon: <Target className="text-red-600" size={32} />, color: "bg-red-100" },
  { name: "Allergy", icon: <Microscope className="text-emerald-500" size={32} />, color: "bg-emerald-50" }
];

interface LabTest {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number; // Original Price
  discountedPrice: number; // Discounted Price
  discountPercent: number;
  includesCount: number;
  isFeatured: boolean;
  isActive: boolean;
  parametersIncluded?: string[];
  reportTimeHours?: number;
  freeHomeCollection?: boolean;
}

interface LabPackage {
  id: string;
  name: string;
  description: string;
  includesTestCount: number;
  testNames: string[]; // text[] from backend serialized as json array
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  smartReportIncluded: boolean;
  isActive: boolean;
}

export default function LabsPage() {
  const router = useRouter();
  const requireAuth = useRequireAuth();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [topTests, setTopTests] = useState<LabTest[]>([]);
  const [topTestsLoading, setTopTestsLoading] = useState(true);
  const [topTestsShowEmpty, setTopTestsShowEmpty] = useState(false);

  const [packages, setPackages] = useState<LabPackage[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [packagesError, setPackagesError] = useState(false);

  useEffect(() => {
    // 8-second timeout fallback for featured tests
    const timer = setTimeout(() => {
      setTopTestsShowEmpty(true);
      setTopTestsLoading(false);
    }, 8000);

    const fetchTopTests = async () => {
      try {
        const res = await api.get("/lab-tests/featured");
        const data = res.data ?? [];
        setTopTests(data);
        if (data.length === 0) {
          setTopTestsShowEmpty(true);
        }
      } catch (err) {
        console.error("Failed to fetch featured lab tests:", err);
        setTopTestsShowEmpty(true);
      } finally {
        setTopTestsLoading(false);
        clearTimeout(timer);
      }
    };

    fetchTopTests();
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await api.get("/lab-packages");
        setPackages(res.data ?? []);
        setPackagesError(false);
      } catch (err) {
        console.error("Failed to fetch lab packages:", err);
        setPackagesError(true);
      } finally {
        setPackagesLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const [selectedBookingItem, setSelectedBookingItem] = useState<{
    id: string;
    name: string;
    price: number;
    type: "TEST" | "PACKAGE";
  } | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const handleBookClick = (item: { id: string; name: string; price: number; type: "TEST" | "PACKAGE" }) => {
    requireAuth(() => {
      setSelectedBookingItem(item);
      setIsBookingOpen(true);
    }, `/labs?book${item.type === "TEST" ? "TestId" : "PackageId"}=${item.id}`);
  };

  useEffect(() => {
    if (isMounted && topTests.length > 0 && packages.length > 0) {
      const searchParams = new URLSearchParams(window.location.search);
      const testId = searchParams.get("bookTestId");
      const packageId = searchParams.get("bookPackageId");
      
      if (testId) {
        const found = topTests.find(t => t.id === testId);
        if (found) {
          setSelectedBookingItem({
            id: found.id,
            name: found.name,
            price: found.discountedPrice,
            type: "TEST"
          });
          setIsBookingOpen(true);
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } else if (packageId) {
        const found = packages.find(p => p.id === packageId);
        if (found) {
          setSelectedBookingItem({
            id: found.id,
            name: found.name,
            price: found.discountedPrice,
            type: "PACKAGE"
          });
          setIsBookingOpen(true);
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    }
  }, [isMounted, topTests, packages]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#0d5c3a] to-[#12774c] pt-12 pb-16 relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="w-full md:w-1/2 space-y-6">
              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
                Book Lab Tests at Home
              </h1>
              <p className="text-emerald-100 text-lg font-medium">Safe, secure, and reliable testing from certified partner labs.</p>
              
              {/* Search Bar */}
              <div className="relative max-w-xl">
                <Search size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search for lab tests, packages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 rounded-xl border-0 shadow-lg text-lg font-medium focus:ring-4 focus:ring-[#e8593c]/30 outline-none"
                />
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-4 mt-6">
                <div className="flex items-center gap-2 text-white/90 bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 text-sm font-bold">
                  <FileText size={16} /> Same Day Reports
                </div>
                <div className="flex items-center gap-2 text-white/90 bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 text-sm font-bold">
                  <Clock size={16} /> Home Sample Collection in 30 Mins
                </div>
                <div className="flex items-center gap-2 text-white/90 bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 text-sm font-bold">
                  <ShieldCheck size={16} /> 10,000+ Tests
                </div>
              </div>
            </div>

            <div className="hidden md:flex w-full md:w-1/2 justify-end relative h-[300px]">
               {/* Illustration Placeholder */}
               <div className="absolute inset-0 right-0 flex items-center justify-center">
                 <div className="w-64 h-64 bg-emerald-700/50 rounded-full blur-3xl absolute"></div>
                 <div className="w-72 h-72 z-10 flex items-center justify-center relative">
                    {/* Character */}
                    <div className="w-32 h-56 bg-emerald-50 rounded-full border-8 border-white flex flex-col items-center pt-8 shadow-2xl relative overflow-hidden">
                      <div className="w-16 h-16 bg-pink-200 rounded-full mb-2"></div>
                      <div className="w-24 h-32 bg-white rounded-t-3xl border-t-4 border-slate-100 flex items-center justify-center">
                         <Activity size={32} className="text-[#0d5c3a]" />
                      </div>
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-12">
        {/* Horizontal Category Filter Pills */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide mb-8">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={cn(
                "whitespace-nowrap px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm border",
                activeCategory === c 
                  ? "bg-[#e8593c] text-white border-[#e8593c]" 
                  : "bg-white text-slate-600 border-slate-200 hover:border-[#0d5c3a] hover:text-[#0d5c3a]"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Doctor Created Health Checks Grid */}
        <div className="mb-16">
          <h2 className="text-2xl font-black text-[#0F172A] mb-6">Doctor Created Health Checks</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {HEALTH_CHECKS.map((check, i) => (
              <div key={i} className="group bg-white rounded-2xl border border-slate-200 p-5 flex flex-col items-center text-center cursor-pointer hover:border-[#0d5c3a] hover:shadow-md transition-all">
                <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform", check.color)}>
                  {check.icon}
                </div>
                <span className="text-sm font-bold text-slate-700">{check.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Booked Tests Horizontal Scroll */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-[#0F172A]">Top Booked Tests</h2>
            <button className="text-[#e8593c] font-bold text-sm hover:underline">View All</button>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x">
            {!isMounted || topTestsLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 min-w-[280px] max-w-[280px] flex flex-col snap-start animate-pulse h-[180px]">
                  <div className="flex-1">
                    <div className="h-6 bg-slate-100 rounded-md w-3/4 mb-2" />
                    <div className="h-5 bg-slate-100 rounded-md w-1/3 mb-4" />
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-end justify-between">
                    <div className="space-y-1">
                      <div className="h-3 bg-slate-100 rounded w-16" />
                      <div className="h-6 bg-slate-100 rounded w-12" />
                    </div>
                    <div className="h-9 bg-slate-100 rounded-lg w-16" />
                  </div>
                </div>
              ))
            ) : topTestsShowEmpty || topTests.length === 0 ? (
              <div className="py-8 text-center text-slate-500 font-medium w-full">
                Tests will be available soon
              </div>
            ) : (
              topTests.map((test) => (
                <div key={test.id} className="bg-white rounded-3xl border border-slate-200 p-6 min-w-[320px] max-w-[320px] flex flex-col justify-between snap-start hover:shadow-lg transition-all relative overflow-hidden group">
                  <div className="flex-1 flex flex-col gap-4">
                    {/* Header: Title & Badges */}
                    <div>
                      <h3 className="font-extrabold text-[#0F172A] text-lg leading-snug group-hover:text-primary transition-colors mb-2">
                        {test.name}
                      </h3>
                      {test.description && (
                        <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed mb-3">
                          {test.description}
                        </p>
                      )}
                    </div>

                    {/* Includes Parameters badge */}
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-[11px] font-black text-[#0d5c3a] bg-emerald-50 border border-emerald-100/50 px-2.5 py-0.5 rounded-full">
                        Includes {test.includesCount} Parameter{test.includesCount > 1 ? 's' : ''}
                      </span>
                      {test.reportTimeHours && (
                        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                          <Clock size={12} className="text-slate-400" /> {test.reportTimeHours} Hrs
                        </span>
                      )}
                    </div>

                    {/* Parameters list (chips/tag pills) */}
                    {test.parametersIncluded && test.parametersIncluded.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Checks Included</p>
                        <div className="flex flex-wrap gap-1.5">
                          {test.parametersIncluded.slice(0, 5).map((param, idx) => (
                            <span key={idx} className="bg-slate-50 text-slate-600 font-semibold px-2 py-0.5 rounded-md text-[10px] border border-slate-100">
                              {param}
                            </span>
                          ))}
                          {test.parametersIncluded.length > 5 && (
                            <span className="text-[10px] font-bold text-slate-400 self-center">
                              +{test.parametersIncluded.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Free home collection checkmark */}
                    {test.freeHomeCollection && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                        <CheckCircle2 size={13} className="text-emerald-500" /> Free Home Collection
                      </div>
                    )}
                  </div>

                  {/* Pricing and CTA Button */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-end justify-between">
                    <div>
                      {test.discountPercent > 0 && (
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs text-slate-400 line-through font-semibold">₹{test.price}</span>
                          <span className="text-[10px] bg-red-100 text-red-600 font-black px-1.5 py-0.5 rounded">
                            {test.discountPercent}% OFF
                          </span>
                        </div>
                      )}
                      <p className="text-2xl font-black text-[#0F172A]">₹{test.discountedPrice}</p>
                    </div>
                    <Button 
                      onClick={() => handleBookClick({
                        id: test.id,
                        name: test.name,
                        price: test.discountedPrice,
                        type: "TEST"
                      })}
                      className="bg-primary hover:bg-primary/95 text-white font-black h-10 px-5 rounded-2xl text-xs active:scale-95 transition-all shadow-md shadow-primary/10 border-none"
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Popular Health Checkup Packages */}
        <div className="mb-16">
          <h2 className="text-2xl font-black text-[#0F172A] mb-6">Popular Health Checkup Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {!isMounted || packagesLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col hover:shadow-lg transition-all relative overflow-hidden group animate-pulse h-[220px]">
                  <div className="absolute top-0 right-0 h-6 bg-slate-100 w-16 rounded-bl-xl" />
                  <div className="flex-1 mb-6 mt-2 space-y-3">
                    <div className="h-6 bg-slate-100 rounded-md w-3/4" />
                    <div className="h-4 bg-slate-100 rounded-md w-5/6" />
                    <div className="h-5 bg-slate-100 rounded-md w-1/2" />
                  </div>
                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="h-3 bg-slate-100 rounded w-20" />
                      <div className="h-7 bg-slate-100 rounded w-16" />
                    </div>
                    <div className="h-10 bg-slate-100 rounded-lg w-20" />
                  </div>
                </div>
              ))
            ) : packagesError || packages.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 font-medium">
                No health packages available at the moment. Check back soon.
              </div>
            ) : (
              packages.map((pkg) => (
                <div key={pkg.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col hover:shadow-lg transition-all relative overflow-hidden group">
                  <div className="absolute top-0 right-0 bg-[#e8593c] text-white text-[10px] font-black px-3 py-1 rounded-bl-xl tracking-wider z-10 shadow-sm">
                    PACKAGE
                  </div>
                  <div className="flex-1 mb-6 mt-2">
                    <h3 className="font-bold text-[#0F172A] text-lg leading-tight mb-2 pr-8">{pkg.name}</h3>
                    <p className="text-xs text-slate-500 font-medium mb-3">
                      Includes {pkg.includesTestCount} Tests ({pkg.testNames && pkg.testNames.length > 0 ? pkg.testNames.slice(0, 3).join(", ") + (pkg.testNames.length > 3 ? " & more" : "") : "Complete checkup"})
                    </p>
                    {pkg.smartReportIncluded && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded w-max border border-blue-100">
                        <FileText size={12} /> Smart Report Included
                      </div>
                    )}
                  </div>
                  <div className="mt-auto pt-4 border-t border-slate-100">
                     <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-slate-400 line-through font-semibold">₹{pkg.originalPrice}</span>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">Save {pkg.discountPercent}%</span>
                     </div>
                     <div className="flex items-center justify-between">
                        <p className="text-2xl font-black text-[#0F172A]">₹{pkg.discountedPrice}</p>
                        <Button 
                          onClick={() => handleBookClick({
                            id: pkg.id,
                            name: pkg.name,
                            price: pkg.discountedPrice,
                            type: "PACKAGE"
                          })}
                          className="bg-primary hover:bg-primary/90 text-white font-bold h-9 px-4 rounded-xl text-xs active:scale-95 transition-all"
                        >
                          Book Now
                        </Button>
                     </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <LabBookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        item={selectedBookingItem} 
      />
    </div>
  );
}
