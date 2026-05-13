"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  User, Calendar, MapPin, Bell, Shield, Loader2, Save, Trash2, Camera, X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export default function DoctorSettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: authUser, userType, loading: authLoading, signOut } = useAuth();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [languageInput, setLanguageInput] = useState("");
  const [languagesList, setLanguagesList] = useState<string[]>([]);
  const [weeklySchedule, setWeeklySchedule] = useState<any>({});
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch Cities
  const { data: cities } = useQuery({
    queryKey: ["cities"],
    queryFn: async () => (await api.get("/doctors/cities")).data,
  });

  // Fetch Profile
  const fetchProfile = useCallback(async () => {
    try {
      const response = await api.get("/doctors/profile");
      setProfile(response.data);
      if (response.data.languages) {
        setLanguagesList(response.data.languages.split(",").filter((a: string) => a.trim() !== ""));
      }
    } catch (err) {
      toast.error("Failed to load your profile details");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Schedule
  const fetchSchedule = useCallback(async () => {
    try {
      const response = await api.get("/doctors/schedule");
      const schedule = response.data?.schedule ? JSON.parse(response.data.schedule) : {};
      
      // Initialize if empty
      const defaultDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
      const newSchedule = { ...schedule };
      defaultDays.forEach(day => {
        if (!newSchedule[day]) newSchedule[day] = [];
      });
      setWeeklySchedule(newSchedule);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push("/login");
      return;
    }
    if (authUser && userType === "DOCTOR") {
      fetchProfile();
      fetchSchedule();
    }
  }, [authUser, userType, authLoading, router, fetchProfile, fetchSchedule]);

  const handleInputChange = (field: string, value: any) => {
    setProfile((prev: any) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleAddLanguage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && languageInput.trim()) {
      e.preventDefault();
      const newList = [...languagesList, languageInput.trim()];
      setLanguagesList(newList);
      handleInputChange("languages", newList.join(","));
      setLanguageInput("");
    }
  };

  const handleRemoveLanguage = (index: number) => {
    const newList = languagesList.filter((_, i) => i !== index);
    setLanguagesList(newList);
    handleInputChange("languages", newList.join(","));
  };

  const toggleScheduleSlot = (day: string, time: string) => {
    setWeeklySchedule((prev: any) => {
      const daySlots = prev[day] || [];
      if (daySlots.includes(time)) {
        return { ...prev, [day]: daySlots.filter((t: string) => t !== time) };
      } else {
        return { ...prev, [day]: [...daySlots, time].sort() };
      }
    });
  };

  const handleSaveProfile = async (section: string) => {
    if (!profile) return;
    setSaving(true);
    try {
      await api.patch("/doctors/profile", profile);
      toast.success(`${section} settings saved successfully!`);
    } catch (err) {
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSchedule = async () => {
    setSaving(true);
    try {
      await api.post("/doctors/schedule/set-hours", weeklySchedule);
      toast.success("Consultation schedule saved successfully!");
    } catch (err) {
      toast.error("Failed to save schedule. Please try again.");
    } finally {
      setSaving(false);
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
      await api.patch("/doctors/profile", { ...profile, profilePictureUrl: newUrl });
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <Loader2 className="w-10 h-10 animate-spin text-[#00A87E]" />
      </div>
    );
  }

  if (!profile) return null;

  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", 
    "15:00", "16:00", "17:00", "18:00"
  ];
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl mb-24">
       <div className="mb-8 space-y-2">
         <h1 className="text-3xl tracking-tight font-extrabold text-slate-900">Doctor Settings</h1>
         <p className="text-slate-500 font-medium">Manage your professional profile, clinic details, and schedule.</p>
       </div>

       <Tabs defaultValue="profile" className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-64 shrink-0">
             <TabsList className="flex md:flex-col h-auto bg-transparent gap-2 p-0 w-full overflow-x-auto justify-start border-none">
                {[
                  { id: "profile", icon: User, label: "Profile" },
                  { id: "consultation", icon: Calendar, label: "Consultation" },
                  { id: "clinic", icon: MapPin, label: "Clinic" },
                  { id: "notifications", icon: Bell, label: "Notifications" },
                  { id: "account", icon: Shield, label: "Account" },
                ].map((tab) => (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id}
                    className="w-full justify-start text-left px-4 py-3 h-auto data-[state=active]:bg-[#00A87E]/10 data-[state=active]:text-[#00A87E] data-[state=active]:font-bold data-[state=active]:shadow-none rounded-xl border border-transparent data-[state=active]:border-[#00A87E]/20 transition-all gap-3 text-slate-600 font-medium"
                  >
                     <tab.icon className="w-5 h-5 opacity-80" />
                     <span className="hidden sm:inline">{tab.label}</span>
                     <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  </TabsTrigger>
                ))}
             </TabsList>
          </div>

          <div className="flex-1 w-full max-w-3xl">
             
             {/* Profile Tab */}
             <TabsContent value="profile" className="m-0 mt-0 focus-visible:outline-none">
                <Card className="border border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
                   <CardHeader className="border-b border-slate-100 pb-5 bg-slate-50/50">
                      <CardTitle className="text-xl font-bold text-slate-900">Professional Profile</CardTitle>
                      <CardDescription>Update your medical credentials and public biography.</CardDescription>
                   </CardHeader>
                   <CardContent className="pt-6 space-y-6">
                      
                      {/* Photo Upload Section */}
                      <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                        <Avatar className="w-24 h-24 border-2 border-slate-100 shadow-sm">
                          <AvatarImage src={profile.profilePictureUrl || ""} />
                          <AvatarFallback className="bg-teal-50 text-[#00A87E] text-2xl font-bold">
                            {profile.name?.charAt(0) || "D"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                          <h4 className="font-bold text-slate-900">Profile Picture</h4>
                          <p className="text-sm text-slate-500 max-w-xs">Upload a professional headshot for your patient-facing profile.</p>
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
                              className="font-bold mt-2 border-slate-300"
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
                           <Label className="text-slate-700 font-bold">Full Name</Label>
                           <Input 
                             value={profile.name || ""} 
                             disabled 
                             className="h-11 bg-slate-50 border-slate-200 text-slate-500 font-medium" 
                           />
                           <p className="text-[10px] text-slate-400">Contact admin to change your registered name.</p>
                        </div>
                        <div className="space-y-2">
                           <Label className="text-slate-700 font-bold">Specialization</Label>
                           <Input 
                             value={profile.specialization || ""} 
                             onChange={(e) => handleInputChange("specialization", e.target.value)} 
                             className="h-11 border-slate-300 focus-visible:ring-[#00A87E]" 
                             placeholder="e.g. Cardiologist"
                           />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                           <Label className="text-slate-700 font-bold">Qualification</Label>
                           <Input 
                             value={profile.qualification || ""} 
                             onChange={(e) => handleInputChange("qualification", e.target.value)} 
                             className="h-11 border-slate-300 focus-visible:ring-[#00A87E]" 
                             placeholder="e.g. MBBS, MD"
                           />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-slate-700 font-bold">Years of Experience</Label>
                           <Input 
                             type="number"
                             value={profile.experienceYears || ""} 
                             onChange={(e) => handleInputChange("experienceYears", parseInt(e.target.value) || 0)} 
                             className="h-11 border-slate-300 focus-visible:ring-[#00A87E]" 
                           />
                        </div>
                      </div>

                      <div className="space-y-2">
                         <Label className="text-slate-700 font-bold">Bio</Label>
                         <Textarea 
                           value={profile.bio || ""} 
                           onChange={(e) => handleInputChange("bio", e.target.value)} 
                           placeholder="Write a short biography about your medical journey and expertise..."
                           className="min-h-[100px] border-slate-300 focus-visible:ring-[#00A87E]" 
                         />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-5">
                        <div className="space-y-3">
                           <Label className="text-slate-700 font-bold">Languages (Press Enter)</Label>
                           <div className="flex items-center gap-2">
                             <Input 
                               value={languageInput} 
                               onChange={(e) => setLanguageInput(e.target.value)}
                               onKeyDown={handleAddLanguage}
                               placeholder="e.g. English, Hindi"
                               className="h-11 border-slate-300 focus-visible:ring-[#00A87E]" 
                             />
                             <Button type="button" onClick={() => handleAddLanguage({ key: 'Enter', preventDefault: () => {} } as any)} className="bg-slate-100 text-slate-700 hover:bg-slate-200 h-11 shrink-0 font-bold">Add</Button>
                           </div>
                           {languagesList.length > 0 && (
                             <div className="flex flex-wrap gap-2 pt-1">
                               {languagesList.map((lang, idx) => (
                                 <Badge key={idx} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm py-1.5 px-3 flex items-center gap-1.5 border border-blue-200 font-medium">
                                   {lang}
                                   <X className="w-3.5 h-3.5 cursor-pointer opacity-70 hover:opacity-100" onClick={() => handleRemoveLanguage(idx)} />
                                 </Badge>
                               ))}
                             </div>
                           )}
                        </div>
                        
                        <div className="space-y-2">
                           <Label className="text-slate-700 font-bold">Base City</Label>
                           <Select value={profile.city || ""} onValueChange={(val) => handleInputChange("city", val || "")}>
                              <SelectTrigger className="h-11 border-slate-300 focus:ring-[#00A87E]">
                                 <SelectValue placeholder="Select City" />
                              </SelectTrigger>
                              <SelectContent>
                                 {(cities || ["Delhi", "Mumbai", "Bangalore", "Chennai"]).map((city: string) => (
                                    <SelectItem key={city} value={city}>{city}</SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                        </div>
                      </div>

                   </CardContent>
                   <CardFooter className="bg-slate-50/80 border-t border-slate-100 py-4 flex justify-end">
                      <Button onClick={() => handleSaveProfile("Profile")} disabled={saving} className="bg-[#00A87E] hover:bg-[#00906B] text-white font-bold px-8 h-11 rounded-xl shadow-md active:scale-95 transition-all">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Profile
                      </Button>
                   </CardFooter>
                </Card>
             </TabsContent>

             {/* Consultation Schedule Tab */}
             <TabsContent value="consultation" className="m-0 mt-0 focus-visible:outline-none">
                <Card className="border border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
                   <CardHeader className="border-b border-slate-100 pb-5 bg-slate-50/50">
                      <CardTitle className="text-xl font-bold text-slate-900">Consultation Schedule</CardTitle>
                      <CardDescription>Manage your consultation fees and weekly availability.</CardDescription>
                   </CardHeader>
                   <CardContent className="pt-6 space-y-8">
                      
                      <div className="space-y-2 max-w-sm">
                         <Label className="text-slate-700 font-bold">Consultation Fee (₹)</Label>
                         <Input 
                           type="number"
                           value={profile.consultationFee || 0} 
                           onChange={(e) => handleInputChange("consultationFee", parseFloat(e.target.value) || 0)} 
                           className="h-11 border-slate-300 focus-visible:ring-[#00A87E] text-lg font-bold" 
                         />
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Weekly Availability</h3>
                        <p className="text-sm text-slate-500">Click on the slots to mark yourself as available.</p>
                        
                        <div className="space-y-4 mt-4">
                          {days.map((day) => (
                            <div key={day} className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                              <div className="w-24 shrink-0 font-bold text-slate-700 capitalize">
                                {day.substring(0, 3)}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {timeSlots.map((time) => {
                                  const isActive = weeklySchedule[day]?.includes(time);
                                  return (
                                    <button
                                      key={`${day}-${time}`}
                                      onClick={() => toggleScheduleSlot(day, time)}
                                      className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                                        isActive 
                                          ? "bg-[#00A87E] border-[#00A87E] text-white shadow-sm" 
                                          : "bg-white border-slate-200 text-slate-500 hover:border-[#00A87E]/50 hover:bg-[#00A87E]/5"
                                      )}
                                    >
                                      {time}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                   </CardContent>
                   <CardFooter className="bg-slate-50/80 border-t border-slate-100 py-4 flex justify-end gap-3">
                      <Button onClick={() => handleSaveProfile("Fee")} disabled={saving} variant="outline" className="font-bold h-11 rounded-xl">
                         Save Fee Only
                      </Button>
                      <Button onClick={handleSaveSchedule} disabled={saving} className="bg-[#00A87E] hover:bg-[#00906B] text-white font-bold px-8 h-11 rounded-xl shadow-md active:scale-95 transition-all">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Schedule
                      </Button>
                   </CardFooter>
                </Card>
             </TabsContent>

             {/* Clinic Tab */}
             <TabsContent value="clinic" className="m-0 mt-0 focus-visible:outline-none">
                <Card className="border border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
                   <CardHeader className="border-b border-slate-100 pb-5 bg-slate-50/50">
                      <CardTitle className="text-xl font-bold text-slate-900">Clinic Information</CardTitle>
                      <CardDescription>Details about your physical clinic or hospital practice.</CardDescription>
                   </CardHeader>
                   <CardContent className="pt-6 space-y-5">
                      <div className="space-y-2">
                         <Label className="text-slate-700 font-bold">Clinic Name</Label>
                         <Input 
                           value={profile.clinicName || ""} 
                           onChange={(e) => handleInputChange("clinicName", e.target.value)} 
                           className="h-11 border-slate-300 focus-visible:ring-[#00A87E]" 
                         />
                      </div>
                      
                      <div className="space-y-2">
                         <Label className="text-slate-700 font-bold">Clinic Address</Label>
                         <Textarea 
                           value={profile.clinicAddress || ""} 
                           onChange={(e) => handleInputChange("clinicAddress", e.target.value)} 
                           className="min-h-[80px] border-slate-300 focus-visible:ring-[#00A87E]" 
                         />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                           <Label className="text-slate-700 font-bold">Clinic Phone</Label>
                           <Input 
                             value={profile.clinicPhone || ""} 
                             onChange={(e) => handleInputChange("clinicPhone", e.target.value)} 
                             className="h-11 border-slate-300 focus-visible:ring-[#00A87E]" 
                           />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-slate-700 font-bold">City Location</Label>
                           <Select value={profile.city || ""} onValueChange={(val) => handleInputChange("city", val || "")}>
                              <SelectTrigger className="h-11 border-slate-300 focus:ring-[#00A87E]">
                                 <SelectValue placeholder="Select City" />
                              </SelectTrigger>
                              <SelectContent>
                                 {(cities || ["Delhi", "Mumbai", "Bangalore", "Chennai"]).map((city: string) => (
                                    <SelectItem key={city} value={city}>{city}</SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                        </div>
                      </div>
                   </CardContent>
                   <CardFooter className="bg-slate-50/80 border-t border-slate-100 py-4 flex justify-end">
                      <Button onClick={() => handleSaveProfile("Clinic Info")} disabled={saving} className="bg-[#00A87E] hover:bg-[#00906B] text-white font-bold px-8 h-11 rounded-xl shadow-md active:scale-95 transition-all">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Clinic Info
                      </Button>
                   </CardFooter>
                </Card>
             </TabsContent>

             {/* Notifications Tab */}
             <TabsContent value="notifications" className="m-0 mt-0 focus-visible:outline-none">
                <Card className="border border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
                   <CardHeader className="border-b border-slate-100 pb-5 bg-slate-50/50">
                      <CardTitle className="text-xl font-bold text-slate-900">Notification Preferences</CardTitle>
                      <CardDescription>Manage how you want to be alerted about patient appointments.</CardDescription>
                   </CardHeader>
                   <CardContent className="pt-6 space-y-4">
                      <div className="flex items-center justify-between p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
                         <div className="space-y-1">
                           <Label className="text-base font-bold text-slate-900">New Appointment Alerts</Label>
                           <p className="text-sm text-slate-500">Get notified via email when a patient books a new consultation.</p>
                         </div>
                         <Switch checked={true} className="data-[state=checked]:bg-[#00A87E]" />
                      </div>

                      <div className="flex items-center justify-between p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
                         <div className="space-y-1">
                           <Label className="text-base font-bold text-slate-900">Instant Consultation Ring</Label>
                           <p className="text-sm text-slate-500">Play an audible ringtone when a patient enters the instant queue.</p>
                         </div>
                         <Switch checked={true} className="data-[state=checked]:bg-[#00A87E]" />
                      </div>
                   </CardContent>
                </Card>
             </TabsContent>

             {/* Account Tab */}
             <TabsContent value="account" className="m-0 mt-0 focus-visible:outline-none">
                <Card className="border border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
                   <CardHeader className="border-b border-slate-100 pb-5 bg-slate-50/50">
                      <CardTitle className="text-xl font-bold text-slate-900">Account Status & Security</CardTitle>
                      <CardDescription>Manage your authentication and platform access.</CardDescription>
                   </CardHeader>
                   <CardContent className="pt-6 space-y-6">
                      
                      <div className="space-y-3">
                         <h3 className="font-bold text-slate-900">Verification Status</h3>
                         <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                            <div>
                               <p className="font-bold text-slate-900">Platform Verification</p>
                               <p className="text-sm text-slate-500 mt-1">
                                 {profile.isVerified ? "Your medical credentials have been verified by administrators." : "Your profile is pending manual verification by our medical board."}
                               </p>
                            </div>
                            <Badge className={cn(
                              "font-bold px-3 py-1",
                              profile.isVerified ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                            )}>
                               {profile.isVerified ? "Verified" : "Pending"}
                            </Badge>
                         </div>
                      </div>

                      <div className="space-y-3 pt-6 border-t border-slate-100">
                         <h3 className="font-bold text-slate-900">Sign out sessions</h3>
                         <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                            <div>
                               <p className="font-bold text-slate-900">Log out from this device</p>
                               <p className="text-sm text-slate-500 mt-1">You will need to sign back in.</p>
                            </div>
                            <Button variant="outline" onClick={() => signOut()} className="font-bold text-slate-700 border-slate-300">
                               Log out
                            </Button>
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
