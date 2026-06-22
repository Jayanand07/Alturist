"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, Plus, Edit2, Trash2, Loader2, FlaskConical, 
  Check, X, FileText, Activity, ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

// --- Types ---
interface LabTest {
  id?: string;
  name: string;
  description: string;
  category: string;
  price: number;
  discountedPrice: number;
  discountPercent: number;
  includesCount: number;
  isFeatured: boolean;
  isActive: boolean;
}

interface LabPackage {
  id?: string;
  name: string;
  description: string;
  includesTestCount: number;
  testNames: string[];
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  smartReportIncluded: boolean;
  isActive: boolean;
}

const CATEGORIES = [
  "Full Body Checkup", "Diabetes", "Heart", "Blood Studies", "Vitamin", "Thyroid", "Kidney", "Liver", "Other"
];

export default function AdminLabManagementPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"tests" | "packages">("tests");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Editing States
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: "test" | "package" } | null>(null);

  // Forms
  const [testForm, setTestForm] = useState<LabTest>({
    name: "", description: "", category: "Full Body Checkup", 
    price: 0, discountedPrice: 0, discountPercent: 0, 
    includesCount: 1, isFeatured: false, isActive: true
  });

  const [packageForm, setPackageForm] = useState<{
    name: string;
    description: string;
    includesTestCount: number;
    testNamesCsv: string;
    originalPrice: number;
    discountedPrice: number;
    discountPercent: number;
    smartReportIncluded: boolean;
    isActive: boolean;
  }>({
    name: "", description: "", includesTestCount: 1, testNamesCsv: "",
    originalPrice: 0, discountedPrice: 0, discountPercent: 0,
    smartReportIncluded: false, isActive: true
  });

  // Calculate discounts automatically
  useEffect(() => {
    if (testForm.price > 0 && testForm.discountedPrice > 0) {
      const discount = Math.round((1 - (testForm.discountedPrice / testForm.price)) * 100);
      setTestForm(prev => ({ ...prev, discountPercent: Math.max(0, discount) }));
    } else {
      setTestForm(prev => ({ ...prev, discountPercent: 0 }));
    }
  }, [testForm.price, testForm.discountedPrice]);

  useEffect(() => {
    if (packageForm.originalPrice > 0 && packageForm.discountedPrice > 0) {
      const discount = Math.round((1 - (packageForm.discountedPrice / packageForm.originalPrice)) * 100);
      setPackageForm(prev => ({ ...prev, discountPercent: Math.max(0, discount) }));
    } else {
      setPackageForm(prev => ({ ...prev, discountPercent: 0 }));
    }
  }, [packageForm.originalPrice, packageForm.discountedPrice]);

  // --- Queries ---
  const { data: labTests = [], isLoading: isLoadingTests } = useQuery<LabTest[]>({
    queryKey: ["admin-lab-tests"],
    queryFn: async () => (await api.get("/admin/lab-tests")).data
  });

  const { data: labPackages = [], isLoading: isLoadingPackages } = useQuery<LabPackage[]>({
    queryKey: ["admin-lab-packages"],
    queryFn: async () => (await api.get("/admin/lab-packages")).data
  });

  // --- Test Mutations ---
  const saveTestMutation = useMutation({
    mutationFn: async (test: LabTest) => {
      if (editingTestId) {
        return (await api.put(`/admin/lab-tests/${editingTestId}`, test)).data;
      } else {
        return (await api.post("/admin/lab-tests", test)).data;
      }
    },
    onSuccess: () => {
      toast.success(editingTestId ? "Lab test updated successfully" : "Lab test created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-lab-tests"] });
      setIsTestModalOpen(false);
      resetTestForm();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to save lab test");
    }
  });

  const toggleTestFeaturedMutation = useMutation({
    mutationFn: async (test: LabTest) => {
      const updated = { ...test, isFeatured: !test.isFeatured };
      return (await api.put(`/admin/lab-tests/${test.id}`, updated)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lab-tests"] });
      toast.success("Updated test preference");
    }
  });

  const toggleTestActiveMutation = useMutation({
    mutationFn: async (test: LabTest) => {
      const updated = { ...test, isActive: !test.isActive };
      return (await api.put(`/admin/lab-tests/${test.id}`, updated)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lab-tests"] });
      toast.success("Updated test visibility");
    }
  });

  // --- Package Mutations ---
  const savePackageMutation = useMutation({
    mutationFn: async (pkg: LabPackage) => {
      if (editingPackageId) {
        return (await api.put(`/admin/lab-packages/${editingPackageId}`, pkg)).data;
      } else {
        return (await api.post("/admin/lab-packages", pkg)).data;
      }
    },
    onSuccess: () => {
      toast.success(editingPackageId ? "Health package updated successfully" : "Health package created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-lab-packages"] });
      setIsPackageModalOpen(false);
      resetPackageForm();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to save package");
    }
  });

  const togglePackageActiveMutation = useMutation({
    mutationFn: async (pkg: LabPackage) => {
      const updated = { ...pkg, isActive: !pkg.isActive };
      return (await api.put(`/admin/lab-packages/${pkg.id}`, updated)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lab-packages"] });
      toast.success("Updated package visibility");
    }
  });

  // --- Delete Mutation ---
  const deleteMutation = useMutation({
    mutationFn: async (target: { id: string; type: "test" | "package" }) => {
      if (target.type === "test") {
        await api.delete(`/admin/lab-tests/${target.id}`);
      } else {
        await api.delete(`/admin/lab-packages/${target.id}`);
      }
    },
    onSuccess: () => {
      toast.success("Deleted successfully");
      queryClient.invalidateQueries({ queryKey: [deleteTarget?.type === "test" ? "admin-lab-tests" : "admin-lab-packages"] });
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error("Failed to delete the item");
    }
  });

  // --- Helpers & Handlers ---
  const resetTestForm = () => {
    setTestForm({
      name: "", description: "", category: "Full Body Checkup", 
      price: 0, discountedPrice: 0, discountPercent: 0, 
      includesCount: 1, isFeatured: false, isActive: true
    });
    setEditingTestId(null);
  };

  const resetPackageForm = () => {
    setPackageForm({
      name: "", description: "", includesTestCount: 1, testNamesCsv: "",
      originalPrice: 0, discountedPrice: 0, discountPercent: 0,
      smartReportIncluded: false, isActive: true
    });
    setEditingPackageId(null);
  };

  const handleEditTest = (test: LabTest) => {
    setEditingTestId(test.id || null);
    setTestForm({ ...test });
    setIsTestModalOpen(true);
  };

  const handleEditPackage = (pkg: LabPackage) => {
    setEditingPackageId(pkg.id || null);
    setPackageForm({
      name: pkg.name,
      description: pkg.description,
      includesTestCount: pkg.includesTestCount,
      testNamesCsv: pkg.testNames ? pkg.testNames.join(", ") : "",
      originalPrice: pkg.originalPrice,
      discountedPrice: pkg.discountedPrice,
      discountPercent: pkg.discountPercent,
      smartReportIncluded: pkg.smartReportIncluded,
      isActive: pkg.isActive
    });
    setIsPackageModalOpen(true);
  };

  const handleDeleteClick = (id: string, type: "test" | "package") => {
    setDeleteTarget({ id, type });
    setIsDeleteDialogOpen(true);
  };

  const handleTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testForm.name.trim()) return toast.error("Test name is required");
    if (testForm.price <= 0) return toast.error("Price must be greater than 0");
    if (testForm.discountedPrice > testForm.price) return toast.error("Discounted price cannot exceed original price");
    saveTestMutation.mutate(testForm);
  };

  const handlePackageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageForm.name.trim()) return toast.error("Package name is required");
    if (packageForm.originalPrice <= 0) return toast.error("Original price must be greater than 0");
    if (packageForm.discountedPrice > packageForm.originalPrice) return toast.error("Discounted price cannot exceed original price");
    
    // Convert CSV input to string array
    const testNames = packageForm.testNamesCsv
      .split(",")
      .map(name => name.trim())
      .filter(name => name.length > 0);

    const payload: LabPackage = {
      name: packageForm.name,
      description: packageForm.description,
      includesTestCount: packageForm.includesTestCount,
      testNames,
      originalPrice: packageForm.originalPrice,
      discountedPrice: packageForm.discountedPrice,
      discountPercent: packageForm.discountPercent,
      smartReportIncluded: packageForm.smartReportIncluded,
      isActive: packageForm.isActive
    };

    savePackageMutation.mutate(payload);
  };

  // Filter lists based on search
  const filteredTests = labTests.filter(test => 
    test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPackages = labPackages.filter(pkg => 
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FlaskConical className="text-[#E8593C]" size={28} /> Lab Tests & Packages
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage test inventory and diagnostic screening packages.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => {
              if (activeTab === "tests") {
                resetTestForm();
                setIsTestModalOpen(true);
              } else {
                resetPackageForm();
                setIsPackageModalOpen(true);
              }
            }}
            className="bg-[#E8593C] hover:bg-[#d6482e] text-white font-bold h-11 px-6 rounded-xl shadow-md transition-colors flex items-center gap-2"
          >
            <Plus size={18} /> Add {activeTab === "tests" ? "New Test" : "New Package"}
          </Button>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200/60 w-fit">
          <button
            onClick={() => { setActiveTab("tests"); setSearchQuery(""); }}
            className={cn(
              "px-5 py-2.5 rounded-lg text-sm font-bold transition-all",
              activeTab === "tests"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            Lab Tests ({labTests.length})
          </button>
          <button
            onClick={() => { setActiveTab("packages"); setSearchQuery(""); }}
            className={cn(
              "px-5 py-2.5 rounded-lg text-sm font-bold transition-all",
              activeTab === "packages"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            Health Packages ({labPackages.length})
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === "tests" ? "Search lab tests..." : "Search packages..."}
            className="pl-10 h-10 w-full bg-white rounded-xl border-slate-200 focus:ring-2 focus:ring-[#E8593C]/20 outline-none"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <Card className="border-slate-200/60 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {activeTab === "tests" ? (
            isLoadingTests ? (
              <div className="p-8 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : filteredTests.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <FlaskConical className="mx-auto text-slate-300" size={48} />
                <h3 className="text-lg font-bold text-slate-700">No Lab Tests Found</h3>
                <p className="text-slate-400 max-w-sm mx-auto text-sm">
                  {searchQuery ? "No tests match your search query." : "Start by adding a test to the catalog."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-bold text-slate-800">Test Details</TableHead>
                      <TableHead className="font-bold text-slate-800">Category</TableHead>
                      <TableHead className="font-bold text-slate-800">Price (Original)</TableHead>
                      <TableHead className="font-bold text-slate-800">Discounted</TableHead>
                      <TableHead className="font-bold text-slate-800">Includes</TableHead>
                      <TableHead className="font-bold text-slate-800">Featured</TableHead>
                      <TableHead className="font-bold text-slate-800">Active</TableHead>
                      <TableHead className="font-bold text-slate-800 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTests.map((test) => (
                      <TableRow key={test.id} className="hover:bg-slate-50/50">
                        <TableCell className="max-w-xs">
                          <p className="font-bold text-slate-900 leading-tight">{test.name}</p>
                          <p className="text-xs text-slate-400 truncate mt-0.5" title={test.description}>
                            {test.description || "No description provided"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 font-bold">
                            {test.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-slate-400 line-through">₹{test.price}</TableCell>
                        <TableCell className="font-bold text-slate-900">
                          ₹{test.discountedPrice}
                          {test.discountPercent > 0 && (
                            <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-1 py-0.5 rounded font-bold ml-1.5">
                              {test.discountPercent}% OFF
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="font-bold text-slate-600">{test.includesCount} tests</TableCell>
                        <TableCell>
                          <Switch 
                            checked={test.isFeatured} 
                            onCheckedChange={() => toggleTestFeaturedMutation.mutate(test)}
                            className="data-[state=checked]:bg-[#0D9373]"
                          />
                        </TableCell>
                        <TableCell>
                          <Switch 
                            checked={test.isActive} 
                            onCheckedChange={() => toggleTestActiveMutation.mutate(test)}
                            className="data-[state=checked]:bg-[#0D9373]"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleEditTest(test)}
                              className="text-slate-500 hover:text-slate-800 h-9 w-9 rounded-lg hover:bg-slate-100"
                            >
                              <Edit2 size={16} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteClick(test.id!, "test")}
                              className="text-rose-500 hover:text-rose-700 h-9 w-9 rounded-lg hover:bg-rose-50"
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
            )
          ) : (
            isLoadingPackages ? (
              <div className="p-8 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : filteredPackages.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <FlaskConical className="mx-auto text-slate-300" size={48} />
                <h3 className="text-lg font-bold text-slate-700">No Health Packages Found</h3>
                <p className="text-slate-400 max-w-sm mx-auto text-sm">
                  {searchQuery ? "No packages match your search query." : "Start by adding a wellness package."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-bold text-slate-800">Package Details</TableHead>
                      <TableHead className="font-bold text-slate-800">Original Price</TableHead>
                      <TableHead className="font-bold text-slate-800">Discounted Price</TableHead>
                      <TableHead className="font-bold text-slate-800">Included Tests</TableHead>
                      <TableHead className="font-bold text-slate-800">Smart Report</TableHead>
                      <TableHead className="font-bold text-slate-800">Active</TableHead>
                      <TableHead className="font-bold text-slate-800 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPackages.map((pkg) => (
                      <TableRow key={pkg.id} className="hover:bg-slate-50/50">
                        <TableCell className="max-w-xs">
                          <p className="font-bold text-slate-900 leading-tight">{pkg.name}</p>
                          <p className="text-xs text-slate-400 truncate mt-0.5" title={pkg.description}>
                            {pkg.description || "No description provided"}
                          </p>
                        </TableCell>
                        <TableCell className="font-semibold text-slate-400 line-through">₹{pkg.originalPrice}</TableCell>
                        <TableCell className="font-bold text-slate-900">
                          ₹{pkg.discountedPrice}
                          {pkg.discountPercent > 0 && (
                            <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-1 py-0.5 rounded font-bold ml-1.5">
                              {pkg.discountPercent}% OFF
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-slate-700 mr-2">{pkg.includesTestCount} tests</span>
                          {pkg.testNames && pkg.testNames.length > 0 && (
                            <p className="text-[11px] text-slate-400 leading-tight mt-0.5 truncate max-w-[180px]" title={pkg.testNames.join(", ")}>
                              {pkg.testNames.join(", ")}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn(
                            "font-bold",
                            pkg.smartReportIncluded 
                              ? "bg-blue-50 text-blue-700 border-blue-100" 
                              : "bg-slate-50 text-slate-500 border-slate-100"
                          )}>
                            {pkg.smartReportIncluded ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Switch 
                            checked={pkg.isActive} 
                            onCheckedChange={() => togglePackageActiveMutation.mutate(pkg)}
                            className="data-[state=checked]:bg-[#0D9373]"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleEditPackage(pkg)}
                              className="text-slate-500 hover:text-slate-800 h-9 w-9 rounded-lg hover:bg-slate-100"
                            >
                              <Edit2 size={16} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteClick(pkg.id!, "package")}
                              className="text-rose-500 hover:text-rose-700 h-9 w-9 rounded-lg hover:bg-rose-50"
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
            )
          )}
        </CardContent>
      </Card>

      {/* --- ADD/EDIT LAB TEST DIALOG --- */}
      <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900">
              {editingTestId ? "Edit Lab Test" : "Create Lab Test"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Fill in the details for the laboratory test.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleTestSubmit} className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-xs font-bold text-slate-700">Test Name *</Label>
              <Input
                id="name"
                required
                value={testForm.name}
                onChange={(e) => setTestForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Complete Blood Count (CBC)"
                className="rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="description" className="text-xs font-bold text-slate-700">Description</Label>
              <Textarea
                id="description"
                value={testForm.description}
                onChange={(e) => setTestForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of what this test analyses..."
                className="rounded-xl border-slate-200 min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="category" className="text-xs font-bold text-slate-700">Category *</Label>
                <Select
                  value={testForm.category}
                  onValueChange={(val) => setTestForm(prev => ({ ...prev, category: val || "Full Body Checkup" }))}
                >
                  <SelectTrigger className="rounded-xl border-slate-200">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-xl border-slate-200">
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat} className="rounded-lg">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="includesCount" className="text-xs font-bold text-slate-700">Includes Count</Label>
                <Input
                  id="includesCount"
                  type="number"
                  min={1}
                  value={testForm.includesCount}
                  onChange={(e) => setTestForm(prev => ({ ...prev, includesCount: parseInt(e.target.value) || 1 }))}
                  className="rounded-xl border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="price" className="text-xs font-bold text-slate-700">Original Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  min={1}
                  required
                  value={testForm.price || ""}
                  onChange={(e) => setTestForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  placeholder="e.g. 500"
                  className="rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="discountedPrice" className="text-xs font-bold text-slate-700">Discounted Price (₹)</Label>
                <Input
                  id="discountedPrice"
                  type="number"
                  min={0}
                  value={testForm.discountedPrice || ""}
                  onChange={(e) => setTestForm(prev => ({ ...prev, discountedPrice: parseFloat(e.target.value) || 0 }))}
                  placeholder="e.g. 399"
                  className="rounded-xl border-slate-200"
                />
              </div>
            </div>

            {testForm.price > 0 && testForm.discountedPrice > 0 && (
              <div className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl flex items-center justify-between">
                <span>Calculated Discount:</span>
                <span>{testForm.discountPercent}% OFF</span>
              </div>
            )}

            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <Switch 
                  id="isFeatured" 
                  checked={testForm.isFeatured} 
                  onCheckedChange={(val) => setTestForm(prev => ({ ...prev, isFeatured: val }))}
                  className="data-[state=checked]:bg-[#0D9373]"
                />
                <Label htmlFor="isFeatured" className="text-xs font-bold text-slate-700 cursor-pointer">Featured Test</Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch 
                  id="isActive" 
                  checked={testForm.isActive} 
                  onCheckedChange={(val) => setTestForm(prev => ({ ...prev, isActive: val }))}
                  className="data-[state=checked]:bg-[#0D9373]"
                />
                <Label htmlFor="isActive" className="text-xs font-bold text-slate-700 cursor-pointer">Active / Visible</Label>
              </div>
            </div>

            <DialogFooter className="pt-4 flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsTestModalOpen(false)}
                className="rounded-xl border-slate-200 font-bold"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={saveTestMutation.isPending}
                className="bg-[#E8593C] hover:bg-[#d6482e] text-white font-bold rounded-xl"
              >
                {saveTestMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : editingTestId ? "Update Test" : "Create Test"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- ADD/EDIT HEALTH PACKAGE DIALOG --- */}
      <Dialog open={isPackageModalOpen} onOpenChange={setIsPackageModalOpen}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900">
              {editingPackageId ? "Edit Health Package" : "Create Health Package"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Configure parameters for the diagnostic healthcare package.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePackageSubmit} className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="pkgName" className="text-xs font-bold text-slate-700">Package Name *</Label>
              <Input
                id="pkgName"
                required
                value={packageForm.name}
                onChange={(e) => setPackageForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Aarogyam Health Checkup"
                className="rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="pkgDescription" className="text-xs font-bold text-slate-700">Description</Label>
              <Textarea
                id="pkgDescription"
                value={packageForm.description}
                onChange={(e) => setPackageForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Comprehensive body screen evaluating kidneys, liver, lipids..."
                className="rounded-xl border-slate-200 min-h-[70px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="pkgTestsCount" className="text-xs font-bold text-slate-700">Includes Tests Count *</Label>
                <Input
                  id="pkgTestsCount"
                  type="number"
                  min={1}
                  required
                  value={packageForm.includesTestCount}
                  onChange={(e) => setPackageForm(prev => ({ ...prev, includesTestCount: parseInt(e.target.value) || 1 }))}
                  className="rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="pkgSmartReport" className="text-xs font-bold text-slate-700 block mb-2">Smart Report Included?</Label>
                <div className="flex items-center h-10">
                  <Switch 
                    id="pkgSmartReport" 
                    checked={packageForm.smartReportIncluded} 
                    onCheckedChange={(val) => setPackageForm(prev => ({ ...prev, smartReportIncluded: val }))}
                    className="data-[state=checked]:bg-[#0D9373]"
                  />
                  <Label htmlFor="pkgSmartReport" className="text-xs text-slate-500 font-bold ml-2 cursor-pointer">Yes, provide insights</Label>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="pkgTestNames" className="text-xs font-bold text-slate-700">Included Tests (comma-separated) *</Label>
              <Textarea
                id="pkgTestNames"
                required
                value={packageForm.testNamesCsv}
                onChange={(e) => setPackageForm(prev => ({ ...prev, testNamesCsv: e.target.value }))}
                placeholder="e.g. Lipid Profile, Complete Blood Count, Liver Function, HbA1c"
                className="rounded-xl border-slate-200 min-h-[60px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="pkgPrice" className="text-xs font-bold text-slate-700">Original Price (₹) *</Label>
                <Input
                  id="pkgPrice"
                  type="number"
                  min={1}
                  required
                  value={packageForm.originalPrice || ""}
                  onChange={(e) => setPackageForm(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) || 0 }))}
                  placeholder="e.g. 2999"
                  className="rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="pkgDiscounted" className="text-xs font-bold text-slate-700">Discounted Price (₹)</Label>
                <Input
                  id="pkgDiscounted"
                  type="number"
                  min={0}
                  value={packageForm.discountedPrice || ""}
                  onChange={(e) => setPackageForm(prev => ({ ...prev, discountedPrice: parseFloat(e.target.value) || 0 }))}
                  placeholder="e.g. 1499"
                  className="rounded-xl border-slate-200"
                />
              </div>
            </div>

            {packageForm.originalPrice > 0 && packageForm.discountedPrice > 0 && (
              <div className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl flex items-center justify-between">
                <span>Calculated Savings:</span>
                <span>{packageForm.discountPercent}% OFF</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <Switch 
                id="pkgActive" 
                checked={packageForm.isActive} 
                onCheckedChange={(val) => setPackageForm(prev => ({ ...prev, isActive: val }))}
                className="data-[state=checked]:bg-[#0D9373]"
              />
              <Label htmlFor="pkgActive" className="text-xs font-bold text-slate-700 cursor-pointer">Package Active & Visible</Label>
            </div>

            <DialogFooter className="pt-4 flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsPackageModalOpen(false)}
                className="rounded-xl border-slate-200 font-bold"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={savePackageMutation.isPending}
                className="bg-[#E8593C] hover:bg-[#d6482e] text-white font-bold rounded-xl"
              >
                {savePackageMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : editingPackageId ? "Update Package" : "Create Package"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- DELETE CONFIRMATION DIALOG --- */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl bg-white max-w-sm p-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 border border-rose-100">
              <ShieldAlert size={24} />
            </div>
            <AlertDialogTitle className="text-lg font-bold text-slate-900">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400 text-sm">
              This action cannot be undone. This will permanently delete this {deleteTarget?.type === "test" ? "lab test" : "health package"} from the database.
            </AlertDialogDescription>
          </div>
          <AlertDialogFooter className="mt-4 flex gap-2 justify-center sm:justify-center">
            <AlertDialogCancel 
              onClick={() => { setIsDeleteDialogOpen(false); setDeleteTarget(null); }}
              className="rounded-xl border-slate-200 font-bold"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteMutation.mutate(deleteTarget!)}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl"
            >
              {deleteMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
