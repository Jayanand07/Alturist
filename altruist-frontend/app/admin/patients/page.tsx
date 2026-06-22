"use client";

import React, { useState } from "react";
import { 
  Users, Search, Download, Eye, Trash2, FilterX, Loader2, AlertCircle,
  Calendar, Activity, UserPlus, ArrowRight, FileText, X, Edit2, ShieldAlert,
  Stethoscope
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

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

interface PatientDetails extends Patient {
  city: string;
  bloodGroup: string;
  allergies: string;
  chronicConditions: string;
  prescriptionCount: number;
  recentConsultations: any[];
  subscription: any;
}

// --- Helpers ---
const getInitials = (name: any) => {
  const safeName = String(name || '');
  if (!safeName || safeName.trim() === '' || safeName === 'null') return 'U';
  return safeName.trim().split(' ').filter(Boolean).map(n => n?.[0] || '').join('').toUpperCase().slice(0, 2);
};

export default function AdminPatientsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  // Modal States
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubOpen, setIsSubOpen] = useState(false);

  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  // Promote to Doctor States
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false);
  const [patientToPromote, setPatientToPromote] = useState<Patient | null>(null);
  const [promoteForm, setPromoteForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    specialization: "General Physician",
    qualification: "",
    experienceYears: 5,
    consultationFee: 500,
    clinicName: "",
    clinicAddress: "",
    clinicPhone: "",
    city: "Amritsar",
    bio: "",
    languages: "English, Hindi, Punjabi",
    isVerified: true
  });

  React.useEffect(() => {
    if (patientToPromote) {
      setPromoteForm(prev => ({
        ...prev,
        fullName: patientToPromote.fullName || "",
        email: patientToPromote.email || "",
        phone: patientToPromote.phone || "",
      }));
    }
  }, [patientToPromote]);
  
  // Edit Form State
  const [editForm, setEditForm] = useState<any>({
    fullName: "", phone: "", city: "", bloodGroup: "", allergies: "", chronicConditions: ""
  });

  // Subscription Form State
  const [subForm, setSubForm] = useState<any>({
    planId: "", billingCycle: "MONTHLY"
  });

  // Manual Subscription Form State
  const [manualSubForm, setManualSubForm] = useState<any>({
    planName: "Active Plan",
    planType: "Monthly",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    amountPaid: "299",
    paymentMethod: "UPI",
    notes: "",
    status: "ACTIVE"
  });

  React.useEffect(() => {
    if (manualSubForm.planName && manualSubForm.planType && manualSubForm.startDate) {
      let durationDays = 30;
      let cost = 299;
      if (manualSubForm.planType === "Quarterly") {
        durationDays = 90;
      } else if (manualSubForm.planType === "Yearly") {
        durationDays = 365;
      }

      if (manualSubForm.planName === "Student Plan") {
        cost = manualSubForm.planType === "Monthly" ? 199 : (manualSubForm.planType === "Quarterly" ? 499 : 1499);
      } else if (manualSubForm.planName === "Active Plan") {
        cost = manualSubForm.planType === "Monthly" ? 299 : (manualSubForm.planType === "Quarterly" ? 799 : 2499);
      } else if (manualSubForm.planName === "Family Cover") {
        cost = manualSubForm.planType === "Monthly" ? 599 : (manualSubForm.planType === "Quarterly" ? 1599 : 4999);
      } else if (manualSubForm.planName === "Corporate Cover") {
        cost = manualSubForm.planType === "Monthly" ? 999 : (manualSubForm.planType === "Quarterly" ? 2799 : 8999);
      } else if (manualSubForm.planName === "Custom") {
        cost = parseInt(manualSubForm.amountPaid) || 0;
      }

      const start = new Date(manualSubForm.startDate);
      const end = new Date(start.getTime() + durationDays * 24 * 60 * 60 * 1000);
      
      setManualSubForm((prev: any) => {
        const newEndDate = end.toISOString().split("T")[0];
        const newAmount = String(cost);
        if (prev.endDate !== newEndDate || (prev.planName !== "Custom" && prev.amountPaid !== newAmount)) {
          return {
            ...prev,
            endDate: newEndDate,
            amountPaid: prev.planName === "Custom" ? prev.amountPaid : newAmount
          };
        }
        return prev;
      });
    }
  }, [manualSubForm.planName, manualSubForm.planType, manualSubForm.startDate]);

  // Create Patient Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "Male",
    bloodGroup: "A+"
  });

  const resetCreateForm = () => {
    setCreateForm({
      fullName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: "Male",
      bloodGroup: "A+"
    });
  };

  // --- Queries ---
  const { data, isLoading } = useQuery({
    queryKey: ["admin-patients", search, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), size: "10", search: search });
      const response = await api.get(`/admin/patients?${params}`);
      return response.data;
    }
  });

  const { data: details, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["admin-patient-details", selectedPatientId],
    queryFn: async () => (await api.get(`/admin/patients/${selectedPatientId}/details`)).data as PatientDetails,
    enabled: !!selectedPatientId && (isDetailsOpen || isEditOpen || isSubOpen)
  });

  const { data: plans } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => (await api.get("/subscriptions/plans")).data,
    enabled: isSubOpen
  });

  const { data: manualSubs, refetch: refetchManualSubs } = useQuery({
    queryKey: ["admin-patient-manual-subs", selectedPatientId],
    queryFn: async () => (await api.get(`/admin/subscriptions/patient/${selectedPatientId}`)).data,
    enabled: !!selectedPatientId && isSubOpen
  });

  // --- Mutations ---
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/patients/${id}/force`), // Using force if possible, or standard
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

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => api.put(`/admin/patients/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-patients"] });
      queryClient.invalidateQueries({ queryKey: ["admin-patient-details", selectedPatientId] });
      toast.success("Patient profile updated");
      setIsEditOpen(false);
    },
    onError: () => toast.error("Failed to update patient profile")
  });

  const assignSubMutation = useMutation({
    mutationFn: (data: any) => api.post("/admin/subscriptions/assign", { ...data, userId: selectedPatientId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-patient-details", selectedPatientId] });
      toast.success("Subscription assigned successfully");
    },
    onError: () => toast.error("Failed to assign subscription")
  });

  const cancelSubMutation = useMutation({
    mutationFn: (subId: string) => api.delete(`/admin/subscriptions/${subId}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-patient-details", selectedPatientId] });
      toast.success("Subscription cancelled successfully");
    },
    onError: () => toast.error("Failed to cancel subscription")
  });
  const createManualSubMutation = useMutation({
    mutationFn: (data: any) => api.post("/admin/subscriptions", { ...data, patientId: selectedPatientId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-patient-manual-subs", selectedPatientId] });
      queryClient.invalidateQueries({ queryKey: ["admin-patient-details", selectedPatientId] });
      toast.success("Manual subscription activated successfully!");
      setManualSubForm((prev: any) => ({ ...prev, notes: "" }));
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to activate subscription.");
    }
  });

  const promoteMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      api.post(`/admin/patients/${id}/promote-to-doctor`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-patients"] });
      toast.success("Patient successfully promoted to Doctor!");
      setIsPromoteDialogOpen(false);
      setPatientToPromote(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.response?.data?.error || "Failed to promote patient to Doctor");
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/admin/patients", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-patients"] });
      toast.success("Patient created successfully");
      setIsCreateOpen(false);
      resetCreateForm();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create patient");
    }
  });

  const handleEditClick = (patient: any) => {
    setSelectedPatientId(patient.id);
    setIsEditOpen(true);
  };

  React.useEffect(() => {
    if (isEditOpen && details) {
      setEditForm({
        fullName: details.fullName || "",
        phone: details.phone || "",
        city: details.city || "",
        bloodGroup: details.bloodGroup || "",
        allergies: details.allergies || "",
        chronicConditions: details.chronicConditions || ""
      });
    }
  }, [details, isEditOpen]);

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPatientId) {
      updateMutation.mutate({ id: selectedPatientId, data: editForm });
    }
  };

  const handleAssignSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subForm.planId) return toast.error("Select a plan first");
    assignSubMutation.mutate(subForm);
  };

  const patients = data?.content || [];
  const totalCount = data?.totalElements || 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-foreground tracking-tight">Patient Management</h2>
          <p className="text-muted-foreground font-medium">Full CRUD operations and subscription management.</p>
        </div>
        <div>
          <Button 
            onClick={() => {
              resetCreateForm();
              setIsCreateOpen(true);
            }}
            className="bg-[#E8593C] hover:bg-[#d6482e] text-white font-bold h-11 px-6 rounded-xl shadow-md transition-colors flex items-center gap-2"
          >
            <UserPlus size={18} /> Add New Patient
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-surface overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-blue-600"><Users size={60} /></div>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-600"><Users size={20} /></div>
              <div>
                <p className="text-xs font-black text-muted-foreground/70 uppercase tracking-widest">Total Patients</p>
                <h3 className="text-xl font-bold text-foreground">{totalCount}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="border-none shadow-sm bg-surface p-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 w-4 h-4" />
          <Input 
            placeholder="Search patients by name or email..." 
            className="pl-10 h-10 border-border/50 focus:border-primary rounded-xl transition-all shadow-none"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
        </div>
      </Card>

      {/* Main Table */}
      <Card className="border-none shadow-sm bg-surface overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-2xl" />)}</div>
          ) : patients.length === 0 ? (
             <div className="flex flex-col items-center justify-center p-20 text-center space-y-6">
                <div className="bg-surface-muted/50 p-6 rounded-full text-muted-foreground/50"><FilterX size={64} /></div>
                <h3 className="text-xl font-black text-foreground tracking-tight">No patients found</h3>
             </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-surface-muted/50/50 hover:bg-transparent border-border/50">
                    <TableHead className="px-4 py-3 font-black text-[11px] text-muted-foreground/70 uppercase tracking-widest">Patient Details</TableHead>
                    <TableHead className="font-black text-[11px] text-muted-foreground/70 uppercase tracking-widest">Contact Info</TableHead>
                    <TableHead className="font-black text-[11px] text-muted-foreground/70 uppercase tracking-widest">Gender / DOB</TableHead>
                    <TableHead className="text-right pr-8 font-black text-[11px] text-muted-foreground/70 uppercase tracking-widest">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((patient: Patient) => (
                    <TableRow key={patient.id} className="border-border/50 hover:bg-blue-50/20 transition-colors group">
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-gray-100">
                            <AvatarFallback className="bg-blue-50 text-blue-600 font-bold text-xs">{getInitials(patient.fullName || patient.email || '')}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-foreground truncate">{patient.fullName}</span>
                            <span className="text-[11px] text-muted-foreground/70 font-medium truncate">{patient.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-bold text-muted-foreground">{patient.phone || "N/A"}</TableCell>
                      <TableCell>
                         <div className="flex flex-col">
                            <Badge variant="outline" className="text-[10px] w-fit font-black uppercase border-border/50 mb-1">{patient.gender}</Badge>
                            <span className="text-[11px] text-muted-foreground/70 font-bold">{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString('en-IN') : "N/A"}</span>
                         </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold text-muted-foreground hover:text-[#0D9373] hover:bg-emerald-50 rounded-xl" onClick={() => { setPatientToPromote(patient); setIsPromoteDialogOpen(true); }}>Promote to Doctor</Button>
                          <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold text-muted-foreground hover:text-amber-600 hover:bg-amber-50 rounded-xl" onClick={() => { setSelectedPatientId(patient.id); setIsSubOpen(true); }}>Manage Sub</Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/70 hover:text-primary hover:bg-primary/10 rounded-xl" onClick={() => { setSelectedPatientId(patient.id); setIsDetailsOpen(true); }}><Eye size={16} /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/70 hover:text-blue-600 hover:bg-blue-50 rounded-xl" onClick={() => handleEditClick(patient)}><Edit2 size={16} /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/70 hover:text-red-600 hover:bg-red-50 rounded-xl" onClick={() => { setPatientToDelete(patient); setIsDeleteDialogOpen(true); }}><Trash2 size={16} /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Modal (View) */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-y-auto max-h-[90vh] border-none rounded-2xl shadow-2xl">
          {isLoadingDetails ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
          ) : details && (
            <div className="flex flex-col bg-surface">
              <div className="bg-gradient-to-br from-blue-600 to-teal-600 p-6 text-white relative">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20 border-4 border-white/20 shadow-2xl">
                    <AvatarFallback className="bg-surface text-blue-600 font-black text-2xl">{getInitials(details.fullName || details.email || '')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-3xl font-black tracking-tight">{details.fullName}</h2>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                       <span className="text-sm font-bold opacity-80">{details.email}</span>
                       <span className="text-sm font-bold opacity-80">{details.phone}</span>
                       <span className="text-sm font-bold opacity-80">Blood: {details.bloodGroup || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-6">
                 <div>
                    <h4 className="text-sm font-black text-foreground uppercase tracking-wider mb-2">Health Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 bg-surface-muted/50 rounded-2xl">
                          <p className="text-[10px] font-black text-muted-foreground/70 uppercase">Allergies</p>
                          <p className="text-sm font-bold text-foreground mt-1">{details.allergies || "None reported"}</p>
                       </div>
                       <div className="p-4 bg-surface-muted/50 rounded-2xl">
                          <p className="text-[10px] font-black text-muted-foreground/70 uppercase">Chronic Conditions</p>
                          <p className="text-sm font-bold text-foreground mt-1">{details.chronicConditions || "None reported"}</p>
                       </div>
                    </div>
                 </div>
                 
                 <div>
                    <h4 className="text-sm font-black text-foreground uppercase tracking-wider mb-2">Subscription Status</h4>
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                       {details.subscription ? (
                          <div className="flex justify-between items-center">
                             <div>
                                <p className="font-bold text-blue-900">{details.subscription.planName} ({details.subscription.billingCycle})</p>
                                <p className="text-xs font-medium text-blue-700">Status: {details.subscription.status}</p>
                             </div>
                             <Badge className="bg-blue-600 text-white shadow-none">Active</Badge>
                          </div>
                       ) : (
                          <p className="text-sm font-bold text-blue-800">No active subscription</p>
                       )}
                    </div>
                 </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-none rounded-2xl shadow-2xl">
           <div className="bg-blue-600 p-6 text-white relative">
             <DialogTitle className="text-xl font-bold">Edit Patient Profile</DialogTitle>
           </div>
           <form onSubmit={handleEditSubmit} className="p-6 space-y-5 bg-surface">
             {isLoadingDetails ? <Loader2 className="animate-spin mx-auto text-blue-600" /> : (
               <div className="grid grid-cols-2 gap-5">
                 <div className="space-y-2 col-span-2">
                    <Label className="text-xs font-black text-muted-foreground/70 uppercase tracking-widest px-1">Full Name</Label>
                    <Input required placeholder="Patient Name" className="h-10 rounded-xl" value={editForm.fullName} onChange={e => setEditForm({...editForm, fullName: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-xs font-black text-muted-foreground/70 uppercase tracking-widest px-1">Phone</Label>
                    <Input placeholder="+91 9876543210" className="h-10 rounded-xl" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-xs font-black text-muted-foreground/70 uppercase tracking-widest px-1">City</Label>
                    <Input placeholder="Delhi" className="h-10 rounded-xl" value={editForm.city} onChange={e => setEditForm({...editForm, city: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-xs font-black text-muted-foreground/70 uppercase tracking-widest px-1">Blood Group</Label>
                    <Input placeholder="O+" className="h-10 rounded-xl" value={editForm.bloodGroup} onChange={e => setEditForm({...editForm, bloodGroup: e.target.value})} />
                 </div>
                 <div className="space-y-2 col-span-2">
                    <Label className="text-xs font-black text-muted-foreground/70 uppercase tracking-widest px-1">Allergies</Label>
                    <Textarea className="rounded-xl" value={editForm.allergies} onChange={e => setEditForm({...editForm, allergies: e.target.value})} />
                 </div>
                 <div className="space-y-2 col-span-2">
                    <Label className="text-xs font-black text-muted-foreground/70 uppercase tracking-widest px-1">Chronic Conditions</Label>
                    <Textarea className="rounded-xl" value={editForm.chronicConditions} onChange={e => setEditForm({...editForm, chronicConditions: e.target.value})} />
                 </div>
               </div>
             )}
             <DialogFooter className="pt-4 gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)} className="rounded-xl font-bold h-10">Cancel</Button>
                <Button type="submit" disabled={updateMutation.isPending} className="rounded-xl font-bold px-6 h-10 bg-blue-600 hover:bg-blue-700 text-white">
                   {updateMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "Save Changes"}
                </Button>
             </DialogFooter>
           </form>
        </DialogContent>
      </Dialog>

      {/* Subscription Management Modal */}
      <Dialog open={isSubOpen} onOpenChange={setIsSubOpen}>
        <DialogContent className="sm:max-w-4xl p-0 overflow-y-auto max-h-[90vh] border-none rounded-2xl shadow-2xl">
           <div className="bg-gradient-to-r from-teal-600 to-[#0D9373] p-6 text-white relative">
             <DialogTitle className="text-xl font-bold">Manage Subscription</DialogTitle>
             <DialogDescription className="text-emerald-50 mt-1 font-medium">
               Activate offline/cash subscriptions and view historical records for {details?.fullName}.
             </DialogDescription>
           </div>
           
           <div className="p-6 bg-surface">
              {isLoadingDetails ? (
                <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-teal-600" size={32} /></div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  
                  {/* Left Column: History */}
                  <div className="space-y-4">
                    <h3 className="font-heading text-lg font-extrabold text-slate-800 border-b border-slate-200 pb-2">
                      Activation History
                    </h3>
                    
                    <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
                      {!manualSubs || manualSubs.length === 0 ? (
                        <p className="text-sm font-semibold text-slate-400 py-6 text-center">No manual subscriptions registered yet.</p>
                      ) : (
                        manualSubs.map((sub: any) => (
                          <div key={sub.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 relative">
                            <div className="flex justify-between items-center">
                              <span className="font-extrabold text-sm text-slate-800">{sub.planName}</span>
                              <Badge className={cn(
                                "border-none shadow-none text-[10px] font-black uppercase rounded-lg px-2",
                                sub.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                              )}>
                                {sub.status}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 font-bold">
                              <div>
                                <span className="text-slate-400">Term:</span> {sub.planType}
                              </div>
                              <div>
                                <span className="text-slate-400">Paid:</span> ₹{sub.amountPaid} ({sub.paymentMethod})
                              </div>
                              <div className="col-span-2">
                                <span className="text-slate-400">Validity:</span> {new Date(sub.startDate).toLocaleDateString("en-IN")} to {new Date(sub.endDate).toLocaleDateString("en-IN")}
                              </div>
                            </div>
                            
                            {sub.notes && (
                              <p className="text-[10px] text-slate-400 italic bg-white p-2 rounded-lg border border-slate-100 mt-1">
                                Note: {sub.notes}
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right Column: Activation Form */}
                  <div className="space-y-4">
                    <h3 className="font-heading text-lg font-extrabold text-slate-800 border-b border-slate-200 pb-2">
                      Activate Offline Plan
                    </h3>
                    
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      createManualSubMutation.mutate(manualSubForm);
                    }} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Plan Name</Label>
                          <Select 
                            value={manualSubForm.planName} 
                            onValueChange={v => setManualSubForm({...manualSubForm, planName: v})}
                          >
                            <SelectTrigger className="h-10 rounded-xl">
                              <SelectValue placeholder="Select Plan" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              <SelectItem value="Student Plan">Student Plan</SelectItem>
                              <SelectItem value="Active Plan">Active Plan</SelectItem>
                              <SelectItem value="Family Cover">Family Cover</SelectItem>
                              <SelectItem value="Corporate Cover">Corporate Cover</SelectItem>
                              <SelectItem value="Custom">Custom / Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Billing Term</Label>
                          <Select 
                            value={manualSubForm.planType} 
                            onValueChange={v => setManualSubForm({...manualSubForm, planType: v})}
                          >
                            <SelectTrigger className="h-10 rounded-xl">
                              <SelectValue placeholder="Select Term" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              <SelectItem value="Monthly">Monthly</SelectItem>
                              <SelectItem value="Quarterly">Quarterly</SelectItem>
                              <SelectItem value="Yearly">Yearly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {manualSubForm.planName === "Custom" && (
                        <div className="space-y-1">
                          <Label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Custom Plan Name *</Label>
                          <Input 
                            required
                            placeholder="e.g. Enterprise Special" 
                            className="h-10 rounded-xl"
                            onChange={e => setManualSubForm({...manualSubForm, planName: e.target.value})}
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Start Date</Label>
                          <Input 
                            type="date"
                            required
                            className="h-10 rounded-xl"
                            value={manualSubForm.startDate}
                            onChange={e => setManualSubForm({...manualSubForm, startDate: e.target.value})}
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">End Date</Label>
                          <Input 
                            type="date"
                            required
                            className="h-10 rounded-xl"
                            value={manualSubForm.endDate}
                            onChange={e => setManualSubForm({...manualSubForm, endDate: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Amount Paid (₹)</Label>
                          <Input 
                            type="number"
                            required
                            className="h-10 rounded-xl"
                            value={manualSubForm.amountPaid}
                            onChange={e => setManualSubForm({...manualSubForm, amountPaid: e.target.value})}
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Payment Method</Label>
                          <Select 
                            value={manualSubForm.paymentMethod} 
                            onValueChange={v => setManualSubForm({...manualSubForm, paymentMethod: v})}
                          >
                            <SelectTrigger className="h-10 rounded-xl">
                              <SelectValue placeholder="Select Method" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              <SelectItem value="UPI">UPI / GPay / PhonePe</SelectItem>
                              <SelectItem value="Cash">Cash payment</SelectItem>
                              <SelectItem value="Bank Transfer">Bank Transfer / IMPS</SelectItem>
                              <SelectItem value="Card">Credit/Debit Card</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Admin Notes</Label>
                        <Textarea 
                          placeholder="e.g. Received cash at clinic reception, approved by manager."
                          className="rounded-xl min-h-[60px]"
                          value={manualSubForm.notes}
                          onChange={e => setManualSubForm({...manualSubForm, notes: e.target.value})}
                        />
                      </div>

                      <Button 
                        type="submit" 
                        disabled={createManualSubMutation.isPending} 
                        className="w-full h-11 rounded-xl font-extrabold bg-[#0D9373] hover:bg-[#0A7A5F] text-white shadow-lg shadow-emerald-500/20 active:scale-95 transition-all border-none"
                      >
                        {createManualSubMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "Activate Subscription"}
                      </Button>
                    </form>
                  </div>

                </div>
              )}
           </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-red-600 p-6 text-white relative">
             <div className="absolute top-0 right-0 p-6 opacity-10"><AlertCircle size={100} /></div>
             <AlertDialogTitle className="text-xl font-bold">Permanently Delete Patient?</AlertDialogTitle>
             <AlertDialogDescription className="text-red-50 font-medium italic mt-1 opacity-90">
                You are about to remove <span className="font-black underline">{patientToDelete?.fullName}</span>. This will erase all history and data associated with this user.
             </AlertDialogDescription>
          </div>
          <AlertDialogFooter className="p-6 bg-surface gap-3">
            <AlertDialogCancel className="h-10 px-6 rounded-xl font-bold border-border/50">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="h-10 px-6 rounded-xl font-bold bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20"
              onClick={() => patientToDelete && deleteMutation.mutate(patientToDelete.id)}
            >
              <Trash2 size={18} className="mr-2" /> Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Promote to Doctor Form Modal */}
      <Dialog open={isPromoteDialogOpen} onOpenChange={setIsPromoteDialogOpen}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-y-auto max-h-[90vh] border-none rounded-2xl shadow-2xl">
          <div className="bg-[#0D9373] p-6 text-white relative">
            <DialogTitle className="text-xl font-bold">Promote to Doctor Profile</DialogTitle>
            <DialogDescription className="text-emerald-50 mt-1 font-medium">
              Convert {patientToPromote?.fullName} into a Doctor account and create their professional profile.
            </DialogDescription>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!promoteForm.specialization) return toast.error("Specialization is required");
            if (!promoteForm.qualification.trim()) return toast.error("Qualification is required");
            if (!promoteForm.city.trim()) return toast.error("City is required");
            
            const proceed = window.confirm(`This will convert ${patientToPromote?.fullName} into a Doctor account. Continue?`);
            if (!proceed) return;
            
            if (patientToPromote) {
              promoteMutation.mutate({ id: patientToPromote.id, data: promoteForm });
            }
          }} className="p-6 space-y-5 bg-surface">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Prefilled / Editable Patient fields */}
              <div className="space-y-1 md:col-span-2 border-b border-border/50 pb-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-700">Full Name</Label>
                    <Input required className="h-10 rounded-xl" value={promoteForm.fullName} onChange={e => setPromoteForm({...promoteForm, fullName: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-700">Email Address</Label>
                    <Input required type="email" className="h-10 rounded-xl" value={promoteForm.email} onChange={e => setPromoteForm({...promoteForm, email: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-700">Phone</Label>
                    <Input className="h-10 rounded-xl" value={promoteForm.phone} onChange={e => setPromoteForm({...promoteForm, phone: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Doctor specific fields */}
              <div className="space-y-1 md:col-span-2">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Professional Profile</h4>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Specialization *</Label>
                <Select 
                  value={promoteForm.specialization} 
                  onValueChange={v => setPromoteForm({...promoteForm, specialization: v || ""})}
                >
                  <SelectTrigger className="h-10 rounded-xl">
                    <SelectValue placeholder="Select Specialization" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="General Physician">General Physician</SelectItem>
                    <SelectItem value="Pediatrician">Pediatrician</SelectItem>
                    <SelectItem value="Cardiologist">Cardiologist</SelectItem>
                    <SelectItem value="Dermatologist">Dermatologist</SelectItem>
                    <SelectItem value="Neurologist">Neurologist</SelectItem>
                    <SelectItem value="Gynaecologist">Gynaecologist</SelectItem>
                    <SelectItem value="Psychiatrist">Psychiatrist</SelectItem>
                    <SelectItem value="Orthopedic">Orthopedic</SelectItem>
                    <SelectItem value="ENT Specialist">ENT Specialist</SelectItem>
                    <SelectItem value="Ophthalmologist">Ophthalmologist</SelectItem>
                    <SelectItem value="Diabetologist">Diabetologist</SelectItem>
                    <SelectItem value="Oncologist">Oncologist</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Qualification *</Label>
                <Input required placeholder="e.g. MBBS, MD - General Medicine" className="h-10 rounded-xl" value={promoteForm.qualification} onChange={e => setPromoteForm({...promoteForm, qualification: e.target.value})} />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Experience Years *</Label>
                <Input required type="number" min={0} className="h-10 rounded-xl" value={promoteForm.experienceYears} onChange={e => setPromoteForm({...promoteForm, experienceYears: parseInt(e.target.value) || 0})} />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Consultation Fee (₹) *</Label>
                <Input required type="number" min={0} className="h-10 rounded-xl" value={promoteForm.consultationFee} onChange={e => setPromoteForm({...promoteForm, consultationFee: parseFloat(e.target.value) || 0})} />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Clinic Name</Label>
                <Input placeholder="e.g. Care Clinic" className="h-10 rounded-xl" value={promoteForm.clinicName} onChange={e => setPromoteForm({...promoteForm, clinicName: e.target.value})} />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Clinic Phone</Label>
                <Input placeholder="Clinic contact number" className="h-10 rounded-xl" value={promoteForm.clinicPhone} onChange={e => setPromoteForm({...promoteForm, clinicPhone: e.target.value})} />
              </div>

              <div className="space-y-1 md:col-span-2">
                <Label className="text-xs font-bold text-slate-700">Clinic Address</Label>
                <Input placeholder="Clinic physical address" className="h-10 rounded-xl" value={promoteForm.clinicAddress} onChange={e => setPromoteForm({...promoteForm, clinicAddress: e.target.value})} />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">City *</Label>
                <Input required placeholder="e.g. Amritsar" className="h-10 rounded-xl" value={promoteForm.city} onChange={e => setPromoteForm({...promoteForm, city: e.target.value})} />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Languages Spoken</Label>
                <Input placeholder="e.g. English, Hindi, Punjabi" className="h-10 rounded-xl" value={promoteForm.languages} onChange={e => setPromoteForm({...promoteForm, languages: e.target.value})} />
              </div>

              <div className="space-y-1 md:col-span-2">
                <Label className="text-xs font-bold text-slate-700">Professional Bio</Label>
                <Textarea placeholder="Brief bio about the doctor's practice and expertise..." className="rounded-xl min-h-[70px]" value={promoteForm.bio} onChange={e => setPromoteForm({...promoteForm, bio: e.target.value})} />
              </div>

              <div className="flex items-center gap-3 pt-2 md:col-span-2">
                <input 
                  type="checkbox" 
                  id="promoteIsVerified"
                  checked={promoteForm.isVerified}
                  onChange={e => setPromoteForm({...promoteForm, isVerified: e.target.checked})}
                  className="h-4.5 w-4.5 rounded border-slate-300 text-[#0D9373] focus:ring-[#0D9373]"
                />
                <Label htmlFor="promoteIsVerified" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Mark Doctor profile as verified immediately
                </Label>
              </div>

            </div>
            
            <DialogFooter className="pt-4 gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsPromoteDialogOpen(false)} className="rounded-xl font-bold h-10">Cancel</Button>
              <Button type="submit" disabled={promoteMutation.isPending} className="rounded-xl font-bold px-6 h-10 bg-[#0D9373] hover:bg-[#0A7A5F] text-white">
                {promoteMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "Promote to Doctor"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add New Patient Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900">
              Add New Patient
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Create a new patient account manually. A temporary password will be generated automatically.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => {
            e.preventDefault();
            if (!createForm.fullName.trim()) return toast.error("Full name is required");
            if (!createForm.email.trim()) return toast.error("Email is required");
            if (!createForm.phone.trim() || createForm.phone.length !== 10) return toast.error("Phone number must be exactly 10 digits");
            if (!createForm.dateOfBirth) return toast.error("Date of birth is required");
            createMutation.mutate(createForm);
          }} className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="createFullName" className="text-xs font-bold text-slate-700">Full Name *</Label>
              <Input
                id="createFullName"
                required
                value={createForm.fullName}
                onChange={(e) => setCreateForm(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="e.g. Rahul Sharma"
                className="rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="createEmail" className="text-xs font-bold text-slate-700">Email Address *</Label>
              <Input
                id="createEmail"
                type="email"
                required
                value={createForm.email}
                onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="e.g. rahul.sharma@example.com"
                className="rounded-xl border-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="createPhone" className="text-xs font-bold text-slate-700">Phone Number *</Label>
                <Input
                  id="createPhone"
                  type="tel"
                  required
                  maxLength={10}
                  value={createForm.phone}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, "") }))}
                  placeholder="10-digit mobile"
                  className="rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="createDob" className="text-xs font-bold text-slate-700">Date of Birth *</Label>
                <Input
                  id="createDob"
                  type="date"
                  required
                  value={createForm.dateOfBirth}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  className="rounded-xl border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="createGender" className="text-xs font-bold text-slate-700">Gender *</Label>
                <Select
                  value={createForm.gender}
                  onValueChange={(val) => setCreateForm(prev => ({ ...prev, gender: val || "Male" }))}
                >
                  <SelectTrigger className="rounded-xl border-slate-200">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-xl border-slate-200">
                    <SelectItem value="Male" className="rounded-lg">Male</SelectItem>
                    <SelectItem value="Female" className="rounded-lg">Female</SelectItem>
                    <SelectItem value="Other" className="rounded-lg">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="createBlood" className="text-xs font-bold text-slate-700">Blood Group *</Label>
                <Select
                  value={createForm.bloodGroup}
                  onValueChange={(val) => setCreateForm(prev => ({ ...prev, bloodGroup: val || "A+" }))}
                >
                  <SelectTrigger className="rounded-xl border-slate-200">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-xl border-slate-200">
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                      <SelectItem key={bg} value={bg} className="rounded-lg">{bg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-4 flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCreateOpen(false)}
                className="rounded-xl border-slate-200 font-bold"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending}
                className="bg-[#E8593C] hover:bg-[#d6482e] text-white font-bold rounded-xl"
              >
                {createMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : "Create Patient"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
