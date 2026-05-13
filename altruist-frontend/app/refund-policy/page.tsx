"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ReceiptText, CheckCircle2, AlertTriangle, XCircle,
  Clock, ChevronDown, ChevronUp, MessageSquare, CreditCard,
} from "lucide-react"
import { Button } from "@/components/ui/button"

// ── Table of contents ────────────────────────────────────────────────────────
const SECTIONS = [
  { id: "teleconsultation", num: "01", title: "Teleconsultation Services" },
  { id: "medicine-orders",  num: "02", title: "Medicine Orders"           },
  { id: "courier-charges",  num: "03", title: "Courier Charges"           },
  { id: "cancellation",     num: "04", title: "Cancellation Policy"       },
  { id: "processing",       num: "05", title: "Refund Processing"         },
  { id: "exceptions",       num: "06", title: "Exceptions"               },
  { id: "contact",          num: "07", title: "Contact"                   },
]

// ── Reusable styled bullet ────────────────────────────────────────────────────
function TealBullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle2 className="h-5 w-5 text-[#00A87E] flex-shrink-0 mt-0.5" />
      <span className="text-[#475569] font-medium leading-relaxed">{children}</span>
    </li>
  )
}

// ── Shared card animation props ───────────────────────────────────────────────
const cardAnim = {
  initial:     { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0  },
  viewport:    { once: true, margin: "-60px" },
  transition:  { duration: 0.45, ease: "easeOut" },
} as const


export default function RefundPolicyPage() {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id)
  const [tocOpen, setTocOpen] = useState(false)

  // Intersection observer for active TOC highlight
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        })
      },
      { rootMargin: "-20% 0px -60% 0px" }
    )
    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) window.scrollTo({ top: el.offsetTop - 100, behavior: "smooth" })
    setTocOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">

      {/* ── Hero ── */}
      <div className="bg-[#0F172A] pt-24 pb-16 px-6 lg:px-12 relative overflow-hidden">
        {/* Glow blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#00A87E]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto max-w-7xl relative z-10 flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#00A87E] text-sm font-semibold mb-6">
            <ReceiptText size={15} />
            Last updated: June 2025
          </div>

          <p className="text-[#00A87E] font-bold text-base tracking-widest uppercase mb-3">
            Altruist Wellness
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight mb-6">
            Refund &amp; Cancellation Policy
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl font-medium leading-relaxed">
            We believe in transparency. Please read our refund and cancellation terms carefully before making a purchase or booking a consultation.
          </p>

          {/* Quick stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-10">
            {[
              { icon: Clock,         label: "5–7 Business Days", sub: "Refund processing time" },
              { icon: CheckCircle2,  label: "No-Questions",      sub: "Eligible medicine returns" },
              { icon: AlertTriangle, label: "Non-Refundable",    sub: "Completed consultations"  },
            ].map(item => (
              <div key={item.label} className="flex flex-col items-center gap-1 text-center">
                <item.icon className="h-6 w-6 text-[#00A87E] mb-1" />
                <p className="text-white font-bold text-sm">{item.label}</p>
                <p className="text-slate-500 text-xs">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 lg:px-12 py-12 flex flex-col lg:flex-row gap-12 relative">

        {/* ── Mobile TOC (collapsible) ── */}
        <div className="lg:hidden w-full sticky top-20 z-40">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            <button
              onClick={() => setTocOpen(o => !o)}
              className="w-full flex items-center justify-between px-5 py-4 text-sm font-bold text-[#0F172A]"
              aria-expanded={tocOpen}
            >
              <span className="flex items-center gap-2">
                <ReceiptText size={16} className="text-[#00A87E]" />
                Jump to Section
              </span>
              {tocOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {tocOpen && (
              <div className="border-t border-[#F1F5F9] px-3 pb-3">
                {SECTIONS.map(s => (
                  <button key={s.id} onClick={() => scrollTo(s.id)}
                    className={`block w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all mt-1 ${
                      activeSection === s.id
                        ? "bg-[#E6F7F3] text-[#00A87E] font-bold"
                        : "text-[#475569] hover:bg-[#F8FAFC]"
                    }`}>
                    <span className="text-[#00A87E] font-bold mr-2">{s.num}</span>{s.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Desktop Sticky Sidebar TOC ── */}
        <div className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-28 bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6">
            <h3 className="font-heading font-bold text-[#0F172A] text-base mb-5 flex items-center gap-2">
              <ReceiptText size={16} className="text-[#00A87E]" />
              Contents
            </h3>
            <div className="space-y-1">
              {SECTIONS.map(s => (
                <button key={s.id} onClick={() => scrollTo(s.id)}
                  className={`flex items-center gap-3 w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeSection === s.id
                      ? "bg-[#E6F7F3] text-[#00A87E] font-bold"
                      : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                  }`}>
                  <span className={`text-xs font-extrabold w-7 flex-shrink-0 ${
                    activeSection === s.id ? "text-[#00A87E]" : "text-[#CBD5E1]"
                  }`}>{s.num}</span>
                  {s.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 space-y-8 pb-20 min-w-0">

          {/* ── Section 1: Teleconsultation (amber warning) ── */}
          <motion.section id="teleconsultation" {...cardAnim}
            className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#E6F7F3] flex items-center justify-center flex-shrink-0">
                  <span className="text-[#00A87E] font-extrabold text-sm">01</span>
                </div>
                <h2 className="text-xl font-heading font-bold text-[#0F172A]">Teleconsultation Services</h2>
              </div>

              {/* Amber warning banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-4">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-amber-800 font-medium leading-relaxed text-sm">
                  All teleconsultation services provided through the platform are non-refundable. Once a consultation is booked and conducted (or missed by the user), no refund will be issued under any circumstances.
                </p>
              </div>
            </div>
          </motion.section>

          {/* ── Section 2: Medicine Orders ── */}
          <motion.section id="medicine-orders" {...cardAnim}
            className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#E6F7F3] flex items-center justify-center flex-shrink-0">
                  <span className="text-[#00A87E] font-extrabold text-sm">02</span>
                </div>
                <h2 className="text-xl font-heading font-bold text-[#0F172A]">Medicine Orders</h2>
              </div>
              <p className="text-[#475569] font-medium mb-5 leading-relaxed">
                Medicines purchased through the platform may be eligible for refund under the following conditions:
              </p>
              <ul className="space-y-3">
                <TealBullet>
                  The request for refund must be raised within a reasonable time after delivery.
                </TealBullet>
                <TealBullet>
                  Medicines should be unused, unopened, and in original packaging.
                </TealBullet>
              </ul>
            </div>
          </motion.section>

          {/* ── Section 3: Courier Charges ── */}
          <motion.section id="courier-charges" {...cardAnim}
            className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#E6F7F3] flex items-center justify-center flex-shrink-0">
                  <span className="text-[#00A87E] font-extrabold text-sm">03</span>
                </div>
                <h2 className="text-xl font-heading font-bold text-[#0F172A]">Courier Charges</h2>
              </div>
              <p className="text-[#475569] font-medium leading-relaxed">
                In case of approved refunds for medicines, applicable courier or logistics charges will be deducted from the refund amount.
              </p>
            </div>
          </motion.section>

          {/* ── Section 4: Cancellation (amber warning items) ── */}
          <motion.section id="cancellation" {...cardAnim}
            className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#E6F7F3] flex items-center justify-center flex-shrink-0">
                  <span className="text-[#00A87E] font-extrabold text-sm">04</span>
                </div>
                <h2 className="text-xl font-heading font-bold text-[#0F172A]">Cancellation Policy</h2>
              </div>

              <div className="space-y-3">
                {[
                  "Teleconsultation bookings cannot be cancelled once confirmed.",
                  "Medicine orders can be cancelled only before dispatch. Once dispatched, cancellation is not allowed.",
                ].map((text, i) => (
                  <div key={i} className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-amber-800 font-medium text-sm leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* ── Section 5: Refund Processing (teal info box) ── */}
          <motion.section id="processing" {...cardAnim}
            className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#E6F7F3] flex items-center justify-center flex-shrink-0">
                  <span className="text-[#00A87E] font-extrabold text-sm">05</span>
                </div>
                <h2 className="text-xl font-heading font-bold text-[#0F172A]">Refund Processing</h2>
              </div>

              {/* Teal info highlight */}
              <div className="bg-[#E6F7F3] border border-[#00A87E]/20 rounded-xl p-5 flex items-start gap-4">
                <Clock className="h-5 w-5 text-[#00A87E] flex-shrink-0 mt-0.5" />
                <p className="text-[#065F46] font-medium leading-relaxed text-sm">
                  Approved refunds will be processed within <strong>5–7 business days</strong> and credited to the original payment method.
                </p>
              </div>
            </div>
          </motion.section>

          {/* ── Section 6: Exceptions (red-tinted) ── */}
          <motion.section id="exceptions" {...cardAnim}
            className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-red-500 font-extrabold text-sm">06</span>
                </div>
                <h2 className="text-xl font-heading font-bold text-[#0F172A]">Exceptions</h2>
              </div>

              <div className="bg-red-50 border border-red-100 rounded-xl p-6">
                <p className="text-red-700 font-semibold mb-4 flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  No refund will be provided for:
                </p>
                <ul className="space-y-3">
                  {[
                    "Partially used or damaged products",
                    "Delay due to courier partners",
                    "Incorrect address provided by the user",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <XCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <span className="text-red-700 font-medium text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.section>

          {/* ── Section 7: Contact ── */}
          <motion.section id="contact" {...cardAnim}
            className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#E6F7F3] flex items-center justify-center flex-shrink-0">
                  <span className="text-[#00A87E] font-extrabold text-sm">07</span>
                </div>
                <h2 className="text-xl font-heading font-bold text-[#0F172A]">Contact</h2>
              </div>
              <p className="text-[#475569] font-medium mb-6 leading-relaxed">
                For refund or cancellation requests, please contact Altruist Wellness support.
              </p>
              <Link href="/support">
                <Button className="bg-[#00A87E] hover:bg-[#007A5C] text-white font-bold px-7 h-11 rounded-xl shadow-lg shadow-[#00A87E]/20 transition-all active:scale-95 gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Contact Support
                </Button>
              </Link>
            </div>
          </motion.section>

          {/* ── Bottom CTA card ── */}
          <motion.div {...cardAnim}
            className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-2xl p-8 text-center relative overflow-hidden">
            {/* Glow */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#00A87E]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-[#00A87E]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#00A87E]/20">
                <MessageSquare className="h-6 w-6 text-[#00A87E]" />
              </div>
              <h3 className="font-heading text-xl font-bold text-white mb-2">Have a question?</h3>
              <p className="text-slate-400 font-medium text-sm mb-6 max-w-sm mx-auto">
                Our support team is available to help with any refund or cancellation queries.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/support">
                  <Button className="bg-[#00A87E] hover:bg-[#007A5C] text-white font-bold px-7 h-11 rounded-xl shadow-lg shadow-[#00A87E]/25 transition-all active:scale-95 gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Contact Support
                  </Button>
                </Link>
                <Link href="/plans">
                  <Button variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 font-bold px-7 h-11 rounded-xl gap-2 bg-transparent">
                    <CreditCard className="h-4 w-4" />
                    View Plans
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
