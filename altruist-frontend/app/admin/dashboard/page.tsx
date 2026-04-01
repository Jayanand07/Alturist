"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  UserRound, 
  Calendar, 
  CreditCard,
  ArrowUpRight,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Stats {
  totalDoctors: number;
  totalPatients: number;
  todayConsultations: number;
  monthlyRevenue: number;
}

interface RecentConsultation {
  id: string;
  patientName: string;
  doctorName: string;
  scheduledAt: string;
  status: string;
  amount: number;
}

interface RecentUser {
  id: string;
  fullName: string;
  email: string;
  userType: string;
  createdAt: string;
}

interface DashboardData {
  stats: Stats;
  recentConsultations: RecentConsultation[];
  recentUsers: RecentUser[];
}

export default function AdminDashboard() {
  const { data, isLoading: loading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      const response = await api.get("/admin/dashboard");
      return response.data as DashboardData;
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const statsConfig = [
    { label: "Total Doctors", value: data?.stats.totalDoctors, icon: UserRound, color: "bg-blue-500", shadow: "shadow-blue-500/20" },
    { label: "Total Patients", value: data?.stats.totalPatients, icon: Users, color: "bg-teal-500", shadow: "shadow-teal-500/20" },
    { label: "Today's Consultations", value: data?.stats.todayConsultations, icon: Calendar, color: "bg-green-500", shadow: "shadow-green-500/20" },
    { label: "Monthly Revenue", value: data?.stats.monthlyRevenue, icon: CreditCard, color: "bg-purple-500", shadow: "shadow-purple-500/20", isPrice: true },
  ];

  if (loading) {
     return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsConfig.map((stat, i) => (
          <Card key={i} className="border-none shadow-md overflow-hidden relative group">
             <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:scale-125 transition-transform duration-300">
                <stat.icon size={80} />
             </div>
             <CardContent className="p-6">
                <div className="flex items-center gap-4">
                   <div className={cn("p-3 rounded-2xl text-white shadow-lg", stat.color, stat.shadow)}>
                      <stat.icon size={22} />
                   </div>
                   <div className="flex flex-col">
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                      <h3 className="text-2xl font-black text-gray-900 mt-1">
                        {stat.isPrice 
                          ? `₹${stat.value ? Number(stat.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}` 
                          : (stat.value ?? 0).toLocaleString()}
                      </h3>
                   </div>
                </div>
             </CardContent>
          </Card>
        ))}
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Consultations Table */}
        <div className="lg:col-span-2">
          <Card className="border-none shadow-md">
            <CardHeader className="p-6 flex flex-row items-center justify-between border-b border-gray-50">
               <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                     <span className="w-1.5 h-6 bg-teal-500 rounded-full" />
                     Recent Consultations
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">Track the latest appointments activity</p>
               </div>
               <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-teal-200 text-teal-700 bg-teal-50 px-2 py-0.5">Live Feed</Badge>
            </CardHeader>
            <CardContent className="p-0">
               <Table>
                  <TableHeader>
                     <TableRow className="bg-gray-50/50 hover:bg-transparent border-gray-100">
                        <TableHead className="font-bold text-gray-700 px-6 py-4">Patient</TableHead>
                        <TableHead className="font-bold text-gray-700">Doctor</TableHead>
                        <TableHead className="font-bold text-gray-700">Date</TableHead>
                        <TableHead className="font-bold text-gray-700">Status</TableHead>
                        <TableHead className="font-bold text-teal-800 text-right pr-6">Amount</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {data?.recentConsultations.map((c) => (
                       <TableRow key={c.id} className="border-gray-50 hover:bg-teal-50/20 transition-colors">
                          <TableCell className="px-6 py-4 font-bold text-gray-900">{c.patientName || 'Unknown Patient'}</TableCell>
                          <TableCell className="font-semibold text-gray-600">{c.doctorName || 'Unknown Doctor'}</TableCell>
                          <TableCell className="text-sm text-gray-500">{new Date(c.scheduledAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                             <Badge className={cn("text-[10px] font-black uppercase tracking-tighter px-2", 
                                c.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                                c.status === 'PENDING' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700')}>
                                {c.status}
                             </Badge>
                          </TableCell>
                          <TableCell className="text-right font-black pr-6 text-teal-800">₹{c.amount}</TableCell>
                       </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </CardContent>
          </Card>
        </div>

        {/* Recent Registrations List */}
        <div className="lg:col-span-1">
          <Card className="border-none shadow-md h-full">
            <CardHeader className="p-6 border-b border-gray-50 flex flex-row items-center justify-between">
               <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                     <span className="w-1.5 h-6 bg-blue-500 rounded-full" />
                     New Registrations
                  </CardTitle>
               </div>
               <Plus size={18} className="text-gray-400" />
            </CardHeader>
            <CardContent className="p-6">
               <div className="space-y-6">
                  {data?.recentUsers.map((u) => (
                    <div key={u.id} className="flex items-center gap-4 group cursor-pointer">
                       <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-gray-100 group-hover:ring-blue-200 transition-all">
                          <AvatarFallback className="bg-blue-50 text-blue-600 font-bold">
                            {String(u?.fullName || u?.email || "U").charAt(0).toUpperCase()}
                          </AvatarFallback>
                       </Avatar>
                       <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{u?.fullName || u?.email || "Unknown User"}</h4>
                          <p className="text-[11px] text-gray-400 truncate">{u?.email || "No Email"}</p>
                       </div>
                       <div className="text-right">
                          <Badge variant="outline" className="text-[9px] font-black px-1.5 py-0 border-gray-200 mb-1">{u.userType}</Badge>
                          <p className="text-[10px] text-gray-500 font-bold">{new Date(u.createdAt).toLocaleDateString()}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
   return (
      <div className="space-y-8 animate-pulse">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
               <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
         </div>
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="lg:col-span-2 h-[500px] rounded-2xl" />
            <Skeleton className="lg:col-span-1 h-[500px] rounded-2xl" />
         </div>
      </div>
   );
}
