"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle2, Loader2, Tag, ShieldCheck, Truck,
  TestTube, Activity, HeartPulse, Building2, Star,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import api from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ── Types ─────────────────────────────────────────────────────────────────────
interface SubscriptionPlan {
  id: string; name: string; description: string
  monthlyPrice: number; yearlyPrice: number
  consultationsPerMonth: number
  labDiscountEnabled: boolean; labDiscountPercent: number
  medicineDiscountEnabled: boolean; medicineDiscountPercent: number
  prioritySupport: boolean; isActive: boolean
}
interface UserSubscription {
  id: string; planName: string; billingCycle: string; status: string
  startDate: string; endDate: string; nextBillingDate: string
  consultationsUsed: number; consultationsRemaining: number
}

// ── Hardcoded client plan content ─────────────────────────────────────────────
const CLIENT_PLANS = [
  {
    key: "student",
    tag: "For Students",
    name: "Student Plan",
    price: 849,
    popular: false,
    benefits: [
      "Unlimited tele and video consultations",
      "One clinic visit or hospital OPD consultation",
      "Up to 20% off on lab tests",
      "Priority customer support",
    ],
  },
  {
    key: "standard",
    tag: "For Working Adults",
    name: "Standard Plan",
    price: 999,
    popular: true,
    benefits: [
      "Unlimited tele and video consultations",
      "One clinic visit or hospital OPD consultation",
      "Up to 20% off on lab tests",
      "Priority customer support",
    ],
  },
]

const LAB_PACKAGES = [
  {
    Icon: TestTube,
    title: "Basic Health Checkup",
    tests: "Blood Sugar, CBC, Basic screening tests",
    price: "₹499 – ₹699",
    badge: null,
    badgeColor: "",
    gradient: "from-blue-50 to-[#E6F7F3]",
  },
  {
    Icon: Activity,
    title: "Advanced Health Package",
    tests: "Full body checkup, Liver, Kidney, Thyroid tests, Detailed health report",
    price: "₹1199 – ₹1499",
    badge: "Comprehensive",
    badgeColor: "bg-[#E6F7F3] text-[#00A87E]",
    gradient: "from-[#E6F7F3] to-emerald-50",
  },
  {
    Icon: HeartPulse,
    title: "Doctor Consultation + Basic Tests",
    tests: "Best for quick diagnosis & treatment",
    price: "Starting at ₹1199",
    badge: "Best Value",
    badgeColor: "bg-[#FF6B35]/10 text-[#FF6B35]",
    gradient: "from-orange-50 to-amber-50",
    accent: true,
  },
]

const MEDICINE_FEATURES = [
  { Icon: Tag,         label: "Up to 20% discount on medicines"              },
  { Icon: ShieldCheck, label: "Genuine & verified products"                  },
  { Icon: Truck,       label: "Fast delivery (same/next day in select areas)" },
]

const EASE = "easeOut" as const

const cardAnim = (i: number) => ({
  initial:     { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0  },
  viewport:    { once: true } as const,
  transition:  { delay: i * 0.1, duration: 0.45, ease: EASE },
})


// ── Page ──────────────────────────────────────────────────────────────────────
export default function PlansPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showCancelModal, setShowCancelModal] = useState(false)

  const { data: plans } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const res = await api.get<SubscriptionPlan[]>("/subscriptions/plans")
      return res.data.sort((a, b) => a.yearlyPrice - b.yearlyPrice)
    },
  })

  const { data: activeSub } = useQuery({
    queryKey: ["my-subscription"],
    queryFn: async () => {
      if (!user) return null
      try { const r = await api.get<UserSubscription>("/subscriptions/my"); return r.data || null }
      catch { return null }
    },
    enabled: !!user,
  })

  const subscribeMutation = useMutation({
    mutationFn: async ({ planId, planName }: { planId: string; planName: string }) => {
      const r = await api.post("/subscriptions/subscribe", { planId, billingCycle: "YEARLY" })
      return { data: r.data, planName }
    },
    onSuccess: ({ planName }) => {
      toast.success(`Welcome to ${planName}! 🎉`)
      queryClient.invalidateQueries({ queryKey: ["my-subscription"] })
    },
    onError: (e: any) => toast.error(e.response?.data?.error || "Failed to subscribe."),
  })

  const renewMutation = useMutation({
    mutationFn: async () => { const r = await api.post("/subscriptions/renew", { billingCycle: "YEARLY" }); return r.data },
    onSuccess: () => { toast.success("Subscription renewed!"); queryClient.invalidateQueries({ queryKey: ["my-subscription"] }) },
    onError: (e: any) => toast.error(e.response?.data?.error || "Failed to renew."),
  })

  const cancelMutation = useMutation({
    mutationFn: async () => { const r = await api.post("/subscriptions/cancel"); return r.data },
    onSuccess: () => {
      toast.success("Subscription cancelled.")
      setShowCancelModal(false)
      queryClient.invalidateQueries({ queryKey: ["my-subscription"] })
    },
    onError: (e: any) => { toast.error(e.response?.data?.error || "Failed to cancel."); setShowCancelModal(false) },
  })

  const handleSubscribe = (clientPlanName: string) => {
    if (!user) { toast.error("Please log in to subscribe."); return }
    const matched = plans?.find(p => p.name.toLowerCase().includes(clientPlanName.toLowerCase()))
    if (!matched) { toast.error("Plan not found. Please try again."); return }
    subscribeMutation.mutate({ planId: matched.id, planName: matched.name })
  }

  const isCurrentPlan = (name: string) =>
    activeSub?.status === "ACTIVE" && activeSub.planName.toLowerCase().includes(name.toLowerCase())

  const isSubscribed = activeSub?.status === "ACTIVE"

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden pb-32 pt-20 px-6"
        style={{ background: "linear-gradient(135deg, #0F172A 0%, #0D1F2D 100%)" }}>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#00A87E]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#00A87E] text-xs font-bold uppercase tracking-widest mb-6">
            <Star className="h-3.5 w-3.5" /> Annual Subscription Plans
          </div>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-5 leading-tight">
            Simple. Affordable.{" "}
            <span className="text-[#00A87E]">Trusted Healthcare.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            At Altruist Wellness, we make healthcare accessible with transparent pricing, expert doctors,
            and reliable services—all in one place.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-20 relative z-10 pb-24 space-y-24">

        {/* ── Current plan banner ── */}
        {user && activeSub && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className={cn("rounded-2xl border p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-sm",
              activeSub.status === "ACTIVE"    ? "bg-[#E6F7F3] border-[#00A87E]/30" :
              activeSub.status === "CANCELLED" ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200")}>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <CheckCircle2 className="h-5 w-5 text-[#00A87E]" />
                <h2 className="font-heading font-bold text-[#0F172A] text-lg">
                  You&apos;re on the <span className="text-[#00A87E]">{activeSub.planName}</span>
                </h2>
                <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  activeSub.status === "ACTIVE" ? "bg-[#00A87E]/15 text-[#00A87E]" :
                  activeSub.status === "CANCELLED" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700")}>
                  {activeSub.status}
                </span>
              </div>
              <p className="text-sm text-[#475569] font-medium">
                {activeSub.status === "ACTIVE" && `Renews: ${new Date(activeSub.nextBillingDate).toLocaleDateString()}`}
                {activeSub.status === "CANCELLED" && `Expires: ${new Date(activeSub.endDate).toLocaleDateString()}`}
                {activeSub.status === "EXPIRED" && `Expired: ${new Date(activeSub.endDate).toLocaleDateString()}`}
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              {(activeSub.status === "CANCELLED" || activeSub.status === "EXPIRED") && (
                <Button onClick={() => renewMutation.mutate()} disabled={renewMutation.isPending}
                  className="bg-[#00A87E] hover:bg-[#007A5C] text-white font-bold h-10 px-5 rounded-xl gap-2">
                  {renewMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Renew
                </Button>
              )}
              {activeSub.status === "ACTIVE" && (
                <Button variant="outline" onClick={() => setShowCancelModal(true)}
                  className="border-red-200 text-red-600 hover:bg-red-50 font-bold h-10 px-5 rounded-xl">
                  Cancel
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {/* ── SECTION 1: Doctor Consultation Plans ── */}
        <section>
          <div className="text-center mb-12">
            <p className="text-[#00A87E] font-bold text-xs uppercase tracking-widest mb-2">Annual Subscription</p>
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-[#0F172A] mb-1">
              Doctor Consultation Plans
            </h2>
            <div className="h-1 w-16 bg-[#00A87E] rounded-full mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Student Plan */}
            {CLIENT_PLANS.map((plan, i) => {
              const current = isCurrentPlan(plan.key)
              const loading = subscribeMutation.isPending &&
                subscribeMutation.variables?.planName?.toLowerCase().includes(plan.key)

              return (
                <motion.div key={plan.key} {...cardAnim(i)}
                  className={cn(
                    "relative bg-white rounded-2xl border flex flex-col h-full transition-all card-hover",
                    plan.popular
                      ? "border-[#00A87E] shadow-xl shadow-[#00A87E]/10 md:-translate-y-3 scale-[1.02]"
                      : "border-[#E2E8F0] shadow-sm",
                    current && "ring-2 ring-[#00A87E] ring-offset-2"
                  )}>
                  {/* Popular ribbon */}
                  {plan.popular && !current && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#00A87E] to-[#059669] text-white text-[10px] font-extrabold uppercase tracking-widest px-4 py-1 rounded-full shadow-md whitespace-nowrap">
                      Most Popular
                    </div>
                  )}
                  {current && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00A87E] text-white text-[10px] font-extrabold uppercase tracking-widest px-4 py-1 rounded-full shadow-md flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3" /> Current Plan
                    </div>
                  )}

                  <div className="p-7 flex flex-col flex-1">
                    {/* Tag */}
                    <span className="inline-block px-3 py-1 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569] text-xs font-bold mb-4">
                      {plan.tag}
                    </span>
                    <h3 className="font-heading text-2xl font-extrabold text-[#0F172A] mb-1">{plan.name}</h3>

                    {/* Price */}
                    <div className="flex items-baseline gap-1 mt-3 mb-6">
                      <span className="text-[#00A87E] font-extrabold text-3xl">₹</span>
                      <span className="font-display text-5xl font-extrabold text-[#0F172A]">{plan.price}</span>
                      <span className="text-[#475569] font-medium ml-1">/ year</span>
                    </div>

                    {/* Benefits */}
                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.benefits.map(b => (
                        <li key={b} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-[#00A87E] flex-shrink-0 mt-0.5" />
                          <span className="text-[#475569] font-medium text-sm leading-relaxed">{b}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Button
                      disabled={current || (isSubscribed && !current) || subscribeMutation.isPending}
                      onClick={() => handleSubscribe(plan.key)}
                      className={cn(
                        "w-full h-12 font-bold rounded-xl text-base transition-all active:scale-[0.98]",
                        current
                          ? "bg-[#E6F7F3] text-[#00A87E] cursor-default hover:bg-[#E6F7F3]"
                          : plan.popular
                            ? "bg-[#00A87E] hover:bg-[#007A5C] text-white shadow-lg shadow-[#00A87E]/25"
                            : "bg-[#0F172A] hover:bg-[#1E293B] text-white"
                      )}>
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" />
                        : current ? <><CheckCircle2 className="h-4 w-4 mr-2 inline" />Current Plan</>
                        : isSubscribed ? "Switch (Cancel First)"
                        : "Subscribe Now — ₹" + plan.price + "/yr"}
                    </Button>
                  </div>
                </motion.div>
              )
            })}

            {/* Enterprise Card */}
            <motion.div {...cardAnim(2)}
              className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col justify-between p-7 card-hover">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 text-slate-600 text-xs font-bold mb-4">
                  <Building2 className="h-3.5 w-3.5" /> Enterprise Plan
                </span>
                <h3 className="font-heading text-2xl font-extrabold text-[#0F172A] mb-3">Enterprise</h3>
                <p className="text-[#475569] font-medium text-sm leading-relaxed mb-8">
                  Separate pricing for coaching institutes, colleges, universities and corporate clients.
                </p>
              </div>
              <a href="mailto:support@altruistwellness.com">
                <Button variant="outline"
                  className="w-full h-12 font-bold rounded-xl border-2 border-slate-300 text-slate-600 hover:border-[#00A87E] hover:text-[#00A87E] transition-all">
                  Contact Us
                </Button>
              </a>
            </motion.div>
          </div>
        </section>

        {/* ── SECTION 2: Lab Test Packages ── */}
        <section>
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-[#0F172A] mb-1">
              Lab Test Packages
            </h2>
            <div className="h-1 w-16 bg-[#00A87E] rounded-full mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {LAB_PACKAGES.map((pkg, i) => (
              <motion.div key={pkg.title} {...cardAnim(i)}
                className={cn(
                  "rounded-2xl p-7 flex flex-col border card-hover bg-gradient-to-br",
                  pkg.gradient,
                  pkg.accent ? "border-[#FF6B35]/20 shadow-lg shadow-orange-50" : "border-[#E2E8F0] shadow-sm"
                )}>
                {/* Icon */}
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center mb-5",
                  pkg.accent ? "bg-[#FF6B35]/10" : "bg-[#00A87E]/10"
                )}>
                  <pkg.Icon className={cn("h-6 w-6", pkg.accent ? "text-[#FF6B35]" : "text-[#00A87E]")} />
                </div>

                {pkg.badge && (
                  <span className={cn("inline-block self-start px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-3", pkg.badgeColor)}>
                    {pkg.badge}
                  </span>
                )}

                <h3 className="font-heading text-lg font-bold text-[#0F172A] mb-1">{pkg.title}</h3>
                <p className="text-[#475569] text-sm font-medium mb-4 flex-1 leading-relaxed">{pkg.tests}</p>

                <div className={cn("text-2xl font-extrabold font-display", pkg.accent ? "text-[#FF6B35]" : "text-[#00A87E]")}>
                  {pkg.price}
                </div>

                <Link href="/labs" className="mt-5">
                  <Button variant="outline"
                    className={cn("w-full rounded-xl font-bold h-11 transition-all",
                      pkg.accent
                        ? "border-[#FF6B35]/30 text-[#FF6B35] hover:bg-[#FF6B35]/5"
                        : "border-[#00A87E]/30 text-[#00A87E] hover:bg-[#E6F7F3]"
                    )}>
                    Book Now →
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── SECTION 3: Medicines & Delivery ── */}
        <section>
          <div className="text-center mb-10">
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-[#0F172A] mb-1">
              Medicines &amp; Delivery
            </h2>
            <div className="h-1 w-16 bg-[#00A87E] rounded-full mx-auto mt-3" />
          </div>

          <motion.div {...cardAnim(0)}
            className="bg-gradient-to-br from-[#0F172A] to-[#1A2E3B] rounded-2xl p-8 md:p-10 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#00A87E]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex flex-col sm:flex-row gap-6 flex-1">
                {MEDICINE_FEATURES.map((f, i) => (
                  <div key={f.label} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#00A87E]/15 border border-[#00A87E]/20 flex items-center justify-center flex-shrink-0">
                      <f.Icon className="h-5 w-5 text-[#00A87E]" />
                    </div>
                    <p className="text-slate-300 font-medium text-sm leading-snug pt-1">{f.label}</p>
                  </div>
                ))}
              </div>
              <Link href="/medicines" className="flex-shrink-0">
                <Button className="bg-[#00A87E] hover:bg-[#007A5C] text-white font-bold px-7 h-11 rounded-xl shadow-lg shadow-[#00A87E]/25 active:scale-95 transition-all">
                  Shop Medicines →
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* ── SECTION 4: Bottom CTA ── */}
        <motion.section {...cardAnim(0)}
          className="bg-gradient-to-br from-[#00A87E] to-[#059669] rounded-3xl p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 hero-grid-pattern opacity-20" />
          <div className="relative z-10">
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-white mb-3">
              Get Started Today
            </h2>
            <p className="text-white/80 font-medium text-lg max-w-xl mx-auto mb-8">
              Book your consultation, order medicines, or schedule lab tests—all from one platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button className="bg-white text-[#00A87E] hover:bg-white/90 font-bold px-9 h-12 rounded-xl shadow-lg text-base active:scale-95 transition-all">
                  Sign Up Now
                </Button>
              </Link>
              <Link href="/consult">
                <Button variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 font-bold px-9 h-12 rounded-xl text-base bg-transparent active:scale-95 transition-all">
                  Book Consultation
                </Button>
              </Link>
            </div>
          </div>
        </motion.section>
      </div>

      {/* ── Cancel Modal ── */}
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-7 w-full max-w-md shadow-2xl">
              <h3 className="font-heading text-xl font-bold text-[#0F172A] mb-2">Cancel Subscription?</h3>
              <p className="text-[#475569] mb-6 font-medium">
                You will lose access to free consultations and discounts at the end of your billing cycle.
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowCancelModal(false)}
                  className="font-bold rounded-xl">Keep Plan</Button>
                <Button variant="destructive" onClick={() => cancelMutation.mutate()}
                  disabled={cancelMutation.isPending} className="font-bold rounded-xl gap-2">
                  {cancelMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Yes, Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
