"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, ShieldCheck, Headphones, FlaskConical, Bell, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: any;
}

const features = [
  { icon: ShieldCheck, title: "Secure Records", desc: "Your medical data is encrypted with bank-grade security. Always safe.", color: "from-primary to-primary/80" },
  { icon: Headphones, title: "Expert Support", desc: "Our health assistants are available 24/7 to guide you.", color: "from-[#2563EB] to-[#1D4ED8]" },
  { icon: FlaskConical, title: "Verified Labs", desc: "Only NABL-certified partners for your diagnostic tests.", color: "from-[#FF6B35] to-[#EA580C]" },
];

export default function PlaceholderPage({ title, description, icon: Icon }: PlaceholderPageProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      toast.success("You're on the list! We'll notify you when it launches.");
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Dark Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden" style={{ background: "linear-gradient(135deg, #0F172A 0%, #064E3B 50%, #0F172A 100%)" }}>
        <div className="absolute inset-0 hero-grid-pattern" />
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/8 rounded-full blur-[120px]" />

        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
            <div className="relative inline-block mb-8">
              <div className="bg-primary/10 p-8 rounded-3xl backdrop-blur-sm border border-primary/20">
                <Icon size={64} className="text-primary" strokeWidth={1.5} />
              </div>
              <div className="absolute -top-3 -right-3 bg-[#FF6B35] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                <Bell size={12} /> Coming Soon
              </div>
            </div>

            <h1 className="font-heading text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-4">
              <span className="text-primary">{title}</span>{" "}
              <span className="text-white">is on its way.</span>
            </h1>
            <p className="text-lg text-slate-400 font-medium max-w-lg mx-auto leading-relaxed mb-8">
              {description} We&apos;re building something incredible for your healthcare needs.
            </p>

            {/* Progress Bar */}
            <div className="max-w-xs mx-auto mb-10">
              <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                <span>Development Progress</span>
                <span className="text-primary">75%</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "75%" }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                />
              </div>
            </div>

            {/* Email Waitlist */}
            {!submitted ? (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto flex gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-13 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus-visible:ring-primary backdrop-blur-sm flex-1"
                />
                <Button type="submit" className="h-13 px-6 bg-primary hover:bg-primary/90 rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all whitespace-nowrap">
                  Notify Me
                </Button>
              </form>
            ) : (
              <div className="flex items-center justify-center gap-2 text-primary font-bold">
                <CheckCircle2 size={20} />
                You&apos;re on the waitlist! We&apos;ll email you.
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-surface-muted/30 p-6 rounded-2xl border border-border card-hover"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                  <f.icon size={22} />
                </div>
                <h4 className="font-heading font-bold text-foreground text-lg mb-2">{f.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Actions */}
      <section className="py-8 bg-surface-muted/30 border-t border-border">
        <div className="max-w-3xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/">
            <Button className="h-12 px-8 font-bold bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/10 transition-all active:scale-95 group gap-2">
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Button>
          </Link>
          <Link href="/consult">
            <Button variant="outline" className="h-12 px-8 font-bold border-border hover:border-primary hover:bg-primary/10 rounded-xl transition-all gap-2">
              Consult a Doctor
              <ChevronRight size={18} />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
