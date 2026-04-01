"use client";

import React, { useState, useRef } from "react";
import { 
  Pill, 
  Search, 
  Plus, 
  Upload, 
  Download, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  FileSpreadsheet,
  Loader2,
  Box,
  FileWarning
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as XLSX from "xlsx";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";

const CATEGORIES = [
  "Antibiotics", "Painkillers", "Vitamins", "Diabetes", 
  "Blood Pressure", "Cardiac", "Dermatology", "Gastrology", "Other"
];

// --- Types ---
interface Medicine {
  id: string;
  name: string;
  genericName: string;
  manufacturer: string;
  category: string;
  price: number;
  discountedPrice: number;
  requiresPrescription: boolean;
  inStock: boolean;
  description: string;
}

interface MedicineForm {
  name: string;
  genericName: string;
  manufacturer: string;
  category: string;
  price: string; // using string for controlled inputs
  discountedPrice: string;
  requiresPrescription: boolean;
  inStock: boolean;
  description: string;
}

export default function MedicinesCatalogPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // General State
  const [activeTab, setActiveTab] = useState<"catalog" | "bulk">("catalog");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [prescriptionFilter, setPrescriptionFilter] = useState("all");
  const [page, setPage] = useState(0);

  // Modal / Single Add State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [formData, setFormData] = useState<MedicineForm>({
    name: "", genericName: "", manufacturer: "", category: "",
    price: "", discountedPrice: "", requiresPrescription: false, inStock: true, description: ""
  });

  // Delete State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [medicineToDelete, setMedicineToDelete] = useState<Medicine | null>(null);

  // Bulk Upload State
  const [previewData, setPreviewData] = useState<any[]>([]);

  // --- Queries ---
  const { data: statsData } = useQuery({
    queryKey: ["admin-medicines-stats"],
    queryFn: async () => (await api.get("/admin/medicines/stats")).data
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-medicines", search, categoryFilter, prescriptionFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        size: "20",
        search: search,
        category: categoryFilter === "all" ? "" : categoryFilter,
        prescription: prescriptionFilter === "all" ? "" : (prescriptionFilter === "yes").toString()
      });
      return (await api.get(`/admin/medicines?${params}`)).data;
    }
  });

  // --- Mutations ---
  const createMutation = useMutation({
    mutationFn: (newMed: Omit<Medicine, 'id'>) => api.post("/admin/medicines", newMed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-medicines"] });
      queryClient.invalidateQueries({ queryKey: ["admin-medicines-stats"] });
      toast.success("Medicine added successfully");
      setIsModalOpen(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Medicine> }) => api.put(`/admin/medicines/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-medicines"] });
      toast.success("Medicine updated");
      setIsModalOpen(false);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/medicines/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-medicines"] });
      queryClient.invalidateQueries({ queryKey: ["admin-medicines-stats"] });
      toast.success("Medicine deleted");
      setIsDeleteDialogOpen(false);
    }
  });

  const toggleStockMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/medicines/${id}/toggle-stock`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-medicines"] });
      queryClient.invalidateQueries({ queryKey: ["admin-medicines-stats"] });
    }
  });

  const bulkUploadMutation = useMutation({
    mutationFn: (payload: any[]) => api.post("/admin/medicines/bulk", payload),
    onSuccess: (res: any) => {
      const { created, failed } = res.data;
      if (failed > 0) {
        toast.warning(`${created} created, ${failed} failed rows. Fix and retry.`);
      } else {
        toast.success(`${created} medicines added successfully!`);
        setPreviewData([]);
        setActiveTab("catalog");
      }
      queryClient.invalidateQueries({ queryKey: ["admin-medicines"] });
      queryClient.invalidateQueries({ queryKey: ["admin-medicines-stats"] });
    },
    onError: () => toast.error("Bulk upload failed completely.")
  });

  // --- Handlers ---
  const resetForm = () => {
    setFormData({
      name: "", genericName: "", manufacturer: "", category: "",
      price: "", discountedPrice: "", requiresPrescription: false, inStock: true, description: ""
    });
    setEditingMedicine(null);
  };

  const openEdit = (med: Medicine) => {
    setEditingMedicine(med);
    setFormData({
      name: med.name, genericName: med.genericName || "", manufacturer: med.manufacturer,
      category: med.category || "", price: med.price?.toString() || "", 
      discountedPrice: med.discountedPrice?.toString() || "",
      requiresPrescription: med.requiresPrescription, inStock: med.inStock,
      description: med.description || ""
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.manufacturer || !formData.price) {
      toast.error("Please fill all required fields");
      return;
    }
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      discountedPrice: formData.discountedPrice ? parseFloat(formData.discountedPrice) : null,
    } as any;

    if (editingMedicine) {
      updateMutation.mutate({ id: editingMedicine.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        setPreviewData(data);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err) {
        toast.error("Failed to parse Excel file. Ensure correct formatting.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const submitBulkUpload = () => {
    // Basic transform mapping missing booleans 
    const payload = previewData.map(row => ({
      name: row.name || row.Name,
      genericName: row.genericName || row['Generic Name'],
      manufacturer: row.manufacturer || row.Manufacturer,
      category: row.category || row.Category,
      price: Number(row.price || row.Price || 0),
      discountedPrice: row.discountedPrice ? Number(row.discountedPrice) : null,
      requiresPrescription: Boolean(row.requiresPrescription || row['Requires Prescription'] === 'true' || row['Requires Prescription'] === true),
      inStock: Boolean(row.inStock ?? row['In Stock'] ?? true),
      description: row.description || row.Description || ""
    }));
    bulkUploadMutation.mutate(payload);
  };

  const handleExportCSV = () => {
    if (!data?.content?.length) return;
    const medicines = data.content as Medicine[];
    const headers = ["Name", "Generic Name", "Manufacturer", "Category", "Price", "Requires Prescription", "In Stock"];
    const rows = medicines.map(m => [
      m.name, m.genericName || 'N/A', m.manufacturer, m.category || 'N/A', 
      m.price, m.requiresPrescription ? "Yes" : "No", m.inStock ? "Yes" : "No"
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `inventory_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const medicines = data?.content || [];
  const totalCount = data?.totalElements || 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
      
      {/* Header and Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Medicine Catalog</h2>
          <p className="text-gray-500 font-medium">Manage pharmacy inventory and pricing</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-11 rounded-xl bg-white border-gray-100 font-bold shadow-sm hover:bg-gray-50 text-gray-600" onClick={handleExportCSV} disabled={medicines.length === 0}>
            <Download size={18} className="mr-2" />
            Export Page CSV
          </Button>
          <Button className="h-11 rounded-xl bg-teal-600 hover:bg-teal-700 font-bold shadow-lg shadow-teal-500/20" onClick={() => { resetForm(); setIsModalOpen(true); }}>
            <Plus size={18} className="mr-2" />
            Add Single Medicine
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-blue-600"><Pill size={60} /></div>
          <CardContent className="p-6 flex items-center gap-4">
             <div className="p-3 rounded-2xl bg-blue-50 text-blue-600"><Pill size={20} /></div>
             <div>
               <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Listed</p>
               <h3 className="text-2xl font-black text-gray-900">{statsData?.totalCount || 0}</h3>
             </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-green-600"><Box size={60} /></div>
          <CardContent className="p-6 flex items-center gap-4">
             <div className="p-3 rounded-2xl bg-green-50 text-green-600"><Box size={20} /></div>
             <div>
               <p className="text-xs font-black text-gray-400 uppercase tracking-widest">In Stock</p>
               <h3 className="text-2xl font-black text-gray-900">{statsData?.inStockCount || 0}</h3>
             </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-orange-600"><FileWarning size={60} /></div>
          <CardContent className="p-6 flex items-center gap-4">
             <div className="p-3 rounded-2xl bg-orange-50 text-orange-600"><FileWarning size={20} /></div>
             <div>
               <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Req. Prescription</p>
               <h3 className="text-2xl font-black text-gray-900">{statsData?.requiresPrescriptionCount || 0}</h3>
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Layout */}
      <Card className="border-none shadow-sm bg-white">
        <div className="flex border-b border-gray-100">
           <button 
             className={cn("px-8 py-4 text-sm font-black tracking-wide border-b-2 transition-all", activeTab === 'catalog' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-400 hover:text-gray-600')}
             onClick={() => setActiveTab('catalog')}
           >
             BROWSE CATALOG
           </button>
           <button 
             className={cn("px-8 py-4 text-sm font-black tracking-wide border-b-2 transition-all", activeTab === 'bulk' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-400 hover:text-gray-600')}
             onClick={() => setActiveTab('bulk')}
           >
             BULK EXCEL UPLOAD
           </button>
        </div>

        <CardContent className="p-0">
          {activeTab === 'catalog' && (
            <div className="flex flex-col animate-in fade-in duration-300">
              <div className="p-6 flex flex-col md:flex-row items-center gap-4 border-b border-gray-50">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    placeholder="Search medicines or manufacturers..." 
                    className="pl-10 h-11 border-gray-100 focus:border-teal-500 rounded-xl transition-all shadow-none"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                  />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <Select value={categoryFilter} onValueChange={(val) => { setCategoryFilter(val ?? "all"); setPage(0); }}>
                    <SelectTrigger className="w-[180px] h-11 border-gray-100 rounded-xl focus:ring-teal-500 shadow-none font-semibold">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={prescriptionFilter} onValueChange={(val) => { setPrescriptionFilter(val ?? "all"); setPage(0); }}>
                    <SelectTrigger className="w-[160px] h-11 border-gray-100 rounded-xl shadow-none font-semibold">
                      <SelectValue placeholder="Prescription" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Rule</SelectItem>
                      <SelectItem value="yes">Required</SelectItem>
                      <SelectItem value="no">OTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isLoading ? (
                <div className="p-6 space-y-4">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
                </div>
              ) : medicines.length === 0 ? (
                <div className="p-20 text-center flex flex-col items-center">
                   <div className="p-6 rounded-full bg-gray-50 mb-4 text-gray-300"><Search size={40} /></div>
                   <h4 className="text-xl font-black text-gray-800 tracking-tight">No medicines found</h4>
                   <p className="text-gray-500 font-medium">Adjust your filters or add new stock.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                   <Table>
                      <TableHeader>
                         <TableRow className="bg-gray-50/50 hover:bg-transparent border-gray-100">
                           <TableHead className="px-6 py-5 font-black text-[11px] text-gray-400 uppercase tracking-widest">Medicine & Brand</TableHead>
                           <TableHead className="font-black text-[11px] text-gray-400 uppercase tracking-widest">Category</TableHead>
                           <TableHead className="font-black text-[11px] text-gray-400 uppercase tracking-widest">Pricing</TableHead>
                           <TableHead className="font-black text-[11px] text-gray-400 uppercase tracking-widest">Prescription</TableHead>
                           <TableHead className="font-black text-[11px] text-gray-400 uppercase tracking-widest">Stock</TableHead>
                           <TableHead className="text-right pr-6 font-black text-[11px] text-gray-400 uppercase tracking-widest">Actions</TableHead>
                         </TableRow>
                      </TableHeader>
                      <TableBody>
                        {medicines.map((med: Medicine) => (
                           <TableRow key={med.id} className="border-gray-50 hover:bg-teal-50/10 transition-colors group">
                              <TableCell className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                   <div className="p-2 rounded-xl bg-gray-50 group-hover:bg-white text-gray-400 group-hover:text-teal-600 transition-colors border border-transparent group-hover:border-teal-100"><Pill size={20} /></div>
                                   <div className="flex flex-col">
                                      <p className="font-bold text-sm text-gray-900 group-hover:text-teal-700 transition-colors">{med.name}</p>
                                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">{med.manufacturer}</p>
                                   </div>
                                </div>
                              </TableCell>
                              <TableCell><Badge variant="outline" className="text-[10px] font-black uppercase bg-gray-50 border-gray-200">{med.category || 'N/A'}</Badge></TableCell>
                              <TableCell>
                                <div className="flex gap-2 items-center">
                                   <span className="font-black text-sm text-gray-900">₹{med.discountedPrice || med.price}</span>
                                   {med.discountedPrice && med.price > med.discountedPrice && (
                                     <span className="text-[10px] text-gray-400 line-through font-bold">₹{med.price}</span>
                                   )}
                                </div>
                              </TableCell>
                              <TableCell>
                                 {med.requiresPrescription ? (
                                    <Badge className="bg-orange-100 text-orange-700 border-none text-[10px] font-black uppercase tracking-widest">Required</Badge>
                                 ) : (
                                    <Badge className="bg-green-100 text-green-700 border-none text-[10px] font-black uppercase tracking-widest">OTC Safe</Badge>
                                 )}
                              </TableCell>
                              <TableCell>
                                 <button 
                                   onClick={() => toggleStockMutation.mutate(med.id)}
                                   className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95", 
                                     med.inStock ? "bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100" : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                                   )}
                                 >
                                    {med.inStock ? "In Stock" : "Out of Stock"}
                                 </button>
                              </TableCell>
                              <TableCell className="text-right pr-6">
                                 <div className="flex justify-end gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all" onClick={() => openEdit(med)}>
                                       <Edit2 size={14} />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" onClick={() => { setMedicineToDelete(med); setIsDeleteDialogOpen(true); }}>
                                       <Trash2 size={14} />
                                    </Button>
                                 </div>
                              </TableCell>
                           </TableRow>
                        ))}
                      </TableBody>
                   </Table>

                   {/* Pagination */}
                   {data?.totalPages > 1 && (
                     <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-500">Page {page + 1} of {data.totalPages}</span>
                        <div className="flex gap-2">
                           <Button variant="outline" size="sm" className="h-8 rounded-lg font-bold" disabled={page === 0} onClick={() => setPage(page - 1)}>Prev</Button>
                           <Button variant="outline" size="sm" className="h-8 rounded-lg font-bold" disabled={page >= data.totalPages - 1} onClick={() => setPage(page + 1)}>Next</Button>
                        </div>
                     </div>
                   )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'bulk' && (
             <div className="p-8 animate-in fade-in duration-300">
                <div className="max-w-4xl mx-auto space-y-8">
                   <div 
                     className="border-2 border-dashed border-teal-200 rounded-[32px] p-16 flex flex-col items-center justify-center text-center bg-teal-50/20 hover:bg-teal-50/50 transition-colors cursor-pointer group"
                     onClick={() => fileInputRef.current?.click()}
                   >
                     <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
                     <div className="bg-white p-6 rounded-full shadow-lg shadow-teal-500/10 mb-6 group-hover:scale-110 transition-transform">
                        <FileSpreadsheet className="text-teal-600" size={48} strokeWidth={1.5} />
                     </div>
                     <h3 className="text-2xl font-black text-gray-900 tracking-tight">Click or drag Excel file here</h3>
                     <p className="text-sm font-medium text-gray-500 mt-2 max-w-sm">
                       Upload .xlsx or .csv files. Ensure headers include Name, Manufacturer, Price, and Category.
                     </p>
                   </div>

                   {previewData.length > 0 && (
                     <div className="bg-white rounded-[24px] border border-gray-200 overflow-hidden shadow-sm">
                        <div className="p-6 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                           <div>
                             <h4 className="text-lg font-black text-gray-900">Preview Data</h4>
                             <p className="text-xs font-bold text-teal-600 mt-1 uppercase tracking-widest">{previewData.length} records ready</p>
                           </div>
                           <div className="flex gap-3">
                              <Button variant="ghost" className="font-bold text-gray-500" onClick={() => setPreviewData([])}>Clear</Button>
                              <Button 
                                className="bg-teal-600 hover:bg-teal-700 font-bold px-8 shadow-lg shadow-teal-500/20" 
                                onClick={submitBulkUpload}
                                disabled={bulkUploadMutation.isPending}
                              >
                                {bulkUploadMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                                Upload All to Inventory
                              </Button>
                           </div>
                        </div>
                        <div className="overflow-x-auto max-h-[400px]">
                           <Table>
                              <TableHeader className="sticky top-0 bg-white z-10 shadow-sm shadow-gray-100">
                                 <TableRow>
                                    <TableHead className="w-16 font-black uppercase text-[10px] tracking-widest">Row</TableHead>
                                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Name</TableHead>
                                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Manufacturer</TableHead>
                                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Category</TableHead>
                                    <TableHead className="font-black uppercase text-[10px] tracking-widest text-right">Price</TableHead>
                                 </TableRow>
                              </TableHeader>
                              <TableBody>
                                 {previewData.map((row, idx) => {
                                    const name = row.name || row.Name;
                                    const mfg = row.manufacturer || row.Manufacturer;
                                    const price = row.price || row.Price;
                                    const hasError = !name || !mfg || price === undefined;

                                    return (
                                       <TableRow key={idx} className={hasError ? "bg-red-50/50 hover:bg-red-50" : ""}>
                                          <TableCell className="text-xs font-bold text-gray-400">{idx + 2}</TableCell>
                                          <TableCell className={cn("font-bold text-sm", !name && "text-red-500 italic")}>{name || "Missing Name"}</TableCell>
                                          <TableCell className={cn("text-xs font-medium text-gray-500", !mfg && "text-red-500 italic")}>{mfg || "Missing Mfg"}</TableCell>
                                          <TableCell><Badge variant="outline" className="text-[9px] uppercase font-black">{row.category || row.Category || 'Unknown'}</Badge></TableCell>
                                          <TableCell className={cn("text-right font-black", !price && "text-red-500")}>{price ? `₹${price}` : "Missing"}</TableCell>
                                       </TableRow>
                                    );
                                 })}
                              </TableBody>
                           </Table>
                        </div>
                     </div>
                   )}
                </div>
             </div>
          )}
        </CardContent>
      </Card>

      {/* Single Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={(o) => { setIsModalOpen(o); if(!o) resetForm(); }}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-none rounded-[32px] shadow-2xl">
           <div className="bg-teal-600 p-8 text-white relative">
              <div className="absolute top-0 right-0 p-8 opacity-10"><Pill size={120} /></div>
              <DialogTitle className="text-2xl font-black tracking-tight">{editingMedicine ? 'Edit Medicine Details' : 'Add New Medicine'}</DialogTitle>
              <DialogDescription className="text-teal-50 font-medium italic mt-1 opacity-90">Ensure generic names and prices are verified.</DialogDescription>
           </div>
           <form onSubmit={handleFormSubmit} className="p-8 bg-white grid grid-cols-2 gap-5">
              <div className="space-y-2 col-span-2 md:col-span-1">
                 <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Medicine Name <span className="text-red-500">*</span></label>
                 <Input required className="border-gray-100 bg-gray-50/50 rounded-xl font-bold h-11" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Paracetamol 500mg" />
              </div>
              <div className="space-y-2 col-span-2 md:col-span-1">
                 <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Generic Name</label>
                 <Input className="border-gray-100 bg-gray-50/50 rounded-xl font-bold h-11" value={formData.genericName} onChange={e => setFormData({...formData, genericName: e.target.value})} placeholder="e.g. Acetaminophen" />
              </div>
              <div className="space-y-2 col-span-2 md:col-span-1">
                 <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Manufacturer <span className="text-red-500">*</span></label>
                 <Input required className="border-gray-100 bg-gray-50/50 rounded-xl font-bold h-11" value={formData.manufacturer} onChange={e => setFormData({...formData, manufacturer: e.target.value})} placeholder="e.g. GSK" />
              </div>
              <div className="space-y-2 col-span-2 md:col-span-1">
                 <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Category</label>
                 <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v ?? ""})}>
                    <SelectTrigger className="border-gray-100 bg-gray-50/50 rounded-xl font-bold h-11"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                 </Select>
              </div>
              <div className="space-y-2 col-span-2 md:col-span-1">
                 <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">MRP Price (₹) <span className="text-red-500">*</span></label>
                 <Input required type="number" step="0.01" className="border-gray-100 bg-gray-50/50 rounded-xl font-bold h-11" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="0.00" />
              </div>
              <div className="space-y-2 col-span-2 md:col-span-1">
                 <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Discount Price (₹)</label>
                 <Input type="number" step="0.01" className="border-gray-100 bg-gray-50/50 rounded-xl font-bold h-11" value={formData.discountedPrice} onChange={e => setFormData({...formData, discountedPrice: e.target.value})} placeholder="0.00" />
              </div>

              <div className="col-span-2 flex gap-8 p-4 bg-gray-50 rounded-[20px] border border-gray-100">
                 <div className="flex items-center gap-3">
                    <Checkbox id="reqPres" checked={formData.requiresPrescription} onCheckedChange={c => setFormData({...formData, requiresPrescription: !!c})} />
                    <label htmlFor="reqPres" className="text-xs font-black uppercase tracking-widest text-gray-600 cursor-pointer">Requires Prescription</label>
                 </div>
                 <div className="flex items-center gap-3">
                    <Checkbox id="inStock" checked={formData.inStock} onCheckedChange={c => setFormData({...formData, inStock: !!c})} />
                    <label htmlFor="inStock" className="text-xs font-black uppercase tracking-widest text-gray-600 cursor-pointer">In Stock (Available)</label>
                 </div>
              </div>

              <div className="col-span-2 space-y-2">
                 <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Description (Optional)</label>
                 <Input className="border-gray-100 bg-gray-50/50 rounded-xl font-bold h-11" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Uses, side effects, etc." />
              </div>

              <div className="col-span-2 flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
                 <Button type="button" variant="ghost" className="h-12 px-6 rounded-xl font-bold" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                 <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="h-12 px-8 rounded-xl bg-teal-600 hover:bg-teal-700 font-bold shadow-lg shadow-teal-500/20">
                    {createMutation.isPending || updateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Medicine"}
                 </Button>
              </div>
           </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-red-600 p-8 text-white relative">
             <div className="absolute top-0 right-0 p-8 opacity-10"><AlertCircle size={100} /></div>
             <AlertDialogTitle className="text-2xl font-black">Remove from Catalog?</AlertDialogTitle>
             <AlertDialogDescription className="text-red-50 font-medium italic mt-1 opacity-90">
                You are about to delete <span className="font-black underline">{medicineToDelete?.name}</span>. This removes it permanently.
             </AlertDialogDescription>
          </div>
          <AlertDialogFooter className="p-8 bg-white gap-3">
            <AlertDialogCancel className="h-12 px-6 rounded-xl font-bold border-gray-100">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="h-12 px-8 rounded-xl font-bold bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20"
              onClick={() => medicineToDelete && deleteMutation.mutate(medicineToDelete.id)}
            >
              <Trash2 size={18} className="mr-2" />
              Remove Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
