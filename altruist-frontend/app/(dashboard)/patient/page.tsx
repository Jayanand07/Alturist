"use client";

import React, { useEffect, useState } from "react";
import { 
  Calendar, Clock, FileText, MessageSquare, Bell, ArrowRight, Heart, Activity, ChevronRight, Pill, 
  FlaskConical, Settings, Stethoscope
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const formatDate = (dateStr: string) => new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date(dateStr));
const formatTime = (dateStr: string) => new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(dateStr));
const formatDayDate = (dateStr: string) => new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: '2-digit' }).format(new Date(dateStr));

interface Stats { totalConsultations: number; completedConsultations: number; upcomingConsultations: number; totalPrescriptions: number; }
interface Consultation { id: string; doctor: { name: string; specialization: string; profilePicture: string | null; }; scheduledAt: string; status: string; type: string; videoRoomId: string | null; canJoinNow: boolean; }
interface Prescription { id: string; doctorName: string; dateIssued: string; medicinesCount: string; }
interface DashboardData { fullName: string; email: string; profilePictureUrl: string | null; stats: Stats; upcomingConsultations: Consultation[]; recentPrescriptions: Prescription[]; healthTips: string[]; }

export default function PatientDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTip, setCurrentTip] = useState(0);
  const router = useRouter();
  const { user: authUser, userType, loading: authLoading } = useAuth();

  // Auth Guard: Redirect if not authenticated or not a patient
  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push("/login");
    } else if (!authLoading && userType !== "PATIENT") {
      router.push("/");
    }
  }, [authUser, userType, authLoading, router]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/patients/dashboard");
        setData(response.data);
      } catch (error) { console.error("Failed to fetch dashboard data", error); }
      finally { setLoading(false); }
    };
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (data?.healthTips?.length) {
      const timer = setInterval(() => setCurrentTip((prev) => (prev + 1) % data.healthTips!.length), 5000);
      return () => clearInterval(timer);
    }
  }, [data]);

  if (authLoading || !authUser || userType !== "PATIENT") return <DashboardSkeleton />;
  if (loading) return <DashboardSkeleton />;

  const stats = [
    { label: "Total Consults", value: data?.stats?.totalConsultations || 0, icon: Calendar, color: "text-[#2563EB]", bg: "bg-[#2563EB]/10", border: "border-l-[#2563EB]" },
    { label: "Upcoming Appts", value: data?.stats?.upcomingConsultations || 0, icon: Clock, color: "text-[#FF6B35]", bg: "bg-[#FF6B35]/10", border: "border-l-[#FF6B35]" },
    { label: "Prescriptions", value: data?.stats?.totalPrescriptions || 0, icon: FileText, color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10", border: "border-l-[#8B5CF6]" },
    { label: "Health Score", value: "92", icon: Activity, color: "text-[#00A87E]", bg: "bg-[#00A87E]/10", border: "border-l-[#00A87E]" },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 min-h-screen">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="font-heading text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Welcome back, <span className="gradient-text">{data?.fullName || "Patient"}</span>! 👋
          </h1>
          <p className="text-[#475569] font-medium">Here&apos;s your health overview for today</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className={cn("border-none shadow-sm card-hover border-l-4", stat.border)}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={cn("p-3 rounded-2xl", stat.bg, stat.color)}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#475569]">{stat.label}</p>
                <h3 className="font-display text-3xl font-bold text-[#0F172A]">
                  {stat.value}
                  {stat.label === "Health Score" && <span className="text-base text-[#475569] font-medium">/100</span>}
                </h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Consultations & Prescriptions */}
        <div className="lg:col-span-3 space-y-8">
          {/* Upcoming Consultations */}
          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 py-5">
              <div className="space-y-1">
                <CardTitle className="font-heading text-xl font-bold text-[#0F172A]">Upcoming Consultations</CardTitle>
                <CardDescription>Your scheduled medical appointments</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {data?.upcomingConsultations && data.upcomingConsultations.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {data.upcomingConsultations.map((consult) => {
                    const isToday = new Date(consult.scheduledAt).toDateString() === new Date().toDateString();
                    return (
                      <div key={consult.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#F8FAFC] transition-colors">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12 border-2 border-[#E6F7F3] shadow-sm">
                            <AvatarImage src={consult.doctor?.profilePicture || ""} />
                            <AvatarFallback className="bg-[#E6F7F3] text-[#00A87E] font-bold text-lg">
                              {(consult.doctor?.name || "Doctor").replace('Dr. ', '').charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-heading font-bold text-[#0F172A]">{consult.doctor?.name}</h4>
                            <p className="text-sm text-[#475569] font-medium">{consult.doctor?.specialization}</p>
                          </div>
                        </div>
                        <div className="flex flex-col md:items-end gap-1">
                          <div className="flex items-center gap-2 text-sm font-bold text-[#0F172A]">
                            <Calendar size={14} className="text-[#475569]" />
                            {formatDayDate(consult.scheduledAt)}
                            <span className="mx-1 text-[#E2E8F0]">•</span>
                            <Clock size={14} className="text-[#475569]" />
                            {formatTime(consult.scheduledAt)}
                          </div>
                          <Badge className={cn("mt-1 w-fit font-bold border-none", isToday ? "bg-[#FF6B35]/10 text-[#FF6B35]" : "bg-[#2563EB]/10 text-[#2563EB]")}>
                            {isToday ? "Today" : "Upcoming"}
                          </Badge>
                        </div>
                        <div>
                          {consult.canJoinNow ? (
                            <Button onClick={() => router.push(`/consultation/${consult.id}`)} className="bg-[#00A87E] hover:bg-[#007A5C] font-bold w-full md:w-auto gap-2 rounded-xl active:scale-95 transition-all">
                              <MessageSquare size={16} /> Open Chat
                            </Button>
                          ) : (
                            <Button onClick={() => router.push(`/consultation/${consult.id}`)} variant="outline" className="border-[#E2E8F0] text-[#475569] font-bold w-full md:w-auto rounded-xl gap-2">
                              <MessageSquare size={16} /> View Chat
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="p-12 text-center space-y-4">
                  <div className="bg-[#F8FAFC] w-20 h-20 rounded-full flex items-center justify-center mx-auto text-[#475569]/30 border-2 border-dashed border-[#E2E8F0]">
                    <Calendar size={36} />
                  </div>
                  <h3 className="font-heading font-bold text-[#0F172A] text-lg">No upcoming consultations</h3>
                  <p className="text-sm text-[#475569] max-w-sm mx-auto">Book an appointment with a specialist now.</p>
                  <Button onClick={() => router.push('/consult')} className="bg-[#00A87E] hover:bg-[#007A5C] font-bold h-11 px-8 rounded-xl shadow-lg shadow-[#00A87E]/10 active:scale-95 transition-all">
                    Book an Appointment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Prescriptions */}
          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 py-5">
              <div className="space-y-1">
                <CardTitle className="font-heading text-xl font-bold text-[#0F172A]">Recent Prescriptions</CardTitle>
                <CardDescription>Your latest medical prescriptions</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {data?.recentPrescriptions && data.recentPrescriptions.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {data.recentPrescriptions.map((prescription) => (
                    <div key={prescription.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F8FAFC] transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="bg-[#8B5CF6]/10 p-3 rounded-xl text-[#8B5CF6]">
                          <Pill size={20} />
                        </div>
                        <div>
                          <h4 className="font-heading font-bold text-[#0F172A]">{prescription.doctorName}</h4>
                          <div className="flex items-center gap-2 text-sm text-[#475569] mt-1 font-medium">
                            <Calendar size={14} className="text-[#475569]/60" />
                            {formatDate(prescription.dateIssued)}
                            <span className="mx-1">•</span>
                            <span>{prescription.medicinesCount} Medicines</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button variant="outline" size="sm" className="font-bold h-9 rounded-lg border-[#E2E8F0]">View</Button>
                        <Button size="sm" className="bg-[#00A87E] hover:bg-[#007A5C] font-bold border-none text-white gap-2 h-9 rounded-lg">
                          Order Medicines
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <p className="text-[#475569] font-medium">No recent prescriptions available.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Quick Actions + Tips */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
            <CardHeader className="pb-4 border-b border-gray-50">
              <CardTitle className="font-heading text-lg font-bold text-[#0F172A]">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <Link href="/consult">
                <Button className="w-full justify-between h-14 bg-[#00A87E] hover:bg-[#007A5C] text-white font-bold rounded-xl shadow-lg shadow-[#00A87E]/10 transition-all active:scale-95">
                  <div className="flex items-center gap-3 text-base"><MessageSquare size={18} /> 💬 Consult Doctor Now</div>
                  <ChevronRight size={18} className="opacity-70" />
                </Button>
              </Link>
              {[
                { href: "/labs", icon: FlaskConical, label: "🧪 Book Diagnostic Test", iconBg: "bg-[#2563EB]/10", iconColor: "text-[#2563EB]" },
                { href: "/medicines", icon: Pill, label: "💊 Order Medicines", iconBg: "bg-[#8B5CF6]/10", iconColor: "text-[#8B5CF6]" },
                { href: "/patient", icon: FileText, label: "📋 View Health Records", iconBg: "bg-[#FF6B35]/10", iconColor: "text-[#FF6B35]" },
                { href: "/settings", icon: Settings, label: "⚙️ Settings", iconBg: "bg-gray-100", iconColor: "text-[#475569]" },
              ].map((action, i) => (
                <Link key={i} href={action.href}>
                  <Button variant="outline" className="w-full justify-between h-14 border-[#E2E8F0] text-[#0F172A] font-bold rounded-xl hover:bg-[#F8FAFC] hover:text-[#00A87E] hover:border-[#00A87E]/30 group transition-all">
                    <div className="flex items-center gap-3 text-base">
                      <div className={cn("p-1.5 rounded-md transition-colors", action.iconBg, "group-hover:bg-[#00A87E]/10")}>
                        <action.icon size={18} className={cn(action.iconColor, "group-hover:text-[#00A87E] transition-colors")} />
                      </div>
                      {action.label}
                    </div>
                    <ChevronRight size={18} className="text-[#475569]/40 group-hover:text-[#00A87E] transition-colors" />
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Health Tips */}
          {data?.healthTips && data.healthTips.length > 0 && (
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden relative text-white" style={{ background: "linear-gradient(135deg, #00A87E, #059669)" }}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 font-bold text-white/70 uppercase text-xs tracking-wider">
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
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 min-h-screen">
      <div className="h-10 bg-gray-200 animate-pulse rounded-xl w-80" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-28 bg-white/60 shadow-sm border border-[#E2E8F0] animate-pulse rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="h-96 bg-white/60 shadow-sm border border-[#E2E8F0] animate-pulse rounded-2xl" />
          <div className="h-64 bg-white/60 shadow-sm border border-[#E2E8F0] animate-pulse rounded-2xl" />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <div className="h-80 bg-white/60 shadow-sm border border-[#E2E8F0] animate-pulse rounded-2xl" />
          <div className="h-40 bg-white/60 shadow-sm border border-[#E2E8F0] animate-pulse rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
