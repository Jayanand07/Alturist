"use client";

import React, { useEffect, useState } from "react";
import { 
  Calendar, 
  Clock, 
  FileText, 
  Video, 
  CheckCircle2, 
  Bell,
  Search,
  Plus,
  ArrowRight,
  User,
  Heart,
  Activity,
  ChevronRight,
  Pill
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const formatDate = (dateStr: string) => {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date(dateStr));
};

const formatTime = (dateStr: string) => {
  return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(dateStr));
};

const formatDayDate = (dateStr: string) => {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: '2-digit' }).format(new Date(dateStr));
};

interface Stats {
  totalConsultations: number;
  completedConsultations: number;
  upcomingConsultations: number;
  totalPrescriptions: number;
}

interface Consultation {
  id: string;
  doctor: {
    name: string;
    specialization: string;
    profilePicture: string | null;
  };
  scheduledAt: string;
  status: string;
  type: string;
  videoRoomId: string | null;
  canJoinNow: boolean;
}

interface Prescription {
  id: string;
  doctorName: string;
  dateIssued: string;
  medicinesCount: string;
}

interface DashboardData {
  fullName: string;
  email: string;
  profilePictureUrl: string | null;
  stats: Stats;
  upcomingConsultations: Consultation[];
  recentPrescriptions: Prescription[];
  healthTips: string[];
}

export default function PatientDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTip, setCurrentTip] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/patients/dashboard");
        setData(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  useEffect(() => {
    if (data?.healthTips?.length) {
      const timer = setInterval(() => {
        setCurrentTip((prev) => (prev + 1) % data.healthTips!.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [data]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const stats = [
    { label: "Total Consults", value: data?.stats?.totalConsultations || 0, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Upcoming Appts", value: data?.stats?.upcomingConsultations || 0, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Active Prescriptions", value: data?.stats?.totalPrescriptions || 0, icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Health Score", value: "92/100", icon: Activity, color: "text-teal-600", bg: "bg-teal-50" },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 bg-gray-50/50 min-h-screen">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Welcome back, <span className="text-[#0D9488]">{data?.fullName || "Patient"}</span>! 👋
          </h1>
          <p className="text-gray-500 font-medium">Here's a quick overview of your health profile.</p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 md:p-6 flex items-center gap-4">
               <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                 <stat.icon size={24} />
               </div>
               <div>
                  <p className="text-sm font-semibold text-gray-500">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Side: 60% Width (3/5 on large screens) */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Upcoming Consultations */}
          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
             <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 py-5">
               <div className="space-y-1">
                 <CardTitle className="text-xl font-bold text-gray-900">Upcoming Consultations</CardTitle>
                 <CardDescription>Your scheduled medical appointments</CardDescription>
               </div>
             </CardHeader>
             <CardContent className="p-0">
                {data?.upcomingConsultations && data.upcomingConsultations.length > 0 ? (
                   <div className="divide-y divide-gray-50">
                     {data.upcomingConsultations.map((consult) => {
                       const isToday = new Date(consult.scheduledAt).toDateString() === new Date().toDateString();
                       
                       return (
                         <div key={consult.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                            <div className="flex items-center gap-4">
                               <Avatar size="lg" className="border-2 border-teal-50 shadow-sm">
                                  <AvatarImage src={consult.doctor?.profilePicture || ""} />
                                  <AvatarFallback className="bg-teal-50 text-[#0D9488] font-bold text-xl">
                                    {(consult.doctor?.name || "Doctor").replace('Dr. ', '').charAt(0)}
                                  </AvatarFallback>
                               </Avatar>
                               <div>
                                  <h4 className="font-bold text-gray-900">{consult.doctor?.name}</h4>
                                  <p className="text-sm text-gray-500 font-medium">{consult.doctor?.specialization}</p>
                               </div>
                            </div>
                            
                            <div className="flex flex-col md:items-end gap-1">
                               <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                  <Calendar size={14} className="text-gray-400" />
                                  {formatDayDate(consult.scheduledAt)}
                                  <span className="mx-1 text-gray-300">•</span>
                                  <Clock size={14} className="text-gray-400" />
                                  {formatTime(consult.scheduledAt)}
                               </div>
                               <Badge className={cn("mt-1 w-fit font-bold border-none", isToday ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800")}>
                                  {isToday ? "Today" : "Upcoming"}
                               </Badge>
                            </div>

                            <div>
                               {consult.canJoinNow ? (
                                  <Button onClick={() => router.push(`/consultation/${consult.id}`)} className="bg-[#0D9488] hover:bg-[#0b7a6e] font-bold w-full md:w-auto gap-2">
                                     <Video size={16} /> Join Now
                                  </Button>
                               ) : (
                                  <Button variant="outline" className="border-gray-200 text-gray-600 font-bold w-full md:w-auto">
                                     View Details
                                  </Button>
                               )}
                            </div>
                         </div>
                       )
                     })}
                   </div>
                ) : (
                   <div className="p-10 text-center space-y-4 bg-gray-50/30">
                      <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto text-gray-400 shadow-sm border border-gray-100">
                         <Calendar size={32} />
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg">No upcoming consultations</h3>
                      <p className="text-sm text-gray-500 max-w-sm mx-auto">You don't have any appointments scheduled right now.</p>
                      <Button onClick={() => router.push('/consult')} className="bg-[#0D9488] hover:bg-[#0b7a6e] font-bold h-11 px-8 rounded-xl shadow-lg shadow-teal-500/10 active:scale-95 transition-all">Book an Appointment</Button>
                   </div>
                )}
             </CardContent>
          </Card>

          {/* Recent Prescriptions */}
          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
             <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 py-5">
               <div className="space-y-1">
                 <CardTitle className="text-xl font-bold text-gray-900">Recent Prescriptions</CardTitle>
                 <CardDescription>Your latest medical prescriptions and notes</CardDescription>
               </div>
             </CardHeader>
             <CardContent className="p-0">
               {data?.recentPrescriptions && data.recentPrescriptions.length > 0 ? (
                 <div className="divide-y divide-gray-50">
                    {data.recentPrescriptions.map((prescription) => (
                       <div key={prescription.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-gray-50/50 transition-colors">
                          <div className="flex items-start gap-4">
                             <div className="bg-purple-50 p-3 rounded-xl text-purple-600 mt-1">
                               <Pill size={20} />
                             </div>
                             <div>
                                <h4 className="font-bold text-gray-900">{prescription.doctorName}</h4>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1 font-medium">
                                   <Calendar size={14} className="text-gray-400" />
                                   {formatDate(prescription.dateIssued)}
                                   <span className="mx-1">•</span>
                                   <span>{prescription.medicinesCount} Medicines</span>
                                </div>
                             </div>
                          </div>
                          
                          <div className="flex gap-3">
                             <Button variant="outline" size="sm" className="font-bold h-9">View</Button>
                             <Button size="sm" className="bg-[#0D9488] hover:bg-[#0b7a6e] font-bold border-none text-white gap-2 h-9">
                               Order Medicines
                             </Button>
                          </div>
                       </div>
                    ))}
                 </div>
               ) : (
                  <div className="p-10 text-center bg-gray-50/30">
                     <p className="text-gray-500 font-medium">No recent prescriptions available.</p>
                  </div>
               )}
             </CardContent>
          </Card>
        </div>

        {/* Right Side: 40% Width (2/5 on large screens) */}
        <div className="lg:col-span-2 space-y-6">
           
           {/* Quick Actions */}
           <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
              <CardHeader className="pb-4 border-b border-gray-50">
                 <CardTitle className="text-lg font-bold text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                 <Button onClick={() => router.push('/consult')} className="w-full justify-between h-14 bg-[#0D9488] hover:bg-[#0b7a6e] text-white font-bold rounded-xl shadow-lg shadow-teal-900/10 transition-all active:scale-95">
                    <div className="flex items-center gap-3 text-base">
                       <Video size={18} /> Consult Doctor Now
                    </div>
                    <ChevronRight size={18} className="opacity-70" />
                 </Button>
                 
                 <Button variant="outline" className="w-full justify-between h-14 border-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:text-[#0D9488] group transition-all">
                    <div className="flex items-center gap-3 text-base">
                       <div className="bg-blue-50 text-blue-600 p-1.5 rounded-md group-hover:bg-[#0D9488]/10 group-hover:text-[#0D9488] transition-colors"><Activity size={18} /></div>
                       Book Diagnostic Test
                    </div>
                    <ChevronRight size={18} className="text-gray-400 group-hover:text-[#0D9488] transition-colors" />
                 </Button>
                 
                 <Button variant="outline" className="w-full justify-between h-14 border-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:text-[#0D9488] group transition-all">
                    <div className="flex items-center gap-3 text-base">
                       <div className="bg-purple-50 text-purple-600 p-1.5 rounded-md group-hover:bg-[#0D9488]/10 group-hover:text-[#0D9488] transition-colors"><Pill size={18} /></div>
                       Order Medicines
                    </div>
                    <ChevronRight size={18} className="text-gray-400 group-hover:text-[#0D9488] transition-colors" />
                 </Button>

                 <Button variant="outline" className="w-full justify-between h-14 border-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:text-[#0D9488] group transition-all">
                    <div className="flex items-center gap-3 text-base">
                       <div className="bg-amber-50 text-amber-600 p-1.5 rounded-md group-hover:bg-[#0D9488]/10 group-hover:text-[#0D9488] transition-colors"><FileText size={18} /></div>
                       View Health Records
                    </div>
                    <ChevronRight size={18} className="text-gray-400 group-hover:text-[#0D9488] transition-colors" />
                 </Button>
              </CardContent>
           </Card>

           {/* Health Tips Carousel */}
           {data?.healthTips && data.healthTips.length > 0 && (
             <Card className="border-none shadow-sm rounded-2xl bg-gradient-to-br from-[#0D9488] to-[#0f766e] overflow-hidden relative text-white hover:shadow-lg transition-shadow">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                <CardHeader className="pb-2">
                   <div className="flex items-center gap-2 font-bold text-teal-100 uppercase text-xs tracking-wider">
                      <Heart size={16} className="fill-white/20" /> Health Tip of the Day
                   </div>
                </CardHeader>
                <CardContent>
                   <div className="h-20 flex items-center pr-4">
                     <p className="font-semibold text-lg leading-snug animate-in fade-in slide-in-from-bottom-2 duration-500" key={currentTip}>
                        {data.healthTips[currentTip]}
                     </p>
                   </div>
                   <div className="flex gap-1.5 mt-4">
                      {data.healthTips.map((_, i) => (
                        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentTip ? "w-6 bg-white" : "w-1.5 bg-white/30"}`} />
                      ))}
                   </div>
                </CardContent>
             </Card>
           )}
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 min-h-screen bg-gray-50/50">
       <div className="h-10 bg-gray-200 animate-pulse rounded-xl w-64" />
       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-white/60 shadow-sm border border-gray-100 animate-pulse rounded-2xl" />)}
       </div>
       <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
             <div className="h-96 bg-white/60 shadow-sm border border-gray-100 animate-pulse rounded-2xl" />
             <div className="h-64 bg-white/60 shadow-sm border border-gray-100 animate-pulse rounded-2xl" />
          </div>
          <div className="lg:col-span-2 space-y-6">
             <div className="h-80 bg-white/60 shadow-sm border border-gray-100 animate-pulse rounded-2xl" />
             <div className="h-40 bg-white/60 shadow-sm border border-gray-100 animate-pulse rounded-2xl" />
          </div>
       </div>
    </div>
  );
}
