"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  CreditCard, Plus, Loader2, Edit, Trash2, ShieldCheck, 
  Search, CheckCircle2, XCircle, AlertCircle
} from "lucide-react";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/AuthContext";

export default function AdminSubscriptionsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: authUser, userType, loading: authLoading } = useAuth();
  
  // Auth Guard
  useEffect(() => {
    if (!authLoading && !authUser) router.push("/login");
    else if (!authLoading && userType !== "ADMIN" && userType !== "SUPER_ADMIN") router.push("/");
  }, [authUser, userType, authLoading, router]);

  // States
  const [activeTab, setActiveTab] = useState("plans");
  const [filterStatus, setFilterStatus] = useState("ALL");
  
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [planForm, setPlanForm] = useState({
    name: "", description: "", monthlyPrice: 0, yearlyPrice: 0,
    consultationsPerMonth: 0, labDiscountEnabled: false, labDiscountPercent: 0,
    medicineDiscountEnabled: false, medicineDiscountPercent: 0,
    prioritySupport: false, isActive: true
  });

  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({
    userId: "", planId: "", billingCycle: "MONTHLY"
  });
  
  const [cancelSubscriptionId, setCancelSubscriptionId] = useState<string | null>(null);

  // Queries
  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ["admin-plans"],
    queryFn: async () => (await api.get("/admin/subscriptions/plans")).data,
    enabled: !!authUser && (userType === "ADMIN" || userType === "SUPER_ADMIN"),
  });

  const { data: subscriptions, isLoading: subsLoading } = useQuery({
    queryKey: ["admin-subscriptions", filterStatus],
    queryFn: async () => (await api.get(`/admin/subscriptions?status=${filterStatus === "ALL" ? "" : filterStatus}`)).data,
    enabled: !!authUser && (userType === "ADMIN" || userType === "SUPER_ADMIN"),
  });

  // Fetch all patients for assignment dialog
  const { data: patients } = useQuery({
    queryKey: ["admin-patients-list"],
    queryFn: async () => (await api.get("/admin/patients?size=100")).data?.content,
    enabled: isAssignDialogOpen,
  });

  // Mutations
  const savePlanMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingPlan) return await api.put(`/admin/subscriptions/plans/${editingPlan.id}`, data);
      return await api.post("/admin/subscriptions/plans", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-plans"] });
      toast.success(editingPlan ? "Plan updated" : "Plan created");
      setIsPlanDialogOpen(false);
    },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed to save plan")
  });

  const deactivatePlanMutation = useMutation({
    mutationFn: async (id: string) => await api.delete(`/admin/subscriptions/plans/${id}/deactivate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-plans"] });
      toast.success("Plan deactivated");
    },
    onError: () => toast.error("Failed to deactivate plan")
  });

  const assignPlanMutation = useMutation({
    mutationFn: async (data: any) => await api.post("/admin/subscriptions/assign", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
      toast.success("Subscription assigned successfully");
      setIsAssignDialogOpen(false);
    },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed to assign subscription")
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async (id: string) => await api.delete(`/admin/subscriptions/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
      toast.success("Subscription cancelled");
      setCancelSubscriptionId(null);
    },
    onError: () => toast.error("Failed to cancel subscription")
  });

  // Handlers
  const handleOpenPlanDialog = (plan: any = null) => {
    if (plan) {
      setEditingPlan(plan);
      setPlanForm({ ...plan });
    } else {
      setEditingPlan(null);
      setPlanForm({
        name: "", description: "", monthlyPrice: 0, yearlyPrice: 0,
        consultationsPerMonth: 0, labDiscountEnabled: false, labDiscountPercent: 0,
        medicineDiscountEnabled: false, medicineDiscountPercent: 0,
        prioritySupport: false, isActive: true
      });
    }
    setIsPlanDialogOpen(true);
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.name || planForm.monthlyPrice < 0 || planForm.yearlyPrice < 0) {
      toast.error("Please fill required fields correctly");
      return;
    }
    savePlanMutation.mutate(planForm);
  };

  const handleAssignPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.userId || !assignForm.planId) {
      toast.error("Please select a patient and a plan");
      return;
    }
    assignPlanMutation.mutate(assignForm);
  };

  if (authLoading) {
    return <div className="min-h-[500px] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#0D9488]" /></div>;
  }

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Subscriptions Management</h1>
          <p className="text-slate-500 font-medium mt-1">Manage health plans and patient subscriptions.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-200/50 p-1 rounded-xl mb-6">
          <TabsTrigger value="plans" className="rounded-lg px-6 font-bold">Health Plans</TabsTrigger>
          <TabsTrigger value="subscriptions" className="rounded-lg px-6 font-bold">Active Subscriptions</TabsTrigger>
        </TabsList>

        {/* PLANS TAB */}
        <TabsContent value="plans" className="m-0 focus-visible:outline-none">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="font-bold text-slate-900 text-lg">Available Plans</h2>
              <Button onClick={() => handleOpenPlanDialog()} className="bg-[#0D9488] hover:bg-teal-700 font-bold rounded-xl shadow-sm">
                <Plus className="w-4 h-4 mr-2" /> Add Plan
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-bold">
                    <th className="p-4">Plan Name</th>
                    <th className="p-4">Pricing</th>
                    <th className="p-4">Benefits</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {plansLoading ? (
                    <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto" /></td></tr>
                  ) : !plans || plans.length === 0 ? (
                    <tr><td colSpan={5} className="p-12 text-center text-slate-500 font-medium">No plans found.</td></tr>
                  ) : (
                    plans.map((plan: any) => (
                      <tr key={plan.id} className={cn("hover:bg-slate-50/50 transition-colors", !plan.isActive && "opacity-60")}>
                        <td className="p-4">
                          <p className="font-bold text-slate-900">{plan.name}</p>
                          <p className="text-xs text-slate-500 line-clamp-1 max-w-[200px]">{plan.description}</p>
                        </td>
                        <td className="p-4 font-medium text-sm">
                          <p>₹{plan.monthlyPrice}/mo</p>
                          <p className="text-slate-500">₹{plan.yearlyPrice}/yr</p>
                        </td>
                        <td className="p-4 text-xs space-y-1">
                          <p><span className="font-bold text-[#0D9488]">{plan.consultationsPerMonth}</span> consults</p>
                          {plan.labDiscountEnabled && <p>{plan.labDiscountPercent}% Lab Off</p>}
                          {plan.medicineDiscountEnabled && <p>{plan.medicineDiscountPercent}% Med Off</p>}
                          {plan.prioritySupport && <p className="text-amber-600 font-bold flex items-center gap-1"><ShieldCheck size={12}/> Priority</p>}
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className={cn("font-bold", plan.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500")}>
                            {plan.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenPlanDialog(plan)} className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 rounded-lg">
                            <Edit size={16} />
                          </Button>
                          {plan.isActive && (
                            <Button variant="ghost" size="sm" onClick={() => deactivatePlanMutation.mutate(plan.id)} className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 rounded-lg">
                              <Trash2 size={16} />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* SUBSCRIPTIONS TAB */}
        <TabsContent value="subscriptions" className="m-0 focus-visible:outline-none space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
            <Select value={filterStatus} onValueChange={v => setFilterStatus(v || "ALL")}>
              <SelectTrigger className="w-[180px] h-10 font-bold bg-slate-50 border-slate-200 rounded-xl">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setIsAssignDialogOpen(true)} className="bg-[#0D9488] hover:bg-teal-700 font-bold rounded-xl shadow-sm h-10">
              <CreditCard className="w-4 h-4 mr-2" /> Assign Plan
            </Button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-bold">
                    <th className="p-4">Patient</th>
                    <th className="p-4">Plan & Cycle</th>
                    <th className="p-4">Usage</th>
                    <th className="p-4">Dates</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subsLoading ? (
                    <tr><td colSpan={6} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto" /></td></tr>
                  ) : !subscriptions || subscriptions.length === 0 ? (
                    <tr><td colSpan={6} className="p-12 text-center text-slate-500 font-medium">No subscriptions found.</td></tr>
                  ) : (
                    subscriptions.map((sub: any) => (
                      <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-bold text-slate-900">{sub.patientName || "Unknown"}</td>
                        <td className="p-4">
                          <p className="font-bold text-[#0D9488]">{sub.planName}</p>
                          <Badge variant="outline" className="text-[10px] mt-1 bg-slate-100 border-slate-200">{sub.billingCycle}</Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden max-w-[100px]">
                              <div 
                                className="bg-[#0D9488] h-full" 
                                style={{ width: `${(sub.consultationsUsed / (sub.consultationsUsed + sub.consultationsRemaining)) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-600">{sub.consultationsUsed}/{sub.consultationsUsed + sub.consultationsRemaining}</span>
                          </div>
                        </td>
                        <td className="p-4 text-xs font-medium text-slate-600">
                          <p>Start: {new Date(sub.startDate).toLocaleDateString()}</p>
                          <p>End: {new Date(sub.endDate).toLocaleDateString()}</p>
                        </td>
                        <td className="p-4">
                          <Badge className={cn("font-bold border-none", 
                            sub.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" :
                            sub.status === "CANCELLED" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"
                          )}>
                            {sub.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          {sub.status === "ACTIVE" && (
                            <Button variant="ghost" size="sm" onClick={() => setCancelSubscriptionId(sub.id)} className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg font-bold text-xs">
                              Cancel
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* PLAN DIALOG */}
      <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
          <div className="px-6 py-5 bg-slate-50 border-b border-slate-100">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900">{editingPlan ? "Edit Plan" : "Create Subscription Plan"}</DialogTitle>
              <DialogDescription className="font-medium text-slate-500 mt-1">Configure pricing and medical benefits.</DialogDescription>
            </DialogHeader>
          </div>
          <form onSubmit={handleSavePlan} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Plan Name *</Label>
              <Input required value={planForm.name} onChange={e => setPlanForm({...planForm, name: e.target.value})} className="h-11 rounded-xl focus-visible:ring-[#0D9488]" />
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Description</Label>
              <Textarea value={planForm.description} onChange={e => setPlanForm({...planForm, description: e.target.value})} className="rounded-xl focus-visible:ring-[#0D9488] resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Monthly Price (₹) *</Label>
                <Input type="number" required min={0} value={planForm.monthlyPrice} onChange={e => setPlanForm({...planForm, monthlyPrice: parseFloat(e.target.value) || 0})} className="h-11 rounded-xl focus-visible:ring-[#0D9488]" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Yearly Price (₹) *</Label>
                <Input type="number" required min={0} value={planForm.yearlyPrice} onChange={e => setPlanForm({...planForm, yearlyPrice: parseFloat(e.target.value) || 0})} className="h-11 rounded-xl focus-visible:ring-[#0D9488]" />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <Label className="font-bold text-slate-700">Consultations Per Month</Label>
              <Input type="number" min={0} value={planForm.consultationsPerMonth} onChange={e => setPlanForm({...planForm, consultationsPerMonth: parseInt(e.target.value) || 0})} className="h-11 rounded-xl focus-visible:ring-[#0D9488]" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3 p-4 border border-slate-200 rounded-xl bg-slate-50">
                <div className="flex items-center justify-between">
                  <Label className="font-bold text-slate-700">Lab Discount</Label>
                  <Switch checked={planForm.labDiscountEnabled} onCheckedChange={c => setPlanForm({...planForm, labDiscountEnabled: c})} className="data-[state=checked]:bg-[#0D9488]" />
                </div>
                {planForm.labDiscountEnabled && (
                  <Input type="number" placeholder="Percent %" value={planForm.labDiscountPercent} onChange={e => setPlanForm({...planForm, labDiscountPercent: parseInt(e.target.value) || 0})} className="h-9" />
                )}
              </div>
              <div className="space-y-3 p-4 border border-slate-200 rounded-xl bg-slate-50">
                <div className="flex items-center justify-between">
                  <Label className="font-bold text-slate-700">Med Discount</Label>
                  <Switch checked={planForm.medicineDiscountEnabled} onCheckedChange={c => setPlanForm({...planForm, medicineDiscountEnabled: c})} className="data-[state=checked]:bg-[#0D9488]" />
                </div>
                {planForm.medicineDiscountEnabled && (
                  <Input type="number" placeholder="Percent %" value={planForm.medicineDiscountPercent} onChange={e => setPlanForm({...planForm, medicineDiscountPercent: parseInt(e.target.value) || 0})} className="h-9" />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
              <div>
                <Label className="font-bold text-slate-700 text-base">Priority Support</Label>
                <p className="text-xs text-slate-500">Enable 24/7 priority ticketing</p>
              </div>
              <Switch checked={planForm.prioritySupport} onCheckedChange={c => setPlanForm({...planForm, prioritySupport: c})} className="data-[state=checked]:bg-[#0D9488]" />
            </div>

            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
              <div>
                <Label className="font-bold text-slate-700 text-base">Plan Active</Label>
                <p className="text-xs text-slate-500">Toggle plan visibility for new users</p>
              </div>
              <Switch checked={planForm.isActive} onCheckedChange={c => setPlanForm({...planForm, isActive: c})} className="data-[state=checked]:bg-[#0D9488]" />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <Button type="button" variant="ghost" onClick={() => setIsPlanDialogOpen(false)} className="rounded-xl font-bold">Cancel</Button>
              <Button type="submit" disabled={savePlanMutation.isPending} className="rounded-xl font-bold px-6 bg-[#0D9488] hover:bg-teal-700">
                {savePlanMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Plan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ASSIGN DIALOG */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
          <div className="px-6 py-5 bg-slate-50 border-b border-slate-100">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900">Assign Subscription</DialogTitle>
              <DialogDescription className="font-medium text-slate-500 mt-1">Manually grant a health plan to a user.</DialogDescription>
            </DialogHeader>
          </div>
          <form onSubmit={handleAssignPlan} className="p-6 space-y-5">
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Patient *</Label>
              <Select value={assignForm.userId} onValueChange={v => setAssignForm({...assignForm, userId: v || ""})}>
                <SelectTrigger className="h-11 rounded-xl focus:ring-[#0D9488]"><SelectValue placeholder="Select Patient" /></SelectTrigger>
                <SelectContent className="max-h-60">
                  {patients?.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Plan *</Label>
              <Select value={assignForm.planId} onValueChange={v => setAssignForm({...assignForm, planId: v || ""})}>
                <SelectTrigger className="h-11 rounded-xl focus:ring-[#0D9488]"><SelectValue placeholder="Select Plan" /></SelectTrigger>
                <SelectContent>
                  {plans?.filter((p: any) => p.isActive).map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Billing Cycle *</Label>
              <Select value={assignForm.billingCycle} onValueChange={v => setAssignForm({...assignForm, billingCycle: v || "MONTHLY"})}>
                <SelectTrigger className="h-11 rounded-xl focus:ring-[#0D9488]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <Button type="button" variant="ghost" onClick={() => setIsAssignDialogOpen(false)} className="rounded-xl font-bold">Cancel</Button>
              <Button type="submit" disabled={assignPlanMutation.isPending} className="rounded-xl font-bold px-6 bg-[#0D9488] hover:bg-teal-700">
                {assignPlanMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Assign Plan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* CANCEL ALERT */}
      <AlertDialog open={!!cancelSubscriptionId} onOpenChange={(open) => !open && setCancelSubscriptionId(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Cancel Subscription?</AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-slate-600">
              Are you sure you want to cancel this user's active subscription immediately? All benefits will be revoked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="rounded-xl font-bold border-slate-200">Keep Active</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => cancelSubscriptionId && cancelSubscriptionMutation.mutate(cancelSubscriptionId)}
              className="rounded-xl font-bold bg-red-600 hover:bg-red-700"
            >
              Confirm Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
