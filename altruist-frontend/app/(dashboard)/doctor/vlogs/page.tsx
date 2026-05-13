"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Video, Eye, Plus, Edit, Trash2, Loader2, PlaySquare, Calendar, Globe, Lock
} from "lucide-react";
import api from "@/lib/axios";
import { supabase } from "@/lib/supabase";
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

const CATEGORIES = ["Health Tips", "Diet", "Mental Health", "General"];

export default function DoctorVlogManagement() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: authUser, userType, loading: authLoading } = useAuth();
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingVlog, setEditingVlog] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    thumbnailUrl: "",
    category: "Health Tips"
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!authLoading && !authUser) router.push("/login");
  }, [authUser, authLoading, router]);

  const { data: vlogs, isLoading } = useQuery({
    queryKey: ["my-vlogs"],
    queryFn: async () => (await api.get("/doctors/my/vlogs")).data,
    enabled: !!authUser && userType === "DOCTOR",
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingVlog) {
        await api.put(`/doctors/my/vlogs/${editingVlog.id}`, data);
      } else {
        await api.post("/doctors/my/vlogs", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-vlogs"] });
      toast.success(editingVlog ? "Vlog updated successfully" : "Vlog created successfully");
      setIsSheetOpen(false);
      resetForm();
    },
    onError: () => toast.error("Failed to save vlog")
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, isPublished }: { id: string, isPublished: boolean }) => {
      if (isPublished) {
        await api.post(`/doctors/my/vlogs/${id}/unpublish`);
      } else {
        await api.post(`/doctors/my/vlogs/${id}/publish`);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["my-vlogs"] });
      toast.success(variables.isPublished ? "Vlog changed to draft" : "Vlog published successfully");
    },
    onError: () => toast.error("Failed to change publish status")
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/doctors/my/vlogs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-vlogs"] });
      toast.success("Vlog deleted successfully");
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete vlog")
  });

  const resetForm = () => {
    setEditingVlog(null);
    setFormData({ title: "", description: "", videoUrl: "", thumbnailUrl: "", category: "Health Tips" });
  };

  const handleEdit = (vlog: any) => {
    setEditingVlog(vlog);
    setFormData({
      title: vlog.title || "",
      description: vlog.description || "",
      videoUrl: vlog.videoUrl || "",
      thumbnailUrl: vlog.thumbnailUrl || "",
      category: vlog.category || "Health Tips"
    });
    setIsSheetOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.videoUrl) {
      toast.error("Title and Video URL are required");
      return;
    }
    saveMutation.mutate(formData);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingImage(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${authUser?.uid || Date.now()}-thumb-${Math.random().toString(36).slice(2)}.${ext}`;
      
      const { error } = await supabase.storage
        .from('vlogs')
        .upload(fileName, file, { upsert: false });
        
      if (error) throw error;
      
      const { data: urlData } = supabase.storage
        .from('vlogs')
        .getPublicUrl(fileName);
        
      setFormData(prev => ({ ...prev, thumbnailUrl: urlData.publicUrl }));
      toast.success("Thumbnail uploaded successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Thumbnail upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50/50"><Loader2 className="w-10 h-10 animate-spin text-[#00A87E]" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-50/50 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-slate-900 tracking-tight">Vlog Studio</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your health videos and insights.</p>
        </div>
        <Button 
          onClick={() => { resetForm(); setIsSheetOpen(true); }}
          className="bg-[#00A87E] hover:bg-[#007A5C] text-white font-bold h-12 px-6 rounded-xl shadow-md active:scale-95 transition-all"
        >
          <Plus className="mr-2 h-5 w-5" /> Create New Vlog
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-bold">
                <th className="p-5 font-bold">Vlog Content</th>
                <th className="p-5 font-bold">Category</th>
                <th className="p-5 font-bold">Visibility</th>
                <th className="p-5 font-bold">Performance</th>
                <th className="p-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto" /></td>
                </tr>
              ) : !vlogs || vlogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300 mb-4">
                      <Video size={32} />
                    </div>
                    <p className="text-lg font-bold text-slate-900 mb-1">No vlogs found</p>
                    <p className="text-slate-500 font-medium">Create your first vlog to share your medical expertise.</p>
                  </td>
                </tr>
              ) : (
                vlogs.map((vlog: any) => (
                  <tr key={vlog.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-14 bg-slate-900 rounded-lg overflow-hidden shrink-0 relative flex items-center justify-center">
                          {vlog.thumbnailUrl ? (
                            <img src={vlog.thumbnailUrl} alt="thumbnail" className="w-full h-full object-cover opacity-80" />
                          ) : (
                            <PlaySquare className="text-slate-500" size={20} />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 line-clamp-1">{vlog.title}</p>
                          <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1">
                            <Calendar size={12} /> {new Date(vlog.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <Badge variant="outline" className="font-bold border-slate-200 text-slate-600 bg-white">
                        {vlog.category || "General"}
                      </Badge>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <Switch 
                          checked={vlog.isPublished}
                          disabled={togglePublishMutation.isPending}
                          onCheckedChange={() => togglePublishMutation.mutate({ id: vlog.id, isPublished: vlog.isPublished })}
                          className="data-[state=checked]:bg-[#00A87E]"
                        />
                        <span className="text-xs font-bold flex items-center gap-1 w-20">
                          {vlog.isPublished ? <><Globe size={12} className="text-[#00A87E]" /> <span className="text-[#00A87E]">Public</span></> : <><Lock size={12} className="text-slate-400" /> <span className="text-slate-500">Draft</span></>}
                        </span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-1.5 text-slate-600 font-bold text-sm">
                        <Eye size={16} className="text-slate-400" /> {vlog.viewsCount || 0}
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(vlog)} className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Edit size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(vlog.id)} className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 size={16} />
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

      {/* Sheet Form */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto sm:max-w-md border-l-0 rounded-l-3xl shadow-2xl p-0 flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <SheetHeader>
              <SheetTitle className="font-heading text-2xl font-bold">{editingVlog ? "Edit Vlog" : "Create New Vlog"}</SheetTitle>
              <SheetDescription>Upload your health insights to educate patients.</SheetDescription>
            </SheetHeader>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 flex-1 flex flex-col gap-6">
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Vlog Title *</Label>
              <Input 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                placeholder="e.g. Top 5 ways to reduce anxiety"
                className="h-11 focus-visible:ring-[#00A87E] rounded-xl"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Category</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v || "Health Tips"})}>
                <SelectTrigger className="h-11 focus:ring-[#00A87E] rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Video URL (YouTube) *</Label>
              <Input 
                value={formData.videoUrl} 
                onChange={e => setFormData({...formData, videoUrl: e.target.value})} 
                placeholder="https://youtube.com/watch?v=..."
                className="h-11 focus-visible:ring-[#00A87E] rounded-xl"
                required
              />
              <p className="text-[10px] text-slate-400 font-medium">Standard YouTube links will automatically be embedded in the public directory.</p>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Thumbnail Image (Optional)</Label>
              <div className="flex gap-2 items-center">
                <Input 
                  value={formData.thumbnailUrl} 
                  onChange={e => setFormData({...formData, thumbnailUrl: e.target.value})} 
                  placeholder="https://example.com/image.jpg"
                  className="h-11 focus-visible:ring-[#00A87E] rounded-xl flex-1"
                />
                <div className="relative shrink-0">
                  <input 
                    type="file" 
                    id="thumbnail-upload" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    disabled={uploadingImage}
                  />
                  <Button 
                    type="button"
                    variant="outline" 
                    className="h-11 font-bold rounded-xl border-slate-300"
                    onClick={() => document.getElementById('thumbnail-upload')?.click()}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Description</Label>
              <Textarea 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                placeholder="Write a brief summary of the video content..."
                className="min-h-[120px] focus-visible:ring-[#00A87E] rounded-xl"
              />
            </div>

            <div className="mt-auto pt-6 border-t border-slate-100 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)} className="rounded-xl font-bold h-11 px-6 border-slate-200">
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending} className="rounded-xl font-bold h-11 px-6 bg-[#00A87E] hover:bg-[#007A5C]">
                {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingVlog ? "Update Vlog" : "Create Vlog"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Delete this vlog?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the video from the public directory. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="rounded-xl font-bold border-slate-200">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
              className="rounded-xl font-bold bg-red-600 hover:bg-red-700"
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
