"use client";

import React from "react";
import { Newspaper, Mail, Download, ArrowRight, Award, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PressPage() {
  const releases = [
    {
      title: "Altruist Wellness Secures Pre-Series A Funding of $5M to Scale Hybrid OPD Care",
      desc: "Funding will be utilized to double clinic footprint, integrate diagnostic logistics, and expand the pharmacy catalog across Northern India.",
      date: "May 12, 2026",
      source: "Economic Times Coverage",
      linkText: "Read Article"
    },
    {
      title: "Introducing Digital Subscription Health Plans for Rural Ecosystems",
      desc: "Altruist Wellness rolls out localized plans supporting multi-lingual telehealth consultations and home collections for underserved cohorts.",
      date: "March 20, 2026",
      source: "HealthTech India",
      linkText: "Read Press Release"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans pb-20">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0D9373] via-[#0B7C61] to-[#085E49] text-white py-16 px-6 md:px-12 text-center">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse" />
        </div>
        
        <div className="container mx-auto max-w-4xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-1">
            <Newspaper size={14} className="text-emerald-300" /> Media & Newsroom
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-[#fcEAD4] tracking-tight">
            Altruist Wellness Press Kit
          </h1>
          <p className="text-emerald-100 text-base md:text-lg font-medium max-w-xl mx-auto leading-relaxed">
            Latest company announcements, branding assets, and official media contact information.
          </p>
        </div>
      </section>

      {/* Press Layout */}
      <section className="max-w-6xl mx-auto px-6 md:px-8 py-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          
          {/* Press Releases List */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="font-heading text-2xl font-extrabold text-slate-900 border-b border-slate-200 pb-3">
              Recent Announcements
            </h2>
            
            <div className="space-y-6">
              {releases.map((rel, idx) => (
                <Card key={idx} className="border-none shadow-md hover:shadow-lg transition-all rounded-3xl bg-white p-6 md:p-8 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-[#0D9373] font-bold bg-[#E7F4F1] px-2.5 py-0.5 rounded-full">
                      {rel.source}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">{rel.date}</span>
                  </div>
                  <h3 className="font-heading text-xl font-extrabold text-slate-900 leading-snug">
                    {rel.title}
                  </h3>
                  <p className="text-slate-500 text-sm font-semibold leading-relaxed">
                    {rel.desc}
                  </p>
                  <div className="pt-2">
                    <Button variant="link" className="text-[#E8593C] hover:text-[#D14A30] font-black text-sm p-0 flex items-center gap-1">
                      {rel.linkText} <ArrowRight size={14} />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Media Kit Sidebar */}
          <div className="space-y-8 lg:sticky lg:top-24">
            
            {/* Media Contact Card */}
            <Card className="border-none shadow-lg bg-[#1B2B4B] text-white rounded-3xl overflow-hidden p-8 space-y-6">
              <div className="space-y-2">
                <Badge className="bg-[#E8593C] text-white border-none py-0.5 px-2.5 font-bold text-[10px] rounded-md tracking-wider">
                  MEDIA CONTACT
                </Badge>
                <h3 className="font-heading text-xl font-extrabold">Journalist Inquiries</h3>
                <p className="text-slate-300 text-xs font-semibold leading-relaxed">
                  For press inquiries, brand assets approval, or interview requests, please get in touch with our PR team.
                </p>
              </div>
              
              <div className="pt-4 border-t border-white/10 space-y-4">
                <a href="mailto:support@altruistwellness.com?subject=Press Inquiry">
                  <Button className="w-full bg-[#E8593C] hover:bg-[#D14A30] text-white font-extrabold py-5 rounded-2xl border-none flex items-center justify-center gap-2">
                    <Mail size={16} /> Contact PR Team
                  </Button>
                </a>
              </div>
            </Card>

            {/* Assets Card */}
            <Card className="border-none shadow-md bg-white rounded-3xl p-8 space-y-6">
              <h3 className="font-heading text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Download size={18} className="text-[#0D9373]" /> Brand Resources
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <p className="font-bold text-sm text-slate-800">Altruist Logos Package</p>
                    <p className="text-[10px] text-slate-400 font-semibold">SVG / PNG formats • 2.4 MB</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-[#0D9373] hover:bg-emerald-50 rounded-xl">
                    <Download size={16} />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-slate-800">Founder Headshots & Bio</p>
                    <p className="text-[10px] text-slate-400 font-semibold">High Res JPGs • 15.8 MB</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-[#0D9373] hover:bg-emerald-50 rounded-xl">
                    <Download size={16} />
                  </Button>
                </div>
              </div>
            </Card>

          </div>

        </div>
      </section>
    </div>
  );
}
