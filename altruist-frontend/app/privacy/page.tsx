"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Shield, FileHeart, UserCheck, Pill, Database,
  Share2, Lock, UserCog, Video, AlertTriangle,
  RefreshCw, MessageCircle, ChevronDown, ChevronUp,
  MessageSquare, ReceiptText,
} from "lucide-react"
import { Button } from "@/components/ui/button"

// ── Table of contents ─────────────────────────────────────────────────────────
const SECTIONS = [
  { id: "introduction",   num: "01", title: "Introduction",                   icon: Shield        },
  { id: "patient",        num: "02", title: "Patient Registration & Records",  icon: FileHeart     },
  { id: "doctor",         num: "03", title: "Doctor Registration & Verification", icon: UserCheck  },
  { id: "medicine",       num: "04", title: "Medicine Listing",                icon: Pill          },
  { id: "data-usage",     num: "05", title: "Data Usage",                      icon: Database      },
  { id: "data-sharing",   num: "06", title: "Data Sharing",                    icon: Share2        },
  { id: "data-security",  num: "07", title: "Data Security",                   icon: Lock          },
  { id: "user-rights",    num: "08", title: "User Rights",                     icon: UserCog       },
  { id: "telemedicine",   num: "09", title: "Telemedicine Compliance",         icon: Video         },
  { id: "disclaimer",     num: "10", title: "Disclaimer",                      icon: AlertTriangle },
  { id: "updates",        num: "11", title: "Updates",                         icon: RefreshCw     },
  { id: "contact",        num: "12", title: "Contact",                         icon: MessageCircle },
]

const cardAnim = {
  initial:     { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0  },
  viewport:    { once: true, margin: "-60px" },
  transition:  { duration: 0.45, ease: "easeOut" },
} as const

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({
  num, title, Icon, danger = false,
}: {
  num: string; title: string; Icon: React.ElementType; danger?: boolean
}) {
  return (
    <div className="flex items-center gap-4 mb-5">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
        danger ? "bg-red-50" : "bg-primary/10"
      }`}>
        <Icon className={`h-5 w-5 ${danger ? "text-red-500" : "text-primary"}`} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-0.5">{num}</p>
        <h2 className="text-xl font-heading font-bold text-foreground">{title}</h2>
      </div>
    </div>
  )
}

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id)
  const [tocOpen, setTocOpen]             = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id) })
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
    <div className="min-h-screen bg-surface-muted/30 font-sans">

      {/* ── Hero ── */}
      <div className="bg-[#0F172A] pt-24 pb-16 px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto max-w-4xl relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface/5 border border-white/10 text-primary text-sm font-semibold mb-6">
            <Shield size={15} />
            Last updated: June 2025
          </div>
          <p className="text-primary font-bold text-[15px] leading-relaxed tracking-widest uppercase mb-3">
            Altruist Wellness
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight mb-6">
            Privacy Policy &amp; Terms
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl font-medium leading-relaxed">
            Your privacy is fundamental to everything we do. We are committed to handling your
            health data with the highest standards of security and transparency.
          </p>

          {/* Trust chips */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
            {[
              { emoji: "🔒", label: "End-to-End Encrypted"       },
              { emoji: "🇮🇳", label: "IT Act 2000 Compliant"       },
              { emoji: "🏥", label: "Telemedicine Guidelines"     },
              { emoji: "🚫", label: "Data Never Sold"             },
            ].map(c => (
              <span key={c.label}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface/5 border border-white/10 text-slate-300 text-xs font-semibold backdrop-blur-sm">
                <span>{c.emoji}</span> {c.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 lg:px-12 py-12 flex flex-col lg:flex-row gap-12 relative">

        {/* ── Mobile TOC (collapsible) ── */}
        <div className="lg:hidden w-full sticky top-20 z-40">
          <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
            <button onClick={() => setTocOpen(o => !o)} aria-expanded={tocOpen}
              className="w-full flex items-center justify-between px-5 py-4 text-sm font-bold text-foreground">
              <span className="flex items-center gap-2">
                <Shield size={16} className="text-primary" /> Jump to Section
              </span>
              {tocOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {tocOpen && (
              <div className="border-t border-[#F1F5F9] px-3 pb-3 max-h-64 overflow-y-auto">
                {SECTIONS.map(s => (
                  <button key={s.id} onClick={() => scrollTo(s.id)}
                    className={`flex items-center gap-3 w-full text-left px-4 py-2.5 rounded-xl text-xs font-medium transition-all mt-1 ${
                      activeSection === s.id
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-muted-foreground hover:bg-surface-muted/30"
                    }`}>
                    <span className="font-extrabold text-primary w-6 flex-shrink-0">{s.num}</span>
                    {s.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Desktop Sticky Sidebar TOC ── */}
        <div className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-28 bg-surface rounded-2xl shadow-sm border border-border p-6 max-h-[80vh] overflow-y-auto">
            <h3 className="font-heading font-bold text-foreground text-[15px] leading-relaxed mb-5 flex items-center gap-2">
              <Shield size={16} className="text-primary" /> Contents
            </h3>
            <div className="space-y-0.5">
              {SECTIONS.map(s => (
                <button key={s.id} onClick={() => scrollTo(s.id)}
                  className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    activeSection === s.id
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-muted-foreground hover:bg-surface-muted/30 hover:text-foreground"
                  }`}>
                  <span className={`font-extrabold w-6 flex-shrink-0 ${
                    activeSection === s.id ? "text-primary" : "text-[#CBD5E1]"
                  }`}>{s.num}</span>
                  <s.icon className={`h-3.5 w-3.5 flex-shrink-0 ${
                    activeSection === s.id ? "text-primary" : "text-[#CBD5E1]"
                  }`} />
                  <span className="leading-tight">{s.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 space-y-8 pb-20 min-w-0">

          {/* §1 Introduction */}
          <motion.section id="introduction" {...cardAnim}
            className="bg-surface rounded-2xl border border-border shadow-sm p-8">
            <SectionHeader num="01" title="Introduction" Icon={Shield} />
            <p className="text-muted-foreground font-medium leading-relaxed">
              Altruist Wellness is committed to protecting user privacy and ensuring compliance with applicable
              laws including the <strong className="text-foreground">Information Technology Act, 2000</strong> and{" "}
              <strong className="text-foreground">Telemedicine Practice Guidelines (India)</strong>.
            </p>
          </motion.section>

          {/* §2 Patient Registration */}
          <motion.section id="patient" {...cardAnim}
            className="bg-surface rounded-2xl border border-border shadow-sm p-8">
            <SectionHeader num="02" title="Patient Registration & Medical Records" Icon={FileHeart} />
            <p className="text-muted-foreground font-medium leading-relaxed">
              We collect personal and medical information such as name, age, gender, contact details, and health
              history. This data is used for consultation, diagnosis support, and maintaining electronic health
              records. All records are handled with strict confidentiality.
            </p>
          </motion.section>

          {/* §3 Doctor Registration */}
          <motion.section id="doctor" {...cardAnim}
            className="bg-surface rounded-2xl border border-border shadow-sm p-8">
            <SectionHeader num="03" title="Doctor Registration & Verification" Icon={UserCheck} />
            <p className="text-muted-foreground font-medium leading-relaxed">
              Doctors must provide valid credentials including medical license, qualifications, and experience.
              This information is verified before onboarding and stored securely.
            </p>
          </motion.section>

          {/* §4 Medicine Listing */}
          <motion.section id="medicine" {...cardAnim}
            className="bg-surface rounded-2xl border border-border shadow-sm p-8">
            <SectionHeader num="04" title="Medicine Listing" Icon={Pill} />
            <p className="text-muted-foreground font-medium leading-relaxed">
              Medicine-related data including composition, dosage, and usage is displayed for informational
              purposes. Users are advised to consult a qualified doctor before consumption.
            </p>
          </motion.section>

          {/* §5 Data Usage — teal callout for "not sold" */}
          <motion.section id="data-usage" {...cardAnim}
            className="bg-surface rounded-2xl border border-border shadow-sm p-8">
            <SectionHeader num="05" title="Data Usage" Icon={Database} />
            <p className="text-muted-foreground font-medium leading-relaxed mb-5">
              User data is used to provide services, improve platform functionality, and maintain internal records.
            </p>
            {/* Teal callout */}
            <div className="bg-primary/10 border border-primary/25 rounded-xl px-5 py-4 flex items-center gap-3">
              <span className="text-xl flex-shrink-0">🚫</span>
              <p className="text-[#065F46] font-bold text-sm">
                Data is not sold to third parties — ever.
              </p>
            </div>
          </motion.section>

          {/* §6 Data Sharing */}
          <motion.section id="data-sharing" {...cardAnim}
            className="bg-surface rounded-2xl border border-border shadow-sm p-8">
            <SectionHeader num="06" title="Data Sharing" Icon={Share2} />
            <p className="text-muted-foreground font-medium leading-relaxed">
              Data may be shared with healthcare professionals for consultation purposes or with authorities if
              required by law.
            </p>
          </motion.section>

          {/* §7 Data Security — feature chips */}
          <motion.section id="data-security" {...cardAnim}
            className="bg-surface rounded-2xl border border-border shadow-sm p-8">
            <SectionHeader num="07" title="Data Security" Icon={Lock} />
            <p className="text-muted-foreground font-medium leading-relaxed mb-5">
              We implement appropriate technical safeguards such as encryption, secure servers, and restricted
              access controls.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { emoji: "🔒", label: "Encrypted Storage"  },
                { emoji: "🖥️", label: "Secure Servers"     },
                { emoji: "🛡️", label: "Restricted Access"  },
              ].map(chip => (
                <span key={chip.label}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
                  <span>{chip.emoji}</span> {chip.label}
                </span>
              ))}
            </div>
          </motion.section>

          {/* §8 User Rights */}
          <motion.section id="user-rights" {...cardAnim}
            className="bg-surface rounded-2xl border border-border shadow-sm p-8">
            <SectionHeader num="08" title="User Rights" Icon={UserCog} />
            <p className="text-muted-foreground font-medium leading-relaxed">
              Users have the right to access, update, or request deletion of their personal data, subject to
              legal requirements.
            </p>
          </motion.section>

          {/* §9 Telemedicine — GoI badge */}
          <motion.section id="telemedicine" {...cardAnim}
            className="bg-surface rounded-2xl border border-border shadow-sm p-8">
            <SectionHeader num="09" title="Telemedicine Compliance" Icon={Video} />
            <p className="text-muted-foreground font-medium leading-relaxed mb-5">
              All online consultations are conducted in accordance with Telemedicine Practice Guidelines issued
              by the Government of India.
            </p>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold">
              🇮🇳 Government of India Compliant
            </span>
          </motion.section>

          {/* §10 Disclaimer — amber warning */}
          <motion.section id="disclaimer" {...cardAnim}
            className="bg-surface rounded-2xl border border-border shadow-sm p-8">
            <SectionHeader num="10" title="Disclaimer" Icon={AlertTriangle} danger />
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-4">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-amber-800 font-medium leading-relaxed text-sm">
                The platform provides information and consultation support but does not replace emergency medical
                services. Altruist Wellness is not liable for misuse of information.
              </p>
            </div>
          </motion.section>

          {/* §11 Updates */}
          <motion.section id="updates" {...cardAnim}
            className="bg-surface rounded-2xl border border-border shadow-sm p-8">
            <SectionHeader num="11" title="Updates" Icon={RefreshCw} />
            <p className="text-muted-foreground font-medium leading-relaxed">
              This policy may be updated periodically. Continued use of the website implies acceptance of changes.
            </p>
          </motion.section>

          {/* §12 Contact */}
          <motion.section id="contact" {...cardAnim}
            className="bg-surface rounded-2xl border border-border shadow-sm p-8">
            <SectionHeader num="12" title="Contact" Icon={MessageCircle} />
            <p className="text-muted-foreground font-medium leading-relaxed mb-6">
              For queries, contact Altruist Wellness support team.
            </p>
            <Link href="/support">
              <Button className="bg-primary hover:bg-primary/90 text-white font-bold px-7 h-11 rounded-xl shadow-lg shadow-[#00A87E]/20 transition-all active:scale-95 gap-2">
                <MessageSquare className="h-4 w-4" /> Contact Support
              </Button>
            </Link>
          </motion.section>

          {/* ── Bottom CTA ── */}
          <motion.div {...cardAnim}
            className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-2xl p-8 text-center relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-bold text-white mb-2">Questions about your privacy?</h3>
              <p className="text-slate-400 font-medium text-sm mb-6 max-w-sm mx-auto">
                Our support team is available to address any privacy or data concerns.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/support">
                  <Button className="bg-primary hover:bg-primary/90 text-white font-bold px-7 h-11 rounded-xl shadow-lg shadow-[#00A87E]/25 transition-all active:scale-95 gap-2">
                    <MessageSquare className="h-4 w-4" /> Contact Support
                  </Button>
                </Link>
                <Link href="/refund-policy">
                  <Button variant="outline"
                    className="border-white/20 text-white hover:bg-surface/10 font-bold px-7 h-11 rounded-xl gap-2 bg-transparent">
                    <ReceiptText className="h-4 w-4" /> Refund Policy
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
