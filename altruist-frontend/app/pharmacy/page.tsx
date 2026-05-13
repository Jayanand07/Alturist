"use client"

import React from "react"
import Link from "next/link"
import { Package, Pill, Truck, ShieldCheck, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PharmacyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#E6F7F3] to-[#D1FAE5] flex items-center justify-center mb-8 shadow-lg shadow-[#00A87E]/10">
        <Package className="w-12 h-12 text-[#00A87E]" />
      </div>
      <h1 className="font-heading text-4xl font-extrabold text-[#0F172A] mb-3 tracking-tight">Pharmacy</h1>
      <p className="text-[#475569] text-lg font-medium max-w-md mb-10">
        Browse prescription &amp; OTC medicines, vitamins, and healthcare essentials from our trusted pharmacy network.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-2xl w-full mb-10">
        {[
          { icon: Truck,       title: "Free Delivery",  desc: "On orders above ₹500" },
          { icon: ShieldCheck, title: "100% Genuine",   desc: "Sourced from licensed distributors" },
          { icon: Clock,       title: "24h Delivery",   desc: "Express delivery available" },
        ].map(item => (
          <div key={item.title} className="bg-white rounded-2xl border border-[#E2E8F0] p-5 flex flex-col items-center gap-2 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#E6F7F3] flex items-center justify-center">
              <item.icon className="h-5 w-5 text-[#00A87E]" />
            </div>
            <p className="font-bold text-[#0F172A] text-sm">{item.title}</p>
            <p className="text-[#475569] text-xs">{item.desc}</p>
          </div>
        ))}
      </div>

      <Link href="/medicines">
        <Button className="bg-[#00A87E] hover:bg-[#007A5C] text-white font-bold px-10 py-6 text-base rounded-2xl shadow-xl shadow-[#00A87E]/20 transition-all active:scale-95">
          <Pill className="h-5 w-5 mr-2" />
          Browse Medicines
        </Button>
      </Link>
    </div>
  )
}
