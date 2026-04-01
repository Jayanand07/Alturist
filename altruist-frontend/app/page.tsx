"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
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
  Activity,
  Calendar,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import ServicesSection from "@/components/shared/ServicesSection";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Custom Counter Hook
const useCounter = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;  
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return count;
};

const StatItem = ({ end, label, icon: Icon, suffix = "" }: { end: number, label: string, icon: any, suffix?: string }) => {
  const count = useCounter(end);
  return (
    <div className="flex flex-col items-center p-6 text-center space-y-2 group transition-transform hover:-translate-y-1">
      <div className="p-4 bg-teal-50 rounded-2xl text-primary group-hover:scale-110 transition-transform">
        <Icon size={32} />
      </div>
      <div>
        <h3 className="text-4xl font-black text-gray-900 tracking-tighter">
          {count.toLocaleString()}{suffix}
        </h3>
        <p className="text-gray-500 font-semibold">{label}</p>
      </div>
    </div>
  );
};

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
        <section className="relative min-h-[calc(100vh-160px)] flex items-center bg-gradient-to-br from-teal-50/50 via-white to-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 md:grid-cols-[1.5fr_1fr] items-center py-16 md:py-0 gap-16">
            
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8 relative z-10"
            >
              <div className="inline-flex items-center gap-2 bg-teal-100/50 text-teal-800 px-4 py-2 rounded-full font-bold text-sm border border-teal-200 shadow-sm animate-pulse">
                <ShieldCheck size={16} className="text-[#0D9488]" />
                India&apos;s Most Trusted Medical Platform
              </div>

              <div className="space-y-4">
                <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1.1]">
                  Instant Healthcare. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0D9488] to-[#3B82F6]">
                    Anytime. Anywhere.
                  </span>
                </h1>
                <p className="text-xl text-gray-600 max-w-xl font-medium leading-relaxed">
                  Connect with over <span className="text-[#0D9488] font-bold">500+ verified specialists</span> for video consultations, 
                  book diagnostic tests, and get medicine delivered in minutes.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { icon: Video, title: "Consultation in 60s" },
                  { icon: FlaskConical, title: "Verified Doctors & Labs" },
                  { icon: Pill, title: "Quick Delivery" },
                ].map((feature, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    className="flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white shadow-sm border border-gray-100 rounded-lg text-primary">
                        <feature.icon size={20} />
                      </div>
                      <span className="text-sm font-bold text-gray-800 leading-tight">{feature.title}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="h-14 px-10 text-lg font-bold bg-[#0D9488] hover:bg-[#0b7a6e] rounded-2xl shadow-xl shadow-teal-500/20 group transition-all active:scale-95">
                  Consult Now
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" className="h-14 px-10 text-lg font-bold border-gray-200 hover:border-[#0D9488] hover:bg-teal-50 rounded-2xl transition-all">
                  View Health Plans
                </Button>
              </div>

              <div className="flex items-center gap-4 pt-4">
                 <div className="flex -space-x-3 overflow-hidden">
                    {[1, 2, 3, 4].map((i) => (
                       <Avatar key={i} className="h-10 w-10 border-2 border-white shadow-sm">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`} alt="user" />
                          <AvatarFallback className="bg-teal-100 uppercase font-bold text-[10px] text-primary">P</AvatarFallback>
                       </Avatar>
                    ))}
                 </div>
                 <p className="text-sm text-gray-500 font-medium">
                   Over <span className="text-gray-900 font-bold">10k+</span> patients booked today
                 </p>
              </div>
            </motion.div>

            {/* Right: Illustration */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative hidden md:flex items-center justify-center p-8 bg-white/20 rounded-3xl backdrop-blur-3xl border border-white/40 shadow-2xl"
            >
              {/* Floating Decoration Icons Arrangement */}
              <div className="relative w-full aspect-square max-w-[450px]">
                <motion.div 
                  animate={{ y: [0, -20, 0] }} 
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-[85%] h-[85%] bg-gradient-to-tr from-teal-500/10 to-blue-500/10 rounded-full flex items-center justify-center border-4 border-dashed border-primary/20 p-12">
                     <div className="bg-white p-8 rounded-[40px] shadow-2xl relative w-full h-full flex flex-col items-center justify-center border-2 border-gray-50">
                        <HeartPulse size={120} className="text-primary animate-pulse" />
                        <Activity className="absolute bottom-12 text-blue-400" size={40} />
                        <div className="absolute top-12 left-12 p-3 bg-red-50 rounded-2xl shadow-sm">
                           <Calendar className="text-red-500" size={32} />
                        </div>
                     </div>
                  </div>
                </motion.div>

                {/* Satellite Icons */}
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute inset-0">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 bg-white rounded-2xl shadow-lg border border-gray-50">
                     <Stethoscope className="text-blue-500" size={32} />
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 p-4 bg-white rounded-2xl shadow-lg border border-gray-50">
                     <Pill className="text-orange-400" size={32} />
                  </div>
                  <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 p-4 bg-white rounded-2xl shadow-lg border border-gray-50">
                     <FlaskConical className="text-teal-500" size={32} />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-white py-16 md:py-24 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              <StatItem icon={UserCheck} end={50000} label="Consultations" suffix="+" />
              <StatItem icon={Stethoscope} end={500} label="Doctors" suffix="+" />
              <StatItem icon={Smile} end={99} label="Satisfaction" suffix="%" />
              <StatItem icon={Clock} end={24} label="Service" suffix="/7" />
            </div>
          </div>
        </section>

        {/* New Services Section */}
        <ServicesSection />
    </>
  );
}
