"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User, Mail, Phone, Calendar, SwitchCamera, MapPin, Activity, Bell, Shield, Loader2, Save, Trash2, HeartPulse, ChevronRight, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/axios";
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
}

export default function SettingsPage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading, signOut } = useAuth();
  
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allergyInput, setAllergyInput] = useState("");
  const [allergiesList, setAllergiesList] = useState<string[]>([]);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await api.get("/patients/profile");
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
    if (authUser) {
      fetchProfile();
    }
  }, [authUser, authLoading, router, fetchProfile]);

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
      await api.patch("/patients/profile", profile);
      toast.success(`${section} settings saved successfully!`);
    } catch (err) {
      toast.error("Failed to save changes. Please try again.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
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
                ].map((tab) => (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id}
                    className="w-full justify-start text-left px-4 py-3 h-auto data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 data-[state=active]:font-bold data-[state=active]:shadow-none rounded-xl border border-transparent data-[state=active]:border-teal-100 transition-all gap-3"
                  >
                     <tab.icon className="w-5 h-5 opacity-70" />
                     <span className="hidden sm:inline">{tab.label}</span>
                     <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  </TabsTrigger>
                ))}
             </TabsList>
          </div>

          <div className="flex-1 w-full max-w-3xl">
             
             {/* Personal Info Tab */}
             <TabsContent value="personal" className="m-0 mt-0 focus-visible:outline-none">
                <Card className="border-0 shadow-sm border-gray-100 rounded-2xl bg-white">
                   <CardHeader className="border-b border-gray-50 pb-5">
                      <CardTitle className="text-xl font-bold text-gray-900">Personal Information</CardTitle>
                      <CardDescription>Update your basic profile details here.</CardDescription>
                   </CardHeader>
                   <CardContent className="pt-6 space-y-5">
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                           <Label className="text-gray-700">Full Name</Label>
                           <Input 
                             value={profile.fullName || ""} 
                             onChange={(e) => handleInputChange("fullName", e.target.value)} 
                             className="h-11 border-gray-200 focus-visible:ring-teal-500" 
                           />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-gray-700">Email Address <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded ml-2">Read-only</span></Label>
                           <Input value={profile.email || ""} disabled className="h-11 bg-gray-50 border-gray-200 text-gray-500" />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                           <Label className="text-gray-700">Phone Number</Label>
                           <Input 
                             value={profile.phone || ""} 
                             onChange={(e) => handleInputChange("phone", e.target.value)} 
                             className="h-11 border-gray-200 focus-visible:ring-teal-500" 
                           />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-gray-700">Date of Birth</Label>
                           <Input 
                             type="date" 
                             value={profile.dateOfBirth || ""} 
                             onChange={(e) => handleInputChange("dateOfBirth", e.target.value)} 
                             className="h-11 border-gray-200 focus-visible:ring-teal-500" 
                           />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                           <Label className="text-gray-700">Gender</Label>
                           <Select value={profile.gender || ""} onValueChange={(val) => handleInputChange("gender", val || "")}>
                              <SelectTrigger className="h-11 border-gray-200 focus:ring-teal-500">
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
                           <Label className="text-gray-700">Blood Group</Label>
                           <Select value={profile.bloodGroup || ""} onValueChange={(val) => handleInputChange("bloodGroup", val || "")}>
                              <SelectTrigger className="h-11 border-gray-200 focus:ring-teal-500">
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
                   </CardContent>
                   <CardFooter className="bg-gray-50/50 rounded-b-2xl py-4 flex justify-end">
                      <Button onClick={() => handleSave("Personal Info")} disabled={saving} className="bg-teal-600 hover:bg-teal-700 font-bold px-6 h-10 shadow-sm active:scale-95 transition-all">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                      </Button>
                   </CardFooter>
                </Card>
             </TabsContent>

             {/* Address Tab */}
             <TabsContent value="address" className="m-0 mt-0 focus-visible:outline-none">
                <Card className="border-0 shadow-sm border-gray-100 rounded-2xl bg-white">
                   <CardHeader className="border-b border-gray-50 pb-5">
                      <CardTitle className="text-xl font-bold text-gray-900">Address & Location</CardTitle>
                      <CardDescription>Update your delivery and home address.</CardDescription>
                   </CardHeader>
                   <CardContent className="pt-6 space-y-5">
                      <div className="space-y-2">
                         <Label className="text-gray-700">Street Address</Label>
                         <Input 
                           value={profile.street || ""} 
                           onChange={(e) => handleInputChange("street", e.target.value)} 
                           placeholder="House number, Street name, Area"
                           className="h-11 border-gray-200 focus-visible:ring-teal-500" 
                         />
                      </div>
                      <div className="grid sm:grid-cols-3 gap-5">
                        <div className="space-y-2 sm:col-span-1">
                           <Label className="text-gray-700">City</Label>
                           <Input 
                             value={profile.city || ""} 
                             onChange={(e) => handleInputChange("city", e.target.value)} 
                             className="h-11 border-gray-200 focus-visible:ring-teal-500" 
                           />
                        </div>
                        <div className="space-y-2 sm:col-span-1">
                           <Label className="text-gray-700">State</Label>
                           <Input 
                             value={profile.state || ""} 
                             onChange={(e) => handleInputChange("state", e.target.value)} 
                             className="h-11 border-gray-200 focus-visible:ring-teal-500" 
                           />
                        </div>
                        <div className="space-y-2 sm:col-span-1">
                           <Label className="text-gray-700">Pincode</Label>
                           <Input 
                             value={profile.pincode || ""} 
                             onChange={(e) => handleInputChange("pincode", e.target.value)} 
                             className="h-11 border-gray-200 focus-visible:ring-teal-500" 
                           />
                        </div>
                      </div>
                   </CardContent>
                   <CardFooter className="bg-gray-50/50 rounded-b-2xl py-4 flex justify-end">
                      <Button onClick={() => handleSave("Address")} disabled={saving} className="bg-teal-600 hover:bg-teal-700 font-bold px-6 h-10 shadow-sm active:scale-95 transition-all">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Address
                      </Button>
                   </CardFooter>
                </Card>
             </TabsContent>

             {/* Health Info Tab */}
             <TabsContent value="health" className="m-0 mt-0 focus-visible:outline-none">
                <Card className="border-0 shadow-sm border-gray-100 rounded-2xl bg-white">
                   <CardHeader className="border-b border-gray-50 pb-5">
                      <CardTitle className="text-xl font-bold text-gray-900">Health Information</CardTitle>
                      <CardDescription>Keep this updated to help doctors provide better care.</CardDescription>
                   </CardHeader>
                   <CardContent className="pt-6 space-y-6">
                      
                      <div className="space-y-3">
                         <Label className="text-gray-700">Allergies (Press Enter to add)</Label>
                         <div className="flex items-center gap-2">
                           <Input 
                             value={allergyInput} 
                             onChange={(e) => setAllergyInput(e.target.value)}
                             onKeyDown={handleAddAllergy}
                             placeholder="e.g., Peanuts, Penicillin..."
                             className="h-11 border-gray-200 focus-visible:ring-teal-500" 
                           />
                           <Button type="button" onClick={() => handleAddAllergy({ key: 'Enter', preventDefault: () => {} } as any)} className="bg-gray-100 text-gray-700 hover:bg-gray-200 h-11 shrink-0">Add</Button>
                         </div>
                         {allergiesList.length > 0 && (
                           <div className="flex flex-wrap gap-2 pt-2">
                             {allergiesList.map((allergy, idx) => (
                               <Badge key={idx} variant="secondary" className="bg-red-50 text-red-700 hover:bg-red-100 text-sm py-1 px-3 flex items-center gap-1 border border-red-100">
                                 {allergy}
                                 <X className="w-3 h-3 cursor-pointer opacity-70 hover:opacity-100" onClick={() => handleRemoveAllergy(idx)} />
                               </Badge>
                             ))}
                           </div>
                         )}
                      </div>

                      <div className="space-y-2">
                         <Label className="text-gray-700">Chronic Conditions</Label>
                         <Input 
                           value={profile.chronicConditions || ""} 
                           onChange={(e) => handleInputChange("chronicConditions", e.target.value)} 
                           placeholder="e.g., Asthma, Diabetes..."
                           className="h-11 border-gray-200 focus-visible:ring-teal-500" 
                         />
                      </div>

                      <div className="space-y-2">
                         <Label className="text-gray-700">Current Medications</Label>
                         <Input 
                           value={profile.currentMedications || ""} 
                           onChange={(e) => handleInputChange("currentMedications", e.target.value)} 
                           placeholder="Any medicines you take regularly"
                           className="h-11 border-gray-200 focus-visible:ring-teal-500" 
                         />
                      </div>

                   </CardContent>
                   <CardFooter className="bg-gray-50/50 rounded-b-2xl py-4 flex justify-end">
                      <Button onClick={() => handleSave("Health Profile")} disabled={saving} className="bg-teal-600 hover:bg-teal-700 font-bold px-6 h-10 shadow-sm active:scale-95 transition-all">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Health Info
                      </Button>
                   </CardFooter>
                </Card>
             </TabsContent>

             {/* Notifications Tab */}
             <TabsContent value="notifications" className="m-0 mt-0 focus-visible:outline-none">
                <Card className="border-0 shadow-sm border-gray-100 rounded-2xl bg-white">
                   <CardHeader className="border-b border-gray-50 pb-5">
                      <CardTitle className="text-xl font-bold text-gray-900">Notification Preferences</CardTitle>
                      <CardDescription>Control how you receive updates and alerts.</CardDescription>
                   </CardHeader>
                   <CardContent className="pt-6 space-y-6">
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                         <div className="space-y-0.5">
                           <Label className="text-base font-bold text-gray-900">Email Alerts</Label>
                           <p className="text-sm text-gray-500">Receive reports, orders and account updates via email.</p>
                         </div>
                         <Switch 
                           checked={profile.emailAlerts !== false} 
                           onCheckedChange={(val) => handleInputChange("emailAlerts", val)}
                         />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                         <div className="space-y-0.5">
                           <Label className="text-base font-bold text-gray-900">SMS Alerts</Label>
                           <p className="text-sm text-gray-500">Get timely order delivery updates on your registered phone.</p>
                         </div>
                         <Switch 
                           checked={profile.smsAlerts !== false} 
                           onCheckedChange={(val) => handleInputChange("smsAlerts", val)}
                         />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                         <div className="space-y-0.5">
                           <Label className="text-base font-bold text-gray-900">Appointment Reminders</Label>
                           <p className="text-sm text-gray-500">Receive reminders 1 hour before scheduled consultations.</p>
                         </div>
                         <Switch 
                           checked={profile.appointmentReminders !== false} 
                           onCheckedChange={(val) => handleInputChange("appointmentReminders", val)}
                         />
                      </div>

                   </CardContent>
                   <CardFooter className="bg-gray-50/50 rounded-b-2xl py-4 flex justify-end">
                      <Button onClick={() => handleSave("Notifications")} disabled={saving} className="bg-teal-600 hover:bg-teal-700 font-bold px-6 h-10 shadow-sm active:scale-95 transition-all">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Update Preferences
                      </Button>
                   </CardFooter>
                </Card>
             </TabsContent>

             {/* Account Details Tab (Logout, Delete, etc.) */}
             <TabsContent value="account" className="m-0 mt-0 focus-visible:outline-none">
                <Card className="border-0 shadow-sm border-gray-100 rounded-2xl bg-white">
                   <CardHeader className="border-b border-gray-50 pb-5">
                      <CardTitle className="text-xl font-bold text-gray-900">Account Security</CardTitle>
                      <CardDescription>Manage your authentication and account status.</CardDescription>
                   </CardHeader>
                   <CardContent className="pt-6 space-y-6">
                      
                      <div className="space-y-4">
                         <h3 className="font-bold text-gray-900">Sign out sessions</h3>
                         <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                            <div>
                               <p className="font-medium text-gray-900">Log out from this device</p>
                               <p className="text-sm text-gray-500">You will need to sign back in.</p>
                            </div>
                            <Button variant="outline" onClick={() => signOut()} className="font-bold text-gray-700 border-gray-300">
                               Log out
                            </Button>
                         </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-gray-50">
                         <h3 className="font-bold text-red-600 flex items-center gap-2"><Trash2 className="w-4 h-4" /> Danger Zone</h3>
                         <div className="p-5 bg-red-50 rounded-xl border border-red-100">
                            <div className="mb-4">
                               <p className="font-bold text-red-900">Delete Account</p>
                               <p className="text-sm text-red-700/80 mt-1">
                                  Once you delete your account, there is no going back. All your medical records, appointments, and data will be permanently erased.
                               </p>
                            </div>
                            <Button variant="destructive" className="font-bold bg-red-600 hover:bg-red-700 w-full sm:w-auto">
                               Delete my account
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
