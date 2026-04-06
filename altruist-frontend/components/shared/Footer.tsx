"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Twitter, Instagram, Facebook, Linkedin, ShieldCheck, HeartPulse, Phone, Mail, MapPin } from "lucide-react"

export default function Footer() {
  const footerSections = [
    {
      title: "Our Services",
      links: [
        { label: "Consult Doctors", href: "/consult" },
        { label: "Diagnostic Tests", href: "/labs" },
        { label: "Order Medicines", href: "/medicines" },
        { label: "Health Plans", href: "/plans" },
        { label: "For Corporates", href: "/about" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Careers", href: "/about" },
        { label: "Press", href: "/about" },
        { label: "Blog", href: "/about" },
        { label: "Contact Us", href: "/about" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", href: "/about" },
        { label: "Privacy Policy", href: "/about" },
        { label: "Terms of Service", href: "/about" },
        { label: "Refund Policy", href: "/about" },
        { label: "Cookie Policy", href: "/about" },
      ],
    },
  ]

  return (
    <footer className="bg-[#0F172A] text-white pt-16 pb-8 px-6 md:px-12 font-sans">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 sm:gap-10">
          {/* Column 1 - Brand */}
          <div className="lg:col-span-2 flex flex-col space-y-6">
            <Link href="/" className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-90">
              <HeartPulse className="w-8 h-8 text-[#00A87E]" />
              <span className="font-heading text-2xl font-extrabold text-white tracking-tight">ALTRUIST</span>
            </Link>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-[300px]">
              Instant Healthcare. Anytime. Anywhere. Making quality healthcare affordable and accessible for every Indian family.
            </p>
            <div className="flex items-center gap-4 pt-2">
              {[
                { icon: Twitter, href: "#" },
                { icon: Instagram, href: "#" },
                { icon: Facebook, href: "#" },
                { icon: Linkedin, href: "#" },
              ].map((social, idx) => (
                <Link key={idx} href={social.href} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-[#00A87E] hover:bg-[#00A87E]/10 hover:border-[#00A87E]/30 transition-all">
                  <social.icon size={18} strokeWidth={1.5} />
                </Link>
              ))}
            </div>

            {/* Contact Info */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Phone size={14} className="text-[#00A87E]" />
                <span>+91 800 123 4567</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Mail size={14} className="text-[#00A87E]" />
                <span>support@altruist.health</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <MapPin size={14} className="text-[#00A87E]" />
                <span>Amritsar, Punjab, India</span>
              </div>
            </div>
          </div>

          {/* Other Columns */}
          {footerSections.map((section) => (
            <div key={section.title} className="flex flex-col space-y-5">
              <h3 className="font-heading text-sm font-extrabold text-white tracking-wider uppercase">
                {section.title}
              </h3>
              <ul className="flex flex-col space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href} 
                      className="text-slate-400 hover:text-[#00A87E] transition-colors text-sm font-medium"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-white/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
              <ShieldCheck className="text-[#00A87E]/60" size={18} />
              <span>Licensed healthcare platform. Not a substitute for professional medical advice.</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex -space-x-1">
                {["VISA", "UPI", "MC", "GPay"].map((pay, i) => (
                  <div key={i} className="h-7 w-12 border border-white/10 rounded-md bg-white/5 flex items-center justify-center text-[8px] font-bold text-slate-500 tracking-wider">
                    {pay}
                  </div>
                ))}
              </div>
              <p className="text-slate-600 text-[10px] font-bold tracking-widest uppercase">© 2026 Altruist</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-6 mt-6 text-xs text-slate-500 font-medium">
            <Link href="/about" className="hover:text-[#00A87E] transition-colors">Privacy Policy</Link>
            <span className="text-white/10">|</span>
            <Link href="/about" className="hover:text-[#00A87E] transition-colors">Terms of Service</Link>
            <span className="text-white/10">|</span>
            <Link href="/about" className="hover:text-[#00A87E] transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
