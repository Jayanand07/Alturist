"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Calendar, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function BlogPage() {
  const posts = [
    {
      title: "10 Essential Tips for Managing Type-2 Diabetes in Daily Life",
      desc: "Learn from experts about dietary habits, routine walks, and diagnostic timings that can help stabilize blood sugar indices effectively.",
      author: "Dr. Amit Patel",
      role: "Endocrinology Advisor",
      date: "June 15, 2026",
      category: "Diabetes Care",
      img: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&h=400&fit=crop&q=80",
      readTime: "5 min read"
    },
    {
      title: "Understanding Cardiovascular Risk Assessment Parameters",
      desc: "An in-depth breakdown of cholesterol profiles, blood pressure guidelines, and key symptoms you should never ignore.",
      author: "Dr. Lisa Wong",
      role: "Cardiologist",
      date: "June 10, 2026",
      category: "Heart Health",
      img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop&q=80",
      readTime: "7 min read"
    },
    {
      title: "Why Regular Preventive Full Body Screening Saves Lives",
      desc: "Early detection remains the ultimate cure. Find out why checking liver and kidney profiles annually is the best healthcare decision you can make.",
      author: "Dr. Michael Chen",
      role: "General Physician",
      date: "June 05, 2026",
      category: "Preventive Care",
      img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop&q=80",
      readTime: "4 min read"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans pb-20">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0D9373] via-[#0B7C61] to-[#085E49] text-white py-16 px-6 md:px-12 text-center">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/20 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto max-w-4xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-1">
            <BookOpen size={14} className="text-emerald-300" /> Altruist Wellness Blog
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-[#fcEAD4] tracking-tight">
            Latest Health & Wellness Articles
          </h1>
          <p className="text-emerald-100 text-base md:text-lg font-medium max-w-xl mx-auto leading-relaxed">
            Stay informed with clinical reviews, lifestyle tips, and preventive care strategies authored by certified doctors.
          </p>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 py-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {posts.map((post, i) => (
            <Card key={i} className="border-none shadow-md hover:shadow-2xl transition-all rounded-3xl bg-white overflow-hidden flex flex-col justify-between group">
              {/* Post Image */}
              <div className="h-48 w-full overflow-hidden bg-slate-100 relative">
                <img 
                  src={post.img} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <Badge className="absolute top-4 left-4 bg-[#0D9373] text-white border-none px-3 py-1 font-bold text-xs rounded-lg">
                  {post.category}
                </Badge>
              </div>

              {/* Content */}
              <CardContent className="p-6 flex flex-col flex-1 justify-between gap-6">
                <div className="space-y-4">
                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-xs text-slate-400 font-bold">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} /> {post.date}
                    </span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>

                  <h3 className="font-heading text-lg font-extrabold text-slate-900 leading-snug group-hover:text-[#0D9373] transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed line-clamp-3">
                    {post.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#0D9373] flex items-center justify-center font-bold text-xs border border-emerald-100 shrink-0">
                      <User size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-tight">{post.author}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{post.role}</p>
                    </div>
                  </div>

                  <Button variant="ghost" className="text-[#E8593C] hover:text-[#D14A30] hover:bg-transparent font-black text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform p-0">
                    Read Article <ArrowRight size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
