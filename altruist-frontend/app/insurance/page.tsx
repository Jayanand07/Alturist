"use client";

import React from "react";
import { ShieldCheck, Heart, Users, Building2, CheckCircle2, Mail, Banknote, Hospital, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function InsurancePage() {
  const plans = [
    {
      name: "Hospicash",
      price: "₹499",
      period: "per year",
      desc: "Daily cash benefit during hospitalization. Get sum assured starting from ₹1.8 Lakh and onwards.",
      icon: Banknote,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
      popular: false,
      features: [
        "Sum Assured starting ₹1,80,000 and onwards",
        "Daily cash allowance during hospital stay",
        "Covers incidental expenses (food, travel, medicines)",
        "No medical check-up required",
        "Simple claim process with minimal documentation"
      ]
    },
    {
      name: "Health Insurance",
      price: "₹4,999",
      period: "per year",
      desc: "Cashless treatment across our hospital network with coverage starting from ₹1.8 Lakh and onwards.",
      icon: Hospital,
      iconColor: "text-indigo-600",
      iconBg: "bg-indigo-50",
      popular: true,
      features: [
        "Cashless treatment in partner hospital network",
        "Coverage starting ₹1,80,000 and onwards",
        "Pre & post hospitalization expenses covered",
        "No copayment requirements",
        "Daycare procedures included",
        "Tax benefits under Section 80D"
      ]
    },
    {
      name: "Term Plan",
      price: "Custom",
      period: "let's discuss",
      desc: "Secure your family's financial future with comprehensive term life coverage tailored to your needs.",
      icon: FileText,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50",
      popular: false,
      features: [
        "High sum assured at affordable premiums",
        "Flexible premium payment options",
        "Critical illness rider available",
        "Accidental death benefit add-on",
        "Hassle-free claim settlement",
        "Customizable coverage tenure"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans pb-20">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0D9373] via-[#0B7C61] to-[#085E49] text-white py-20 px-6 md:px-12 text-center">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto max-w-4xl relative z-10 space-y-6">
          <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-2">
            <ShieldCheck size={14} className="text-emerald-300" /> Secure Your Health
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-[#fcEAD4] tracking-tight">
            Affordable Health Insurance Plans
          </h1>
          <p className="text-emerald-100 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Choose from the best health plans tailored for you, your family, and your enterprise teams. Covered by India's top insurers.
          </p>
        </div>
      </section>

      {/* Plan Cards Grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 py-16 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <Card 
                key={i} 
                className={`border-none shadow-lg hover:shadow-2xl transition-all rounded-3xl bg-white overflow-hidden flex flex-col justify-between h-full group ${
                  plan.popular ? "ring-2 ring-[#E8593C] relative" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-[#E8593C] text-white text-[10px] font-black px-4 py-1.5 rounded-bl-2xl tracking-widest uppercase">
                    MOST POPULAR
                  </div>
                )}
                
                <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className={`w-14 h-14 rounded-2xl ${plan.iconBg} ${plan.iconColor} flex items-center justify-center`}>
                      <Icon size={28} />
                    </div>
                    <div>
                      <h3 className="font-heading text-2xl font-extrabold text-slate-900">{plan.name}</h3>
                      <p className="text-slate-500 text-sm font-semibold mt-1 leading-relaxed">{plan.desc}</p>
                    </div>
                  </div>

                  <div className="py-6 border-y border-slate-100 my-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                      <span className="text-slate-500 font-bold text-sm">{plan.period}</span>
                    </div>
                    {plan.name !== "Term Plan" && (
                      <p className="text-xs text-emerald-600 font-bold mt-1">Sum assured from ₹1.8 Lakh onwards</p>
                    )}
                  </div>

                  <ul className="space-y-3.5 flex-1 pt-2">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3">
                        <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-slate-600 text-sm font-bold leading-relaxed">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-8 pt-0 mt-auto">
                  <a href={`mailto:support@altruistwellness.com?subject=Enquiry for ${encodeURIComponent(plan.name)}`}>
                    <Button 
                      className={`w-full font-black text-sm py-6 rounded-2xl shadow border-none transition-all active:scale-95 ${
                        plan.popular 
                          ? "bg-[#E8593C] hover:bg-[#D14A30] text-white" 
                          : "bg-[#0D9373] hover:bg-[#0A7A5F] text-white"
                      }`}
                    >
                      {plan.name === "Term Plan" ? "Let's Connect to Discuss" : "Enquire Now"} <Mail size={16} className="ml-2" />
                    </Button>
                  </a>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Trust Elements */}
      <section className="max-w-4xl mx-auto px-6 text-center mt-8 space-y-6">
        <h2 className="font-heading text-2xl font-extrabold text-slate-900">Why Get Insured via Altruist?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-2">
            <h3 className="font-bold text-slate-800 text-sm">Cashless OPD claims</h3>
            <p className="text-slate-500 text-xs font-semibold leading-relaxed">Instantly adjust consultation and diagnostic lab test costs directly at checkout.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-2">
            <h3 className="font-bold text-slate-800 text-sm">24/7 Helpline Support</h3>
            <p className="text-slate-500 text-xs font-semibold leading-relaxed">Dedicated claim relationship manager assigned to resolve disputes and process papers.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-2">
            <h3 className="font-bold text-slate-800 text-sm">Tax Benefits</h3>
            <p className="text-slate-500 text-xs font-semibold leading-relaxed">Get tax exemption benefits under Section 80D for medical insurance premiums paid.</p>
          </div>
        </div>
      </section>

      {/* IRDAI Disclaimer */}
      <section className="max-w-4xl mx-auto px-6 mt-12 text-center">
        <p className="text-xs text-slate-400 font-medium leading-relaxed">
          We partner with IRDAI-registered insurers. Final premium depends on age, coverage, and health history. 
          Insurance is the subject matter of solicitation. For more details on risk factors, terms and conditions, 
          please read the sales brochure carefully before concluding a sale. Tax benefits are subject to changes in tax laws.
        </p>
      </section>
    </div>
  );
}
