"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, FileText } from "lucide-react"

const SECTIONS = [
  { id: "acceptance", title: "1. Acceptance of Terms" },
  { id: "description", title: "2. Description of Services" },
  { id: "disclaimer", title: "3. Medical Disclaimer" },
  { id: "accounts", title: "4. User Accounts & Registration" },
  { id: "patient-responsibilities", title: "5. Patient Responsibilities" },
  { id: "doctor-responsibilities", title: "6. Doctor Responsibilities" },
  { id: "billing", title: "7. Subscription Plans & Billing" },
  { id: "cancellation", title: "8. Cancellation & Refund Policy" },
  { id: "privacy", title: "9. Privacy & Data Protection" },
  { id: "prescriptions", title: "10. Prescription Policies" },
  { id: "prohibited", title: "11. Prohibited Activities" },
  { id: "intellectual-property", title: "12. Intellectual Property" },
  { id: "liability", title: "13. Limitation of Liability" },
  { id: "governing-law", title: "14. Governing Law" },
  { id: "contact", title: "15. Contact Us" },
];

export default function TermsAndConditions() {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: "-20% 0px -60% 0px" }
    )

    SECTIONS.forEach((section) => {
      const el = document.getElementById(section.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 100,
        behavior: "smooth",
      })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Hero Header */}
      <div className="bg-[#0F172A] pt-24 pb-16 px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto max-w-4xl relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface/5 border border-white/10 text-primary text-sm font-semibold mb-6">
            <FileText size={16} />
            Last updated: June 2025
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight mb-6">
            Terms & Conditions
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl font-medium">
            Please read these terms carefully before using Altruist. By accessing our platform, you agree to be bound by these legal guidelines designed to protect our community.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-6 lg:px-12 py-12 flex flex-col lg:flex-row gap-12 relative">
        
        {/* Mobile TOC Dropdown */}
        <div className="lg:hidden w-full sticky top-20 z-40 bg-surface p-4 rounded-2xl shadow-sm border border-slate-200">
          <label className="block text-sm font-bold text-slate-700 mb-2">Jump to Section</label>
          <select 
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none"
            value={activeSection}
            onChange={(e) => scrollTo(e.target.value)}
          >
            {SECTIONS.map((sec) => (
              <option key={sec.id} value={sec.id}>{sec.title}</option>
            ))}
          </select>
        </div>

        {/* Desktop Sticky Sidebar TOC */}
        <div className="hidden lg:block w-80 shrink-0">
          <div className="sticky top-28 bg-surface rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-heading font-bold text-slate-900 text-lg mb-6">Table of Contents</h3>
            <div className="space-y-1">
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollTo(section.id)}
                  className={`block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeSection === section.id
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 space-y-10 pb-20">
          
          <motion.section id="acceptance" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-surface p-8 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-heading font-bold text-slate-900 mb-4">1. Acceptance of Terms</h2>
            <div className="prose prose-slate max-w-none text-slate-600 space-y-4">
              <p>Welcome to Altruist. By downloading, accessing, or using the Altruist website, mobile application, or any associated services (collectively, the "Platform"), you signify your absolute agreement to these Terms and Conditions ("Terms").</p>
              <p>If you do not agree with any part of these Terms, you must immediately cease using the Platform. These Terms constitute a legally binding agreement between you (the "User", "Patient", or "Doctor") and Altruist Health Technologies Pvt. Ltd.</p>
            </div>
          </motion.section>

          <motion.section id="description" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-surface p-8 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-heading font-bold text-slate-900 mb-4">2. Description of Services</h2>
            <div className="prose prose-slate max-w-none text-slate-600 space-y-4">
              <p>Altruist is a comprehensive healthcare technology platform that facilitates:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Teleconsultations:</strong> Secure video and audio consultations with verified medical professionals.</li>
                <li><strong>In-Clinic Appointments:</strong> Discovery and booking of physical appointments at participating clinics.</li>
                <li><strong>Pharmacy & Medicines:</strong> Ordering of over-the-counter and prescription medications for home delivery.</li>
                <li><strong>Diagnostic Services:</strong> Booking of laboratory tests and home-collection of samples.</li>
                <li><strong>Health Subscriptions:</strong> Purchasing tiered health plans for discounted holistic care.</li>
              </ul>
            </div>
          </motion.section>

          <motion.section id="disclaimer" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-surface p-8 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-heading font-bold text-slate-900 mb-4 flex items-center gap-3">
              3. Medical Disclaimer
              <span className="bg-orange-100 text-[#FF6B35] text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">Critical</span>
            </h2>
            <div className="prose prose-slate max-w-none text-slate-600 space-y-4">
              <p className="font-bold text-slate-800">ALTRUIST IS NOT FOR MEDICAL EMERGENCIES.</p>
              <p>The teleconsultation services provided on this platform are not intended to replace primary care, emergency services, or face-to-face medical evaluations. In the event of a medical emergency (such as severe chest pain, breathing difficulties, stroke symptoms, or severe trauma), immediately call your local emergency services (e.g., 112/108 in India) or visit the nearest hospital.</p>
              <p>Altruist does not practice medicine. We act solely as a technology intermediary bridging users with independent medical practitioners.</p>
            </div>
          </motion.section>

          <motion.section id="accounts" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-surface p-8 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-heading font-bold text-slate-900 mb-4">4. User Accounts & Registration</h2>
            <div className="prose prose-slate max-w-none text-slate-600 space-y-4">
              <p>To access core features, you must register an account. You agree to provide accurate, current, and complete information during registration. Altruist utilizes Firebase Authentication for secure identity management.</p>
              <p>You are strictly responsible for maintaining the confidentiality of your login credentials. Any activity occurring under your account is your sole responsibility. You must be at least 18 years old to create an account. Minors may use the platform only under the direct supervision of a parent or legal guardian who holds the account.</p>
            </div>
          </motion.section>

          <motion.section id="patient-responsibilities" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-surface p-8 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-heading font-bold text-slate-900 mb-4">5. Patient Responsibilities</h2>
            <div className="prose prose-slate max-w-none text-slate-600 space-y-4">
              <p>As a patient utilizing Altruist, you agree to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Provide completely truthful medical histories, current symptoms, and lists of current medications to consulting doctors.</li>
                <li>Ensure a stable internet connection and a private environment for chat consultations.</li>
                <li>Treat all doctors, support staff, and delivery personnel with absolute respect. Abusive language or inappropriate behavior during video calls will result in immediate permanent account suspension.</li>
                <li>Show up for scheduled appointments on time. Repeated no-shows may incur penalty fees.</li>
              </ul>
            </div>
          </motion.section>

          <motion.section id="doctor-responsibilities" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-surface p-8 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-heading font-bold text-slate-900 mb-4">6. Doctor Responsibilities</h2>
            <div className="prose prose-slate max-w-none text-slate-600 space-y-4">
              <p>Medical professionals practicing on Altruist are independent contractors and are legally obligated to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Maintain valid medical licenses and registrations with the respective Medical Councils (e.g., NMC in India).</li>
                <li>Adhere strictly to the Telemedicine Practice Guidelines issued by the Ministry of Health and Family Welfare.</li>
                <li>Prescribe medications judiciously, specifically avoiding prohibited tele-prescriptions (e.g., Schedule X drugs, narcotics).</li>
                <li>Protect patient confidentiality at all times in accordance with medical ethics.</li>
              </ul>
            </div>
          </motion.section>

          <motion.section id="billing" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-surface p-8 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-heading font-bold text-slate-900 mb-4">7. Subscription Plans & Billing</h2>
            <div className="prose prose-slate max-w-none text-slate-600 space-y-4">
              <p>Altruist offers tiered Subscription Plans (e.g., Basic, Premium) providing benefits like bundled consultations and pharmacy discounts. By enrolling, you authorize recurring charges to your selected payment method.</p>
              <p>All prices listed on the platform are inclusive of applicable taxes unless stated otherwise. We use secure third-party payment gateways. We do not store full credit card numbers on our servers.</p>
            </div>
          </motion.section>

          <motion.section id="cancellation" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-surface p-8 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-heading font-bold text-slate-900 mb-4">8. Cancellation & Refund Policy</h2>
            <div className="prose prose-slate max-w-none text-slate-600 space-y-4">
              <p><strong>Consultations:</strong> Patients may cancel an appointment up to 2 hours before the scheduled time for a full refund. Cancellations within 2 hours are non-refundable. If a doctor fails to join the call, a 100% refund will be automatically initiated.</p>
              <p><strong>Medicines:</strong> Returns are accepted within 3 days of delivery only for sealed, untampered medications or in the case of incorrect delivery. Cold-chain medications (e.g., insulin) cannot be returned.</p>
              <p><strong>Subscriptions:</strong> You may cancel your subscription at any time. The cancellation will take effect at the end of the current billing cycle. We do not provide prorated refunds for mid-cycle cancellations.</p>
            </div>
          </motion.section>

          <motion.section id="privacy" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-surface p-8 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-heading font-bold text-slate-900 mb-4">9. Privacy & Data Protection</h2>
            <div className="prose prose-slate max-w-none text-slate-600 space-y-4">
              <p>Your privacy is our utmost priority. Altruist handles Personal Health Information (PHI) securely, drawing inspiration from HIPAA compliance standards. Our database utilizes Supabase Row Level Security (RLS) policies to ensure that your medical records, chat history, and prescriptions are absolutely invisible to unauthorized users.</p>
              <p>Chat consultations are end-to-end encrypted and are never recorded without explicit dual-consent from both the patient and the doctor. Please review our full Privacy Policy for detailed data practices.</p>
            </div>
          </motion.section>

          <motion.section id="prescriptions" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-surface p-8 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-heading font-bold text-slate-900 mb-4">10. Prescription Policies</h2>
            <div className="prose prose-slate max-w-none text-slate-600 space-y-4">
              <p>Digital prescriptions generated on Altruist carry the digital signature or consent of the verified doctor. You may use these prescriptions to purchase medicines through our integrated pharmacy or download them for use at local physical pharmacies.</p>
              <p>Altering, forging, or tampering with digital prescriptions is a serious criminal offense and will be reported to law enforcement agencies.</p>
            </div>
          </motion.section>

          <motion.section id="prohibited" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-surface p-8 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-heading font-bold text-slate-900 mb-4">11. Prohibited Activities</h2>
            <div className="prose prose-slate max-w-none text-slate-600 space-y-4">
              <p>Users are strictly prohibited from:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Using the platform for illegal drug procurement.</li>
                <li>Attempting to hack, scrape, or disrupt the platform's infrastructure.</li>
                <li>Creating fake profiles, impersonating medical professionals, or providing false identities.</li>
                <li>Harassing, threatening, or discriminating against any user, doctor, or Altruist employee.</li>
              </ul>
            </div>
          </motion.section>

          <motion.section id="intellectual-property" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-surface p-8 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-heading font-bold text-slate-900 mb-4">12. Intellectual Property</h2>
            <div className="prose prose-slate max-w-none text-slate-600 space-y-4">
              <p>All content on the Altruist platform—including but not limited to logos, UI/UX designs, text, graphics, and source code—is the exclusive property of Altruist and is protected by copyright and intellectual property laws. You may not reproduce or distribute any platform assets without written consent.</p>
            </div>
          </motion.section>

          <motion.section id="liability" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-surface p-8 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-heading font-bold text-slate-900 mb-4">13. Limitation of Liability</h2>
            <div className="prose prose-slate max-w-none text-slate-600 space-y-4">
              <p>To the maximum extent permitted by law, Altruist shall not be liable for any indirect, incidental, or consequential damages resulting from the use of our services. We are an intermediary connecting patients with doctors; medical liability rests solely with the consulting practitioner.</p>
              <p>Altruist does not guarantee uninterrupted platform availability and is not liable for network failures during critical consultations.</p>
            </div>
          </motion.section>

          <motion.section id="governing-law" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-surface p-8 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-heading font-bold text-slate-900 mb-4">14. Governing Law</h2>
            <div className="prose prose-slate max-w-none text-slate-600 space-y-4">
              <p>These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or relating to these Terms or the Platform shall be subject to the exclusive jurisdiction of the courts located in New Delhi, India.</p>
            </div>
          </motion.section>

          <motion.section id="contact" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-surface p-8 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-heading font-bold text-slate-900 mb-4">15. Contact Us</h2>
            <div className="prose prose-slate max-w-none text-slate-600 space-y-4">
              <p>If you have any questions, concerns, or grievances regarding these Terms & Conditions, please reach out to our legal and support team:</p>
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mt-4">
                <p className="font-bold text-slate-800">Grievance Officer: Altruist Legal Team</p>
                <p>Email: legal@altruist.health</p>
                <p>Phone: +91 800 123 4567</p>
                <p>Address: Altruist HQ, Amritsar, Punjab, India 143001</p>
              </div>
            </div>
          </motion.section>

          {/* CTA Footer */}
          <div className="pt-12 flex justify-center">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-[#00A87E]/20 transition-all hover:-translate-y-1"
            >
              <ArrowLeft size={20} />
              Back to Home
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
