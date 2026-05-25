"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, ShieldCheck, Clock, Activity, Target, 
  Microscope, Heart, Syringe, Brain, Bone, Baby, 
  Pill, FileText, ChevronRight, PhoneCall, Plus 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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

const TOP_TESTS = [
  { name: "Complete Blood Count (CBC)", includes: 24, originalPrice: 400, price: 300, discount: 25 },
  { name: "HbA1c (Glycosylated Hemoglobin)", includes: 1, originalPrice: 500, price: 350, discount: 30 },
  { name: "Fasting Blood Sugar (FBS)", includes: 1, originalPrice: 150, price: 100, discount: 33 },
  { name: "Lipid Profile", includes: 8, originalPrice: 800, price: 600, discount: 25 },
  { name: "Vitamin D (25-OH)", includes: 1, originalPrice: 1200, price: 800, discount: 33 },
  { name: "Thyroid Profile (T3, T4, TSH)", includes: 3, originalPrice: 600, price: 450, discount: 25 }
];

const POPULAR_PACKAGES = [
  { name: "Aarogyam C Pro", tests: 91, originalPrice: 3500, price: 1499, discount: 57, isSmart: true },
  { name: "Comprehensive Full Body Checkup", tests: 75, originalPrice: 2800, price: 1299, discount: 53, isSmart: true },
  { name: "Basic Heart Health Package", tests: 45, originalPrice: 1500, price: 999, discount: 33, isSmart: false },
  { name: "Advanced Diabetic Profile", tests: 52, originalPrice: 2200, price: 1199, discount: 45, isSmart: true }
];

export default function LabsPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

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
            {TOP_TESTS.map((test, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 min-w-[280px] max-w-[280px] flex flex-col snap-start hover:shadow-md transition-all">
                <div className="flex-1">
                  <h3 className="font-bold text-[#0F172A] text-lg leading-tight mb-2">{test.name}</h3>
                  <div className="text-xs font-bold text-[#0d5c3a] bg-emerald-50 border border-emerald-100 px-2 py-1 rounded inline-block mb-4">
                    Includes {test.includes} Test{test.includes > 1 ? 's' : ''}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-end justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs text-slate-400 line-through">₹{test.originalPrice}</span>
                      <span className="text-[10px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded">{test.discount}% OFF</span>
                    </div>
                    <p className="text-xl font-black text-[#0F172A]">₹{test.price}</p>
                  </div>
                  <Button size="sm" className="bg-[#0d5c3a] hover:bg-[#0b5e39] text-white font-bold h-9 px-4 rounded-lg">
                    Add
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Health Checkup Packages */}
        <div className="mb-16">
          <h2 className="text-2xl font-black text-[#0F172A] mb-6">Popular Health Checkup Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {POPULAR_PACKAGES.map((pkg, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col hover:shadow-lg transition-all relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-[#e8593c] text-white text-[10px] font-black px-3 py-1 rounded-bl-xl tracking-wider z-10 shadow-sm">
                  PACKAGE
                </div>
                <div className="flex-1 mb-6 mt-2">
                  <h3 className="font-bold text-[#0F172A] text-lg leading-tight mb-2 pr-8">{pkg.name}</h3>
                  <p className="text-xs text-slate-500 font-medium mb-3">Includes {pkg.tests} Tests (Cholesterol, Thyroid, CBC & more)</p>
                  {pkg.isSmart && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded w-max border border-blue-100">
                      <FileText size={12} /> Smart Report Included
                    </div>
                  )}
                </div>
                <div className="mt-auto pt-4 border-t border-slate-100">
                   <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-slate-400 line-through font-semibold">₹{pkg.originalPrice}</span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">Save {pkg.discount}%</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <p className="text-2xl font-black text-[#0F172A]">₹{pkg.price}</p>
                      <Button className="bg-white border-2 border-[#0d5c3a] text-[#0d5c3a] hover:bg-[#0d5c3a] hover:text-white font-bold h-10 px-6 rounded-lg transition-colors">
                        Add <Plus size={16} className="ml-1" />
                      </Button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Footer CTA Banner */}
      <div className="max-w-[1400px] mx-auto px-6 mb-12">
        <div className="bg-[#fff7ed] border border-orange-100 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-sm">
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
              <PhoneCall size={32} className="text-[#e8593c]" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-[#0F172A] mb-1">Need Assistance?</h3>
              <p className="text-orange-900 font-medium">Call our health advisor to book your tests.</p>
            </div>
          </div>
          <div className="relative z-10 flex w-full md:w-auto max-w-md gap-3">
             <input type="text" placeholder="Enter Mobile Number" className="flex-1 h-12 rounded-xl border border-orange-200 px-4 font-medium outline-none focus:ring-2 focus:ring-orange-200" />
             <Button className="bg-[#e8593c] hover:bg-[#d6482e] text-white font-bold h-12 px-6 rounded-xl shadow-md whitespace-nowrap">
               Request Callback
             </Button>
          </div>
          {/* Bg graphic */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200/50 rounded-full blur-3xl -mr-20 -mt-20"></div>
        </div>
      </div>

    </div>
  );
}
