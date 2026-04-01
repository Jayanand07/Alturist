"use client";

import React, { useState } from "react";
import { 
  Search, 
  Download, 
  Eye,
  CalendarDays,
  Activity,
  CheckCircle2,
  PhoneCall,
  Video,
  FileText,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, parseISO } from "date-fns";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogDescription
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// --- Types ---
interface ConsultationAdmin {
  id: string;
  patientName: string;
  patientEmail: string;
  doctorName: string;
  doctorSpecialization: string;
  scheduledAt: string;
  consultationType: string;
  status: string;
  paymentStatus: string;
  amount: number;
  videoRoomId?: string;
  prescriptionUrl?: string;
  createdAt: string;
  callStartedAt?: string;
  callEndedAt?: string;
  callDurationMinutes?: number;
}

export default function ConsultationsManagementPage() {
  // Filters State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState(format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationAdmin | null>(null);

  // --- Queries ---
  const { data: statsData } = useQuery({
    queryKey: ["admin-consultations-stats"],
    queryFn: async () => (await api.get("/admin/consultations/stats")).data
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-consultations", search, statusFilter, dateFrom, dateTo, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        size: "15",
        search: search
      });
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (dateFrom) params.append("dateFrom", `${dateFrom}T00:00:00`);
      if (dateTo) params.append("dateTo", `${dateTo}T23:59:59`);
      
      return (await api.get(`/admin/consultations?${params}`)).data;
    }
  });

  // --- Handlers ---
  const handleExportCSV = () => {
    if (!data?.content?.length) return;
    const items = data.content as ConsultationAdmin[];
    const headers = ["ID", "Patient", "Doctor", "Scheduled At", "Type", "Status", "Amount"];
    const rows = items.map(c => [
      c.id.split('-')[0],
      c.patientName,
      c.doctorName,
      format(new Date(c.scheduledAt), "yyyy-MM-dd HH:mm"),
      c.consultationType,
      c.status,
      c.amount?.toString() || "0"
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(r => r.map(cell => `"${cell}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `consultations_${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openDetails = (consultation: ConsultationAdmin) => {
    setSelectedConsultation(consultation);
    setIsModalOpen(true);
  };

  // --- Helpers ---
  const getInitials = (name: any) => {
    const safeName = String(name || '');
    if (!safeName || safeName.trim() === '' || safeName === 'null') return 'U';
    return safeName.trim().split(' ')
      .filter(Boolean)
      .map(n => n?.[0] || '')
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-none">Pending</Badge>;
      case "ONGOING":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none relative pr-4">Ongoing<span className="absolute right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full animate-ping" /></Badge>;
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-none">Completed</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200 border border-dashed">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const consultations = data?.content || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
      
      {/* Header and Exporter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Consultations</h2>
          <p className="text-gray-500 font-medium">Track all remote and clinic appointments</p>
        </div>
        <div>
          <Button variant="outline" className="h-11 rounded-xl bg-white border-gray-100 font-bold shadow-sm hover:bg-gray-50 text-gray-600" onClick={handleExportCSV} disabled={consultations.length === 0}>
            <Download size={18} className="mr-2" />
            Export Page CSV
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-blue-600"><CalendarDays size={60} /></div>
          <CardContent className="p-5 flex items-center gap-4">
             <div className="p-3 rounded-2xl bg-blue-50 text-blue-600"><CalendarDays size={18} /></div>
             <div>
               <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Record</p>
               <h3 className="text-xl font-black text-gray-900">{statsData?.total || 0}</h3>
             </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-indigo-600"><CheckCircle2 size={60} /></div>
          <CardContent className="p-5 flex items-center gap-4">
             <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600"><CheckCircle2 size={18} /></div>
             <div>
               <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Today's Visits</p>
               <h3 className="text-xl font-black text-gray-900">{statsData?.today || 0}</h3>
             </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-blue-600 overflow-hidden relative group shadow-blue-500/20">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-white"><Activity size={60} /></div>
          <CardContent className="p-5 flex items-center gap-4">
             <div className="p-3 rounded-2xl bg-white/20 text-white">
               <Activity size={18} className="animate-pulse" />
             </div>
             <div>
               <p className="text-xs font-black text-blue-100 uppercase tracking-widest">Ongoing Now</p>
               <h3 className="text-xl font-black text-white">{statsData?.ongoing || 0}</h3>
             </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-green-600"><FileText size={60} /></div>
          <CardContent className="p-5 flex items-center gap-4">
             <div className="p-3 rounded-2xl bg-green-50 text-green-600"><FileText size={18} /></div>
             <div>
               <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Completed Mtd</p>
               <h3 className="text-xl font-black text-gray-900">{statsData?.completedThisMonth || 0}</h3>
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <div className="p-6 flex flex-col xl:flex-row items-center gap-4 border-b border-gray-50 bg-gray-50/30">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Search by patient or doctor name..." 
              className="pl-10 h-11 border-gray-200 bg-white focus:border-indigo-500 rounded-xl transition-all shadow-sm font-medium"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            />
          </div>
          <div className="flex flex-wrap md:flex-nowrap items-center gap-3 w-full xl:w-auto">
            <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1 shadow-sm flex-1 md:flex-auto">
               <Input 
                 type="date" 
                 value={dateFrom} 
                 onChange={e => { setDateFrom(e.target.value); setPage(0); }} 
                 className="h-9 border-none bg-transparent shadow-none text-sm w-36 font-semibold text-gray-600"
               />
               <span className="text-gray-300 font-bold">-</span>
               <Input 
                 type="date" 
                 value={dateTo} 
                 onChange={e => { setDateTo(e.target.value); setPage(0); }} 
                 className="h-9 border-none bg-transparent shadow-none text-sm w-36 font-semibold text-gray-600"
               />
            </div>
            <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val ?? "all"); setPage(0); }}>
              <SelectTrigger className="w-[180px] h-11 border-gray-200 rounded-xl shadow-sm bg-white font-semibold">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="ONGOING">Ongoing</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
          </div>
        ) : consultations.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center">
             <div className="p-6 rounded-full bg-gray-50 mb-4 text-gray-300"><Search size={40} /></div>
             <h4 className="text-xl font-black text-gray-800 tracking-tight">No consultations found</h4>
             <p className="text-gray-500 font-medium">Try adjusting your date range or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-transparent border-gray-100">
                  <TableHead className="px-6 py-5 font-black text-[11px] text-gray-400 uppercase tracking-widest min-w-[200px]">Patient</TableHead>
                  <TableHead className="font-black text-[11px] text-gray-400 uppercase tracking-widest min-w-[200px]">Reporting Doctor</TableHead>
                  <TableHead className="font-black text-[11px] text-gray-400 uppercase tracking-widest">Date & Time</TableHead>
                  <TableHead className="font-black text-[11px] text-gray-400 uppercase tracking-widest">Type</TableHead>
                  <TableHead className="font-black text-[11px] text-gray-400 uppercase tracking-widest">Status</TableHead>
                  <TableHead className="font-black text-[11px] text-gray-400 uppercase tracking-widest">Amount</TableHead>
                  <TableHead className="text-right pr-6 font-black text-[11px] text-gray-400 uppercase tracking-widest">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consultations.map((c: ConsultationAdmin) => (
                  <TableRow key={c.id} className="border-gray-50 hover:bg-indigo-50/10 transition-colors">
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs shrink-0">
                           {getInitials(c.patientName)}
                         </div>
                         <div className="flex flex-col min-w-0">
                            <span className="font-bold text-sm text-gray-900 truncate">{c.patientName}</span>
                            <span className="text-[11px] font-medium text-gray-400 truncate">{c.patientEmail}</span>
                         </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                         <div className="h-8 w-8 rounded-full bg-gray-100 border border-gray-200 text-gray-500 flex items-center justify-center font-black text-[10px] shrink-0">
                           {getInitials(c.doctorName)}
                         </div>
                         <div className="flex flex-col min-w-0">
                            <span className="font-bold text-sm text-gray-800 truncate">{c.doctorName}</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-teal-600 truncate">{c.doctorSpecialization}</span>
                         </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-gray-700">{format(parseISO(c.scheduledAt), "MMM dd, yyyy")}</span>
                        <span className="text-xs font-bold text-gray-400">{format(parseISO(c.scheduledAt), "hh:mm a")}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {c.consultationType === "INSTANT" ? (
                         <div className="flex items-center gap-1.5 text-orange-600 text-xs font-black uppercase tracking-wider">
                           <Activity size={12} /> Instant
                         </div>
                      ) : (
                         <div className="flex items-center gap-1.5 text-blue-600 text-xs font-black uppercase tracking-wider">
                           <CalendarDays size={12} /> Scheduled
                         </div>
                      )}
                    </TableCell>
                    <TableCell>{renderStatusBadge(c.status)}</TableCell>
                    <TableCell><span className="font-black text-gray-900">₹{c.amount}</span></TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="sm" className="h-9 px-3 text-indigo-600 hover:bg-indigo-50 rounded-lg font-bold transition-all" onClick={() => openDetails(c)}>
                        Details <Eye size={14} className="ml-2" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination Box */}
            {data?.totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500">Showing page {page + 1} of {data.totalPages}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-8 rounded-lg font-bold" disabled={page === 0} onClick={() => setPage(page - 1)}>Prev</Button>
                  <Button variant="outline" size="sm" className="h-8 rounded-lg font-bold" disabled={page >= data.totalPages - 1} onClick={() => setPage(page + 1)}>Next</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* View Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden border-none rounded-[32px] shadow-2xl">
           <div className="bg-indigo-600 p-8 text-white relative">
              <div className="absolute top-0 right-0 p-8 opacity-10"><Activity size={120} /></div>
              <DialogTitle className="text-2xl font-black tracking-tight mb-2">Consultation Dossier</DialogTitle>
              <div className="flex gap-2 items-center">
                 <Badge className="bg-white/20 hover:bg-white/20 border-none px-3 font-black text-indigo-50">
                    ID: {selectedConsultation?.id.split('-')[0].toUpperCase()}
                 </Badge>
                 {selectedConsultation && renderStatusBadge(selectedConsultation.status)}
              </div>
           </div>
           
           {selectedConsultation && (
             <div className="p-8 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-[24px] shadow-sm mb-6 border border-gray-100">
                   {/* Patient Info */}
                   <div>
                     <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 border-b border-gray-50 pb-2">Patient Details</p>
                     <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-sm">
                           {getInitials(selectedConsultation.patientName)}
                        </div>
                        <div>
                           <p className="font-bold text-gray-900">{selectedConsultation.patientName}</p>
                           <p className="text-xs text-gray-500 font-medium">{selectedConsultation.patientEmail}</p>
                        </div>
                     </div>
                   </div>

                   {/* Doctor Info */}
                   <div>
                     <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 border-b border-gray-50 pb-2">Attending Doctor</p>
                     <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-black text-sm">
                           {getInitials(selectedConsultation.doctorName)}
                        </div>
                        <div>
                           <p className="font-bold text-gray-900">{selectedConsultation.doctorName}</p>
                           <p className="text-xs font-bold text-teal-600 tracking-wider uppercase">{selectedConsultation.doctorSpecialization}</p>
                        </div>
                     </div>
                   </div>
                </div>

                {/* Timeline & Meta */}
                <h4 className="font-black text-sm text-gray-800 mb-4 px-2">Consultation Timeline & Data</h4>
                <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 space-y-6">
                   <div className="flex items-start gap-4">
                      <div className="mt-1 p-2 bg-blue-50 text-blue-500 rounded-full"><Clock size={16} /></div>
                      <div>
                         <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Scheduled Event</p>
                         <p className="font-bold text-gray-900">{format(parseISO(selectedConsultation.scheduledAt), "EEEE, MMMM do yyyy 'at' hh:mm a")}</p>
                         <p className="text-sm font-medium text-gray-500 mt-1">Booked as {selectedConsultation.consultationType} interaction.</p>
                      </div>
                   </div>

                   {selectedConsultation.callStartedAt && (
                     <div className="flex items-start gap-4">
                        <div className="mt-1 p-2 bg-green-50 text-green-500 rounded-full"><PhoneCall size={16} /></div>
                        <div>
                           <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Telehealth Session</p>
                           <p className="font-bold text-gray-900">Joined at {format(parseISO(selectedConsultation.callStartedAt), "hh:mm a")}</p>
                           {selectedConsultation.callEndedAt && (
                             <p className="text-sm font-medium text-gray-500 mt-1">
                               Ended at {format(parseISO(selectedConsultation.callEndedAt), "hh:mm a")} 
                               ({selectedConsultation.callDurationMinutes} mins duration)
                             </p>
                           )}
                           {selectedConsultation.videoRoomId && (
                             <Badge variant="outline" className="mt-2 text-[10px] font-bold bg-gray-50">Room: {selectedConsultation.videoRoomId}</Badge>
                           )}
                        </div>
                     </div>
                   )}

                   {selectedConsultation.prescriptionUrl && (
                     <div className="flex items-start gap-4 border-t border-gray-50 pt-6">
                        <div className="mt-1 p-2 bg-indigo-50 text-indigo-500 rounded-full"><FileText size={16} /></div>
                        <div className="flex-1">
                           <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Digital Prescription</p>
                           <p className="text-sm font-medium text-gray-500 mt-1 mb-3">A prescription was issued during this consultation.</p>
                           <a href={selectedConsultation.prescriptionUrl} target="_blank" rel="noopener noreferrer">
                              <Button className="h-10 px-5 rounded-xl font-bold bg-indigo-100 text-indigo-700 hover:bg-indigo-200 shadow-none">
                                 View Prescription PDF
                              </Button>
                           </a>
                        </div>
                     </div>
                   )}
                </div>
             </div>
           )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
