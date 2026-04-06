"use client";

import React, { useState } from "react";
import { 
  UserRound, 
  Search, 
  Plus, 
  Star, 
  StarHalf, 
  MoreVertical,
  Edit2,
  Trash2,
  Power,
  Users,
  CheckCircle2,
  XCircle,
  FilterX,
  Loader2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
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
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

// --- Types ---
interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  experienceYears: number;
  consultationFee: number;
  rating: number;
  profilePictureUrl: string | null;
  totalConsultations: number;
  isAvailable: boolean;
}

interface DoctorRequest {
  fullName: string;
  email: string;
  specialization: string;
  medicalLicense: string;
  experienceYears: number;
  consultationFee: number;
  qualification: string;
}

// --- Constants ---
const SPECIALIZATIONS = [
  "Cardiology", "Dermatology", "Pediatrics", "Orthopedics", "Neurology",
  "General Medicine", "Gynecology", "Psychiatry", "ENT", "Ophthalmology"
];

const STAR_TOTAL = 5;

// --- Components ---

const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = STAR_TOTAL - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5 text-amber-400">
      {[...Array(fullStars)].map((_, i) => <Star key={`full-${i}`} size={14} fill="currentColor" />)}
      {hasHalfStar && <StarHalf size={14} fill="currentColor" />}
      {[...Array(emptyStars)].map((_, i) => <Star key={`empty-${i}`} size={14} />)}
      <span className="ml-1.5 text-xs font-bold text-gray-400">{rating.toFixed(1)}</span>
    </div>
  );
};

export default function AdminDoctorsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(0);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);

  // Form State
  const [formData, setFormData] = useState<DoctorRequest>({
    fullName: "",
    email: "",
    specialization: "",
    medicalLicense: "",
    experienceYears: 0,
    consultationFee: 0,
    qualification: ""
  });

  const { userType } = useAuth();
  const canEditOrDelete = userType === "ADMIN" || userType === "DOCTOR";

  // --- Queries ---
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["doctors", search, specialization, status, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        size: "10",
        search: search,
        specialization: specialization === "all" ? "" : specialization,
        available: status === "all" ? "" : (status === "available").toString()
      });
      const response = await api.get(`/doctors?${params}`);
      return response.data;
    }
  });

  // --- Mutations ---
  const createMutation = useMutation({
    mutationFn: (newDoctor: DoctorRequest) => api.post("/admin/doctors", newDoctor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      toast.success("Doctor added successfully");
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to add doctor")
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: DoctorRequest }) => api.put(`/doctors/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      toast.success("Doctor updated successfully");
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to update doctor")
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => api.put(`/admin/doctors/${id}/availability`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      toast.success("Availability toggled");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/doctors/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      toast.success("Doctor deleted successfully");
      setIsDeleteDialogOpen(false);
    },
    onError: (err: any) => {
      if (err.response?.status === 409) {
        toast.error("Cannot delete doctor with active history");
      } else {
        toast.error("Failed to delete doctor");
      }
    }
  });

  // --- Handlers ---
  const resetForm = () => {
    setFormData({
      fullName: "", email: "", specialization: "", medicalLicense: "",
      experienceYears: 0, consultationFee: 0, qualification: ""
    });
    setEditingDoctor(null);
  };

  const handleEdit = (doctor: Doctor) => {
    // Note: We need full details for editing (license, qualification) which might not be in ListDTO
    // For now, we'll try to fetch or assume base info if mapped
    setEditingDoctor(doctor);
    setFormData({
      fullName: doctor.name,
      email: doctor.email,
      specialization: doctor.specialization,
      medicalLicense: "", // Fetching detail would be better
      experienceYears: doctor.experienceYears,
      consultationFee: doctor.consultationFee,
      qualification: ""
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDoctor) {
      updateMutation.mutate({ id: editingDoctor.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // --- Stats Calculation ---
  const doctors = data?.content || [];
  const totalCount = data?.totalElements || 0;
  const availableCount = doctors.filter((d: Doctor) => d.isAvailable).length; // This is approximate for the current page
  const busyCount = doctors.filter((d: Doctor) => !d.isAvailable).length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-teal-600"><Users size={60} /></div>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-teal-50 text-teal-600"><Users size={20} /></div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Doctors</p>
                <h3 className="text-2xl font-black text-gray-900">{totalCount}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-green-600"><CheckCircle2 size={60} /></div>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-green-50 text-green-600"><CheckCircle2 size={20} /></div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Available Now</p>
                <h3 className="text-2xl font-black text-gray-900">{availableCount}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-orange-600"><XCircle size={60} /></div>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-orange-50 text-orange-600"><XCircle size={20} /></div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">On Duty / Busy</p>
                <h3 className="text-2xl font-black text-gray-900">{busyCount}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="border-none shadow-sm bg-white p-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Search by name or specialization..." 
              className="pl-10 h-11 border-gray-100 focus:border-teal-500 rounded-xl transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Select value={specialization} onValueChange={(val) => setSpecialization(val ?? "all")}>
              <SelectTrigger className="w-[180px] h-11 border-gray-100 rounded-xl focus:ring-teal-500">
                <SelectValue placeholder="Specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialities</SelectItem>
                {SPECIALIZATIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={(val) => setStatus(val ?? "all")}>
              <SelectTrigger className="w-[150px] h-11 border-gray-100 rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if(!open) resetForm(); }}>
              <DialogTrigger 
                render={
                  <Button className="bg-[#0D9488] hover:bg-[#0b7a6e] h-11 px-6 rounded-xl font-bold flex gap-2 shadow-lg shadow-teal-500/20 active:scale-95 transition-all">
                    <Plus size={18} />
                    Add Doctor
                  </Button>
                }
              />
              <DialogContent className="max-w-xl p-0 overflow-hidden border-none rounded-[32px] shadow-2xl">
                <div className="bg-[#0D9488] p-8 text-white relative">
                   <div className="absolute top-0 right-0 p-8 opacity-10"><UserRound size={120} /></div>
                   <DialogTitle className="text-2xl font-black">{editingDoctor ? "Edit Doctor Profile" : "Onboard New Doctor"}</DialogTitle>
                   <DialogDescription className="text-teal-50 mt-1 font-medium italic opacity-90">Please ensure all medical credentials are valid.</DialogDescription>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-5 bg-white">
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                       <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                       <Input required placeholder="Dr. John Doe" className="h-11 border-gray-100 rounded-xl focus:border-teal-500 transition-all font-semibold" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Email Address</label>
                       <Input required type="email" placeholder="john.doe@altruist.com" className="h-11 border-gray-100 rounded-xl focus:border-teal-500 transition-all font-semibold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Specialization</label>
                       <Select required value={formData.specialization} onValueChange={val => setFormData({...formData, specialization: val ?? ""})}>
                          <SelectTrigger className="h-11 border-gray-100 rounded-xl font-semibold">
                             <SelectValue placeholder="Select Specialty" />
                          </SelectTrigger>
                          <SelectContent>
                             {SPECIALIZATIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Medical License</label>
                       <Input required placeholder="LIC-12345678" className="h-11 border-gray-100 rounded-xl focus:border-teal-500 transition-all font-semibold" value={formData.medicalLicense} onChange={e => setFormData({...formData, medicalLicense: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Exp (Years)</label>
                       <Input required type="number" className="h-11 border-gray-100 rounded-xl font-semibold" value={formData.experienceYears} onChange={e => setFormData({...formData, experienceYears: parseInt(e.target.value) || 0})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Fee (₹)</label>
                       <Input required type="number" className="h-11 border-gray-100 rounded-xl font-semibold" value={formData.consultationFee} onChange={e => setFormData({...formData, consultationFee: parseInt(e.target.value) || 0})} />
                    </div>
                    <div className="space-y-2 col-span-2">
                       <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Qualification</label>
                       <Input required placeholder="MBBS, MD - Cardiology" className="h-11 border-gray-100 rounded-xl focus:border-teal-500 transition-all font-semibold" value={formData.qualification} onChange={e => setFormData({...formData, qualification: e.target.value})} />
                    </div>
                  </div>
                  <DialogFooter className="pt-4 gap-3">
                     <Button type="button" variant="ghost" className="rounded-xl font-bold px-6 h-12" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                     <Button type="submit" className="bg-[#0D9488] hover:bg-[#0b7a6e] rounded-xl font-bold px-8 h-12 shadow-lg shadow-teal-500/20" disabled={createMutation.isPending || updateMutation.isPending}>
                        {createMutation.isPending || updateMutation.isPending ? <Loader2 className="animate-spin w-5 h-5" /> : (editingDoctor ? "Save Changes" : "Register Doctor")}
                     </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </Card>

      {/* Main Table */}
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <TableSkeleton />
          ) : doctors.length === 0 ? (
            <EmptyState onAdd={() => setIsModalOpen(true)} />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 hover:bg-transparent border-gray-100">
                    <TableHead className="px-6 py-5 font-black text-[11px] text-gray-400 uppercase tracking-widest">Doctor Information</TableHead>
                    <TableHead className="font-black text-[11px] text-gray-400 uppercase tracking-widest">Specialization</TableHead>
                    <TableHead className="font-black text-[11px] text-gray-400 uppercase tracking-widest">Exp / Fee</TableHead>
                    <TableHead className="font-black text-[11px] text-gray-400 uppercase tracking-widest">Rating</TableHead>
                    <TableHead className="font-black text-[11px] text-gray-400 uppercase tracking-widest">Status</TableHead>
                    <TableHead className="text-right pr-8 font-black text-[11px] text-gray-400 uppercase tracking-widest">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctors.map((doctor: Doctor) => (
                    <TableRow key={doctor.id} className="border-gray-50 hover:bg-teal-50/10 transition-colors group">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10 border-2 border-white shadow-sm overflow-hidden bg-teal-50">
                            <AvatarImage src={doctor.profilePictureUrl || ""} className="object-cover" />
                            <AvatarFallback className="bg-teal-100 text-teal-600 font-bold">{(doctor?.name || "Dr.").charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-gray-900 truncate group-hover:text-teal-600 transition-colors">{doctor.name}</span>
                            <span className="text-[11px] text-gray-400 font-medium truncate">{doctor.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                         <Badge variant="outline" className="text-[10px] font-black uppercase tracking-tight py-0.5 px-2 border-teal-100 text-teal-700 bg-teal-50/30">
                           {doctor.specialization}
                         </Badge>
                      </TableCell>
                      <TableCell>
                         <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-700">{doctor.experienceYears} Years Exp.</span>
                            <span className="text-[11px] text-gray-400 font-bold">₹{doctor.consultationFee} / session</span>
                         </div>
                      </TableCell>
                      <TableCell>
                         <StarRating rating={doctor.rating} />
                         <span className="text-[10px] text-gray-400 font-medium">{doctor.totalConsultations} consultations</span>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", doctor.isAvailable ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-orange-500")} />
                            <span className={cn("text-[11px] font-black uppercase tracking-widest", doctor.isAvailable ? "text-green-600" : "text-orange-600")}>
                               {doctor.isAvailable ? "Available" : "On Duty / Busy"}
                            </span>
                         </div>
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        <div className="flex items-center justify-end gap-1">
                          {canEditOrDelete && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg" onClick={() => handleEdit(doctor)}>
                               <Edit2 size={14} />
                            </Button>
                          )}
                          <Button 
                             variant="ghost" 
                             size="icon" 
                             className={cn("h-8 w-8 rounded-lg outline-none", doctor.isAvailable ? "text-orange-400 hover:text-orange-600 hover:bg-orange-50" : "text-green-400 hover:text-green-600 hover:bg-green-50")}
                             onClick={() => toggleMutation.mutate(doctor.id)}
                          >
                             <Power size={14} />
                          </Button>
                          {canEditOrDelete && (
                            <Button 
                               variant="ghost" 
                               size="icon" 
                               className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                               onClick={() => { setDoctorToDelete(doctor); setIsDeleteDialogOpen(true); }}
                            >
                               <Trash2 size={14} />
                            </Button>
                          )}
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

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-red-600 p-8 text-white relative">
             <div className="absolute top-0 right-0 p-8 opacity-10"><AlertCircle size={100} /></div>
             <AlertDialogTitle className="text-2xl font-black">Delete Doctor Profile?</AlertDialogTitle>
             <AlertDialogDescription className="text-red-50 font-medium italic mt-1 opacity-90">
                This will permanently delete <span className="font-black underline">Dr. {doctorToDelete?.name}</span>. This action cannot be undone.
             </AlertDialogDescription>
          </div>
          <AlertDialogFooter className="p-8 bg-white gap-3">
            <AlertDialogCancel className="h-12 px-6 rounded-xl font-bold border-gray-100">Keep Profile</AlertDialogCancel>
            <AlertDialogAction 
              className="h-12 px-8 rounded-xl font-bold bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20"
              onClick={() => doctorToDelete && deleteMutation.mutate(doctorToDelete.id)}
            >
              Confirm Deletion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-20 text-center space-y-6">
      <div className="bg-gray-50 p-8 rounded-full text-gray-300">
        <FilterX size={64} strokeWidth={1.5} />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-black text-gray-900 tracking-tight">No doctors found</h3>
        <p className="text-gray-500 font-medium max-w-xs">Relax your filters or onboard a new doctor to the platform.</p>
      </div>
      <Button 
        onClick={onAdd}
        className="bg-[#0D9488] hover:bg-[#0b7a6e] h-11 px-8 rounded-xl font-bold shadow-lg shadow-teal-500/10"
      >
        <Plus size={18} className="mr-2" />
        Add New Doctor
      </Button>
    </div>
  );
}
