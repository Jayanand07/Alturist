"use client";

import React from "react";
import Link from "next/link";
import { 
  Video, 
  Microscope, 
  Pill, 
  Check,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const services = [
  {
    title: "Video Consultation",
    description: "Connect with qualified doctors instantly via secure video call",
    icon: Video,
    features: [
      "60-second doctor connection",
      "Digital prescription",
      "24/7 availability"
    ],
    buttonText: "Book Now",
    buttonLink: "/consult",
    color: "bg-teal-500"
  },
  {
    title: "Diagnostic Tests",
    description: "Doctor-prescribed tests with trusted labs like Dr. Lal PathLabs",
    icon: Microscope,
    features: [
      "Home sample collection",
      "Accurate reports",
      "Doctor-guided only"
    ],
    buttonText: "Explore Tests",
    buttonLink: "/diagnostics",
    color: "bg-blue-500"
  },
  {
    title: "Medicines",
    description: "Genuine medicines delivered to your doorstep",
    icon: Pill,
    features: [
      "Doctor-prescribed only",
      "Branded medicines",
      "Fast delivery"
    ],
    buttonText: "Order Medicines",
    buttonLink: "/medicines",
    color: "bg-orange-500"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

export default function ServicesSection() {
  return (
    <section className="py-20 md:py-32 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16 md:mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight"
          >
            Our Services
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-500 font-medium max-w-2xl mx-auto"
          >
            Complete healthcare solutions for you and your family
          </motion.p>
        </div>

        {/* Services Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
        >
          {services.map((service, index) => (
            <motion.div 
              key={index}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className="bg-white p-8 rounded-[32px] shadow-sm hover:shadow-2xl hover:shadow-teal-900/5 transition-all duration-500 border border-gray-100 flex flex-col items-center text-center group"
            >
              {/* Icon Circle */}
              <div className="mb-8 relative">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg shadow-${service.color.split('-')[1]}-500/20 transition-transform duration-500 group-hover:rotate-[360deg] ${service.color}`}>
                  <service.icon size={36} />
                </div>
                <div className={`absolute inset-0 rounded-full blur-2xl opacity-20 -z-10 ${service.color}`} />
              </div>

              {/* Content */}
              <div className="space-y-4 flex-1">
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-500 font-medium leading-relaxed">
                  {service.description}
                </p>

                {/* Features List */}
                <div className="py-6 space-y-3">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm font-bold text-gray-600 justify-center">
                      <div className="h-5 w-5 rounded-full bg-teal-50 flex items-center justify-center text-[#0D9488]">
                         <Check size={12} strokeWidth={3} />
                      </div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 w-full">
                <Link href={service.buttonLink} className="w-full block">
                  <Button className="w-full h-12 text-base font-bold bg-[#0D9488] hover:bg-[#0b7a6e] rounded-2xl group/btn transition-all">
                    {service.buttonText}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
