"use client"

import React from "react"
import Link from "next/link"
import {
  Twitter, Instagram, Facebook, Linkedin,
  ShieldCheck, HeartPulse, Phone, Mail, MapPin,
} from "lucide-react"

export default function Footer() {
  const footerSections = [
    {
      title: "Our Services",
      links: [
        { label: "Consult Doctors",  href: "/consult"   },
        { label: "Diagnostic Tests", href: "/labs"      },
        { label: "Order Medicines",  href: "/medicines" },
        { label: "Health Plans",     href: "/plans"     },
        { label: "Doctor Vlogs",     href: "/vlogs"     },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us",   href: "/about"                             },
        { label: "Careers",    href: "/about"                             },
        { label: "Press",      href: "/about"                             },
        { label: "Blog",       href: "/vlogs"                             },
        { label: "Contact Us", href: "mailto:support@altruistwellness.com" },
      ],
    },
    {
      title: "Support & Legal",
      links: [
        { label: "Help & Support",     href: "/support"       },
        { label: "Terms & Conditions", href: "/terms"         },
        { label: "Privacy Policy",     href: "/privacy"       },
        { label: "Refund Policy",      href: "/refund-policy" },
        { label: "Cookie Policy",      href: "/about"         },
      ],
    },
  ]

  return (
    <footer className="bg-[#0F172A] text-white pt-16 pb-8 px-6 md:px-12 font-sans">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 sm:gap-10">

          {/* Column 1 — Brand */}
          <div className="lg:col-span-2 flex flex-col space-y-6">
            <Link href="/" className="inline-flex items-center transition-opacity hover:opacity-90">
              <img src="/logo.png" alt="Altruist Wellness" className="h-[54px] w-auto object-contain brightness-0 invert" />
            </Link>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-[300px]">
              Instant Healthcare. Anytime. Anywhere. Making quality healthcare
              affordable and accessible for every Indian family.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-4 pt-2">
              {[
                { icon: Twitter,   href: "#", label: "Twitter"   },
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Facebook,  href: "#", label: "Facebook"  },
                { icon: Linkedin,  href: "#", label: "LinkedIn"  },
              ].map((s) => (
                <Link key={s.label} href={s.href} aria-label={s.label}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 hover:border-primary/30 transition-all">
                  <s.icon size={18} strokeWidth={1.5} />
                </Link>
              ))}
            </div>

            {/* Contact info */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Phone size={14} className="text-primary flex-shrink-0" />
                <span>+91 800 123 4567</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Mail size={14} className="text-primary flex-shrink-0" />
                <a href="mailto:support@altruistwellness.com"
                  className="hover:text-primary transition-colors">support@altruistwellness.com</a>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <MapPin size={14} className="text-primary flex-shrink-0" />
                <span>Amritsar, Punjab, India</span>
              </div>
            </div>
          </div>

          {/* Link columns */}
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
                      className="text-slate-400 hover:text-primary transition-colors text-sm font-medium"
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
              <ShieldCheck className="text-primary/60 flex-shrink-0" size={18} />
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
              <p className="text-slate-500 text-[10px] font-bold tracking-widest uppercase">© 2025 Altruist Wellness. All rights reserved.</p>
            </div>
          </div>

          {/* Legal links row */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-6 text-xs text-slate-500 font-medium">
            <Link href="/privacy"       className="hover:text-primary transition-colors">Privacy Policy</Link>
            <span className="text-white/10 hidden sm:block">|</span>
            <Link href="/terms"         className="hover:text-primary transition-colors">Terms &amp; Conditions</Link>
            <span className="text-white/10 hidden sm:block">|</span>
            <Link href="/refund-policy" className="hover:text-primary transition-colors">Refund Policy</Link>
            <span className="text-white/10 hidden sm:block">|</span>
            <Link href="/plans"         className="hover:text-primary transition-colors">Health Plans</Link>
            <span className="text-white/10 hidden sm:block">|</span>
            <Link href="/vlogs"         className="hover:text-primary transition-colors">Doctor Vlogs</Link>
            <span className="text-white/10 hidden sm:block">|</span>
            <Link href="/support"       className="hover:text-primary transition-colors">Support</Link>
            <span className="text-white/10 hidden sm:block">|</span>
            <Link href="/about"         className="hover:text-primary transition-colors">Cookies</Link>
          </div>

        </div>
      </div>
    </footer>
  )
}
