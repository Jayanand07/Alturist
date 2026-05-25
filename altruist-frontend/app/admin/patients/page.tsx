"use client";

import React, { useState } from "react";
import { 
  Users, Search, Download, Eye, Trash2, FilterX, Loader2, AlertCircle,
  Calendar, Activity, UserPlus, ArrowRight, FileText, X, Edit2, ShieldAlert
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
  
  // Edit Form State
  const [editForm, setEditForm] = useState<any>({
    fullName: "", phone: "", city: "", bloodGroup: "", allergies: "", chronicConditions: ""
  });

  // Subscription Form State
  const [subForm, setSubForm] = useState<any>({
    planId: "", billingCycle: "MONTHLY"
  });

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

  // --- Handlers ---
  const handleEditClick = (patient: any) => {
    setSelectedPatientId(patient.id);
    setIsEditOpen(true);
    // Ideally we would set form once details are loaded, but we'll do it in a useEffect or directly if data is cached
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
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none rounded-2xl shadow-2xl">
           <div className="bg-amber-500 p-6 text-white relative">
             <DialogTitle className="text-xl font-bold">Manage Subscription</DialogTitle>
           </div>
           <div className="p-6 space-y-6 bg-surface">
             {isLoadingDetails ? <Loader2 className="animate-spin mx-auto text-amber-500" /> : (
                <>
                  <div className="p-4 bg-surface-muted/50 rounded-2xl border border-border/50">
                     <p className="text-[10px] font-black text-muted-foreground/70 uppercase tracking-widest mb-2">Current Status</p>
                     {details?.subscription?.status === 'ACTIVE' ? (
                        <div>
                           <div className="flex justify-between items-center mb-4">
                              <span className="font-bold text-foreground">{details.subscription.planName} ({details.subscription.billingCycle})</span>
                              <Badge className="bg-emerald-100 text-emerald-800 border-none shadow-none">Active</Badge>
                           </div>
                           <Button 
                              variant="destructive" 
                              onClick={() => cancelSubMutation.mutate(details.subscription.id)}
                              disabled={cancelSubMutation.isPending}
                              className="w-full rounded-xl font-bold"
                           >
                              {cancelSubMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "Cancel Subscription"}
                           </Button>
                        </div>
                     ) : (
                        <p className="text-sm font-bold text-muted-foreground">No active subscription found for this user.</p>
                     )}
                  </div>
                  
                  <form onSubmit={handleAssignSub} className="space-y-4 pt-4 border-t border-border/50">
                     <h4 className="text-sm font-black text-foreground uppercase tracking-wider">Assign New Plan</h4>
                     <div className="space-y-2">
                        <Label className="text-xs font-black text-muted-foreground/70 uppercase px-1">Select Plan</Label>
                        <Select value={subForm.planId} onValueChange={v => setSubForm({...subForm, planId: v})}>
                           <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Choose Plan" /></SelectTrigger>
                           <SelectContent>
                              {plans?.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                           </SelectContent>
                        </Select>
                     </div>
                     <div className="space-y-2">
                        <Label className="text-xs font-black text-muted-foreground/70 uppercase px-1">Billing Cycle</Label>
                        <Select value={subForm.billingCycle} onValueChange={v => setSubForm({...subForm, billingCycle: v})}>
                           <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Billing Cycle" /></SelectTrigger>
                           <SelectContent>
                              <SelectItem value="MONTHLY">Monthly</SelectItem>
                              <SelectItem value="YEARLY">Yearly</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                     <Button type="submit" disabled={assignSubMutation.isPending} className="w-full rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-white h-10 shadow-lg shadow-amber-500/20">
                        {assignSubMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "Assign Subscription"}
                     </Button>
                  </form>
                </>
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
    </div>
  );
}
