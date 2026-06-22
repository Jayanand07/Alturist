"use client";

import React, { useState } from "react";
import { 
  Search, Calendar, Clock, MapPin, Phone, 
  Loader2, ClipboardList, CheckCircle2, ChevronLeft, 
  ChevronRight, Info, Eye, Edit
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

interface LabBooking {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  labTestId: string | null;
  labTestName: string | null;
  labPackageId: string | null;
  labPackageName: string | null;
  bookingType: "TEST" | "PACKAGE";
  preferredDate: string;
  preferredTimeSlot: string;
  address: string;
  phone: string;
  status: "PENDING" | "CONFIRMED" | "SAMPLE_COLLECTED" | "REPORT_READY" | "CANCELLED";
  amount: number;
  paymentStatus: "UNPAID" | "PAID";
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUSES = ["PENDING", "CONFIRMED", "SAMPLE_COLLECTED", "REPORT_READY", "CANCELLED"];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-100",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-100",
  SAMPLE_COLLECTED: "bg-indigo-50 text-indigo-700 border-indigo-100",
  REPORT_READY: "bg-emerald-50 text-emerald-700 border-emerald-100",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-100"
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  SAMPLE_COLLECTED: "Sample Collected",
  REPORT_READY: "Report Ready",
  CANCELLED: "Cancelled"
};

export default function AdminLabBookingsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(0);
  const size = 10;

  // Modal / Detail state
  const [selectedBooking, setSelectedBooking] = useState<LabBooking | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string>("PENDING");
  const [adminNotes, setAdminNotes] = useState("");

  // Fetch Bookings
  const { data, isLoading } = useQuery<{ content: LabBooking[]; totalPages: number; totalElements: number }>({
    queryKey: ["admin-lab-bookings", statusFilter, search, page],
    queryFn: async () => {
      const params: Record<string, any> = {
        page,
        size,
        sort: "createdAt,desc"
      };
      if (statusFilter !== "ALL") {
        params.status = statusFilter;
      }
      if (search.trim()) {
        params.search = search.trim();
      }
      const res = await api.get("/admin/lab-bookings", { params });
      return res.data;
    }
  });

  // Update Status Mutation
  const updateMutation = useMutation({
    mutationFn: async (payload: { id: string; status: string; notes: string }) => {
      const res = await api.put(`/admin/lab-bookings/${payload.id}`, {
        status: payload.status,
        notes: payload.notes
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Booking updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-lab-bookings"] });
      setIsDetailOpen(false);
      setSelectedBooking(null);
    },
    onError: (err: any) => {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update booking");
    }
  });

  const handleRowClick = (booking: LabBooking) => {
    setSelectedBooking(booking);
    setUpdateStatus(booking.status);
    setAdminNotes(booking.notes || "");
    setIsDetailOpen(true);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    updateMutation.mutate({
      id: selectedBooking.id,
      status: updateStatus,
      notes: adminNotes
    });
  };

  const bookings = data?.content || [];
  const totalPages = data?.totalPages || 0;

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <ClipboardList className="text-[#E8593C]" size={28} /> Lab Bookings Support
        </h1>
        <p className="text-slate-500 font-medium mt-1">Manage and update home collection requests and reports.</p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        {/* Status filter tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200/60 overflow-x-auto scrollbar-none max-w-full">
          <button
            onClick={() => { setStatusFilter("ALL"); setPage(0); }}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
              statusFilter === "ALL"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            All Bookings
          </button>
          {STATUSES.map(st => (
            <button
              key={st}
              onClick={() => { setStatusFilter(st); setPage(0); }}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                statusFilter === st
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              {STATUS_LABELS[st]}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search patient name or phone..."
            className="pl-10 h-10 w-full bg-white rounded-xl border-slate-200 focus:ring-2 focus:ring-[#E8593C]/20 outline-none font-medium text-slate-700"
          />
        </div>
      </div>

      {/* Table Display */}
      <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white rounded-2xl">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <ClipboardList className="mx-auto text-slate-300" size={48} />
              <h3 className="text-lg font-bold text-slate-700">No Bookings Found</h3>
              <p className="text-slate-400 max-w-sm mx-auto text-xs">
                There are no lab collection booking requests matching your filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-bold text-slate-800">Patient Details</TableHead>
                    <TableHead className="font-bold text-slate-800">Booked Item</TableHead>
                    <TableHead className="font-bold text-slate-800">Preferred Slot</TableHead>
                    <TableHead className="font-bold text-slate-800">Amount</TableHead>
                    <TableHead className="font-bold text-slate-800">Status</TableHead>
                    <TableHead className="font-bold text-slate-800">Booked On</TableHead>
                    <TableHead className="font-bold text-slate-800 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => {
                    const itemName = booking.bookingType === "TEST" 
                      ? booking.labTestName 
                      : booking.labPackageName;
                    
                    return (
                      <TableRow 
                        key={booking.id} 
                        onClick={() => handleRowClick(booking)}
                        className="hover:bg-slate-50/50 cursor-pointer transition-colors"
                      >
                        <TableCell>
                          <p className="font-bold text-slate-900 leading-tight">{booking.patientName}</p>
                          <p className="text-[11px] text-slate-400 font-bold mt-0.5">{booking.phone}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800 text-sm">{itemName}</span>
                            <Badge className="w-max mt-1 text-[9px] font-black tracking-wider uppercase border border-slate-200 bg-slate-50 text-slate-500">
                              {booking.bookingType}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-semibold text-slate-800 text-sm">{booking.preferredDate}</p>
                          <p className="text-[11px] text-slate-400 font-bold mt-0.5">{booking.preferredTimeSlot}</p>
                        </TableCell>
                        <TableCell className="font-bold text-slate-900 text-sm">₹{booking.amount}</TableCell>
                        <TableCell>
                          <Badge className={cn("font-bold text-xs border uppercase", STATUS_COLORS[booking.status])}>
                            {STATUS_LABELS[booking.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-500 text-xs font-semibold">
                          {new Date(booking.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-slate-400 hover:text-slate-800"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(booking);
                            }}
                          >
                            <Eye size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-slate-400 font-semibold">
            Showing Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage(prev => Math.max(0, prev - 1))}
              className="rounded-xl h-9 border-slate-200"
            >
              <ChevronLeft size={16} className="mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages - 1}
              onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
              className="rounded-xl h-9 border-slate-200"
            >
              Next <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* --- BOOKING DETAIL & UPDATE STATUS MODAL --- */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl border border-slate-100 p-6 bg-white gap-6">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
                <Info size={20} />
              </div>
              <div>
                <DialogTitle className="font-heading text-lg font-black text-slate-900 leading-tight">
                  Booking Specifications
                </DialogTitle>
                <DialogDescription className="text-slate-400 text-xs font-bold">
                  View patient history and manage collection status.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedBooking && (
            <form onSubmit={handleUpdateSubmit} className="space-y-5">
              {/* Detailed specification table */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block">Patient Name</span>
                    <span className="text-slate-800 font-extrabold">{selectedBooking.patientName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Patient Phone</span>
                    <span className="text-slate-800 font-extrabold flex items-center gap-1">
                      <Phone size={12} className="text-slate-400" /> {selectedBooking.phone}
                    </span>
                  </div>
                  <div className="col-span-2 border-t border-slate-200/60 my-1 pt-1">
                    <span className="text-slate-400 font-bold block">Booked Diagnostic Item</span>
                    <span className="text-slate-800 font-black text-sm block mt-0.5">
                      {selectedBooking.bookingType === "TEST" ? selectedBooking.labTestName : selectedBooking.labPackageName}
                    </span>
                    <Badge className="mt-1 text-[9px] font-black tracking-wider uppercase border border-slate-200 bg-white text-slate-500">
                      {selectedBooking.bookingType}
                    </Badge>
                  </div>
                  <div className="col-span-2 border-t border-slate-200/60 my-1 pt-1">
                    <span className="text-slate-400 font-bold block">Preferred Date & Slot</span>
                    <span className="text-slate-800 font-extrabold flex items-center gap-1.5 mt-0.5">
                      <Calendar size={13} className="text-slate-400" /> {selectedBooking.preferredDate}
                      <span className="text-slate-300">|</span>
                      <Clock size={13} className="text-slate-400" /> {selectedBooking.preferredTimeSlot}
                    </span>
                  </div>
                  <div className="col-span-2 border-t border-slate-200/60 my-1 pt-1">
                    <span className="text-slate-400 font-bold block">Home Collection Address</span>
                    <span className="text-slate-700 font-bold flex items-start gap-1.5 mt-0.5 leading-relaxed">
                      <MapPin size={13} className="text-slate-400 mt-0.5 shrink-0" /> {selectedBooking.address}
                    </span>
                  </div>
                  <div className="border-t border-slate-200/60 my-1 pt-1">
                    <span className="text-slate-400 font-bold block">Billing Amount</span>
                    <span className="text-slate-900 font-black text-base">₹{selectedBooking.amount}</span>
                  </div>
                  <div className="border-t border-slate-200/60 my-1 pt-1">
                    <span className="text-slate-400 font-bold block">Payment Status</span>
                    <span className="text-slate-800 font-extrabold block mt-0.5">{selectedBooking.paymentStatus} (Manual)</span>
                  </div>
                </div>
              </div>

              {/* Status Update Dropdown */}
              <div className="space-y-1">
                <Label htmlFor="status" className="text-xs font-bold text-slate-600">Update Booking Status *</Label>
                <Select
                  value={updateStatus}
                  onValueChange={(val) => setUpdateStatus(val || "PENDING")}
                >
                  <SelectTrigger id="status" className="rounded-xl border-slate-200 font-semibold text-slate-700">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-xl border-slate-200">
                    {STATUSES.map(st => (
                      <SelectItem key={st} value={st} className="rounded-lg font-medium">
                        {STATUS_LABELS[st]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Remarks Textarea */}
              <div className="space-y-1">
                <Label htmlFor="notes" className="text-xs font-bold text-slate-600">Admin Notes / Remarks</Label>
                <Textarea
                  id="notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Called customer. Phlebotomist scheduled for 8 AM. / Report generated."
                  className="rounded-xl border-slate-200 min-h-[80px] font-semibold text-slate-700"
                />
              </div>

              {/* Footer Actions */}
              <DialogFooter className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDetailOpen(false)}
                  className="flex-1 rounded-xl border-slate-200 font-bold"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                  className="flex-1 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl shadow border-none"
                >
                  {updateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
