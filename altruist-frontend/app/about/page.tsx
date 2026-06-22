"use client";

import React from "react";
import Link from "next/link";
import { 
  HeartPulse, Shield, Award, Users, Hourglass, 
  MapPin, Stethoscope, ChevronRight, Sparkles, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/LanguageContext";

export default function AboutPage() {
  const { t } = useLanguage();

  const stats = [
    { label: "Consultations Completed", value: "250K+", icon: Stethoscope, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Verified Experts", value: "150+", icon: Users, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Average Delivery Time", value: "2 Hours", icon: Hourglass, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Patient Satisfaction", value: "4.9/5", icon: Award, color: "text-purple-500", bg: "bg-purple-50" },
  ];

  const values = [
    {
      title: "Patient-Centric Care",
      desc: "Every feature, service, and workflow is designed to maximize patient comfort, privacy, and clinical outcomes.",
      icon: HeartPulse,
      color: "text-rose-500",
      bg: "bg-rose-50",
    },
    {
      title: "Absolute Integrity",
      desc: "100% genuine medicines sourced directly from authorized manufacturers and standard compliance under strict safety regulations.",
      icon: Shield,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      title: "Clinical Excellence",
      desc: "Our board-certified medical experts undergo rigorous vetting processes to offer gold-standard online care.",
      icon: Award,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
  ];


  return (
    <div className="min-h-screen bg-slate-50/50 font-sans">
      
      {/* 1. Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0D9373]/90 via-[#0B7C61] to-[#085E49] text-white py-20 px-6 md:px-12 text-center">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto max-w-4xl relative z-10 space-y-6">
          <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-2">
            <Sparkles size={12} className="text-emerald-300" /> India's Most Trusted Digital Clinic
          </div>
          <h1 className="font-heading text-4xl md:text-6xl font-extrabold tracking-tight">
            Our Mission: Healthcare <span className="text-emerald-200">Reimagined</span>
          </h1>
          <p className="text-emerald-100 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Altruist Wellness is dedicated to bridging the clinical gap by bringing specialist consultation, genuine medicine, and diagnostic excellence straight to your phone.
          </p>
        </div>
      </section>

      {/* 2. Key Stats Grid */}
      <section className="container mx-auto max-w-6xl px-6 -mt-10 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, i) => (
            <Card key={i} className="border border-border/60 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300 bg-white">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className={`p-3.5 rounded-2xl mb-4 ${stat.bg} ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <h3 className="text-3xl font-heading font-black text-foreground mb-1 leading-none">{stat.value}</h3>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. Our Values Section */}
      <section className="py-20 px-6 md:px-12 bg-white mt-10">
        <div className="container mx-auto max-w-6xl space-y-12">
          <div className="text-center space-y-3">
            <Badge className="bg-primary/10 text-primary border-none hover:bg-primary/10 font-bold uppercase tracking-wider text-xs rounded-full px-3.5 py-1">
              Who We Are
            </Badge>
            <h2 className="font-heading text-3xl font-extrabold text-foreground tracking-tight">
              Driven by Pure Values
            </h2>
            <p className="text-muted-foreground font-medium max-w-xl mx-auto text-sm">
              We leverage modern technology to solve real healthcare accessibility problems without compromising on clinical quality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {values.map((v, i) => (
              <Card key={i} className="border border-border/80 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 rounded-3xl overflow-hidden bg-white">
                <CardContent className="p-8 space-y-4">
                  <div className={`p-3 rounded-2xl w-fit ${v.bg} ${v.color}`}>
                    <v.icon size={22} />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-foreground">{v.title}</h3>
                  <p className="text-muted-foreground text-sm font-medium leading-relaxed">{v.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* 6. CTA Footer Section */}
      <section className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white py-16 px-6 md:px-12 text-center">
        <div className="container mx-auto max-w-3xl space-y-6">
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-slate-200 text-base max-w-xl mx-auto font-medium leading-relaxed">
            Experience modern, secure digital consulting with our panel of experts today. First consult is completely free!
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/consult">
              <Button className="font-bold bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all">
                Book Consultation <ChevronRight size={16} className="ml-1" />
              </Button>
            </Link>
            <Link href="/plans">
              <Button variant="outline" className="font-bold border-white/20 text-white hover:bg-white/10 h-12 px-8 rounded-xl">
                Explore Health Plans
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
