"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { 
  Calendar, Clock, FileText, MessageSquare, ArrowRight, Heart, Activity, 
  ChevronRight, Pill, FlaskConical, Stethoscope, Video, ShoppingBag, Info, Phone, Search, LifeBuoy
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";

// Helper functions
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const formatDayDate = (dateStr: string) => {
  if (!dateStr) return "";
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: '2-digit' }).format(new Date(dateStr));
};

const formatTime = (dateStr: string) => {
  if (!dateStr) return "";
  return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(dateStr));
};

export default function PatientDashboard() {
  const router = useRouter();
  const { user: authUser, userType, loading: authLoading } = useAuth();
  
  const [greeting] = useState(getGreeting());
  const todayDate = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  // Auth Guard
  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push("/login");
    } else if (!authLoading && userType !== "PATIENT") {
      router.push("/");
    }
  }, [authUser, userType, authLoading, router]);

  // Queries
  const { data: dash, isLoading: dashLoading, isError: dashError } = useQuery({
    queryKey: ["patient-dashboard"],
    queryFn: async () => (await api.get("/patients/dashboard")).data,
    enabled: !!authUser && userType === "PATIENT",
  });

  const { data: sub, isLoading: subLoading } = useQuery({
    queryKey: ["my-subscription"],
    queryFn: async () => {
      try {
        return (await api.get("/subscriptions/my")).data;
      } catch (e) { return null; }
    },
    enabled: !!authUser && userType === "PATIENT",
    retry: false
  });

  const { data: tickets, isLoading: tickLoading } = useQuery({
    queryKey: ["recent-tickets"],
    queryFn: async () => {
      try {
        return (await api.get("/support/tickets?limit=3")).data;
      } catch (e) { return []; }
    },
    enabled: !!authUser && userType === "PATIENT",
  });

  const { data: history, isLoading: histLoading } = useQuery({
    queryKey: ["recent-history"],
    queryFn: async () => {
      try {
        return (await api.get("/patients/consultations?size=5")).data.content;
      } catch (e) { return []; }
    },
    enabled: !!authUser && userType === "PATIENT",
  });

  if (dashError) {
    toast.error("Failed to load dashboard data");
  }

  if (authLoading || dashLoading) return <DashboardSkeleton />;
  if (!authUser || userType !== "PATIENT" || !dash) return null;

  // Stats
  const totalConsultations = dash.stats?.totalConsultations || 0;
  const upcomingAppointments = dash.stats?.upcomingAppointments || 0;
  const activePrescriptions = dash.stats?.activePrescriptions || 0;
  const pendingOrders = 0; // Fallback if API doesn't return orders

  const statsCards = [
    { label: "Total Consults", value: totalConsultations, icon: Calendar, color: "text-[#2563EB]", bg: "bg-[#2563EB]/10", border: "border-[#2563EB]/20" },
    { label: "Upcoming Appts", value: upcomingAppointments, icon: Clock, color: "text-[#FF6B35]", bg: "bg-[#FF6B35]/10", border: "border-[#FF6B35]/20" },
    { label: "Prescriptions", value: activePrescriptions, icon: FileText, color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10", border: "border-[#8B5CF6]/20" },
    { label: "Pending Orders", value: pendingOrders, icon: ShoppingBag, color: "text-[#00A87E]", bg: "bg-[#00A87E]/10", border: "border-[#00A87E]/20" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 min-h-screen bg-slate-50/50">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-2 border-b border-slate-200">
        <div>
          <p className="text-[#00A87E] font-bold text-sm tracking-wider uppercase mb-1">{todayDate}</p>
          <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            {greeting}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00A87E] to-teal-600">{authUser.displayName?.split(" ")[0] || "User"}</span>! 👋
          </h1>
          <p className="text-slate-500 font-medium mt-2">Here is your health overview for today.</p>
        </div>
        <Link href="/consult">
          <Button className="bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold h-11 px-6 rounded-xl shadow-md transition-all active:scale-95">
            <Video className="w-4 h-4 mr-2" /> Book Video Consult
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, i) => (
          <Card key={i} className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow rounded-2xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={cn("p-3.5 rounded-2xl border", stat.bg, stat.color, stat.border)}>
                  <stat.icon size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-black text-slate-900">{stat.value}</h3>
                  <p className="text-sm font-bold text-slate-500 mt-0.5">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: "/consult", icon: Stethoscope, label: "Find Doctors", color: "text-[#2563EB]", bg: "bg-[#2563EB]/5 border-[#2563EB]/20 hover:bg-[#2563EB]/10" },
          { href: "/medicines", icon: Pill, label: "Order Medicine", color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/5 border-[#8B5CF6]/20 hover:bg-[#8B5CF6]/10" },
          { href: "/labs", icon: FlaskConical, label: "Lab Tests", color: "text-[#FF6B35]", bg: "bg-[#FF6B35]/5 border-[#FF6B35]/20 hover:bg-[#FF6B35]/10" },
          { href: "/support", icon: LifeBuoy, label: "Support Chat", color: "text-[#00A87E]", bg: "bg-[#00A87E]/5 border-[#00A87E]/20 hover:bg-[#00A87E]/10" },
        ].map((action, i) => (
          <Link key={i} href={action.href}>
            <Card className={cn("border transition-all cursor-pointer rounded-2xl shadow-sm", action.bg)}>
              <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                <action.icon size={28} className={action.color} />
                <span className="font-bold text-slate-800">{action.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Main content) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Subscription Banner */}
          {!subLoading && sub && sub.status === "ACTIVE" ? (
            <div className="bg-gradient-to-r from-[#0F172A] to-slate-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl shadow-slate-900/10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#00A87E]/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-[#00A87E]/20 text-[#00A87E] hover:bg-[#00A87E]/20 border border-[#00A87E]/30 uppercase tracking-widest font-bold">
                      Active Plan
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-heading font-bold mb-1">{sub.planName}</h3>
                  <p className="text-slate-400 font-medium text-sm">Renews on {new Date(sub.nextBillingDate).toLocaleDateString()}</p>
                </div>
                <div className="flex-1 max-w-sm w-full bg-slate-900/50 p-4 rounded-2xl border border-white/10">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-slate-300">Consultations</span>
                    <span className="text-lg font-bold"><span className="text-[#00A87E]">{sub.consultationsRemaining}</span> / {sub.consultationsUsed + sub.consultationsRemaining}</span>
                  </div>
                  <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#00A87E] rounded-full" 
                      style={{ width: `${(sub.consultationsUsed / (sub.consultationsUsed + sub.consultationsRemaining)) * 100}%` }}
                    />
                  </div>
                </div>
                <Link href="/plans">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 font-bold bg-transparent">Manage Plan</Button>
                </Link>
              </div>
            </div>
          ) : !subLoading && (!sub || sub.status !== "ACTIVE") ? (
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-3xl p-6 md:p-8 border border-teal-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-heading font-bold text-slate-900 mb-1">Upgrade your healthcare</h3>
                <p className="text-slate-600 font-medium">Subscribe to Altruist Premium for unlimited consults and flat 20% off medicines.</p>
              </div>
              <Link href="/plans" className="shrink-0">
                <Button className="bg-[#00A87E] hover:bg-[#00906B] text-white font-bold h-11 px-6 rounded-xl shadow-md">
                  View Plans
                </Button>
              </Link>
            </div>
          ) : null}

          {/* Upcoming Appointments */}
          <Card className="border border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 py-6">
              <div>
                <CardTitle className="font-heading text-xl font-bold text-slate-900">Upcoming Appointments</CardTitle>
                <CardDescription className="font-medium mt-1">Your next scheduled video calls</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {dash?.upcomingConsultations && dash.upcomingConsultations.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {dash.upcomingConsultations.map((consult: any) => {
                    const isToday = new Date(consult.scheduledAt).toDateString() === new Date().toDateString();
                    // First name + Last initial
                    const docParts = (consult.doctor?.name || "Doctor").replace("Dr. ", "").split(" ");
                    const docDisplayName = docParts.length > 1 
                      ? `Dr. ${docParts[0]} ${docParts[docParts.length - 1].charAt(0)}.` 
                      : `Dr. ${docParts[0]}`;

                    return (
                      <div key={consult.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-14 h-14 border-2 border-teal-100 shadow-sm">
                            <AvatarImage src={consult.doctor?.profilePicture || ""} />
                            <AvatarFallback className="bg-teal-50 text-[#00A87E] font-bold text-lg">
                              {docDisplayName.replace('Dr. ', '').charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-heading font-extrabold text-slate-900 text-lg">{docDisplayName}</h4>
                            <p className="text-sm text-slate-500 font-bold">{consult.doctor?.specialization}</p>
                          </div>
                        </div>
                        <div className="flex flex-col md:items-end gap-1.5">
                          <div className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg w-fit">
                            <Calendar size={14} className="text-[#00A87E]" />
                            {formatDayDate(consult.scheduledAt)}
                            <span className="mx-1 text-slate-300">•</span>
                            <Clock size={14} className="text-[#00A87E]" />
                            {formatTime(consult.scheduledAt)}
                          </div>
                          {isToday && <Badge className="bg-amber-100 text-amber-800 border-none font-bold w-fit mt-1">Today</Badge>}
                        </div>
                        <div>
                          {consult.canJoinNow ? (
                            <Link href={`/consultation/${consult.id}`}>
                              <Button className="bg-[#00A87E] hover:bg-[#007A5C] font-bold w-full md:w-auto gap-2 rounded-xl h-11 px-6 shadow-md shadow-teal-500/20 active:scale-95 transition-all">
                                <Video size={18} /> Join Call
                              </Button>
                            </Link>
                          ) : (
                            <Button disabled variant="outline" className="border-slate-200 text-slate-400 font-bold w-full md:w-auto rounded-xl h-11 px-6 bg-slate-50 cursor-not-allowed">
                              <Clock size={18} className="mr-2" /> Waiting
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <EmptyState icon={<Calendar size={40} className="text-slate-300" />} title="No upcoming appointments" message="You don't have any video consultations scheduled." actionLabel="Book Appointment" actionUrl="/consult" />
              )}
            </CardContent>
          </Card>

          {/* Recent History Table */}
          <Card className="border border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 py-6">
              <CardTitle className="font-heading text-xl font-bold text-slate-900">Recent Consultations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {histLoading ? (
                <div className="p-8 flex justify-center"><Activity className="animate-spin text-slate-300" /></div>
              ) : history && history.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Doctor</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {history.map((item: any) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors font-medium text-slate-700">
                          <td className="px-6 py-4">
                            <span className="font-bold text-slate-900">Dr. {item.doctor?.user?.fullName || "Doctor"}</span>
                            <span className="block text-xs text-slate-500">{item.doctor?.specialization || "General"}</span>
                          </td>
                          <td className="px-6 py-4">
                            {formatDayDate(item.scheduledAt)}<br/>
                            <span className="text-xs text-slate-500">{formatTime(item.scheduledAt)}</span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={
                              item.status === 'COMPLETED' ? "bg-emerald-100 text-emerald-800 border-none" :
                              item.status === 'CANCELLED' ? "bg-red-100 text-red-800 border-none" :
                              "bg-blue-100 text-blue-800 border-none"
                            }>
                              {item.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState icon={<FileText size={40} className="text-slate-300" />} title="No past consultations" message="Your consultation history will appear here." />
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-8">
          
          {/* Active Prescriptions */}
          <Card className="border border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 py-5 bg-slate-50/50">
              <CardTitle className="font-heading text-lg font-bold text-slate-900">My Prescriptions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {dash?.recentPrescriptions && dash.recentPrescriptions.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {dash.recentPrescriptions.slice(0,3).map((prescription: any) => (
                    <div key={prescription.id} className="p-5 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="bg-purple-100 p-2.5 rounded-xl text-purple-600 shrink-0 mt-1">
                          <FileText size={20} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-heading font-extrabold text-slate-900">Dr. {prescription.doctorName}</h4>
                          <p className="text-xs font-bold text-slate-500 mt-1 flex items-center gap-1.5">
                            <Calendar size={12}/> {formatDayDate(prescription.issuedAt)}
                          </p>
                          <div className="flex items-center gap-2 mt-3">
                            <Badge variant="outline" className="font-bold text-xs bg-white text-slate-600 border-slate-200">
                              {prescription.medicinesCount} Medicines
                            </Badge>
                          </div>
                          {prescription.prescriptionUrl && (
                            <Button 
                              onClick={() => window.open(prescription.prescriptionUrl, "_blank")} 
                              variant="link" 
                              className="px-0 mt-2 h-auto text-[#00A87E] font-bold"
                            >
                              Download PDF
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center space-y-3">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                    <Pill size={24} />
                  </div>
                  <p className="font-bold text-slate-700">No prescriptions yet 💊</p>
                </div>
              )}
              <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
                <Link href="/medicines" className="text-sm font-bold text-[#00A87E] hover:underline">Order Medicines &rarr;</Link>
              </div>
            </CardContent>
          </Card>

          {/* Support Tickets */}
          <Card className="border border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 py-5 bg-slate-50/50">
              <CardTitle className="font-heading text-lg font-bold text-slate-900">Recent Support</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {tickLoading ? (
                <div className="p-6 flex justify-center"><Activity className="animate-spin text-slate-300" /></div>
              ) : tickets && tickets.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {tickets.map((t: any) => (
                    <Link key={t.id} href="/support" className="block p-5 hover:bg-slate-50 transition-colors">
                      <h4 className="font-bold text-slate-900 text-sm truncate mb-1">{t.subject}</h4>
                      <div className="flex items-center justify-between mt-2">
                        <Badge className={
                          t.status === 'OPEN' ? "bg-blue-100 text-blue-800 border-none" : 
                          t.status === 'RESOLVED' ? "bg-emerald-100 text-emerald-800 border-none" :
                          "bg-slate-100 text-slate-800 border-none"
                        }>{t.status}</Badge>
                        <span className="text-xs font-bold text-slate-400">#{t.id.split('-')[0]}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center space-y-3">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                    <MessageSquare size={24} />
                  </div>
                  <p className="font-bold text-slate-700">No active tickets 🎧</p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}

// Emptry State Component
function EmptyState({ icon, title, message, actionLabel, actionUrl }: any) {
  return (
    <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
      <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-slate-200">
        {icon}
      </div>
      <h3 className="font-heading font-bold text-slate-900 text-xl">{title}</h3>
      <p className="text-slate-500 font-medium max-w-sm mx-auto">{message}</p>
      {actionLabel && actionUrl && (
        <Link href={actionUrl}>
          <Button className="mt-2 bg-[#00A87E] hover:bg-[#00906B] font-bold h-11 px-8 rounded-xl shadow-md active:scale-95 transition-all">
            {actionLabel}
          </Button>
        </Link>
      )}
    </div>
  );
}

// Skeleton Loader
function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 min-h-screen bg-slate-50/50">
      <div className="h-16 bg-slate-200 animate-pulse rounded-2xl w-3/4 max-w-lg" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white shadow-sm border border-slate-100 animate-pulse rounded-3xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="h-40 bg-white shadow-sm border border-slate-100 animate-pulse rounded-3xl" />
          <div className="h-96 bg-white shadow-sm border border-slate-100 animate-pulse rounded-3xl" />
        </div>
        <div className="space-y-8">
          <div className="h-80 bg-white shadow-sm border border-slate-100 animate-pulse rounded-3xl" />
          <div className="h-64 bg-white shadow-sm border border-slate-100 animate-pulse rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
