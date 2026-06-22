"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  Video, Eye, Plus, Edit, Trash2, Loader2, PlaySquare, Calendar, Globe, Lock, Search, Sparkles
} from "lucide-react";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter
} from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const CATEGORIES = ["Health Tips", "Diet", "Mental Health", "General", "Skin Care", "Child Health", "Diabetes Care"];

export default function AdminVlogManagement() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: authUser, userType, loading: authLoading } = useAuth();
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingVlog, setEditingVlog] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    videoUrl: "",
    thumbnailUrl: "",
    category: "Health Tips",
    authorDoctorId: "",
    isPublished: false,
    isFeatured: false
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Queries
  const { data: vlogs, isLoading: isVlogsLoading } = useQuery({
    queryKey: ["admin-vlogs"],
    queryFn: async () => (await api.get("/admin/vlogs")).data,
    enabled: !!authUser && (userType === "ADMIN" || userType === "SUPER_ADMIN"),
  });

  const { data: doctorsData } = useQuery({
    queryKey: ["admin-doctors-dropdown"],
    queryFn: async () => (await api.get("/doctors?size=100")).data,
    enabled: !!authUser && (userType === "ADMIN" || userType === "SUPER_ADMIN"),
  });

  const doctors = doctorsData?.content || [];

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingVlog) {
        return (await api.put(`/admin/vlogs/${editingVlog.id}`, data)).data;
      } else {
        return (await api.post("/admin/vlogs", data)).data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vlogs"] });
      toast.success(editingVlog ? "Vlog updated successfully!" : "Vlog created successfully!");
      setIsSheetOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to save vlog.");
    }
  });

  const quickUpdateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string, payload: any }) => {
      return (await api.put(`/admin/vlogs/${id}`, payload)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vlogs"] });
      toast.success("Vlog status updated!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to update vlog status.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/vlogs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vlogs"] });
      toast.success("Vlog deleted successfully.");
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete vlog.")
  });

  const resetForm = () => {
    setEditingVlog(null);
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      videoUrl: "",
      thumbnailUrl: "",
      category: "Health Tips",
      authorDoctorId: "",
      isPublished: false,
      isFeatured: false
    });
  };

  const handleEdit = (vlog: any) => {
    setEditingVlog(vlog);
    setFormData({
      title: vlog.title || "",
      excerpt: vlog.excerpt || "",
      content: vlog.content || "",
      videoUrl: vlog.videoUrl || "",
      thumbnailUrl: vlog.thumbnailUrl || "",
      category: vlog.category || "Health Tips",
      authorDoctorId: vlog.authorDoctorId || "",
      isPublished: vlog.isPublished || false,
      isFeatured: vlog.isFeatured || false
    });
    setIsSheetOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error("Title and Content are required.");
      return;
    }
    if (!formData.authorDoctorId) {
      toast.error("Author Doctor is required.");
      return;
    }
    if (formData.isPublished && !formData.thumbnailUrl) {
      toast.error("Thumbnail is required to publish a vlog. Save as draft instead, or upload a thumbnail.");
      return;
    }
    saveMutation.mutate(formData);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingImage(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      
      const response = await api.post("/admin/vlogs/upload-thumbnail", uploadData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setFormData(prev => ({ ...prev, thumbnailUrl: response.data.url }));
      toast.success("Thumbnail uploaded successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || "Thumbnail upload failed.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleQuickTogglePublish = (vlog: any) => {
    const nextPublished = !vlog.isPublished;
    if (nextPublished && !vlog.thumbnailUrl) {
      toast.error("Thumbnail is required to publish a vlog.");
      return;
    }

    const payload = {
      title: vlog.title,
      excerpt: vlog.excerpt,
      content: vlog.content,
      category: vlog.category,
      videoUrl: vlog.videoUrl,
      thumbnailUrl: vlog.thumbnailUrl,
      isPublished: nextPublished,
      isFeatured: vlog.isFeatured,
      authorDoctorId: vlog.authorDoctorId
    };

    quickUpdateMutation.mutate({ id: vlog.id, payload });
  };

  const filteredVlogs = (vlogs || []).filter((vlog: any) => {
    if (categoryFilter !== "all" && vlog.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return vlog.title?.toLowerCase().includes(q) || 
             vlog.doctorName?.toLowerCase().includes(q) ||
             vlog.category?.toLowerCase().includes(q);
    }
    return true;
  });

  if (authLoading || isVlogsLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#E8593C]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Video className="text-[#E8593C]" /> Vlogs & Blogs
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Manage health tip video vlogs, category tags, and feature flags.</p>
        </div>
        <Button 
          onClick={() => { resetForm(); setIsSheetOpen(true); }}
          className="bg-[#E8593C] hover:bg-[#D0482B] text-white font-bold h-11 px-5 rounded-xl shadow-sm transition-all"
        >
          <Plus className="mr-2 h-5 w-5" /> Add New Vlog
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-gray-200">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input 
            placeholder="Search by title, doctor name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 border-gray-200 rounded-lg focus-visible:ring-[#E8593C]"
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val || "all")}>
          <SelectTrigger className="w-full sm:w-[180px] h-10 border-gray-200 rounded-lg">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="rounded-lg">
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider font-bold">
                <th className="p-4 font-bold w-20">Preview</th>
                <th className="p-4 font-bold">Vlog Info</th>
                <th className="p-4 font-bold">Category</th>
                <th className="p-4 font-bold">Author</th>
                <th className="p-4 font-bold">Views</th>
                <th className="p-4 font-bold">Featured</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredVlogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-gray-400 font-medium">
                    No vlogs found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredVlogs.map((vlog: any) => (
                  <tr key={vlog.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4">
                      <div className="w-16 h-11 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center shrink-0 border border-gray-100 relative">
                        {vlog.thumbnailUrl ? (
                          <img src={vlog.thumbnailUrl} alt="thumbnail" className="w-full h-full object-cover" />
                        ) : (
                          <PlaySquare className="text-gray-400 w-5 h-5" />
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-gray-900 max-w-xs">
                      <div className="line-clamp-1">{vlog.title}</div>
                      <div className="text-[11px] text-gray-400 font-medium mt-0.5 flex items-center gap-1">
                        <Calendar size={11} /> {new Date(vlog.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="font-bold border-gray-200 text-gray-600 bg-gray-50/50">
                        {vlog.category}
                      </Badge>
                    </td>
                    <td className="p-4 text-gray-700 font-medium">
                      Dr. {vlog.doctorName || "Unknown"}
                    </td>
                    <td className="p-4 font-semibold text-gray-500 flex items-center gap-1 h-14">
                      <Eye size={14} className="text-gray-400" /> {vlog.viewsCount || 0}
                    </td>
                    <td className="p-4">
                      {vlog.isFeatured ? (
                        <Badge className="bg-amber-500 text-white font-extrabold flex gap-1 w-max items-center">
                          <Sparkles size={10} /> Featured
                        </Badge>
                      ) : (
                        <span className="text-xs text-gray-400 font-semibold">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={vlog.isPublished}
                          disabled={quickUpdateMutation.isPending}
                          onCheckedChange={() => handleQuickTogglePublish(vlog)}
                          className="data-[state=checked]:bg-[#0D9373]"
                        />
                        <Badge className={cn("text-[10px] font-black uppercase tracking-wider", vlog.isPublished ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-50 text-gray-500 border border-gray-200")}>
                          {vlog.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(vlog)} className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Edit size={15} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(vlog.id)} className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto sm:max-w-md border-l-0 rounded-l-2xl shadow-2xl p-0 flex flex-col">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <SheetHeader>
              <SheetTitle className="text-xl font-bold text-gray-900">{editingVlog ? "Edit Vlog/Blog" : "Add New Vlog"}</SheetTitle>
              <SheetDescription>Publish and review health vlogs, short tips, or articles linked to doctors.</SheetDescription>
            </SheetHeader>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 flex-1 flex flex-col gap-5">
            <div className="space-y-1.5">
              <Label className="font-bold text-gray-800 text-xs uppercase tracking-wider">Vlog Title *</Label>
              <Input 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                placeholder="e.g. 5 Science-Backed Benefits of Daily Exercise"
                className="h-10 border-gray-200 focus-visible:ring-[#E8593C] rounded-lg font-medium"
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <Label className="font-bold text-gray-800 text-xs uppercase tracking-wider">Author Doctor *</Label>
              <Select 
                value={formData.authorDoctorId} 
                onValueChange={(val) => setFormData({...formData, authorDoctorId: val || ""})}
              >
                <SelectTrigger className="h-10 border-gray-200 rounded-lg">
                  <SelectValue placeholder="Select Doctor..." />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  {doctors.map((doc: any) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      Dr. {doc.name} ({doc.specialization})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-bold text-gray-800 text-xs uppercase tracking-wider">Category *</Label>
                <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val || "Health Tips"})}>
                  <SelectTrigger className="h-10 border-gray-200 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-gray-800 text-xs uppercase tracking-wider">Video URL (YouTube)</Label>
                <Input 
                  value={formData.videoUrl} 
                  onChange={e => setFormData({...formData, videoUrl: e.target.value})} 
                  placeholder="https://youtube.com/watch?v=..."
                  className="h-10 border-gray-200 focus-visible:ring-[#E8593C] rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-gray-800 text-xs uppercase tracking-wider">Thumbnail Image</Label>
              <div className="flex gap-2 items-center">
                <Input 
                  value={formData.thumbnailUrl} 
                  onChange={e => setFormData({...formData, thumbnailUrl: e.target.value})} 
                  placeholder="https://example.com/thumbnail.jpg"
                  className="h-10 border-gray-200 focus-visible:ring-[#E8593C] rounded-lg flex-1"
                />
                <div className="relative shrink-0">
                  <input 
                    type="file" 
                    id="admin-thumbnail-upload" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    disabled={uploadingImage}
                  />
                  <Button 
                    type="button"
                    variant="outline" 
                    className="h-10 font-bold rounded-lg border-gray-200"
                    onClick={() => document.getElementById('admin-thumbnail-upload')?.click()}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin text-gray-500" /> : "Upload"}
                  </Button>
                </div>
              </div>
              {formData.thumbnailUrl && (
                <div className="mt-1 w-24 h-14 rounded-lg overflow-hidden border border-gray-200">
                  <img src={formData.thumbnailUrl} alt="uploaded preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-gray-800 text-xs uppercase tracking-wider">Excerpt (Max 200 chars) *</Label>
              <Textarea 
                value={formData.excerpt} 
                onChange={e => setFormData({...formData, excerpt: e.target.value})} 
                placeholder="Write a short summary shown on the card..."
                maxLength={200}
                className="min-h-[60px] border-gray-200 focus-visible:ring-[#E8593C] rounded-lg"
              />
              <span className="text-[10px] text-gray-400 font-semibold block text-right">
                {formData.excerpt.length}/200 characters
              </span>
            </div>

            <div className="space-y-1.5 flex-1 flex flex-col">
              <Label className="font-bold text-gray-800 text-xs uppercase tracking-wider">Content Body *</Label>
              <Textarea 
                value={formData.content} 
                onChange={e => setFormData({...formData, content: e.target.value})} 
                placeholder="Write the full health guide or vlog body content here (HTML / Markdown supported)..."
                className="flex-1 min-h-[160px] border-gray-200 focus-visible:ring-[#E8593C] rounded-lg font-medium"
                required
              />
            </div>

            <div className="flex gap-6 items-center p-3 bg-gray-50 rounded-xl border border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <Switch 
                  checked={formData.isPublished}
                  onCheckedChange={(val) => setFormData({...formData, isPublished: val})}
                  className="data-[state=checked]:bg-[#0D9373]"
                />
                <Label className="font-bold text-gray-700 text-xs uppercase tracking-wider cursor-pointer">Publish Live</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch 
                  checked={formData.isFeatured}
                  onCheckedChange={(val) => setFormData({...formData, isFeatured: val})}
                  className="data-[state=checked]:bg-[#0D9373]"
                />
                <Label className="font-bold text-gray-700 text-xs uppercase tracking-wider cursor-pointer">Feature Post</Label>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end gap-2 shrink-0">
              <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)} className="rounded-lg font-bold h-10 px-5 border-gray-200">
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending} className="rounded-lg font-bold h-10 px-5 bg-[#E8593C] hover:bg-[#D0482B] text-white">
                {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingVlog ? "Save Vlog" : "Create Vlog"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 font-bold">Delete this Vlog?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the vlog and remove all associated views. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="rounded-lg font-bold border-gray-200">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
              className="rounded-lg font-bold bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
