"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PlayCircle, Video, Activity, Eye, Calendar, User, Search, Stethoscope } from "lucide-react";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
      await api.post(`/vlogs/${vlogId}/view`);
    }
  });

  const handleVlogClick = (vlog: any) => {
    setSelectedVlog(vlog);
    viewMutation.mutate(vlog.id); // fire and forget
  };

  const filteredVlogs = (vlogs || []).filter((vlog: any) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return vlog.title?.toLowerCase().includes(query) || 
             vlog.doctorName?.toLowerCase().includes(query);
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
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero */}
      <div className="bg-[#0F172A] py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <Badge className="bg-[#00A87E]/20 text-[#00A87E] border-none mb-4 px-3 py-1 text-xs font-bold uppercase tracking-widest">
            Altruist Learn
          </Badge>
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Health Tips & <span className="text-[#00A87E]">Doctor Insights</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg font-medium">
            Watch short videos and read insights from our verified medical professionals to stay informed about your health.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
          <div className="flex overflow-x-auto pb-2 md:pb-0 w-full md:w-auto gap-2 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <Button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                variant={activeCategory === cat ? "default" : "outline"}
                className={cn(
                  "rounded-full font-bold transition-all shrink-0",
                  activeCategory === cat ? "bg-[#00A87E] hover:bg-[#007A5C] text-white border-[#00A87E]" : "bg-white text-slate-600 border-slate-200"
                )}
              >
                {cat !== "All" && <span className="mr-2">{getCategoryEmoji(cat)}</span>}
                {cat}
              </Button>
            ))}
          </div>

          <div className="relative w-full md:w-72 shrink-0">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Search topics or doctors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-full h-11 border-slate-200 focus-visible:ring-[#00A87E] bg-white shadow-sm"
            />
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm animate-pulse">
                <div className="h-48 bg-slate-200" />
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                  <div className="flex gap-4 pt-2">
                    <div className="h-8 bg-slate-100 rounded-full w-20" />
                    <div className="h-8 bg-slate-100 rounded-full w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredVlogs.length === 0 ? (
          <div className="bg-white p-20 rounded-3xl text-center space-y-4 border border-slate-200 shadow-sm max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <Video size={40} />
            </div>
            <h3 className="font-heading text-2xl font-bold text-slate-900">No vlogs found</h3>
            <p className="text-slate-500 font-medium">We couldn't find any content matching your criteria. Try another category.</p>
            <Button onClick={() => { setActiveCategory("All"); setSearchQuery(""); }} className="bg-[#00A87E] hover:bg-[#00906B] font-bold mt-4">
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVlogs.map((vlog: any) => (
              <div 
                key={vlog.id} 
                onClick={() => handleVlogClick(vlog)}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col"
              >
                {/* Thumbnail */}
                <div className="h-52 bg-slate-900 relative overflow-hidden">
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
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-110">
                      <PlayCircle className="text-white fill-white/20" size={32} />
                    </div>
                  </div>
                  <Badge className={cn("absolute top-4 left-4 font-bold border", getCategoryColor(vlog.category))}>
                    {vlog.category || "General"}
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-heading text-lg font-bold text-slate-900 line-clamp-2 mb-3 group-hover:text-[#00A87E] transition-colors">
                    {vlog.title}
                  </h3>
                  
                  <div className="mt-auto pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8 border border-slate-200">
                          <AvatarImage src={vlog.doctorProfilePic || ""} />
                          <AvatarFallback className="bg-teal-50 text-[#00A87E] text-xs font-bold">
                            {vlog.doctorName?.charAt(0) || "D"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">Dr. {vlog.doctorName}</p>
                          <p className="text-[10px] font-medium text-slate-500 truncate">{vlog.doctorSpecialization}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                      <div className="flex items-center gap-1.5"><Eye size={14} /> {vlog.viewsCount || 0} views</div>
                      <div className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(vlog.publishedAt || vlog.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Video Modal */}
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
                <div className="w-full h-64 bg-slate-900 flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
                   {selectedVlog.thumbnailUrl ? (
                      <img src={selectedVlog.thumbnailUrl} className="absolute inset-0 w-full h-full object-cover opacity-30" />
                   ) : null}
                   <Video size={48} className="text-white/50 mb-4 relative z-10" />
                   <h3 className="text-white font-bold text-xl relative z-10">Video content not available</h3>
                   <a href={selectedVlog.videoUrl} target="_blank" rel="noreferrer" className="mt-4 text-[#00A87E] font-bold hover:underline relative z-10">
                     Open external link &rarr;
                   </a>
                </div>
              )}
              
              <div className="p-6 md:p-8">
                <Badge className={cn("mb-3 font-bold border", getCategoryColor(selectedVlog.category))}>
                  {selectedVlog.category || "General"}
                </Badge>
                <DialogTitle className="font-heading text-2xl font-bold text-slate-900 mb-2">
                  {selectedVlog.title}
                </DialogTitle>
                
                <div className="flex items-center gap-4 text-sm font-bold text-slate-500 mb-6 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-1.5"><Eye size={16} /> {(selectedVlog.viewsCount || 0) + 1} views</div>
                  <div className="flex items-center gap-1.5"><Calendar size={16} /> {new Date(selectedVlog.publishedAt || selectedVlog.createdAt).toLocaleDateString()}</div>
                </div>

                <DialogDescription className="text-base text-slate-600 font-medium whitespace-pre-wrap leading-relaxed">
                  {selectedVlog.description || "No description provided."}
                </DialogDescription>

                <div className="mt-8 bg-slate-50 p-4 rounded-2xl flex items-center justify-between border border-slate-100">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                      <AvatarImage src={selectedVlog.doctorProfilePic || ""} />
                      <AvatarFallback className="bg-teal-50 text-[#00A87E] font-bold">
                        {selectedVlog.doctorName?.charAt(0) || "D"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-slate-900">Dr. {selectedVlog.doctorName}</p>
                      <p className="text-sm font-medium text-slate-500">{selectedVlog.doctorSpecialization} • {selectedVlog.doctorCity}</p>
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
