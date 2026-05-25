"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  CheckCircle2, Stethoscope, FlaskConical, Pill, 
  Mail, ShieldCheck, Sparkles, Star, ChevronRight, 
  ArrowRight, Award, GraduationCap, Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/LanguageContext";

// ── DATA STRUCTURES ──────────────────────────────────────────────────────

const ANCESTOR_PLANS = [
  {
    name: "Student Plan",
    price: "₹849",
    period: "/ year",
    type: "STUDENT",
    icon: GraduationCap,
    description: "Affordable premium care tailored for coaching and college students.",
    features: [
      "Unlimited tele and video consultations",
      "One clinic visit or hospital OPD consultation",
      "Up to 20% off on lab tests",
      "Priority customer support"
    ],
    buttonText: "Get Student Plan",
    isPopular: false,
    color: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-50/50",
    borderTheme: "border-emerald-100",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600"
  },
  {
    name: "Working & Adult Plan",
    price: "₹999",
    period: "/ year",
    type: "INDIVIDUAL",
    icon: Briefcase,
    description: "Complete individual healthcare plan for working professionals.",
    features: [
      "Unlimited tele and video consultations",
      "One clinic visit or hospital OPD consultation",
      "Up to 20% off on lab tests",
      "Priority customer support"
    ],
    buttonText: "Get Active Plan",
    isPopular: true,
    color: "from-[#E8593C] to-[#D14A30]",
    bgLight: "bg-[#FFF5F2]",
    borderTheme: "border-red-100",
    iconBg: "bg-[#FCEBE7]",
    iconColor: "text-[#E8593C]"
  }
];

const LAB_TEST_PACKAGES = [
  {
    title: "Basic Health Checkup",
    price: "₹499 – ₹699",
    img: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=300&h=200&fit=crop&q=80",
    icon: FlaskConical,
    desc: "Essential parameters to monitor your metabolic baseline.",
    parameters: ["Blood Sugar Profile", "Complete Blood Count (CBC)", "Basic Screening Urine Analysis"]
  },
  {
    title: "Advanced Health Package",
    price: "₹1199 – ₹1499",
    img: "https://images.unsplash.com/photo-1584308666744-24d5e1a3bcbe?w=300&h=200&fit=crop&q=80",
    icon: Award,
    desc: "Complete head-to-toe screening for full system assessment.",
    parameters: ["Full Body Checkup (84 tests)", "Comprehensive Liver Tests", "Kidney Function Analysis", "Thyroid Profile (T3, T4, TSH)", "Detailed Clinical Health Report"]
  },
  {
    title: "Combo Offer 🎯",
    price: "Starting at ₹1199",
    img: "https://images.unsplash.com/photo-1579684385101-f3d34f634312?w=300&h=200&fit=crop&q=80",
    icon: Sparkles,
    desc: "Best for quick diagnosis & treatment. Combined Doctor + Lab checks.",
    parameters: ["Annual Doctor Consultation Subscription", "Basic Health Screening Tests Included", "2Hr Pharmacy Priority Shipping"],
    highlight: "MOST RECOMMENDED"
  }
];

export default function RedesignedPlansPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const handleSubscribe = (planName: string) => {
    router.push(`/checkout?plan=${planName.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 pb-20">
      
      {/* 1. HERO BANNER */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#0D9373] to-[#0A7A5F] py-20 lg:py-24 text-white text-center">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="absolute top-[-50px] right-[-100px] w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-6">
          <Badge className="bg-white/15 text-white border-none py-1.5 px-4 font-extrabold text-xs tracking-wider rounded-full backdrop-blur-md uppercase">
            {t('plans.badge')}
          </Badge>
          
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
            💙 {t('plans.heroTitle')} <br className="hidden md:block" />
            <span className="text-emerald-300">{t('plans.heroTitleHighlight')}</span>
          </h1>
          
          <p className="text-slate-100 text-base md:text-lg max-w-2xl mx-auto font-semibold leading-relaxed opacity-90">
            {t('plans.heroDesc')}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 space-y-24">

        {/* 2. DOCTOR CONSULTATION ANNUAL PLANS */}
        <section className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge className="bg-[#E7F4F1] text-[#0D9373] hover:bg-[#E7F4F1] border-none font-bold text-xs px-3 py-1 rounded-md uppercase">
              {t('plans.doctorBadge')}
            </Badge>
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('plans.doctorTitle')}
            </h2>
            <p className="text-slate-500 text-sm font-semibold">
              {t('plans.doctorDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {ANCESTOR_PLANS.map((plan, i) => {
              const IconComp = plan.icon;
              return (
                <motion.div
                  key={i}
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`bg-white rounded-3xl p-8 flex flex-col justify-between border shadow-lg hover:shadow-2xl transition-all relative overflow-hidden ${
                    plan.isPopular ? "border-[#E8593C]" : "border-slate-100"
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute top-0 right-0 bg-[#E8593C] text-white px-4 py-1.5 font-black text-[10px] tracking-widest rounded-bl-2xl uppercase">
                      {t('plans.bestChoice')}
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl ${plan.iconBg} ${plan.iconColor} flex items-center justify-center`}>
                        <IconComp className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-black text-xl text-slate-900">{plan.type === 'STUDENT' ? t('plans.studentName') : t('plans.adultName')}</h3>
                        <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{t('plans.annualPrivilege')}</span>
                      </div>
                    </div>

                    <p className="text-sm font-semibold text-slate-500 leading-relaxed min-h-[40px]">
                      {plan.type === 'STUDENT' ? t('plans.studentDesc') : t('plans.adultDesc')}
                    </p>

                    <div className="flex items-baseline gap-1.5 border-y border-slate-50 py-4">
                      <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                      <span className="text-sm font-bold text-slate-400 uppercase">{plan.period}</span>
                    </div>

                    <div className="space-y-3.5">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('plans.includedBenefits')}</span>
                      {plan.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-sm font-bold text-slate-600 leading-tight">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8">
                    <Button 
                      onClick={() => handleSubscribe(plan.name)}
                      className={`w-full h-12 rounded-2xl font-black text-base transition-all border-none ${
                        plan.isPopular
                          ? "bg-[#E8593C] hover:bg-[#D14A30] text-white shadow-md shadow-orange-500/20"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                      }`}
                    >
                      {plan.type === 'STUDENT' ? t('plans.studentButton') : t('plans.adultButton')} <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Enterprise custom plan card */}
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-white relative overflow-hidden border border-slate-800 shadow-xl">
            <div className="absolute right-[-40px] bottom-[-40px] w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl text-left">
                <Badge className="bg-emerald-500 text-white border-none px-2.5 py-0.5 text-[9px] font-black tracking-widest rounded-md uppercase">
                  {t('plans.enterpriseBadge')}
                </Badge>
                <h3 className="font-extrabold text-xl">{t('plans.enterpriseTitle')}</h3>
                <p className="text-sm font-semibold text-slate-400 leading-relaxed">
                  {t('plans.enterpriseDesc')}
                </p>
              </div>
              <a href="mailto:support@altruistwellness.com" className="w-full md:w-auto shrink-0">
                <Button className="w-full md:w-auto h-12 px-8 rounded-2xl bg-[#0D9373] hover:bg-[#0A7A5F] text-white font-black text-sm border-none shadow-md flex items-center justify-center gap-2">
                  <Mail size={16} /> {t('plans.enterpriseButton')}
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* 3. LAB TEST PACKAGES GRID */}
        <section className="space-y-12 bg-white border border-slate-100 p-8 sm:p-12 rounded-3xl shadow-sm">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge className="bg-[#FEF3C7] text-[#D97706] hover:bg-[#FEF3C7] border-none font-bold text-xs px-3 py-1 rounded-md uppercase">
              {t('plans.labsBadge')}
            </Badge>
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('plans.labsTitle')}
            </h2>
            <p className="text-slate-500 text-sm font-semibold">
              {t('plans.labsDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {LAB_TEST_PACKAGES.map((pkg, idx) => (
              <Card key={idx} className="border border-slate-100 hover:border-emerald-100 shadow-md hover:shadow-xl transition-all rounded-3xl bg-white overflow-hidden flex flex-col justify-between h-full group">
                <div className="relative h-44 w-full overflow-hidden bg-slate-50">
                  <img 
                    src={pkg.img} 
                    alt={pkg.title} 
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  
                  {pkg.highlight && (
                    <Badge className="absolute top-4 left-4 bg-[#E8593C] text-white border-none px-3 py-1 font-black text-xs tracking-wider rounded-lg shadow">
                      {pkg.highlight}
                    </Badge>
                  )}

                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-black text-lg text-white drop-shadow-md leading-tight">
                      {pkg.title}
                    </h3>
                  </div>
                </div>

                <CardContent className="p-6 flex flex-col justify-between flex-1 gap-6">
                  <div className="space-y-4 text-left">
                    <div className="flex items-baseline gap-1">
                      <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">{t('plans.priceRange')}</span>
                      <span className="text-xl font-black text-slate-900 ml-1">{pkg.price}</span>
                    </div>

                    <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                      {pkg.desc}
                    </p>

                    <div className="space-y-2 pt-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{t('plans.parameters')}</span>
                      <div className="flex flex-col gap-2">
                        {pkg.parameters.map((param, pIdx) => (
                          <div key={pIdx} className="flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0D9373] mt-1.5 shrink-0" />
                            <span className="text-xs font-bold text-slate-600 leading-tight">{param}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-50">
                    <Link href="/labs">
                      <Button className="w-full h-11 rounded-2xl bg-[#0D9373] hover:bg-[#0A7A5F] text-white font-extrabold text-sm border-none shadow-sm flex items-center justify-center gap-1">
                        {t('plans.bookDiagnostic')} <ArrowRight size={14} />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 4. MEDICINES & PHARMACY PROMOTION CARD */}
        <section className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute right-[-50px] top-[-50px] w-96 h-96 rounded-full bg-[#E8593C]/5 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 text-left">
            <div className="space-y-6 max-w-xl">
              <div className="inline-flex items-center gap-1.5 bg-[#E8593C]/10 border border-[#E8593C]/20 rounded-full px-3 py-1 text-[#E8593C] text-xs font-black tracking-widest uppercase">
                <Pill size={12} /> {t('plans.medicinesBadge')}
              </div>
              <h2 className="font-heading text-3xl font-black leading-tight tracking-tight">
                💊 {t('plans.medicinesTitle')}
              </h2>
              <p className="text-slate-400 font-semibold text-sm leading-relaxed">
                {t('plans.medicinesDesc')}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-800 pt-6">
                <div>
                  <span className="block text-2xl font-black text-[#E8593C]">{t('plans.discountTitle')}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t('plans.discountDesc')}</span>
                </div>
                <div>
                  <span className="block text-2xl font-black text-emerald-400">{t('plans.genuineTitle')}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t('plans.genuineDesc')}</span>
                </div>
                <div>
                  <span className="block text-2xl font-black text-blue-400">{t('plans.expressTitle')}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t('plans.expressDesc')}</span>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-auto shrink-0 flex flex-col gap-3 min-w-[240px]">
              <Link href="/medicines" className="w-full">
                <Button className="w-full h-12 rounded-2xl bg-[#E8593C] hover:bg-[#D14A30] text-white font-black text-sm border-none shadow-md">
                  {t('plans.orderNow')}
                </Button>
              </Link>
              <Link href="/support" className="w-full">
                <Button className="w-full h-12 rounded-2xl bg-transparent hover:bg-white/5 border border-white/25 text-white font-bold text-sm">
                  {t('plans.talkPharmacist')}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* 5. GET STARTED TODAY BANNER (CTA) */}
        <section className="bg-gradient-to-br from-[#0D9373] via-[#0A7A5F] to-[#08614C] rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 right-0 bottom-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          
          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <span className="text-4xl">🚀</span>
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight">
              {t('plans.getStartedTitle')}
            </h2>
            <p className="text-emerald-100 font-semibold text-base leading-relaxed opacity-95">
              {t('plans.getStartedDesc')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/register">
                <Button className="w-full sm:w-auto h-12 px-8 rounded-2xl bg-white text-[#0D9373] hover:bg-slate-50 font-black text-sm border-none shadow-lg active:scale-95 transition-all">
                  {t('plans.signUpButton')}
                </Button>
              </Link>
              <Link href="/">
                <Button className="w-full sm:w-auto h-12 px-8 rounded-2xl bg-[#E8593C] hover:bg-[#D14A30] text-white font-black text-sm border-none shadow-lg active:scale-95 transition-all">
                  {t('plans.dashboardButton')}
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
