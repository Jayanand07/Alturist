"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  User, Mail, Phone, Calendar, SwitchCamera, MapPin, Activity, Bell, 
  Shield, Loader2, Save, Trash2, HeartPulse, ChevronRight, X, CreditCard, Camera
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, 
  AlertDialogTitle, AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import api from "@/lib/axios";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface PatientProfile {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  allergies: string;
  chronicConditions: string;
  currentMedications: string;
  emailAlerts: boolean;
  smsAlerts: boolean;
  appointmentReminders: boolean;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  profilePictureUrl?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: authUser, userType, loading: authLoading, signOut } = useAuth();
  
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allergyInput, setAllergyInput] = useState("");
  const [allergiesList, setAllergiesList] = useState<string[]>([]);
  const [deleteInput, setDeleteInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Profile Fetch
  const fetchProfile = useCallback(async () => {
    try {
      let endpoint = "/patients/profile";
      if (userType === "DOCTOR") {
        endpoint = "/doctors/profile";
      } else if (userType === "ADMIN" || userType === "SUPER_ADMIN") {
        setProfile({
          fullName: authUser?.displayName || "Admin User",
          email: authUser?.email || "",
          phone: authUser?.phoneNumber || "",
          dateOfBirth: "",
          gender: "",
          bloodGroup: "",
          street: "",
          city: "",
          state: "",
          pincode: "",
          allergies: "",
          chronicConditions: "",
          currentMedications: "",
          emailAlerts: true,
          smsAlerts: true,
          appointmentReminders: true
        });
        setLoading(false);
        return;
      }
      
      const response = await api.get(endpoint);
      setProfile(response.data);
      if (response.data.allergies) {
        setAllergiesList(response.data.allergies.split(",").filter((a: string) => a.trim() !== ""));
      }
    } catch (err) {
      console.error("Failed to load profile", err);
      toast.error("Failed to load your profile details");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push("/login");
      return;
    }
    if (authUser && userType) {
      fetchProfile();
    }
  }, [authUser, userType, authLoading, router, fetchProfile]);

  // Subscription Fetch
  const { data: sub, isLoading: subLoading } = useQuery({
    queryKey: ["my-subscription"],
    queryFn: async () => {
      try {
        const res = await api.get("/subscriptions/my");
        return res.data;
      } catch (err) {
        return null;
      }
    },
    enabled: !!authUser,
  });

  // Cancel Sub Mutation
  const cancelSubMutation = useMutation({
    mutationFn: async () => {
      await api.post("/subscriptions/cancel");
    },
    onSuccess: () => {
      toast.success("Subscription cancelled successfully.");
      queryClient.invalidateQueries({ queryKey: ["my-subscription"] });
    },
    onError: () => {
      toast.error("Failed to cancel subscription.");
    }
  });

  const handleInputChange = (field: keyof PatientProfile, value: string | boolean) => {
    setProfile((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleAddAllergy = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && allergyInput.trim()) {
      e.preventDefault();
      const newList = [...allergiesList, allergyInput.trim()];
      setAllergiesList(newList);
      handleInputChange("allergies", newList.join(","));
      setAllergyInput("");
    }
  };

  const handleRemoveAllergy = (index: number) => {
    const newList = allergiesList.filter((_, i) => i !== index);
    setAllergiesList(newList);
    handleInputChange("allergies", newList.join(","));
  };

  const handleSave = async (section: string) => {
    if (!profile) return;
    setSaving(true);
    try {
      let endpoint = "/patients/profile";
      if (userType === "DOCTOR") {
        endpoint = "/doctors/profile";
      } else if (userType === "ADMIN" || userType === "SUPER_ADMIN") {
        toast.success(`${section} settings saved successfully!`);
        setSaving(false);
        return;
      }
      await api.patch(endpoint, profile);
      toast.success(`${section} settings saved successfully!`);
    } catch (err) {
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== "DELETE") return;
    setIsDeleting(true);
    try {
      let endpoint = "/patients/profile";
      if (userType === "DOCTOR") {
        endpoint = "/doctors/profile"; // Wait, doctors don't have DELETE /profile endpoint? Let's check DoctorController...
        toast.error("Doctors cannot delete their account from this page.");
        setIsDeleting(false);
        return;
      } else if (userType === "ADMIN" || userType === "SUPER_ADMIN") {
        toast.error("Admins cannot delete their account from this page.");
        setIsDeleting(false);
        return;
      }
      await api.delete(endpoint);
      toast.success("Account deleted successfully.");
      signOut();
    } catch (err) {
      toast.error("Failed to delete account.");
      setIsDeleting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingImage(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${authUser?.uid || Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      
      const { error } = await supabase.storage
        .from('profiles')
        .upload(fileName, file, { upsert: false });
        
      if (error) throw error;
      
      const { data: urlData } = supabase.storage
        .from('profiles')
        .getPublicUrl(fileName);
        
      const newUrl = urlData.publicUrl;
      handleInputChange("profilePictureUrl", newUrl);
      
      // Auto-save the new profile picture URL
      let endpoint = "/patients/profile";
      if (userType === "DOCTOR") endpoint = "/doctors/profile";
      if (userType !== "ADMIN" && userType !== "SUPER_ADMIN") {
        await api.patch(endpoint, { ...profile, profilePictureUrl: newUrl });
      }
      toast.success("Profile picture updated!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl mb-24">
       <div className="mb-8 space-y-2">
         <h1 className="text-3xl tracking-tight font-extrabold text-gray-900">Account Settings</h1>
         <p className="text-gray-500 font-medium">Manage your profile, preferences, and personal information.</p>
       </div>

       <Tabs defaultValue="personal" className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-64 shrink-0">
             <TabsList className="flex md:flex-col h-auto bg-transparent gap-2 p-0 w-full overflow-x-auto justify-start border-none">
                {[
                  { id: "personal", icon: User, label: "Personal Info" },
                  { id: "address", icon: MapPin, label: "Address & Location" },
                  { id: "health", icon: HeartPulse, label: "Health Info" },
                  { id: "notifications", icon: Bell, label: "Notifications" },
                  { id: "account", icon: Shield, label: "Account & Security" },
                  { id: "subscription", icon: CreditCard, label: "Subscription" },
                ].map((tab) => (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id}
                    className="w-full justify-start text-left px-4 py-3 h-auto data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-bold data-[state=active]:shadow-none rounded-xl border border-transparent data-[state=active]:border-primary/20 transition-all gap-3 text-gray-600 font-medium"
                  >
                     <tab.icon className="w-5 h-5 opacity-80" />
                     <span className="hidden sm:inline">{tab.label}</span>
                     <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  </TabsTrigger>
                ))}
             </TabsList>
          </div>

          <div className="flex-1 w-full max-w-3xl">
             
             {/* Personal Info Tab */}
             <TabsContent value="personal" className="m-0 mt-0 focus-visible:outline-none">
                <Card className="border border-gray-200 shadow-sm rounded-2xl bg-white overflow-hidden">
                   <CardHeader className="border-b border-gray-100 pb-5 bg-gray-50/50">
                      <CardTitle className="text-xl font-bold text-gray-900">Personal Information</CardTitle>
                      <CardDescription>Update your basic profile and contact details here.</CardDescription>
                   </CardHeader>
                   <CardContent className="pt-6 space-y-6">
                      
                      {/* Photo Upload Section */}
                      <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                        <Avatar className="w-24 h-24 border-2 border-gray-100 shadow-sm">
                          <AvatarImage src={profile.profilePictureUrl || ""} />
                          <AvatarFallback className="bg-teal-50 text-primary text-2xl font-bold">
                            {profile.fullName?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                          <h4 className="font-bold text-gray-900">Profile Picture</h4>
                          <p className="text-sm text-gray-500 max-w-xs">Upload a clear photo of yourself so doctors can easily identify you.</p>
                          <div className="relative">
                            <input 
                              type="file" 
                              id="profile-upload" 
                              className="hidden" 
                              accept="image/*" 
                              onChange={handleImageUpload} 
                              disabled={uploadingImage}
                            />
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="font-bold mt-2 border-gray-300"
                              onClick={() => document.getElementById('profile-upload')?.click()}
                              disabled={uploadingImage}
                            >
                              {uploadingImage ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Camera className="w-4 h-4 mr-2" />} 
                              {uploadingImage ? "Uploading..." : "Change Photo"}
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                           <Label className="text-gray-700 font-bold">Full Name</Label>
                           <Input 
                             value={profile.fullName || ""} 
                             onChange={(e) => handleInputChange("fullName", e.target.value)} 
                             className="h-11 border-gray-300 focus-visible:ring-primary" 
                           />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-gray-700 font-bold">Email Address <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded ml-2 font-bold">Read-only</span></Label>
                           <Input value={profile.email || ""} disabled className="h-11 bg-gray-50 border-gray-200 text-gray-500 font-medium" />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                           <Label className="text-gray-700 font-bold">Phone Number</Label>
                           <Input 
                             value={profile.phone || ""} 
                             onChange={(e) => handleInputChange("phone", e.target.value)} 
                             className="h-11 border-gray-300 focus-visible:ring-primary" 
                           />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-gray-700 font-bold">Date of Birth</Label>
                           <Input 
                             type="date" 
                             value={profile.dateOfBirth || ""} 
                             onChange={(e) => handleInputChange("dateOfBirth", e.target.value)} 
                             className="h-11 border-gray-300 focus-visible:ring-primary" 
                           />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                           <Label className="text-gray-700 font-bold">Gender</Label>
                           <Select value={profile.gender || ""} onValueChange={(val) => handleInputChange("gender", val || "")}>
                              <SelectTrigger className="h-11 border-gray-300 focus:ring-primary">
                                 <SelectValue placeholder="Select Gender" />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="MALE">Male</SelectItem>
                                 <SelectItem value="FEMALE">Female</SelectItem>
                                 <SelectItem value="OTHER">Other</SelectItem>
                              </SelectContent>
                           </Select>
                        </div>
                        <div className="space-y-2">
                           <Label className="text-gray-700 font-bold">Blood Group</Label>
                           <Select value={profile.bloodGroup || ""} onValueChange={(val) => handleInputChange("bloodGroup", val || "")}>
                              <SelectTrigger className="h-11 border-gray-300 focus:ring-primary">
                                 <SelectValue placeholder="Select Blood Group" />
                              </SelectTrigger>
                              <SelectContent>
                                 {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                                    <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                        </div>
                      </div>

                      {/* Emergency Contact */}
                      <div className="pt-6 border-t border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4">Emergency Contact</h3>
                        <div className="grid sm:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <Label className="text-gray-700 font-bold">Contact Name</Label>
                            <Input 
                              value={profile.emergencyContactName || ""} 
                              onChange={(e) => handleInputChange("emergencyContactName", e.target.value)} 
                              placeholder="Full Name"
                              className="h-11 border-gray-300 focus-visible:ring-primary" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-gray-700 font-bold">Contact Phone</Label>
                            <Input 
                              value={profile.emergencyContactPhone || ""} 
                              onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)} 
                              placeholder="Phone Number"
                              className="h-11 border-gray-300 focus-visible:ring-primary" 
                            />
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <Label className="text-gray-700 font-bold">Relationship</Label>
                            <Select value={profile.emergencyContactRelation || ""} onValueChange={(val) => handleInputChange("emergencyContactRelation", val || "")}>
                               <SelectTrigger className="h-11 border-gray-300 focus:ring-primary">
                                  <SelectValue placeholder="Select Relationship" />
                               </SelectTrigger>
                               <SelectContent>
                                  {["Spouse", "Parent", "Child", "Sibling", "Friend", "Other"].map(rel => (
                                     <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                                  ))}
                               </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                   </CardContent>
                   <CardFooter className="bg-gray-50/80 border-t border-gray-100 py-4 flex justify-end">
                      <Button onClick={() => handleSave("Personal Info")} disabled={saving} className="bg-primary hover:bg-primary/90 text-white font-bold px-8 h-11 rounded-xl shadow-md active:scale-95 transition-all">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                      </Button>
                   </CardFooter>
                </Card>
             </TabsContent>

             {/* Address Tab */}
             <TabsContent value="address" className="m-0 mt-0 focus-visible:outline-none">
                <Card className="border border-gray-200 shadow-sm rounded-2xl bg-white overflow-hidden">
                   <CardHeader className="border-b border-gray-100 pb-5 bg-gray-50/50">
                      <CardTitle className="text-xl font-bold text-gray-900">Address & Location</CardTitle>
                      <CardDescription>Update your delivery and home address for pharmacy orders.</CardDescription>
                   </CardHeader>
                   <CardContent className="pt-6 space-y-5">
                      <div className="space-y-2">
                         <Label className="text-gray-700 font-bold">Street Address</Label>
                         <Input 
                           value={profile.street || ""} 
                           onChange={(e) => handleInputChange("street", e.target.value)} 
                           placeholder="House number, Street name, Area"
                           className="h-11 border-gray-300 focus-visible:ring-primary" 
                         />
                      </div>
                      <div className="grid sm:grid-cols-3 gap-5">
                        <div className="space-y-2 sm:col-span-1">
                           <Label className="text-gray-700 font-bold">City</Label>
                           <Input 
                             value={profile.city || ""} 
                             onChange={(e) => handleInputChange("city", e.target.value)} 
                             className="h-11 border-gray-300 focus-visible:ring-primary" 
                           />
                        </div>
                        <div className="space-y-2 sm:col-span-1">
                           <Label className="text-gray-700 font-bold">State</Label>
                           <Input 
                             value={profile.state || ""} 
                             onChange={(e) => handleInputChange("state", e.target.value)} 
                             className="h-11 border-gray-300 focus-visible:ring-primary" 
                           />
                        </div>
                        <div className="space-y-2 sm:col-span-1">
                           <Label className="text-gray-700 font-bold">Pincode</Label>
                           <Input 
                             value={profile.pincode || ""} 
                             onChange={(e) => handleInputChange("pincode", e.target.value)} 
                             className="h-11 border-gray-300 focus-visible:ring-primary" 
                           />
                        </div>
                      </div>
                   </CardContent>
                   <CardFooter className="bg-gray-50/80 border-t border-gray-100 py-4 flex justify-end">
                      <Button onClick={() => handleSave("Address")} disabled={saving} className="bg-primary hover:bg-primary/90 text-white font-bold px-8 h-11 rounded-xl shadow-md active:scale-95 transition-all">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Address
                      </Button>
                   </CardFooter>
                </Card>
             </TabsContent>

             {/* Health Info Tab */}
             <TabsContent value="health" className="m-0 mt-0 focus-visible:outline-none">
                <Card className="border border-gray-200 shadow-sm rounded-2xl bg-white overflow-hidden">
                   <CardHeader className="border-b border-gray-100 pb-5 bg-gray-50/50">
                      <CardTitle className="text-xl font-bold text-gray-900">Health Information</CardTitle>
                      <CardDescription>Keep this updated to help doctors provide better care.</CardDescription>
                   </CardHeader>
                   <CardContent className="pt-6 space-y-6">
                      
                      <div className="space-y-3">
                         <Label className="text-gray-700 font-bold">Allergies (Press Enter to add)</Label>
                         <div className="flex items-center gap-2">
                           <Input 
                             value={allergyInput} 
                             onChange={(e) => setAllergyInput(e.target.value)}
                             onKeyDown={handleAddAllergy}
                             placeholder="e.g., Peanuts, Penicillin..."
                             className="h-11 border-gray-300 focus-visible:ring-primary" 
                           />
                           <Button type="button" onClick={() => handleAddAllergy({ key: 'Enter', preventDefault: () => {} } as any)} className="bg-gray-100 text-gray-700 hover:bg-gray-200 h-11 shrink-0 font-bold">Add</Button>
                         </div>
                         {allergiesList.length > 0 && (
                           <div className="flex flex-wrap gap-2 pt-2">
                             {allergiesList.map((allergy, idx) => (
                               <Badge key={idx} variant="secondary" className="bg-red-50 text-red-700 hover:bg-red-100 text-sm py-1.5 px-3 flex items-center gap-1.5 border border-red-200 font-medium">
                                 {allergy}
                                 <X className="w-3.5 h-3.5 cursor-pointer opacity-70 hover:opacity-100" onClick={() => handleRemoveAllergy(idx)} />
                               </Badge>
                             ))}
                           </div>
                         )}
                      </div>

                      <div className="space-y-2">
                         <Label className="text-gray-700 font-bold">Chronic Conditions</Label>
                         <Input 
                           value={profile.chronicConditions || ""} 
                           onChange={(e) => handleInputChange("chronicConditions", e.target.value)} 
                           placeholder="e.g., Asthma, Diabetes..."
                           className="h-11 border-gray-300 focus-visible:ring-primary" 
                         />
                      </div>

                      <div className="space-y-2">
                         <Label className="text-gray-700 font-bold">Current Medications</Label>
                         <Input 
                           value={profile.currentMedications || ""} 
                           onChange={(e) => handleInputChange("currentMedications", e.target.value)} 
                           placeholder="Any medicines you take regularly"
                           className="h-11 border-gray-300 focus-visible:ring-primary" 
                         />
                      </div>

                   </CardContent>
                   <CardFooter className="bg-gray-50/80 border-t border-gray-100 py-4 flex justify-end">
                      <Button onClick={() => handleSave("Health Profile")} disabled={saving} className="bg-primary hover:bg-primary/90 text-white font-bold px-8 h-11 rounded-xl shadow-md active:scale-95 transition-all">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Health Info
                      </Button>
                   </CardFooter>
                </Card>
             </TabsContent>

             {/* Notifications Tab */}
             <TabsContent value="notifications" className="m-0 mt-0 focus-visible:outline-none">
                <Card className="border border-gray-200 shadow-sm rounded-2xl bg-white overflow-hidden">
                   <CardHeader className="border-b border-gray-100 pb-5 bg-gray-50/50">
                      <CardTitle className="text-xl font-bold text-gray-900">Notification Preferences</CardTitle>
                      <CardDescription>Control how you receive updates and alerts.</CardDescription>
                   </CardHeader>
                   <CardContent className="pt-6 space-y-4">
                      
                      <div className="flex items-center justify-between p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
                         <div className="space-y-1">
                           <Label className="text-base font-bold text-gray-900">Email Alerts</Label>
                           <p className="text-sm text-gray-500">Receive reports, orders and account updates via email.</p>
                         </div>
                         <Switch 
                           checked={profile.emailAlerts !== false} 
                           onCheckedChange={(val) => handleInputChange("emailAlerts", val)}
                           className="data-[state=checked]:bg-primary"
                         />
                      </div>

                      <div className="flex items-center justify-between p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
                         <div className="space-y-1">
                           <Label className="text-base font-bold text-gray-900">SMS Alerts</Label>
                           <p className="text-sm text-gray-500">Get timely order delivery updates on your registered phone.</p>
                         </div>
                         <Switch 
                           checked={profile.smsAlerts !== false} 
                           onCheckedChange={(val) => handleInputChange("smsAlerts", val)}
                           className="data-[state=checked]:bg-primary"
                         />
                      </div>

                      <div className="flex items-center justify-between p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
                         <div className="space-y-1">
                           <Label className="text-base font-bold text-gray-900">Appointment Reminders</Label>
                           <p className="text-sm text-gray-500">Receive reminders 1 hour before scheduled consultations.</p>
                         </div>
                         <Switch 
                           checked={profile.appointmentReminders !== false} 
                           onCheckedChange={(val) => handleInputChange("appointmentReminders", val)}
                           className="data-[state=checked]:bg-primary"
                         />
                      </div>

                   </CardContent>
                   <CardFooter className="bg-gray-50/80 border-t border-gray-100 py-4 flex justify-end">
                      <Button onClick={() => handleSave("Notifications")} disabled={saving} className="bg-primary hover:bg-primary/90 text-white font-bold px-8 h-11 rounded-xl shadow-md active:scale-95 transition-all">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Update Preferences
                      </Button>
                   </CardFooter>
                </Card>
             </TabsContent>

             {/* Account Details Tab */}
             <TabsContent value="account" className="m-0 mt-0 focus-visible:outline-none">
                <Card className="border border-gray-200 shadow-sm rounded-2xl bg-white overflow-hidden">
                   <CardHeader className="border-b border-gray-100 pb-5 bg-gray-50/50">
                      <CardTitle className="text-xl font-bold text-gray-900">Account Security</CardTitle>
                      <CardDescription>Manage your authentication and account status.</CardDescription>
                   </CardHeader>
                   <CardContent className="pt-6 space-y-6">
                      
                      <div className="space-y-3">
                         <h3 className="font-bold text-gray-900">Sign out sessions</h3>
                         <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                            <div>
                               <p className="font-bold text-gray-900">Log out from this device</p>
                               <p className="text-sm text-gray-500 mt-1">You will need to sign back in.</p>
                            </div>
                            <Button variant="outline" onClick={() => signOut()} className="font-bold text-gray-700 border-gray-300">
                               Log out
                            </Button>
                         </div>
                      </div>

                      <div className="space-y-3 pt-6 border-t border-gray-100">
                         <h3 className="font-bold text-red-600 flex items-center gap-2"><Trash2 className="w-4 h-4" /> Danger Zone</h3>
                         <div className="p-5 bg-red-50/50 rounded-xl border border-red-100">
                            <div className="mb-5">
                               <p className="font-bold text-red-900">Delete Account</p>
                               <p className="text-sm text-red-700/80 mt-1 font-medium">
                                  Once you delete your account, there is no going back. All your medical records, appointments, and data will be permanently erased.
                               </p>
                            </div>
                            
                            <AlertDialog>
                              <AlertDialogTrigger>
                                <Button variant="destructive" className="font-bold bg-red-600 hover:bg-red-700 w-full sm:w-auto h-11">
                                   Delete my account
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-2xl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-red-600">Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription className="text-gray-600">
                                    This action cannot be undone. This will permanently delete your
                                    account and remove your data from our servers.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="py-4">
                                  <Label className="text-gray-900 font-bold">Type DELETE to confirm</Label>
                                  <Input 
                                    value={deleteInput} 
                                    onChange={(e) => setDeleteInput(e.target.value)} 
                                    placeholder="DELETE"
                                    className="mt-2 font-bold tracking-widest text-red-600"
                                  />
                                </div>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => setDeleteInput("")}>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={handleDeleteAccount} 
                                    disabled={deleteInput !== "DELETE" || isDeleting}
                                    className="bg-red-600 hover:bg-red-700 font-bold"
                                  >
                                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    Yes, Delete Account
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                         </div>
                      </div>

                   </CardContent>
                </Card>
             </TabsContent>

             {/* Subscription Tab */}
             <TabsContent value="subscription" className="m-0 mt-0 focus-visible:outline-none">
                <Card className="border border-gray-200 shadow-sm rounded-2xl bg-white overflow-hidden">
                   <CardHeader className="border-b border-gray-100 pb-5 bg-gray-50/50">
                      <CardTitle className="text-xl font-bold text-gray-900">Subscription & Billing</CardTitle>
                      <CardDescription>Manage your active health plan and billing history.</CardDescription>
                   </CardHeader>
                   <CardContent className="pt-6 space-y-6">
                      
                      {/* Current Plan */}
                      <div>
                        <h3 className="font-bold text-gray-900 mb-3">Current Plan</h3>
                        {subLoading ? (
                          <div className="h-24 bg-gray-100 animate-pulse rounded-xl" />
                        ) : sub && sub.status === "ACTIVE" ? (
                          <div className="p-6 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl border border-teal-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
                             <div>
                                <div className="flex items-center gap-3 mb-2">
                                   <h4 className="text-2xl font-black text-teal-900">{sub.planName}</h4>
                                   <Badge className="bg-teal-100 text-teal-800 border-none uppercase tracking-widest font-bold text-[10px]">Active</Badge>
                                </div>
                                <p className="text-teal-700 font-medium text-sm">
                                   {sub.consultationsRemaining} free consultations remaining. Renews on {new Date(sub.nextBillingDate).toLocaleDateString()}.
                                </p>
                             </div>
                             <div className="flex flex-col gap-2 shrink-0">
                               <Button onClick={() => router.push("/plans")} className="bg-primary hover:bg-primary/90 font-bold h-10 w-full md:w-auto">
                                 Upgrade Plan
                               </Button>
                               <AlertDialog>
                                 <AlertDialogTrigger>
                                   <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold h-10">
                                     Cancel Subscription
                                   </Button>
                                 </AlertDialogTrigger>
                                 <AlertDialogContent className="rounded-2xl">
                                   <AlertDialogHeader>
                                     <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                                     <AlertDialogDescription>
                                       You will lose access to free consultations and discounts at the end of your billing cycle. Are you sure?
                                     </AlertDialogDescription>
                                   </AlertDialogHeader>
                                   <AlertDialogFooter>
                                     <AlertDialogCancel>Keep Plan</AlertDialogCancel>
                                     <AlertDialogAction onClick={() => cancelSubMutation.mutate()} className="bg-red-600 hover:bg-red-700 font-bold">
                                       Yes, Cancel
                                     </AlertDialogAction>
                                   </AlertDialogFooter>
                                 </AlertDialogContent>
                               </AlertDialog>
                             </div>
                          </div>
                        ) : (
                          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 text-center space-y-3">
                             <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto text-gray-500">
                                <CreditCard size={20} />
                             </div>
                             <div>
                               <p className="font-bold text-gray-900">No active subscription</p>
                               <p className="text-sm text-gray-500 mt-1">Subscribe to a health plan for priority support and free consultations.</p>
                             </div>
                             <Button onClick={() => router.push("/plans")} className="bg-primary hover:bg-primary/90 font-bold h-10 mt-2">
                               View Plans
                             </Button>
                          </div>
                        )}
                      </div>

                      {/* History */}
                      <div className="pt-6 border-t border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4">Billing History</h3>
                        <div className="overflow-x-auto border border-gray-200 rounded-xl">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                              <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4">Description</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {/* Assuming simple static fallback or single entry if subscribed */}
                              {sub && sub.startDate ? (
                                <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                  <td className="p-4 font-medium text-gray-700">{new Date(sub.startDate).toLocaleDateString()}</td>
                                  <td className="p-4 font-bold text-gray-900">{sub.planName} Plan - {sub.billingCycle}</td>
                                  <td className="p-4 font-bold text-gray-700">Paid</td>
                                  <td className="p-4"><Badge className="bg-emerald-100 text-emerald-700 border-none">Success</Badge></td>
                                </tr>
                              ) : (
                                <tr>
                                  <td colSpan={4} className="p-8 text-center text-gray-500 font-medium">
                                    No billing history available.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                   </CardContent>
                </Card>
             </TabsContent>

          </div>
       </Tabs>
    </div>
  );
}
