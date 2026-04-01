"use client";

import React, { useState } from "react";
import { 
  Users, 
  Search, 
  Download, 
  Eye, 
  Trash2, 
  FilterX, 
  Loader2, 
  AlertCircle,
  Calendar,
  Activity,
  UserPlus,
  ArrowRight,
  FileText,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

// --- Types ---
interface Patient {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  createdAt: string;
  totalConsultations: number;
}

interface RecentConsultation {
  id: string;
  doctorName: string;
  specialization: string;
  scheduledAt: string;
  status: string;
  amount: number;
}

interface PatientDetails extends Patient {
  prescriptionCount: number;
  recentConsultations: RecentConsultation[];
}

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

const exportToCSV = (data: Patient[]) => {
  const headers = ["Name", "Email", "Phone", "Gender", "DOB", "Registered", "Total Consultations"];
  const rows = data.map(p => [
    p.fullName,
    p.email,
    p.phone,
    p.gender,
    p.dateOfBirth,
    new Date(p.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short', 
      year: 'numeric'
    }),
    p.totalConsultations
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `patients_export_${new Date().toISOString().split('T')[0]}.csv`);

  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function AdminPatientsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  // Modal States
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  // --- Queries ---
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-patients", search, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        size: "10",
        search: search
      });
      const response = await api.get(`/admin/patients?${params}`);
      return response.data;
    }
  });

  const { data: details, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["admin-patient-details", selectedPatientId],
    queryFn: async () => {
      const response = await api.get(`/admin/patients/${selectedPatientId}/details`);
      return response.data as PatientDetails;
    },
    enabled: !!selectedPatientId && isDetailsOpen
  });

  // --- Mutations ---
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/patients/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-patients"] });
      toast.success("Patient record deleted successfully");
      setIsDeleteDialogOpen(false);
    },
    onError: (err: any) => {
      if (err.response?.status === 409) {
        toast.error("Cannot delete patient with active consultations");
      } else {
        toast.error("Failed to delete patient record");
      }
    }
  });

  // --- Calculations ---
  const patients = data?.content || [];
  const totalCount = data?.totalElements || 0;
  
  // Calculate "New this month" from current page data (as per frontend-only requirement)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const newThisMonth = patients.filter((p: Patient) => new Date(p.createdAt) >= startOfMonth).length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Header & Stats Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Patient Management</h2>
          <p className="text-gray-500 font-medium">Monitor and manage all registered patients</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => exportToCSV(patients)}
          className="h-11 border-gray-100 rounded-xl font-bold flex gap-2 bg-white hover:bg-gray-50 shadow-sm transition-all active:scale-95"
          disabled={patients.length === 0}
        >
          <Download size={18} className="text-teal-600" />
          Export to CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-blue-600"><Users size={60} /></div>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-600"><Users size={20} /></div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Patients</p>
                <h3 className="text-2xl font-black text-gray-900">{totalCount}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-teal-600"><UserPlus size={60} /></div>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-teal-50 text-teal-600"><UserPlus size={20} /></div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">New This Month</p>
                <h3 className="text-2xl font-black text-gray-900">{newThisMonth}</h3>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 font-bold italic">* Calculated from current view</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-purple-600"><Activity size={60} /></div>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-purple-50 text-purple-600"><Activity size={20} /></div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Growth Rate</p>
                <h3 className="text-2xl font-black text-gray-900">12.5%</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="border-none shadow-sm bg-white p-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input 
            placeholder="Search patients by name or email..." 
            className="pl-10 h-12 border-gray-100 focus:border-teal-500 rounded-xl transition-all shadow-none"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
        </div>
      </Card>

      {/* Main Table */}
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
            </div>
          ) : patients.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-center space-y-6">
               <div className="bg-gray-50 p-8 rounded-full text-gray-300"><FilterX size={64} strokeWidth={1.5} /></div>
               <div className="space-y-1">
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">No patients found</h3>
                  <p className="text-gray-500 font-medium max-w-xs">Try adjusting your search query to find who you're looking for.</p>
               </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 hover:bg-transparent border-gray-100">
                    <TableHead className="px-6 py-5 font-black text-[11px] text-gray-400 uppercase tracking-widest">Patient Details</TableHead>
                    <TableHead className="font-black text-[11px] text-gray-400 uppercase tracking-widest">Contact Info</TableHead>
                    <TableHead className="font-black text-[11px] text-gray-400 uppercase tracking-widest">Gender / DOB</TableHead>
                    <TableHead className="font-black text-[11px] text-gray-400 uppercase tracking-widest">Registration</TableHead>
                    <TableHead className="font-black text-[11px] text-gray-400 uppercase tracking-widest">Activity</TableHead>
                    <TableHead className="text-right pr-8 font-black text-[11px] text-gray-400 uppercase tracking-widest">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((patient: Patient) => (
                    <TableRow key={patient.id} className="border-gray-50 hover:bg-teal-50/10 transition-colors group">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-gray-100">
                            <AvatarFallback className="bg-blue-50 text-blue-600 font-bold text-xs">
                               {getInitials(patient.fullName || patient.email || '')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{patient.fullName}</span>
                            <span className="text-[11px] text-gray-400 font-medium truncate">{patient.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-bold text-gray-600">{patient.phone || "N/A"}</TableCell>
                      <TableCell>
                         <div className="flex flex-col">
                            <Badge variant="outline" className="text-[10px] w-fit font-black uppercase border-gray-100 mb-1">{patient.gender}</Badge>
                            <span className="text-[11px] text-gray-400 font-bold">{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "N/A"}</span>
                         </div>
                      </TableCell>
                      <TableCell className="text-[11px] text-gray-500 font-bold italic">{new Date(patient.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</TableCell>
                      <TableCell>

                         <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-900">{patient.totalConsultations} Consults</span>
                            <div className="w-16 h-1 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                               <div className="bg-teal-500 h-full" style={{ width: `${Math.min(patient.totalConsultations * 10, 100)}%` }} />
                            </div>
                         </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all"
                            onClick={() => { setSelectedPatientId(patient.id); setIsDetailsOpen(true); }}
                          >
                             <Eye size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            onClick={() => { setPatientToDelete(patient); setIsDeleteDialogOpen(true); }}
                          >
                             <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        
        {/* Pagination */}
        {data?.totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500 font-bold">
              Showing <span className="text-gray-900">{patients.length}</span> of <span className="text-gray-900">{totalCount}</span> patients
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 rounded-lg font-bold"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              {[...Array(data.totalPages)].map((_, i) => (
                <Button 
                  key={i} 
                  variant={page === i ? "default" : "outline"} 
                  size="sm" 
                  className={cn("h-8 w-8 rounded-lg font-bold transition-all", page === i ? "bg-teal-600 hover:bg-teal-700" : "")}
                  onClick={() => setPage(i)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 rounded-lg font-bold"
                disabled={page === data.totalPages - 1}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden border-none rounded-[32px] shadow-2xl">
          {isLoadingDetails ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
               <Loader2 className="animate-spin text-teal-600" size={40} />
               <p className="text-gray-500 font-black animate-pulse uppercase tracking-widest text-xs">Fetching Health Records...</p>
            </div>
          ) : details && (
            <div className="flex flex-col">
              {/* Profile Header */}
              <div className="bg-gradient-to-br from-blue-600 to-teal-600 p-8 text-white relative">
                <button 
                  onClick={() => setIsDetailsOpen(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                   <X size={20} />
                </button>
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20 border-4 border-white/20 shadow-2xl">
                    <AvatarFallback className="bg-white text-blue-600 font-black text-2xl">
                       {getInitials(details.fullName || details.email || '')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-3xl font-black tracking-tight">{details.fullName}</h2>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                       <Badge className="bg-white/20 hover:bg-white/30 border-none text-[10px] font-black uppercase tracking-widest">Patient #{details.id.substring(0, 8)}</Badge>
                       <span className="text-sm font-bold opacity-80">{details.email}</span>
                       <span className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                       <span className="text-sm font-bold opacity-80">{details.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Patient Content */}
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 bg-white">
                {/* Side Stats */}
                <div className="space-y-6">
                   <div className="p-5 rounded-[24px] bg-gray-50 border border-gray-100">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Identification</h4>
                      <div className="space-y-3">
                         <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500 font-bold">Gender</span>
                            <span className="text-xs text-gray-900 font-black">{details.gender}</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500 font-bold">DOB</span>
                            <span className="text-xs text-gray-900 font-black">{details.dateOfBirth ? new Date(details.dateOfBirth).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "N/A"}</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500 font-bold">Joined</span>
                            <span className="text-xs text-gray-900 font-black">{new Date(details.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                         </div>
                      </div>

                   </div>
                   <div className="flex gap-4">
                      <div className="flex-1 p-4 rounded-[24px] bg-teal-50 border border-teal-100 text-center">
                         <p className="text-[10px] font-black text-teal-600 uppercase mb-1">Total Consults</p>
                         <h5 className="text-xl font-black text-teal-800">{details.totalConsultations}</h5>
                      </div>
                      <div className="flex-1 p-4 rounded-[24px] bg-blue-50 border border-blue-100 text-center">
                         <p className="text-[10px] font-black text-blue-600 uppercase mb-1">Prescriptions</p>
                         <h5 className="text-xl font-black text-blue-800">{details.prescriptionCount}</h5>
                      </div>
                   </div>
                </div>

                {/* Main History */}
                <div className="md:col-span-2 space-y-6">
                   <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                         <Calendar size={18} className="text-teal-600" />
                         Recent Consultations
                      </h4>
                   </div>
                   
                   <div className="space-y-4">
                      {details.recentConsultations.length === 0 ? (
                         <div className="text-center py-10 bg-gray-50 rounded-[24px] border border-dashed border-gray-200">
                            <FileText size={32} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">No history recorded</p>
                         </div>
                      ) : details.recentConsultations.map((c) => (
                         <div key={c.id} className="p-4 rounded-[24px] border border-gray-100 hover:border-teal-100 transition-all group flex items-center justify-between bg-white shadow-sm">
                            <div className="flex items-center gap-4">
                               <div className="p-2 rounded-xl bg-gray-50 group-hover:bg-teal-50 text-gray-400 group-hover:text-teal-600 transition-colors">
                                  <Activity size={20} />
                               </div>
                               <div>
                                  <h6 className="text-sm font-bold text-gray-900">{c.doctorName}</h6>
                                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tighter">{c.specialization} • {new Date(c.scheduledAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                               </div>
                            </div>

                            <div className="text-right flex flex-col items-end">
                               <Badge className={cn("text-[9px] font-black uppercase px-2 mb-1", 
                                  c.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700')}>
                                  {c.status}
                               </Badge>
                               <span className="text-xs font-black text-gray-900">₹{c.amount}</span>
                            </div>
                         </div>
                      ))}
                      {details.totalConsultations > 5 && (
                         <div className="text-center pt-2">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Showing last 5 of {details.totalConsultations} sessions</p>
                         </div>
                      )}
                   </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-red-600 p-8 text-white relative">
             <div className="absolute top-0 right-0 p-8 opacity-10"><AlertCircle size={100} /></div>
             <AlertDialogTitle className="text-2xl font-black">Permanently Delete Patient?</AlertDialogTitle>
             <AlertDialogDescription className="text-red-50 font-medium italic mt-1 opacity-90">
                You are about to remove <span className="font-black underline">{patientToDelete?.fullName}</span>. This will erase all history and data associated with this user.
             </AlertDialogDescription>
          </div>
          <AlertDialogFooter className="p-8 bg-white gap-3">
            <AlertDialogCancel className="h-12 px-6 rounded-xl font-bold border-gray-100">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="h-12 px-8 rounded-xl font-bold bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20"
              onClick={() => patientToDelete && deleteMutation.mutate(patientToDelete.id)}
            >
              <Trash2 size={18} className="mr-2" />
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
