"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PlayCircle, Video, Eye, Calendar, Search, Sparkles } from "lucide-react";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from "@/context/LanguageContext";

const CATEGORIES = ["All", "Health Tips", "Diet", "Mental Health", "General"];

const getCategoryColor = (cat: string) => {
  switch (cat) {
    case "Health Tips": return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "Diet": return "bg-orange-100 text-orange-700 border-orange-200";
    case "Mental Health": return "bg-blue-100 text-blue-700 border-blue-200";
    default: return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

const getCategoryEmoji = (cat: string) => {
  switch (cat) {
    case "Health Tips": return "💡";
    case "Diet": return "🥗";
    case "Mental Health": return "🧠";
    default: return "🩺";
  }
};

export default function PublicVlogsPage() {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVlog, setSelectedVlog] = useState<any>(null);

  const { data: vlogs, isLoading } = useQuery({
    queryKey: ["public-vlogs", activeCategory],
    queryFn: async () => {
      const url = activeCategory === "All" ? "/vlogs" : `/vlogs?category=${encodeURIComponent(activeCategory)}`;
      return (await api.get(url)).data;
    },
  });

  const viewMutation = useMutation({
    mutationFn: async (vlogId: string) => {
      try {
        await api.get(`/vlogs/${vlogId}`);
      } catch(e) {}
    }
  });

  const handleVlogClick = (vlog: any) => {
    setSelectedVlog(vlog);
    viewMutation.mutate(vlog.id); // fire and forget views increment
  };

  const allVlogs = vlogs || [];

  const filteredVlogs = allVlogs.filter((vlog: any) => {
    // category filter
    if (activeCategory !== "All" && vlog.category !== activeCategory) {
      return false;
    }
    
    // search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return vlog.title?.toLowerCase().includes(query) || 
             vlog.doctorName?.toLowerCase().includes(query) ||
             vlog.excerpt?.toLowerCase().includes(query) ||
             vlog.content?.toLowerCase().includes(query);
    }
    return true;
  });

  // Extract YouTube ID if it's a standard youtube link
  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11)
      ? `https://www.youtube.com/embed/${match[2]}?autoplay=1`
      : null;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 pb-20">
      
      {/* 1. HERO BANNER */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#E7F4F1] to-[#F3FAF8] py-20 lg:py-24 text-slate-900 text-center border-b border-slate-200">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="absolute top-[-50px] right-[-100px] w-96 h-96 rounded-full bg-[#0D9373]/5 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-6">
          <Badge className="bg-[#E7F4F1] text-[#0D9373] border border-[#0D9373]/20 py-1.5 px-4 font-extrabold text-xs tracking-wider rounded-full uppercase flex items-center gap-1.5 w-max mx-auto shadow-sm">
            <Sparkles size={12} /> {t('vlogs.badge') || "Altruist Learn & Vlogs"}
          </Badge>
          
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-slate-900">
            {t('vlogs.title') || "Health Tips &"} <span className="text-[#0D9373]">{t('vlogs.titleHighlight') || "Doctor Insights"}</span>
          </h1>
          
          <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto font-semibold leading-relaxed">
            {t('vlogs.desc') || "Watch short video vlogs and read premium health guides directly from our verified clinical professionals."}
          </p>
        </div>
      </section>

      {/* 2. CONTROLS & SEARCH BAR */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-10 space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pb-6 border-b border-slate-200">
          <div className="flex overflow-x-auto pb-2 md:pb-0 w-full md:w-auto gap-2 scrollbar-none">
            {CATEGORIES.map(cat => (
              <Button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "rounded-full font-extrabold transition-all shrink-0 h-10 px-5 shadow-sm border-none active:scale-95",
                  activeCategory === cat 
                    ? "bg-[#0D9373] hover:bg-[#0A7A5F] text-white" 
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                )}
              >
                {cat !== "All" && <span className="mr-2">{getCategoryEmoji(cat)}</span>}
                {cat}
              </Button>
            ))}
          </div>

          <div className="relative w-full md:w-80 shrink-0">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder={t('vlogs.searchPlaceholder') || "Search health tips, doctors..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 rounded-full h-11 border-slate-200 focus:border-[#0D9373] bg-white shadow-sm hover:shadow-md transition-shadow font-semibold"
            />
          </div>
        </div>

        {/* 3. VLOGS GRID */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden border border-slate-100 h-[480px] shadow-sm animate-pulse flex flex-col justify-between">
                <div className="h-52 bg-slate-200" />
                <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-3">
                    <div className="h-6 bg-slate-200 rounded-lg w-3/4" />
                    <div className="h-4 bg-slate-200 rounded-lg w-1/4" />
                    <div className="h-16 bg-slate-100 rounded-xl" />
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-200" />
                    <div className="space-y-2 flex-1">
                      <div className="h-3 bg-slate-200 rounded-lg w-1/2" />
                      <div className="h-2 bg-slate-200 rounded-lg w-1/3" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredVlogs.length === 0 ? (
          <div className="bg-white p-20 rounded-3xl text-center space-y-4 border border-slate-200 max-w-3xl mx-auto shadow-md">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <Video size={40} />
            </div>
            <h3 className="font-heading text-2xl font-black text-slate-900">No Vlogs Published Yet</h3>
            <p className="text-slate-500 font-bold max-w-md mx-auto">
              No vlogs published yet. Check back soon for health tips and insights from our doctors.
            </p>
            {(activeCategory !== "All" || searchQuery) && (
              <Button onClick={() => { setActiveCategory("All"); setSearchQuery(""); }} className="bg-[#0D9373] hover:bg-[#0A7A5F] font-extrabold h-11 px-8 rounded-full border-none shadow mt-2">
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVlogs.map((vlog: any) => (
              <div 
                key={vlog.id} 
                onClick={() => handleVlogClick(vlog)}
                className="bg-white rounded-3xl overflow-hidden border border-slate-100 hover:border-emerald-100 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between"
              >
                {/* Thumbnail Header */}
                <div className="h-52 bg-slate-950 relative overflow-hidden flex-shrink-0">
                  {vlog.thumbnailUrl ? (
                    <img 
                      src={vlog.thumbnailUrl} 
                      alt={vlog.title} 
                      className="w-full h-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                      <span className="text-6xl opacity-50 filter drop-shadow-lg">{getCategoryEmoji(vlog.category)}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-110 shadow">
                      <PlayCircle className="text-white fill-white/20" size={32} />
                    </div>
                  </div>
                  <Badge className={cn("absolute top-4 left-4 font-black border-none py-1 px-3 rounded-lg shadow-sm text-[10px] tracking-wider uppercase", getCategoryColor(vlog.category))}>
                    {vlog.category || "General"}
                  </Badge>
                </div>

                {/* Body Content */}
                <div className="p-6 flex flex-col flex-1 justify-between gap-6">
                  <div>
                    <h3 className="font-heading text-lg font-extrabold text-slate-900 line-clamp-2 mb-3 group-hover:text-[#0D9373] transition-colors leading-snug">
                      {vlog.title}
                    </h3>
                    
                    {/* Excerpt preview */}
                    <p className="text-xs text-slate-500 font-semibold line-clamp-3 leading-relaxed italic bg-slate-50 border border-slate-100 p-3 rounded-xl">
                      "{vlog.excerpt || "No summary provided."}"
                    </p>
                  </div>
                  
                  {/* Doctor Info Footer */}
                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9 border-2 border-emerald-500/10">
                          <AvatarImage src={vlog.doctorProfilePic || ""} className="object-cover" />
                          <AvatarFallback className="bg-[#E7F4F1] text-[#0D9373] text-xs font-bold">
                            {vlog.doctorName?.charAt(0) || "D"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 text-left">
                          <p className="text-xs font-black text-slate-900 truncate">Dr. {vlog.doctorName || "Verified Specialist"}</p>
                          <p className="text-[10px] font-bold text-slate-500 truncate">{vlog.doctorSpecialization || "Consultant"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">
                      <div className="flex items-center gap-1"><Eye size={12} /> {vlog.viewsCount || 0} {t('vlogs.views') || "views"}</div>
                      <div className="flex items-center gap-1"><Calendar size={12} /> {new Date(vlog.publishedAt || vlog.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Video / Detail Modal */}
      <Dialog open={!!selectedVlog} onOpenChange={(open) => !open && setSelectedVlog(null)}>
        <DialogContent className="sm:max-w-3xl p-0 overflow-hidden bg-white rounded-3xl border-0 shadow-2xl">
          {selectedVlog && (
            <div className="flex flex-col">
              {getYoutubeEmbedUrl(selectedVlog.videoUrl) ? (
                <div className="w-full aspect-video bg-black relative">
                  <iframe 
                    src={getYoutubeEmbedUrl(selectedVlog.videoUrl)!} 
                    className="absolute inset-0 w-full h-full"
                    allowFullScreen
                    allow="autoplay; encrypted-media"
                  />
                </div>
              ) : (
                <div className="w-full h-64 bg-slate-950 flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
                   {selectedVlog.thumbnailUrl ? (
                      <img src={selectedVlog.thumbnailUrl} className="absolute inset-0 w-full h-full object-cover opacity-20" alt="thumbnail" />
                   ) : null}
                   <PlayCircle size={48} className="text-white/50 mb-4 relative z-10" />
                   <h3 className="text-white font-bold text-xl relative z-10 leading-tight">External Video</h3>
                   <a href={selectedVlog.videoUrl} target="_blank" rel="noreferrer" className="mt-4 text-emerald-400 font-extrabold hover:underline relative z-10 flex items-center gap-1 bg-white/10 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md transition-all active:scale-95 text-sm">
                     Open Video URL &rarr;
                   </a>
                </div>
              )}
              
              <div className="p-6 md:p-8 max-h-[60vh] overflow-y-auto">
                <Badge className={cn("mb-3 font-black border-none py-1 px-3 text-[10px] tracking-wider rounded-lg shadow-sm uppercase", getCategoryColor(selectedVlog.category))}>
                  {selectedVlog.category || "General"}
                </Badge>
                <DialogTitle className="font-heading text-2xl font-black text-slate-900 mb-2 leading-snug">
                  {selectedVlog.title}
                </DialogTitle>
                
                <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-1"><Eye size={14} /> {(selectedVlog.viewsCount || 0) + 1} {t('vlogs.views') || "views"}</div>
                  <div className="flex items-center gap-1"><Calendar size={14} /> {new Date(selectedVlog.publishedAt || selectedVlog.createdAt).toLocaleDateString()}</div>
                </div>

                <div className="space-y-6">
                  {selectedVlog.excerpt && (
                    <div className="space-y-2">
                      <span className="text-xs font-black text-[#0D9373] uppercase tracking-widest block">Summary</span>
                      <p className="text-sm text-slate-600 font-semibold leading-relaxed italic bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                        "{selectedVlog.excerpt}"
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <span className="text-xs font-black text-[#0D9373] uppercase tracking-widest block">Full Details</span>
                    <div className="text-sm md:text-base text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                      {selectedVlog.content || selectedVlog.excerpt || "No description provided."}
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-slate-50 p-4 rounded-2xl flex items-center justify-between border border-slate-100">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 border-2 border-white shadow-sm hover:shadow-md transition-shadow shrink-0">
                      <AvatarImage src={selectedVlog.doctorProfilePic || ""} className="object-cover" />
                      <AvatarFallback className="bg-[#E7F4F1] text-[#0D9373] font-bold">
                        {selectedVlog.doctorName?.charAt(0) || "D"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="font-black text-slate-900 leading-tight">Dr. {selectedVlog.doctorName || "Verified Specialist"}</p>
                      <p className="text-xs font-bold text-slate-500 mt-0.5">{selectedVlog.doctorSpecialization || "Consultant"} • {selectedVlog.doctorCity || "Altruist Clinic"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
