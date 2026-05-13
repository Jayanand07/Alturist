"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Video, 
  FlaskConical, 
  Pill, 
  UserCheck, 
  Stethoscope, 
  Smile, 
  Clock,
  ArrowRight,
  HeartPulse,
  ShieldCheck,
  Check,
  Microscope,
  Phone,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

/* ── Intersection-based count-up ── */
const useCountUp = (end: number, duration = 2000) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let startTime: number | null = null;
    const animate = (ts: number) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor(p * end));
      if (p < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [started, end, duration]);

  return { count, ref };
};

const specialties = [
  { name: "General Medicine", emoji: "🩺" },
  { name: "Pediatrics", emoji: "👶" },
  { name: "Dermatology", emoji: "🧴" },
  { name: "Cardiology", emoji: "❤️" },
  { name: "Gynecology", emoji: "🤰" },
  { name: "Orthopedics", emoji: "🦴" },
  { name: "Psychiatry", emoji: "🧠" },
  { name: "ENT", emoji: "👂" },
  { name: "Neurology", emoji: "⚡" },
  { name: "Ophthalmology", emoji: "👁️" },
];

const services = [
  {
    title: "Video Consultation",
    description: "Connect with qualified doctors instantly via secure video call from anywhere.",
    icon: Video,
    features: ["60-second doctor connection", "Digital prescription", "24/7 availability"],
    buttonText: "Book Now",
    buttonLink: "/consult",
    gradient: "from-[#00A87E] to-[#059669]",
  },
  {
    title: "Diagnostic Tests",
    description: "Book from 1000+ certified lab tests. Home sample collection with accurate results.",
    icon: Microscope,
    features: ["Home sample collection", "NABL certified labs", "Reports in 24 hours"],
    buttonText: "Explore Tests",
    buttonLink: "/labs",
    gradient: "from-[#2563EB] to-[#1D4ED8]",
  },
  {
    title: "Medicines",
    description: "Genuine medicines delivered to your doorstep within 24 hours.",
    icon: Pill,
    features: ["100% genuine medicines", "Doctor-prescribed only", "Fast delivery"],
    buttonText: "Order Medicines",
    buttonLink: "/medicines",
    gradient: "from-[#FF6B35] to-[#EA580C]",
  },
];

function StatCounter({
  end,
  label,
  icon: Icon,
  suffix,
}: {
  end: number;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  suffix: string;
}) {
  const { count, ref } = useCountUp(end);

  return (
    <div ref={ref} className="text-center space-y-3">
      <div className="w-14 h-14 rounded-2xl bg-[#00A87E]/10 flex items-center justify-center mx-auto text-[#00A87E]">
        <Icon size={28} />
      </div>
      <h3 className="font-display text-5xl font-bold text-[#00A87E]">
        {count.toLocaleString()}{suffix}
      </h3>
      <p className="text-slate-400 font-semibold text-sm">{label}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0F172A 0%, #064E3B 50%, #0F172A 100%)" }}>
        {/* grid overlay */}
        <div className="absolute inset-0 hero-grid-pattern" />
        {/* soft blurs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#00A87E]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#2563EB]/8 rounded-full blur-[100px]" />

        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-2 items-center py-20 lg:py-0 gap-16 relative z-10">
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 bg-[#00A87E]/10 text-[#00A87E] px-5 py-2.5 rounded-full font-bold text-sm border border-[#00A87E]/30 backdrop-blur-sm">
              <ShieldCheck size={16} />
              🛡️ India&apos;s Most Trusted — 50k+ Patients
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <h1 className="font-heading text-[56px] lg:text-[72px] font-extrabold leading-[1.05] tracking-tight">
                <span className="text-white">Instant Healthcare.</span><br />
                <span className="text-[#00A87E]">Anytime. Anywhere.</span>
              </h1>
              <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
                Connect with over <span className="text-[#00A87E] font-bold">500+ verified specialists</span> for video consultations, 
                book diagnostic tests, and get medicines delivered — all from your phone.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/consult">
                <Button className="h-14 px-8 text-lg font-bold bg-[#00A87E] hover:bg-[#007A5C] rounded-full shadow-xl shadow-[#00A87E]/25 group transition-all active:scale-95">
                  Consult Now
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/plans">
                <Button className="h-14 px-8 text-lg font-bold rounded-full bg-white/10 text-white border border-white/20 backdrop-blur-sm hover:bg-white/20 transition-all active:scale-95">
                  View Health Plans
                </Button>
              </Link>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-6 flex-wrap pt-2">
              {[
                { num: "50,000+", label: "Consultations" },
                { num: "500+", label: "Doctors" },
                { num: "99%", label: "Satisfaction" },
                { num: "24/7", label: "Service" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  {i > 0 && <div className="w-px h-8 bg-white/15 hidden sm:block" />}
                  <div className={i > 0 ? "pl-3" : ""}>
                    <p className="font-display text-xl font-bold text-white">{s.num}</p>
                    <p className="text-xs text-slate-400 font-medium">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Floating Doctor Card UI */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative hidden lg:flex items-center justify-center"
          >
            <div className="relative w-full max-w-[420px]">
              {/* Main Doctor Ready Card */}
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-black/20 border border-white/50">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-[#10B981] animate-pulse-dot" />
                  <span className="text-sm font-bold text-[#10B981]">Doctor is Ready</span>
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00A87E] to-[#059669] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    Dr
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-[#0F172A] text-lg">Dr. Priya Sharma</h3>
                    <p className="text-sm text-[#475569] font-medium">General Physician</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[1,2,3,4,5].map(i => <Star key={i} size={12} className="fill-amber-400 text-amber-400" />)}
                      <span className="text-xs text-[#475569] ml-1 font-bold">4.9</span>
                    </div>
                  </div>
                </div>
                <Button className="w-full h-12 bg-[#00A87E] hover:bg-[#007A5C] rounded-xl font-bold text-base shadow-lg shadow-[#00A87E]/20">
                  <Video className="mr-2" size={18} />
                  Join Video Call
                </Button>
              </div>

              {/* Floating Mini Cards */}
              <div className="absolute -top-6 -right-8 animate-float">
                <div className="bg-white rounded-2xl px-5 py-3 shadow-xl border border-gray-100 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#10B981]/10 flex items-center justify-center">
                    <Check size={16} className="text-[#10B981]" />
                  </div>
                  <span className="text-sm font-bold text-[#0F172A]">Prescription Ready ✓</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-10 animate-float-delayed">
                <div className="bg-white rounded-2xl px-5 py-3 shadow-xl border border-gray-100 flex items-center gap-2">
                  <span className="text-lg">📊</span>
                  <span className="text-sm font-bold text-[#0F172A]">Lab Report Available</span>
                </div>
              </div>

              <div className="absolute top-1/2 -left-14 animate-float">
                <div className="bg-[#FF6B35] text-white rounded-2xl px-4 py-2.5 shadow-xl flex items-center gap-2">
                  <Pill size={14} />
                  <span className="text-xs font-bold">Medicine Delivered!</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ SERVICES ═══════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center space-y-4 mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-heading text-4xl md:text-5xl font-extrabold text-[#0F172A] tracking-tight"
            >
              Our Services
            </motion.h2>
            <div className="w-16 h-1.5 bg-[#00A87E] rounded-full mx-auto" />
            <p className="text-lg text-[#475569] font-medium max-w-2xl mx-auto">
              Complete healthcare solutions designed for you and your family
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-white p-8 rounded-2xl border border-[#E2E8F0] card-hover flex flex-col"
              >
                <div className={cn("w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg mb-6", service.gradient)}>
                  <service.icon size={28} />
                </div>
                <h3 className="font-heading text-xl font-bold text-[#0F172A] mb-2">{service.title}</h3>
                <p className="text-[#475569] text-sm leading-relaxed mb-6">{service.description}</p>
                <div className="space-y-3 mb-8 flex-1">
                  {service.features.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm font-semibold text-[#475569]">
                      <div className="w-5 h-5 rounded-full bg-[#E6F7F3] flex items-center justify-center flex-shrink-0">
                        <Check size={12} className="text-[#00A87E]" strokeWidth={3} />
                      </div>
                      {f}
                    </div>
                  ))}
                </div>
                <Link href={service.buttonLink}>
                  <Button className="w-full h-12 bg-[#00A87E] hover:bg-[#007A5C] rounded-xl font-bold text-base transition-all active:scale-95 group">
                    {service.buttonText}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ STATS BAR ═══════════════════ */}
      <section className="py-20 bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { end: 50000, label: "Consultations Completed", icon: UserCheck, suffix: "+" },
            { end: 500, label: "Verified Doctors", icon: Stethoscope, suffix: "+" },
            { end: 99, label: "Patient Satisfaction", icon: Smile, suffix: "%" },
            { end: 24, label: "Hours Service", icon: Clock, suffix: "/7" },
          ].map((stat) => (
            <StatCounter key={stat.label} {...stat} />
          ))}
        </div>
      </section>

      {/* ═══════════════════ SPECIALTIES ═══════════════════ */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center space-y-4 mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-[#0F172A]">Browse by Speciality</h2>
            <div className="w-16 h-1.5 bg-[#00A87E] rounded-full mx-auto" />
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {specialties.map((sp, i) => (
              <Link key={i} href={`/consult?specialty=${encodeURIComponent(sp.name)}`}>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-3 rounded-full border border-[#E2E8F0] bg-white text-[#475569] font-semibold text-sm hover:bg-[#00A87E] hover:text-white hover:border-[#00A87E] transition-all cursor-pointer shadow-sm"
                >
                  <span className="text-lg">{sp.emoji}</span>
                  {sp.name}
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ TRUST / AS SEEN IN ═══════════════════ */}
      <section className="py-16 bg-white border-t border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <p className="text-center text-sm font-bold text-[#475569] uppercase tracking-widest mb-10">Trusted By Leading Organizations</p>
          <div className="flex items-center justify-center gap-12 flex-wrap opacity-40 grayscale">
            {["AIIMS", "Apollo", "Medanta", "Max Healthcare", "Fortis", "ICMR"].map((brand, i) => (
              <div key={i} className="text-2xl font-heading font-extrabold text-[#0F172A] tracking-tight">{brand}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ CTA BANNER ═══════════════════ */}
      <section className="py-20" style={{ background: "linear-gradient(135deg, #00A87E 0%, #059669 100%)" }}>
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-white">
            Ready to take control of your health?
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Join 50,000+ patients who trust Altruist for their healthcare needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/consult">
              <Button className="h-14 px-10 text-lg font-bold bg-white text-[#00A87E] hover:bg-white/90 rounded-full shadow-xl active:scale-95 transition-all">
                Book a Consultation
              </Button>
            </Link>
            <Link href="/medicines">
              <Button className="h-14 px-10 text-lg font-bold bg-transparent text-white border-2 border-white/40 hover:bg-white/10 rounded-full transition-all active:scale-95">
                Order Medicines
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
