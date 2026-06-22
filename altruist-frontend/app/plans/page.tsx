"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  CheckCircle2, Mail, ChevronRight, 
  GraduationCap, Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";

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

const getPlanMailtoLink = (planName: string) => {
  const subject = `Plan Subscription Request — ${planName}`;
  const body = `Hi Altruist Support Team,

I am interested in subscribing to the ${planName}.

Please find my details below:
Name: 
Email: 
Phone: 
City: 

Kindly process my subscription and get in touch with me.

Thank you.`;

  return `mailto:support@altruistwellness.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

export default function RedesignedPlansPage() {
  const { t } = useLanguage();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-16">

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
                      onClick={() => {
                        if (isMounted) {
                          window.location.href = getPlanMailtoLink(plan.name);
                        }
                      }}
                      className={`w-full h-12 rounded-2xl font-black text-base transition-all border-none ${
                        plan.isPopular
                          ? "bg-[#E8593C] hover:bg-[#D14A30] text-white shadow-md shadow-orange-500/20"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                      }`}
                    >
                      {plan.type === 'STUDENT' ? t('plans.studentButton') : t('plans.adultButton')} <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                    <p className="text-xs text-slate-500 mt-2 text-center font-bold">
                      Opens your email app to contact our team
                    </p>
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
                <h3 className="font-extrabold text-xl !text-white" style={{ color: '#ffffff' }}>{t('plans.enterpriseTitle')}</h3>
                <p className="text-sm font-semibold text-slate-200 leading-relaxed">
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

      </div>
    </div>
  );
}
