"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, Pill, FlaskConical, CreditCard,
  ChevronRight, Star, ShieldCheck, Truck, Clock, 
  CheckCircle2, Video, ChevronDown, ChevronUp,
  Percent, ThumbsUp, Building2, ShoppingBag, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import LocationSelectorModal from "@/components/shared/LocationSelectorModal";
import FuzzySearchBar from "@/components/shared/FuzzySearchBar";
import SpecialistSection from "@/components/shared/SpecialistSection";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";
import { useRequireAuth } from "@/hooks/useRequireAuth";

// ── CONSTANTS ────────────────────────────────────────────────────────────

const POPULAR_SEARCH_TAGS = [
  { text: "Cold & Flu", href: "/medicines?search=cold" },
  { text: "Full Body Checkup", href: "/labs" },
  { text: "Dermatologist", href: "/consult?specialty=Dermatologist" },
  { text: "Diabetes Care", href: "/medicines?category=Diabetes%20Care" },
  { text: "Cetaphil", href: "/medicines?search=cetaphil" }
];

const SERVICES = [
  { 
    title: "Order Medicines", 
    desc: "100% Genuine. Free Delivery in 2 Hours.", 
    tTitleKey: "nav.medicines",
    tDescKey: "quick.descMedicines",
    tCtaKey: "quick.shopNow",
    icon: Pill, 
    href: "/medicines", 
    cta: "Shop Now",
    gradient: "from-[#FCEBE7] to-[#FFF5F2]",
    iconBg: "bg-[#FCEBE7]",
    iconColor: "text-[#E8593C]"
  },
  { 
    title: "Consult Specialists", 
    desc: "Chat online with verified doctors in 10 mins.", 
    tTitleKey: "nav.consult",
    tDescKey: "quick.descConsult",
    tCtaKey: "quick.consultNow",
    icon: MessageSquare, 
    href: "/consult", 
    cta: "Consult Now",
    gradient: "from-[#E7F4F1] to-[#F3FAF8]",
    iconBg: "bg-[#E7F4F1]",
    iconColor: "text-[#0D9373]"
  },
  { 
    title: "Book Lab Tests", 
    desc: "Free hygienic sample pickup from your home.", 
    tTitleKey: "nav.labs",
    tDescKey: "quick.descLabs",
    tCtaKey: "quick.bookTest",
    icon: FlaskConical, 
    href: "/labs", 
    cta: "Book Test",
    gradient: "from-[#FFFBEB] to-[#FEF3C7]",
    iconBg: "bg-[#FEF3C7]",
    iconColor: "text-[#D97706]"
  },
  { 
    title: "Health Insurance", 
    desc: "Affordable health plans for individuals, families, and enterprises.", 
    tTitleKey: "quick.healthInsuranceTitle",
    tDescKey: "quick.healthInsuranceDesc",
    tCtaKey: "quick.getInsurance",
    icon: ShieldCheck, 
    href: "/insurance", 
    cta: "Get Insurance",
    gradient: "from-[#EEF2FF] to-[#E0E7FF]",
    iconBg: "bg-[#E0E7FF]",
    iconColor: "text-indigo-600"
  }
];

const PROMO_CARDS = [
  {
    title: "Start Your Consultation",
    desc: "Get free medical advice from our trusted panel of General Physicians.",
    href: "/consult",
    cta: "Start Now",
    icon: MessageSquare,
    gradient: "from-[#E7F4F1] to-[#F3FAF8]",
    iconBg: "bg-[#E7F4F1]",
    iconColor: "text-[#0D9373]"
  },
  {
    title: "Comprehensive Health Screen",
    desc: "Identify early health warning signs with comprehensive blood & urine parameters.",
    href: "/labs",
    cta: "Start Now",
    icon: FlaskConical,
    gradient: "from-[#FFFBEB] to-[#FEF3C7]",
    iconBg: "bg-[#FEF3C7]",
    iconColor: "text-[#D97706]"
  },
  {
    title: "Order Genuine Medicine",
    desc: "Let our verified pharmacists read your prescription & prepare your cart.",
    href: "/pharmacy",
    cta: "Start Now",
    icon: Pill,
    gradient: "from-[#FCEBE7] to-[#FFF5F2]",
    iconBg: "bg-[#FCEBE7]",
    iconColor: "text-[#E8593C]"
  },
  {
    title: "Affordable Health Insurance",
    desc: "Choose from best health insurance plans and term plans tailored for you and your family.",
    href: "/insurance",
    cta: "Start Now",
    icon: ShieldCheck,
    gradient: "from-[#EEF2FF] to-[#E0E7FF]",
    iconBg: "bg-[#E0E7FF]",
    iconColor: "text-indigo-600"
  }
];


const FALLBACK_TESTIMONIALS = [
  {
    text: "Saved almost 40% on my father's chronic diabetes medications, and they were delivered in just 2 hours! The customer support is absolutely elite.",
    tKey: "testimonials.sunilVermaText",
    user: "Sunil Verma",
    location: "Amritsar",
    tag: "Genuine Medicines Ordered",
    rating: 5
  },
  {
    text: "Consulted Dr. Jenkins online at 11 PM for emergency chest congestion. Had my prescription PDF in 10 mins! Truly life-saving service.",
    tKey: "testimonials.priyaSharmaText",
    user: "Priya Sharma",
    location: "Chandigarh",
    tag: "Doctor Consultation Completed",
    rating: 5
  },
  {
    text: "The phlebotomist who came for the home collection was highly professional. Clean, painless draw and reports arrived in my WhatsApp in 12 hours.",
    tKey: "testimonials.karanMalhotraText",
    user: "Karan Malhotra",
    location: "Jalandhar",
    tag: "Full Body Checkup Done",
    rating: 5
  }
];

const FAQS = [
  {
    q: "How do I upload a prescription to buy medicines?",
    a: "It's extremely simple! Navigate to our 'Order Medicines' page. You can click on 'Upload Prescription', select your doctor's PDF or image, and click Submit. Our NABL-verified pharmacist will review the notes, prepare your medicine cart, and send a checkout link to your account in under 10 minutes."
  },
  {
    q: "How does the home sample collection for diagnostic tests work?",
    a: "Once you book a diagnostic test or full body checkup, our certified, hygienic phlebotomist is dispatched to your selected address at your selected time slot. They collect samples using single-use vacuum tubes in sterilized packages. Samples are sent to our NABL-accredited partner laboratory immediately in temperature-controlled kits. Reports are delivered digitally in 12-24 hours."
  },
  {
    q: "Are the doctors on Altruist verified and qualified?",
    a: "Absolutely. Altruist enforces a zero-exception verification policy. Every doctor registered on our platform holds certified medical degrees (MBBS, MD, MS, DM) from recognized national/international universities and is verified through the National Medical Commission (NMC) or State Medical Councils. We perform thorough credentials checks before licensing."
  },
  {
    q: "Is Altruist safe and secure for my records?",
    a: "Yes. Security is our paramount non-negotiable rule. Your patient PII, consulting chats, and digital prescriptions are encrypted both in transit and at rest. We utilize Supabase Row Level Security (RLS) policies to ensure that absolutely no one except you and your authorized practitioner can view your private medical history."
  }
];

export default function RedesignedHomePage() {
  const { t } = useLanguage();
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  const { addItem } = useCartStore();
  const requireAuth = useRequireAuth();

  const [medicines, setMedicines] = useState<any[]>([]);
  const [medicinesLoading, setMedicinesLoading] = useState(true);
  const [labPackages, setLabPackages] = useState<any[]>([]);
  const [labPackagesLoading, setLabPackagesLoading] = useState(true);
  const [topDoctors, setTopDoctors] = useState<any[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch medicines
    const fetchMedicines = async () => {
      try {
        const res = await fetch("/api/medicines?page=0&size=5");
        if (res.ok) {
          const data = await res.json();
          setMedicines(data.content || data || []);
        }
      } catch (err) {
        console.error("Failed to fetch medicines", err);
      } finally {
        setMedicinesLoading(false);
      }
    };

    // 2. Fetch lab packages
    const fetchLabPackages = async () => {
      try {
        const res = await fetch("/api/lab-packages");
        if (res.ok) {
          const data = await res.json();
          setLabPackages(data || []);
        }
      } catch (err) {
        console.error("Failed to fetch lab packages", err);
      } finally {
        setLabPackagesLoading(false);
      }
    };

    // 3. Fetch top doctors
    const fetchTopDoctors = async () => {
      try {
        const res = await fetch("/api/doctors?size=5");
        if (res.ok) {
          const data = await res.json();
          setTopDoctors(data.content || data || []);
        }
      } catch (err) {
        console.error("Failed to fetch top doctors", err);
      } finally {
        setDoctorsLoading(false);
      }
    };

    // 4. Fetch testimonials
    const fetchTestimonials = async () => {
      try {
        const res = await fetch("/api/testimonials?featured=true&limit=3");
        if (res.ok) {
          const data = await res.json();
          setTestimonials(data || []);
        } else {
          setTestimonials([]);
        }
      } catch (err) {
        console.error("Failed to fetch testimonials", err);
        setTestimonials([]);
      } finally {
        setTestimonialsLoading(false);
      }
    };

    fetchMedicines();
    fetchLabPackages();
    fetchTopDoctors();
    fetchTestimonials();
  }, []);

  const handleAddProduct = (prod: any) => {
    const originalPrice = prod.price !== undefined ? prod.price : prod.originalPrice;
    const discountedPrice = prod.discountedPrice !== undefined ? prod.discountedPrice : prod.discountPrice;
    const brandName = prod.manufacturer || prod.brand;
    addItem({
      id: prod.id,
      name: prod.name,
      manufacturer: brandName,
      price: originalPrice,
      discountedPrice: discountedPrice,
      requiresPrescription: prod.requiresPrescription,
      quantity: 1
    });
    toast.success(`${prod.name} added to cart successfully! 🛒`, {
      description: `Manufacturer: ${brandName} • Saved ₹${originalPrice - discountedPrice}`
    });
  };

  const toggleFaq = (index: number) => {
    setFaqOpenIndex(faqOpenIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans antialiased text-slate-900 pb-16">
      
      {/* 1. HERO SECTION WITH MODERN GLASSMORPHISM & DYNAMIC PATTERN */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#0D9373] to-[#0A7A5F] py-20 lg:py-24 text-white">
        {/* Subtle geometric pattern in background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="absolute top-[-50px] right-[-100px] w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-30 flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Hero Left Content */}
          <div className="w-full lg:w-3/5 space-y-6 text-left">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
              {t("hero.title1")} <br className="hidden md:block" />
              <span className="text-emerald-300">{t("hero.title2")}</span>
            </h1>
            
            <p className="text-slate-100 text-base md:text-lg max-w-xl font-medium leading-relaxed opacity-90">
              {t("hero.desc")}
            </p>
            
            {/* Fuzzy Search Bar — Fuse.js powered */}
            <FuzzySearchBar
              placeholder={t("hero.placeholder")}
              showLocationSelector={true}
              onLocationClick={() => setIsLocationOpen(true)}
            />

            {/* Quick searches */}
            <div className="flex flex-wrap gap-2 items-center text-xs text-slate-100 font-semibold pt-1">
              <span className="opacity-75">{t("hero.commonSearches")}</span>
              {POPULAR_SEARCH_TAGS.map((tag, idx) => (
                <Link key={idx} href={tag.href}>
                  <span className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full border border-white/10 cursor-pointer transition-colors">
                    {tag.text}
                  </span>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Hero Right: Borderless Premium Doctor Image */}
          <div className="w-full lg:w-2/5 flex justify-center lg:justify-end select-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="relative w-full max-w-[380px] aspect-[4/5]"
            >
              {/* Soft decorative glow behind the doctor */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-teal-400/20 to-emerald-400/20 rounded-full blur-[60px] opacity-75 animate-pulse pointer-events-none" />
              
              <img 
                src="/hero_doctor.png" 
                alt="Altruist Wellness Doctors" 
                className="w-full h-full object-cover relative z-10 rounded-[32px] drop-shadow-[0_15px_30px_rgba(13,148,136,0.3)]" 
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. DYNAMIC PROMO CARDS */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 mb-16 mt-16 md:mt-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PROMO_CARDS.map((card, i) => (
            <Link key={i} href={card.href} className="h-full block">
              <Card className="border-none shadow-md hover:shadow-2xl transition-all cursor-pointer group bg-white rounded-3xl h-full overflow-hidden flex flex-col justify-between">
                <CardContent className={`p-6 bg-gradient-to-b ${card.gradient} h-full flex flex-col justify-between`}>
                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-2xl ${card.iconBg} ${card.iconColor} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                      <card.icon className="w-6 h-6" strokeWidth={2.5} />
                    </div>
                    
                    <div>
                      <h3 className="font-black text-slate-900 text-lg mb-1 group-hover:text-[#0D9373] transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                        {card.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 flex items-center justify-between text-sm font-extrabold text-slate-700">
                    <span className="group-hover:text-[#0D9373] transition-colors">{card.cta}</span>
                    <div className="w-7 h-7 rounded-full bg-white shadow flex items-center justify-center group-hover:bg-[#0D9373] group-hover:text-white transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. CORE SERVICES QUICK ACTION GRID */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 mb-16">
        <div className="text-center md:text-left mb-8">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t("quick.title")}
          </h2>
          <p className="text-slate-500 text-sm font-semibold mt-1">
            {t("quick.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((serv, index) => (
            <Link key={index} href={serv.href}>
              <Card className="border-none shadow-md hover:shadow-2xl transition-all cursor-pointer group bg-white rounded-3xl h-full overflow-hidden flex flex-col justify-between">
                <CardContent className={`p-6 bg-gradient-to-b ${serv.gradient} h-full flex flex-col justify-between`}>
                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-2xl ${serv.iconBg} ${serv.iconColor} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                      <serv.icon className="w-6 h-6" strokeWidth={2.5} />
                    </div>
                    
                    <div>
                      <h3 className="font-black text-slate-900 text-lg mb-1 group-hover:text-[#0D9373] transition-colors">
                        {t(serv.tTitleKey)}
                      </h3>
                      <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                        {t(serv.tDescKey)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 flex items-center justify-between text-sm font-extrabold text-slate-700">
                    <span className="group-hover:text-[#0D9373] transition-colors">{t(serv.tCtaKey)}</span>
                    <div className="w-7 h-7 rounded-full bg-white shadow flex items-center justify-center group-hover:bg-[#0D9373] group-hover:text-white transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. CONSULT TOP SPECIALISTS — live data from /api/doctors/specialties */}
      <SpecialistSection />

      {/* 5. BEST SELLERS IN MEDICINES & HEALTH PRODUCTS (DYNAMIC ADD TO CART!) */}
      {!medicinesLoading && medicines.length === 0 ? null : (
        <section className="max-w-7xl mx-auto px-6 md:px-8 mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <ShoppingBag className="text-[#E8593C]" /> {t("bestSellers.title")}
              </h2>
              <p className="text-slate-500 text-sm font-semibold mt-1">
                {t("bestSellers.subtitle")}
              </p>
            </div>
            <Link href="/medicines">
              <Button className="bg-[#FFF5F2] hover:bg-[#E8593C] text-[#E8593C] hover:text-white font-extrabold rounded-xl shadow-sm border-none transition-all active:scale-95">
                {t("bestSellers.exploreStore")} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {medicinesLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl border border-slate-200 p-4 h-[280px] flex flex-col animate-pulse">
                  <div className="h-36 bg-slate-100 rounded-2xl mb-4" />
                  <div className="h-4 bg-slate-100 rounded-md w-3/4 mb-2" />
                  <div className="h-3 bg-slate-100 rounded-md w-1/2 mb-auto" />
                  <div className="h-8 bg-slate-100 rounded-md w-full mt-4" />
                </div>
              ))
            ) : (
              medicines.map((prod) => {
                const originalPrice = prod.price !== undefined ? prod.price : prod.originalPrice;
                const discountedPrice = prod.discountedPrice !== undefined ? prod.discountedPrice : prod.discountPrice;
                const brandName = prod.manufacturer || prod.brand;
                const imageUrl = prod.imageUrl || prod.img;
                const discountPercent = prod.discountPercent || 
                  (originalPrice && discountedPrice && originalPrice > discountedPrice
                    ? Math.round((1 - (discountedPrice / originalPrice)) * 100)
                    : 0);

                return (
                  <Card key={prod.id} className="border-none shadow-md hover:shadow-2xl transition-all rounded-3xl bg-white overflow-hidden flex flex-col justify-between h-full group">
                    <div className="p-4 flex flex-col gap-3">
                      {/* Product Image */}
                      <div className="h-36 w-full rounded-2xl overflow-hidden bg-slate-50 relative flex items-center justify-center flex-shrink-0">
                        <img 
                          src={imageUrl || "https://images.unsplash.com/photo-1584308666744-24d5e1a3bcbe?w=400&h=400&fit=crop&q=80"} 
                          alt={prod.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {discountPercent > 0 && (
                          <Badge className="absolute top-2 left-2 bg-red-500 text-white border-none py-0.5 px-2 font-bold text-[9px] rounded">
                            {discountPercent}% OFF
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider leading-none">
                          {brandName}
                        </span>
                        <h3 className="font-bold text-sm text-slate-800 line-clamp-2 leading-snug h-10 group-hover:text-[#E8593C] transition-colors">
                          {prod.name}
                        </h3>
                      </div>
                    </div>

                    {/* Price & Add to Cart */}
                    <div className="px-4 pb-4 pt-2 border-t border-slate-50 flex items-center justify-between">
                      <div>
                        {originalPrice > discountedPrice && (
                          <span className="text-[10px] text-slate-400 line-through block font-medium leading-none">₹{originalPrice}</span>
                        )}
                        <span className="text-base font-black text-slate-900 leading-none">₹{discountedPrice}</span>
                      </div>

                      <Button 
                        onClick={() => requireAuth(() => handleAddProduct(prod), "/")}
                        size="sm"
                        className="h-8 px-3 rounded-full bg-[#E7F4F1] hover:bg-[#0D9373] text-[#0D9373] hover:text-white font-extrabold flex items-center gap-1 shadow-inner border-none transition-colors"
                      >
                        <Plus size={14} /> {t("bestSellers.add")}
                      </Button>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </section>
      )}

      {/* 6. FEATURED LAB TESTS ( tata 1mg styled ) WITH PREMIUM LAB IMAGES */}
      {!labPackagesLoading && labPackages.length === 0 ? null : (
        <section className="max-w-7xl mx-auto px-6 md:px-8 mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                {t("labPackages.title")}
              </h2>
              <p className="text-slate-500 text-sm font-semibold mt-1">
                {t("labPackages.subtitle")}
              </p>
            </div>
            <Link href="/labs">
              <Button className="bg-[#FFFBEB] hover:bg-amber-500 text-amber-700 hover:text-white font-extrabold rounded-xl shadow-sm border-none transition-all active:scale-95">
                {t("labPackages.exploreTests")} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {labPackagesLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl border border-slate-200 p-6 h-[340px] flex flex-col animate-pulse">
                  <div className="h-40 bg-slate-100 rounded-2xl mb-4" />
                  <div className="h-4 bg-slate-100 rounded-md w-3/4 mb-2" />
                  <div className="h-3 bg-slate-100 rounded-md w-1/2 mb-auto" />
                  <div className="h-8 bg-slate-100 rounded-md w-full mt-4" />
                </div>
              ))
            ) : (
              labPackages.map((pkg, i) => {
                const title = pkg.name;
                const testsCount = pkg.includesTestCount;
                const parameters = pkg.testNames || [];
                const originalPrice = pkg.originalPrice;
                const discountPrice = pkg.discountedPrice || pkg.originalPrice;
                const discountText = pkg.discountPercent ? `${pkg.discountPercent}% OFF` : "";
                const duration = "Reports in 24 Hrs";
                const features = pkg.smartReportIncluded ? ["Free Home Collection", "Smart Report Included"] : ["Free Home Collection"];
                const badge = pkg.discountPercent && pkg.discountPercent >= 50 ? "BEST SELLER" : "POPULAR";

                let img = "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=300&h=200&fit=crop&q=80";
                if (title && title.toLowerCase().includes("diabetes")) {
                  img = "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&h=400&fit=crop&q=80";
                } else if (title && (title.toLowerCase().includes("fitness") || title.toLowerCase().includes("joint"))) {
                  img = "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=600&h=400&fit=crop&q=80";
                }

                return (
                  <Card key={pkg.id || i} className="border-none shadow-md hover:shadow-2xl transition-all rounded-3xl bg-white overflow-hidden flex flex-col justify-between group">
                    {/* Card Banner Image */}
                    <div className="h-40 w-full overflow-hidden bg-slate-100 relative">
                      <img 
                        src={img} 
                        alt={title} 
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <Badge className="absolute top-4 left-4 bg-emerald-500 text-white border-none px-3 py-1 font-black text-xs tracking-wider rounded-lg">
                        {badge}
                      </Badge>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="font-black text-lg text-white leading-tight drop-shadow-md">
                          {title}
                        </h3>
                      </div>
                    </div>

                    <CardContent className="p-6 flex flex-col h-full justify-between gap-6">
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-xs font-black text-[#0D9373] bg-[#E7F4F1] px-2.5 py-0.5 rounded-full">
                            {testsCount} {t("labPackages.testParameters")}
                          </span>
                          <span className="text-xs text-slate-400 font-bold flex items-center">
                            <Clock className="w-3.5 h-3.5 mr-1" /> {duration}
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t("labPackages.includesChecks")}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {parameters.map((p: string, pIdx: number) => (
                              <span key={pIdx} className="bg-slate-50 text-slate-600 font-semibold px-2 py-1 rounded-md text-[10px] border border-slate-100">
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-3">
                          {features.map((feat: string, fIdx: number) => (
                            <span key={fIdx} className="inline-flex items-center text-xs font-bold text-emerald-600">
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {feat}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            {originalPrice > discountPrice && (
                              <span className="text-xs font-bold text-slate-400 line-through">₹{originalPrice}</span>
                            )}
                            <div className="flex items-center gap-1.5">
                              <span className="text-2xl font-black text-slate-900">₹{discountPrice}</span>
                              {discountText && (
                                <Badge className="bg-red-500 text-white border-none font-extrabold text-[10px] rounded px-1.5 py-0.5">
                                  {discountText}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <Button 
                            onClick={() => requireAuth(() => toast.success(`Booking initiated for ${title}! Our representative will contact you shortly.`, { icon: "🧪" }), "/")}
                            className="bg-[#0D9373] hover:bg-[#0A7A5F] text-white font-extrabold rounded-full px-6 shadow-sm border-none"
                          >
                            {t("labPackages.bookNow")}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </section>
      )}

      {/* 7. TRUSTED BRAND BLOCK */}
      <section className="py-16 bg-[#0F172A] text-white mb-16 relative overflow-hidden">
        {/* Abstract background light */}
        <div className="absolute left-[-100px] bottom-[-100px] w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {t("trust.title")}
            </h2>
            <p className="text-slate-400 text-sm font-semibold mt-1">
              {t("trust.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left divide-y md:divide-y-0 md:divide-x divide-slate-800">
            <div className="flex flex-col items-center md:items-start p-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white">{t("trust.card1Title")}</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-semibold">
                {t("trust.card1Desc")}
              </p>
            </div>

            <div className="flex flex-col items-center md:items-start p-4 space-y-3 pt-6 md:pt-0">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white">{t("trust.card2Title")}</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-semibold">
                {t("trust.card2Desc")}
              </p>
            </div>

            <div className="flex flex-col items-center md:items-start p-4 space-y-3 pt-6 md:pt-0">
              <div className="w-12 h-12 rounded-2xl bg-[#E8593C]/10 text-[#E8593C] flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white">{t("trust.card3Title")}</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-semibold">
                {t("trust.card3Desc")}
              </p>
            </div>

            <div className="flex flex-col items-center md:items-start p-4 space-y-3 pt-6 md:pt-0">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white">{t("trust.card4Title")}</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-semibold">
                {t("trust.card4Desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. TOP DOCTORS ( CAROUSEL / GRID ) */}
      {!doctorsLoading && (topDoctors.length === 0 || !topDoctors.some(doc => (doc.rating || 0) > 0)) ? null : (
        <section className="max-w-7xl mx-auto px-6 md:px-8 mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                {t("topDoctors.title")}
              </h2>
              <p className="text-slate-500 text-sm font-semibold mt-1">
                {t("topDoctors.subtitle")}
              </p>
            </div>
            <Link href="/consult">
              <Button className="bg-[#FFF5F2] hover:bg-[#E8593C] text-[#E8593C] hover:text-white font-extrabold rounded-xl shadow-sm border-none transition-all active:scale-95">
                {t("topDoctors.consultDoctor")} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="flex overflow-x-auto gap-6 pb-6 snap-x scrollbar-thin scrollbar-thumb-emerald-600 scrollbar-track-slate-100">
            {doctorsLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="min-w-[280px] md:min-w-[320px] bg-white border border-slate-200 p-5 rounded-3xl animate-pulse flex flex-col gap-4">
                  <div className="flex gap-4 items-start">
                    <div className="w-16 h-16 rounded-full bg-slate-100 shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-slate-100 rounded w-3/4" />
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                      <div className="h-4 bg-slate-100 rounded w-1/3" />
                    </div>
                  </div>
                  <div className="h-4 bg-slate-100 rounded w-1/4" />
                  <div className="h-8 bg-slate-100 rounded w-full mt-4" />
                </div>
              ))
            ) : (
              topDoctors.map((doc, idx) => {
                const spec = doc.specialization || doc.spec;
                const exp = doc.experienceYears !== undefined ? `${doc.experienceYears}+ Yrs Exp` : doc.exp;
                const fee = doc.consultationFee !== undefined ? doc.consultationFee : doc.fee;
                const img = doc.profilePictureUrl || doc.img;
                const reviews = doc.totalConsultations !== undefined ? doc.totalConsultations : (doc.reviews || 120);

                return (
                  <Card key={doc.id || idx} className="min-w-[280px] md:min-w-[320px] border-none shadow-md snap-start shrink-0 hover:shadow-2xl transition-all rounded-3xl bg-white overflow-hidden flex flex-col justify-between">
                    <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
                      <div className="flex gap-4 items-start">
                        <Avatar className="w-16 h-16 border-2 border-emerald-500/10 shadow-inner shrink-0">
                          <AvatarImage src={img} alt={doc.name} className="object-cover" />
                          <AvatarFallback className="bg-[#E7F4F1] text-[#0D9373] font-bold">
                            {doc.name ? doc.name.split(" ").slice(-1)[0]?.charAt(0) : "D"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-black text-base text-slate-900 leading-tight">{doc.name}</h3>
                          <p className="text-xs text-slate-500 font-bold">{spec}</p>
                          <Badge className="mt-1 bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100 px-2 py-0.5 text-[10px] font-bold rounded-md">
                            {exp}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 text-sm font-bold text-slate-800">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" /> {doc.rating} 
                        <span className="text-slate-400 font-normal ml-1">({reviews} {t("topDoctors.reviews")})</span>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">{t("topDoctors.fee")}</p>
                          <p className="font-black text-lg text-slate-900">₹{fee}</p>
                        </div>
                        <Link href="/consult">
                          <Button className="bg-[#E8593C] hover:bg-[#D14A30] text-white font-extrabold rounded-full px-6 shadow-sm border-none">
                            {t("topDoctors.consultNow")}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </section>
      )}


      {/* 10. TESTIMONIALS SLIDER SECTION */}
      {!testimonialsLoading && testimonials.length === 0 ? null : (
        <section className="max-w-7xl mx-auto px-6 md:px-8 mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t("testimonials.title")}
            </h2>
            <p className="text-slate-500 text-sm font-semibold mt-1">
              {t("testimonials.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonialsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl border border-slate-200 p-6 h-[200px] flex flex-col animate-pulse space-y-4">
                  <div className="h-4 bg-slate-100 rounded w-1/4" />
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              ))
            ) : (
              testimonials.map((tItem, idx) => (
                <Card key={idx} className="border-none shadow-md rounded-3xl bg-white flex flex-col justify-between">
                  <CardContent className="p-6 flex flex-col justify-between h-full gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-0.5">
                        {[...Array(tItem.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                        ))}
                      </div>
                      <p className="text-slate-600 text-sm font-medium leading-relaxed italic text-left">
                        "{tItem.tKey ? t(tItem.tKey) : tItem.text}"
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                      <div className="text-left">
                        <h4 className="font-black text-sm text-slate-900">{tItem.user}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{tItem.location}</p>
                      </div>
                      {tItem.tag && (
                        <Badge className="bg-emerald-50 text-[#0D9373] border-none px-2 py-0.5 text-[9px] font-black tracking-widest rounded-md uppercase">
                          {tItem.tag}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>
      )}

      {/* 11. FAQS COMPONENT ( ACCORDION-STYLED ) */}
      <section className="max-w-4xl mx-auto px-6 md:px-8 mt-8">
        <div className="text-center mb-10">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t("faqs.title")}
          </h2>
          <p className="text-slate-500 text-sm font-semibold mt-1">
            {t("faqs.subtitle")}
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = faqOpenIndex === index;
            return (
              <div 
                key={index} 
                className="border-none rounded-2xl bg-white shadow-md overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-sm md:text-base text-slate-800 hover:text-[#0D9373] transition-colors focus:outline-none"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-[#0D9373] shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>
                
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-5 pb-5 pt-1 text-xs md:text-sm text-slate-500 leading-relaxed font-medium border-t border-slate-50">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* Location Selector Modal */}
      <LocationSelectorModal 
        isOpen={isLocationOpen} 
        onClose={() => setIsLocationOpen(false)} 
      />
    </div>
  );
}
