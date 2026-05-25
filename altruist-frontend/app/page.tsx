"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, MessageSquare, Pill, FlaskConical, CreditCard,
  ChevronRight, Star, ShieldCheck, Truck, Clock, 
  MapPin, CheckCircle2, Video, ChevronDown, ChevronUp,
  Percent, ThumbsUp, Building2, ShoppingBag, Plus, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLocationStore } from "@/store/locationStore";
import LocationSelectorModal from "@/components/shared/LocationSelectorModal";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";

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
    badge: "FLAT 18% OFF", 
    badgeColor: "bg-red-500",
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
    badge: "24/7 ACTIVE", 
    badgeColor: "bg-emerald-600",
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
    badge: "UP TO 60% OFF", 
    badgeColor: "bg-amber-500",
    icon: FlaskConical, 
    href: "/labs", 
    cta: "Book Test",
    gradient: "from-[#FFFBEB] to-[#FEF3C7]",
    iconBg: "bg-[#FEF3C7]",
    iconColor: "text-[#D97706]"
  },
  { 
    title: "About Us", 
    desc: "Learn more about Altruist Wellness and our mission.", 
    tTitleKey: "nav.aboutUs",
    tDescKey: "quick.descAboutUs",
    tCtaKey: "quick.learnMore",
    badge: "KNOW MORE", 
    badgeColor: "bg-blue-500",
    icon: Building2, 
    href: "/about", 
    cta: "Learn More",
    gradient: "from-[#EFF6FF] to-[#DBEAFE]",
    iconBg: "bg-[#DBEAFE]",
    iconColor: "text-[#2563EB]"
  }
];

const PROMO_CARDS = [
  {
    title: "First Consultation FREE 🩺",
    desc: "Get free medical advice from our trusted panel of General Physicians.",
    tTitleKey: "promo.promo1Title",
    tDescKey: "promo.promo1Desc",
    coupon: "ALTRUISTNEW",
    bg: "bg-gradient-to-br from-[#0D9373] via-[#0A7A5F] to-[#08614C]",
    textColor: "text-white",
    btnColor: "bg-[#E8593C] hover:bg-[#D14A30] text-white",
    href: "/consult",
    img: "/promo1.png"
  },
  {
    title: "Comprehensive Health Screen 🧪",
    desc: "Identify early health warning signs. 84 critical blood & urine parameters.",
    tTitleKey: "promo.promo2Title",
    tDescKey: "promo.promo2Desc",
    tag: "NABL ACCREDITED",
    bg: "bg-gradient-to-br from-[#E8593C] via-[#D14A30] to-[#992211]",
    textColor: "text-white",
    btnColor: "bg-[#0D9373] hover:bg-[#0A7A5F] text-white",
    href: "/labs",
    img: "/promo2.png"
  },
  {
    title: "Upload Prescription & Order 💊",
    desc: "Let our verified pharmacists read your prescription & prepare your cart.",
    tTitleKey: "promo.promo3Title",
    tDescKey: "promo.promo3Desc",
    tag: "SAVE 18%",
    bg: "bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#020617]",
    textColor: "text-white",
    btnColor: "bg-white text-slate-900 hover:bg-slate-100",
    href: "/medicines",
    img: "/promo3.png"
  }
];

const DOCTOR_SPECIALTIES = [
  { 
    name: "General Physician", 
    count: "42 Doctors", 
    img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&q=80",
    href: "/consult?specialty=General%20Physician" 
  },
  { 
    name: "Pediatrician", 
    count: "18 Doctors", 
    img: "https://images.unsplash.com/photo-1594824436998-058d0152462e?w=300&h=300&fit=crop&q=80",
    href: "/consult?specialty=Pediatrician" 
  },
  { 
    name: "Cardiologist", 
    count: "12 Doctors", 
    img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=300&fit=crop&q=80",
    href: "/consult?specialty=Cardiologist" 
  },
  { 
    name: "Dermatologist", 
    count: "21 Doctors", 
    img: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300&h=300&fit=crop&q=80",
    href: "/consult?specialty=Dermatologist" 
  },
  { 
    name: "Neurologist", 
    count: "9 Doctors", 
    img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&q=80",
    href: "/consult?specialty=Neurologist" 
  },
  { 
    name: "Gynaecologist", 
    count: "15 Doctors", 
    img: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=300&h=300&fit=crop&q=80",
    href: "/consult?specialty=Gynaecologist" 
  }
];

const LAB_PACKAGES = [
  {
    title: "Comprehensive Gold Full Body Checkup",
    testsCount: 84,
    img: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=300&h=200&fit=crop&q=80",
    parameters: ["HbA1c (Diabetes)", "Thyroid Profile (TSH)", "Lipid Profile (Cholesterol)", "Liver Function Test", "Kidney Function Test", "Complete Hemogram (CBC)"],
    originalPrice: 1999,
    discountPrice: 799,
    discountText: "60% OFF",
    duration: "Reports in 24 Hrs",
    features: ["Free Home Collection", "Free Doctor Consultation"],
    badge: "BEST SELLER"
  },
  {
    title: "Active Fitness & Joint Screen",
    testsCount: 45,
    img: "https://images.unsplash.com/photo-1584308666744-24d5e1a3bcbe?w=300&h=200&fit=crop&q=80",
    parameters: ["Vitamin D3 (Immunity)", "Vitamin B12 (Nerves)", "Calcium (Bone Health)", "Uric Acid", "Rheumatoid Factor", "Complete Urine Analysis"],
    originalPrice: 1499,
    discountPrice: 599,
    discountText: "60% OFF",
    duration: "Reports in 24 Hrs",
    features: ["Free Home Collection"],
    badge: "POPULAR"
  },
  {
    title: "Diabetes Care Assessment",
    testsCount: 28,
    img: "https://images.unsplash.com/photo-1579684385101-f3d34f634312?w=300&h=200&fit=crop&q=80",
    parameters: ["HbA1c", "Fasting Blood Sugar", "Post-Prandial Sugar", "Microalbumin", "Average Blood Glucose"],
    originalPrice: 999,
    discountPrice: 399,
    discountText: "60% OFF",
    duration: "Reports in 12 Hrs",
    features: ["Free Home Collection"],
    badge: "HEALTH TRACK"
  }
];

const BEST_SELLERS = [
  {
    id: "prod-cetaphil",
    name: "Cetaphil Gentle Skin Cleanser (250ml)",
    brand: "Galderma",
    category: "Skin Care",
    img: "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=200&h=200&fit=crop&q=80",
    originalPrice: 499,
    discountPrice: 399,
    discountText: "20% OFF",
    requiresPrescription: false
  },
  {
    id: "prod-himalaya-neem",
    name: "Himalaya Purifying Neem Face Wash (150ml)",
    brand: "Himalaya",
    category: "Personal Care",
    img: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200&h=200&fit=crop&q=80",
    originalPrice: 250,
    discountPrice: 199,
    discountText: "20% OFF",
    requiresPrescription: false
  },
  {
    id: "prod-revital",
    name: "Revital H Daily Health Supplement (30 Caps)",
    brand: "Sun Pharma",
    category: "Vitamins & Supplements",
    img: "https://images.unsplash.com/photo-1550572017-edb799298379?w=200&h=200&fit=crop&q=80",
    originalPrice: 370,
    discountPrice: 299,
    discountText: "19% OFF",
    requiresPrescription: false
  },
  {
    id: "prod-dettol",
    name: "Dettol Antiseptic Disinfectant Liquid (500ml)",
    brand: "Reckitt",
    category: "Personal Care",
    img: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=200&h=200&fit=crop&q=80",
    originalPrice: 199,
    discountPrice: 159,
    discountText: "20% OFF",
    requiresPrescription: false
  },
  {
    id: "prod-tulsi-tea",
    name: "Organic India Tulsi Green Tea (25 Infusion Bags)",
    brand: "Organic India",
    category: "Vitamins & Supplements",
    img: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&h=200&fit=crop&q=80",
    originalPrice: 180,
    discountPrice: 149,
    discountText: "17% OFF",
    requiresPrescription: false
  }
];

const TOP_DOCTORS = [
  { id: 1, name: "Dr. Sarah Jenkins", spec: "Cardiologist", exp: "15+ Yrs Exp", fee: 500, rating: 4.9, reviews: 120, img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&q=80" },
  { id: 2, name: "Dr. Michael Chen", spec: "Neurologist", exp: "12+ Yrs Exp", fee: 600, rating: 4.8, reviews: 95, img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&q=80" },
  { id: 3, name: "Dr. Emily Roberts", spec: "Pediatrician", exp: "8+ Yrs Exp", fee: 400, rating: 4.9, reviews: 210, img: "https://images.unsplash.com/photo-1594824436998-058d0152462e?w=150&h=150&fit=crop&q=80" },
  { id: 4, name: "Dr. Amit Patel", spec: "Dermatologist", exp: "10+ Yrs Exp", fee: 450, rating: 4.7, reviews: 80, img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&q=80" },
  { id: 5, name: "Dr. Lisa Wong", spec: "General Physician", exp: "20+ Yrs Exp", fee: 350, rating: 4.9, reviews: 300, img: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=150&h=150&fit=crop&q=80" }
];

const WELLNESS_BRANDS = [
  { name: "Himalaya Wellness", img: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=120&h=120&fit=crop&q=80", tag: "Himalaya" },
  { name: "Dabur Products", img: "https://images.unsplash.com/photo-1584308666744-24d5e1a3bcbe?w=120&h=120&fit=crop&q=80", tag: "Dabur" },
  { name: "Organic India", img: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=120&h=120&fit=crop&q=80", tag: "Organic India" },
  { name: "Cetaphil Skin", img: "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=120&h=120&fit=crop&q=80", tag: "Cetaphil" },
  { name: "Nivea Care", img: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=120&h=120&fit=crop&q=80", tag: "Nivea" },
  { name: "Dettol Antiseptic", img: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=120&h=120&fit=crop&q=80", tag: "Dettol" }
];

const TESTIMONIALS = [
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
    q: "Is Altruist safe and HIPAA-compliant for my records?",
    a: "Yes. Security is our paramount non-negotiable rule. Your patient PII, consulting chats, and digital prescriptions are encrypted both in transit and at rest. We utilize Supabase Row Level Security (RLS) policies to ensure that absolutely no one except you and your authorized practitioner can view your private medical history."
  }
];

export default function RedesignedHomePage() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);
  const { selectedCity } = useLocationStore();
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  const { addItem } = useCartStore();

  const handleAddProduct = (prod: any) => {
    addItem({
      id: prod.id,
      name: prod.name,
      manufacturer: prod.brand,
      price: prod.originalPrice,
      discountedPrice: prod.discountPrice,
      requiresPrescription: prod.requiresPrescription,
      quantity: 1
    });
    toast.success(`${prod.name} added to cart successfully! 🛒`, {
      description: `Manufacturer: ${prod.brand} • Saved ₹${prod.originalPrice - prod.discountPrice}`
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
        
        <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Hero Left Content */}
          <div className="w-full lg:w-3/5 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles size={12} className="text-emerald-300" /> {t("hero.sparkleTag")}
              </span>
            </div>
            
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
              {t("hero.title1")} <br className="hidden md:block" />
              <span className="text-emerald-300">{t("hero.title2")}</span>
            </h1>
            
            <p className="text-slate-100 text-base md:text-lg max-w-xl font-medium leading-relaxed opacity-90">
              {t("hero.desc")}
            </p>
            
            {/* Mega Search Bar */}
            <div className="w-full max-w-2xl bg-white p-2 rounded-2xl shadow-xl flex flex-col md:flex-row items-center gap-2 border border-slate-100">
              {/* Geolocation selector (reads like active professional apps) */}
              <div 
                onClick={() => setIsLocationOpen(true)}
                className="flex items-center w-full md:w-auto px-3 border-b md:border-b-0 md:border-r border-slate-100 py-2 md:py-0 select-none cursor-pointer hover:bg-slate-50 rounded-xl transition-all"
              >
                <MapPin className="w-5 h-5 text-[#0D9373] shrink-0 mr-2" />
                <span className="text-sm font-bold text-slate-800 shrink-0 truncate max-w-[100px]">{selectedCity}</span>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
              </div>

              
              <div className="flex items-center flex-1 w-full relative">
                <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
                <Input 
                  type="text"
                  placeholder={t("hero.placeholder")} 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 h-11 text-slate-900 border-none shadow-none focus-visible:ring-0 text-base placeholder:text-slate-400"
                />
              </div>
              
              <Link href={searchTerm ? `/medicines?search=${encodeURIComponent(searchTerm)}` : '/medicines'} className="w-full md:w-auto shrink-0">
                <Button className="w-full md:w-auto h-11 px-8 rounded-xl font-extrabold text-base bg-[#E8593C] text-white hover:bg-[#D14A30] shadow-md hover:shadow-lg transition-all active:scale-95 border-none">
                  {t("hero.search")}
                </Button>
              </Link>
            </div>
            
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

      {/* 2. DYNAMIC PROMO CARDS ( tata 1mg / apollo styled ) */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 -mt-10 relative z-20 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PROMO_CARDS.map((card, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300 }}
              className={`rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[190px] border-none ${card.bg} ${card.textColor}`}
            >
              {card.img && <img src={card.img} className="absolute right-[-10px] bottom-[-10px] h-32 w-auto opacity-70 object-contain pointer-events-none" />}
              {/* Abs decoration circles */}
              <div className="absolute right-[-20px] bottom-[-20px] w-24 h-24 rounded-full bg-white/5 pointer-events-none" />
              
              <div className="space-y-2 relative z-10">
                <div className="flex justify-between items-start">
                  <h3 className="font-extrabold text-xl leading-snug tracking-tight max-w-[200px]">
                    {t(card.tTitleKey)}
                  </h3>
                  {card.coupon && (
                    <Badge className="bg-[#E8593C] text-white border-none py-1 px-2.5 font-black text-xs tracking-wider rounded-lg">
                      USE: {card.coupon}
                    </Badge>
                  )}
                  {card.tag && (
                    <Badge className="bg-[#0D9373] text-white border-none py-1 px-2.5 font-bold text-xs rounded-lg">
                      {card.tag}
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-medium leading-relaxed opacity-90 max-w-[250px]">
                  {t(card.tDescKey)}
                </p>
              </div>
              
              <div className="pt-4 flex items-center">
                <Link href={card.href}>
                  <Button className={`font-extrabold text-sm px-6 py-2 h-9 rounded-full shadow transition-colors border-none ${card.btnColor}`}>
                    {t("promo.claimOffer")} <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </motion.div>
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
                    <div className="flex justify-between items-start">
                      <div className={`w-12 h-12 rounded-2xl ${serv.iconBg} ${serv.iconColor} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                        <serv.icon className="w-6 h-6" strokeWidth={2.5} />
                      </div>
                      <Badge className={`${serv.badgeColor} text-white border-none px-2 py-0.5 text-[9px] font-black tracking-widest rounded-md`}>
                        {serv.badge}
                      </Badge>
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

      {/* 4. SHOP BY SPECIALTY ( tata 1mg / apollo styled ) WITH PREMIUM DOCTOR IMAGES */}
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
            <Link href="/consult">
              <Button className="bg-[#E7F4F1] hover:bg-[#0D9373] text-[#0D9373] hover:text-white font-extrabold rounded-xl shadow-sm border-none transition-all active:scale-95">
                {t("specialty.viewAll")} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {DOCTOR_SPECIALTIES.map((spec, i) => (
              <Link key={i} href={spec.href}>
                <div className="bg-white border-none shadow-md hover:shadow-2xl hover:bg-emerald-50/10 transition-all cursor-pointer text-center p-4 rounded-3xl group flex flex-col items-center gap-3">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-500/10 shadow-inner group-hover:scale-105 transition-transform flex-shrink-0">
                    <img 
                      src={spec.img} 
                      alt={spec.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#0D9373] transition-colors leading-tight">
                      {spec.name}
                    </h3>
                    <p className="text-xs text-[#0D9373] font-bold mt-1 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      {spec.count}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. BEST SELLERS IN MEDICINES & HEALTH PRODUCTS (DYNAMIC ADD TO CART!) */}
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
          {BEST_SELLERS.map((prod) => (
            <Card key={prod.id} className="border-none shadow-md hover:shadow-2xl transition-all rounded-3xl bg-white overflow-hidden flex flex-col justify-between h-full group">
              <div className="p-4 flex flex-col gap-3">
                {/* Product Image */}
                <div className="h-36 w-full rounded-2xl overflow-hidden bg-slate-50 relative flex items-center justify-center flex-shrink-0">
                  <img 
                    src={prod.img} 
                    alt={prod.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-2 left-2 bg-red-500 text-white border-none py-0.5 px-2 font-bold text-[9px] rounded">
                    {prod.discountText}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider leading-none">
                    {prod.brand}
                  </span>
                  <h3 className="font-bold text-sm text-slate-800 line-clamp-2 leading-snug h-10 group-hover:text-[#E8593C] transition-colors">
                    {prod.name}
                  </h3>
                </div>
              </div>

              {/* Price & Add to Cart */}
              <div className="px-4 pb-4 pt-2 border-t border-slate-50 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 line-through block font-medium leading-none">₹{prod.originalPrice}</span>
                  <span className="text-base font-black text-slate-900 leading-none">₹{prod.discountPrice}</span>
                </div>

                <Button 
                  onClick={() => handleAddProduct(prod)}
                  size="sm"
                  className="h-8 px-3 rounded-full bg-[#E7F4F1] hover:bg-[#0D9373] text-[#0D9373] hover:text-white font-extrabold flex items-center gap-1 shadow-inner border-none transition-colors"
                >
                  <Plus size={14} /> {t("bestSellers.add")}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 6. FEATURED LAB TESTS ( tata 1mg styled ) WITH PREMIUM LAB IMAGES */}
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
          {LAB_PACKAGES.map((pkg, i) => (
            <Card key={i} className="border-none shadow-md hover:shadow-2xl transition-all rounded-3xl bg-white overflow-hidden flex flex-col justify-between group">
              {/* Card Banner Image */}
              <div className="h-40 w-full overflow-hidden bg-slate-100 relative">
                <img 
                  src={pkg.img} 
                  alt={pkg.title} 
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <Badge className="absolute top-4 left-4 bg-emerald-500 text-white border-none px-3 py-1 font-black text-xs tracking-wider rounded-lg">
                  {pkg.badge}
                </Badge>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="font-black text-lg text-white leading-tight drop-shadow-md">
                    {pkg.title}
                  </h3>
                </div>
              </div>

              <CardContent className="p-6 flex flex-col h-full justify-between gap-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-black text-[#0D9373] bg-[#E7F4F1] px-2.5 py-0.5 rounded-full">
                      {pkg.testsCount} {t("labPackages.testParameters")}
                    </span>
                    <span className="text-xs text-slate-400 font-bold flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1" /> {pkg.duration}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t("labPackages.includesChecks")}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {pkg.parameters.map((p, pIdx) => (
                        <span key={pIdx} className="bg-slate-50 text-slate-600 font-semibold px-2 py-1 rounded-md text-[10px] border border-slate-100">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    {pkg.features.map((feat, fIdx) => (
                      <span key={fIdx} className="inline-flex items-center text-xs font-bold text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {feat}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-400 line-through">₹{pkg.originalPrice}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-2xl font-black text-slate-900">₹{pkg.discountPrice}</span>
                        <Badge className="bg-red-500 text-white border-none font-extrabold text-[10px] rounded px-1.5 py-0.5">
                          {pkg.discountText}
                        </Badge>
                      </div>
                    </div>

                    <Link href="/labs">
                      <Button className="bg-[#0D9373] hover:bg-[#0A7A5F] text-white font-extrabold rounded-full px-6 shadow-sm border-none">
                        {t("labPackages.bookNow")}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

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
          {TOP_DOCTORS.map((doc) => (
            <Card key={doc.id} className="min-w-[280px] md:min-w-[320px] border-none shadow-md snap-start shrink-0 hover:shadow-2xl transition-all rounded-3xl bg-white overflow-hidden flex flex-col justify-between">
              <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
                <div className="flex gap-4 items-start">
                  <Avatar className="w-16 h-16 border-2 border-emerald-500/10 shadow-inner shrink-0">
                    <AvatarImage src={doc.img} alt={doc.name} className="object-cover" />
                    <AvatarFallback className="bg-[#E7F4F1] text-[#0D9373] font-bold">
                      {doc.name.split(" ").slice(-1)[0]?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-black text-base text-slate-900 leading-tight">{doc.name}</h3>
                    <p className="text-xs text-slate-500 font-bold">{doc.spec}</p>
                    <Badge className="mt-1 bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100 px-2 py-0.5 text-[10px] font-bold rounded-md">
                      {doc.exp}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 text-sm font-bold text-slate-800">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" /> {doc.rating} 
                  <span className="text-slate-400 font-normal ml-1">({doc.reviews} {t("topDoctors.reviews")})</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">{t("topDoctors.fee")}</p>
                    <p className="font-black text-lg text-slate-900">₹{doc.fee}</p>
                  </div>
                  <Link href="/consult">
                    <Button className="bg-[#E8593C] hover:bg-[#D14A30] text-white font-extrabold rounded-full px-6 shadow-sm border-none">
                      {t("topDoctors.consultNow")}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 9. DYNAMIC WELLNESS BRANDS ( TATA 1MG STYLE ) */}
      <section className="py-16 bg-[#F8FAFC] border-y border-slate-100 mb-16">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center md:text-left mb-8">
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t("brands.title")}
            </h2>
            <p className="text-slate-500 text-sm font-semibold mt-1">
              {t("brands.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {WELLNESS_BRANDS.map((brand, i) => (
              <Link key={i} href={`/medicines?search=${encodeURIComponent(brand.tag)}`}>
                <div className="bg-white border-none shadow-md hover:shadow-xl transition-all rounded-2xl p-4 flex flex-col items-center justify-between text-center cursor-pointer group h-full gap-4">
                  <div className="h-24 w-24 overflow-hidden rounded-xl bg-slate-50 flex items-center justify-center">
                    <img 
                      src={brand.img} 
                      alt={brand.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                  </div>
                  <h3 className="font-bold text-xs text-slate-800 group-hover:text-[#0D9373] transition-colors leading-tight">
                    {brand.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 10. TESTIMONIALS SLIDER SECTION */}
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
          {TESTIMONIALS.map((tItem, idx) => (
            <Card key={idx} className="border-none shadow-md rounded-3xl bg-white flex flex-col justify-between">
              <CardContent className="p-6 flex flex-col justify-between h-full gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-0.5">
                    {[...Array(tItem.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                    ))}
                  </div>
                  <p className="text-slate-600 text-sm font-medium leading-relaxed italic">
                    "{t(tItem.tKey)}"
                  </p>
                </div>
                
                <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                  <div>
                    <h4 className="font-black text-sm text-slate-900">{tItem.user}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{tItem.location}</p>
                  </div>
                  <Badge className="bg-emerald-50 text-[#0D9373] border-none px-2 py-0.5 text-[9px] font-black tracking-widest rounded-md uppercase">
                    {tItem.tag}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

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
