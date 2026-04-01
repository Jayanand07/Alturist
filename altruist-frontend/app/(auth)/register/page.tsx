"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { 
  HeartPulse, 
  Video, 
  TestTube, 
  Pill, 
  Loader2, 
  Eye, 
  EyeOff, 
  Check, 
  X,
  User as UserIcon,
  Stethoscope
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  signUpWithEmail, 
  sendEmailVerification 
} from "@/lib/firebase";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";

// Registration Schema
const registerSchema = z.object({
  fullName: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number").optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  userType: z.enum(["PATIENT", "DOCTOR"]),
  // Doctor fields
  specialization: z.string().optional(),
  medicalLicense: z.string().optional(),
  experienceYears: z.coerce.number().optional(),
  consultationFee: z.coerce.number().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.userType === "DOCTOR") {
    return !!data.specialization && !!data.medicalLicense;
  }
  return true;
}, {
  message: "Medical details are required for doctors",
  path: ["medicalLicense"],
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      router.push("/patient");
    }
  }, [user, router]);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      dateOfBirth: "",
      gender: "MALE",
      userType: "PATIENT",
    },
    mode: "onChange"
  });

  const selectedUserType = useWatch({
    control: form.control,
    name: "userType"
  });

  const password = useWatch({
    control: form.control,
    name: "password"
  }) || "";

  // Password strength logic
  const strengthChecks = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains uppercase", met: /[A-Z]/.test(password) },
    { label: "Contains number", met: /[0-9]/.test(password) },
    { label: "Contains special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  const onSubmit = async (data: RegisterValues) => {
    setIsLoading(true);
    try {
      // 1. Firebase Sign Up
      const { user: firebaseUser } = await signUpWithEmail(data.email, data.password);
      
      // 2. Email Verification
      await sendEmailVerification(firebaseUser);
      
      // 3. Sync with Backend
      await api.post("/auth/sync", {
        firebaseUid: firebaseUser.uid,
        email: data.email,
        phone: data.phone,
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        userType: data.userType,
        doctorInfo: data.userType === "DOCTOR" ? {
          specialization: data.specialization,
          medicalLicense: data.medicalLicense,
          experienceYears: data.experienceYears,
          consultationFee: data.consultationFee
        } : null
      });

      toast.success("Verification email sent! Check your inbox.");
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);

    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-x-hidden">
      {/* Left Side: Hero */}
      <div className="hidden md:flex flex-1 bg-gradient-to-br from-[#0D9488] to-[#3B82F6] p-12 flex-col justify-between text-white relative h-screen sticky top-0">
        <div className="relative z-10">
          <Link href="/login" className="flex items-center gap-2 mb-12">
            <HeartPulse className="w-10 h-10" />
            <span className="text-3xl font-bold tracking-tight">Altruist</span>
          </Link>
          
          <h1 className="text-5xl font-extrabold leading-tight mb-8">
            Instant Healthcare. <br />
            <span className="text-teal-100">Anytime. Anywhere.</span>
          </h1>

          <div className="space-y-8 mt-16">
            {[
              { icon: Video, title: "Video Consultation", desc: "Talk to expert doctors from home" },
              { icon: TestTube, title: "Lab Tests", desc: "Book diagnostic tests at best prices" },
              { icon: Pill, title: "Online Medicines", desc: "Get prescribed medicines delivered fast" },
              { icon: HeartPulse, title: "Health Records", desc: "Securely store your medical history" }
            ].map((feature, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <feature.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-xl">{feature.title}</h3>
                  <p className="text-white/80">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="relative z-10 mt-auto opacity-70">
          <p>© 2026 Altruist Healthcare Services. All rights reserved.</p>
        </div>

        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
      </div>

      {/* Right Side: Register Form */}
      <div className="flex-1 overflow-y-auto px-6 py-12 md:px-12 bg-gray-50/50">
        <div className="w-full max-w-xl mx-auto space-y-8">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create an account</h2>
            <p className="text-gray-500 font-medium">Join Altruist for quality medical consultation</p>
          </div>

          <Card className="border-none shadow-xl bg-white rounded-2xl">
            <CardContent className="pt-8">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* User Type Selection */}
                <div className="space-y-3">
                   <Label className="text-gray-700 font-semibold">I am registering as a:</Label>
                   <RadioGroup 
                     defaultValue="PATIENT" 
                     className="flex gap-4"
                     onValueChange={(val) => form.setValue("userType", val as any)}
                   >
                      <div className="flex-1">
                        <RadioGroupItem value="PATIENT" id="patient" className="peer sr-only" />
                        <Label 
                          htmlFor="patient" 
                          className="flex flex-col items-center justify-between rounded-xl border-2 border-gray-100 bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-teal-50/30 [&_svg]:peer-data-[state=checked]:text-primary transition-all cursor-pointer"
                        >
                          <UserIcon className="mb-2 h-6 w-6 text-gray-400" />
                          <span className="font-bold text-gray-900">Patient</span>
                        </Label>
                      </div>
                      <div className="flex-1">
                        <RadioGroupItem value="DOCTOR" id="doctor" className="peer sr-only" />
                        <Label 
                          htmlFor="doctor" 
                          className="flex flex-col items-center justify-between rounded-xl border-2 border-gray-100 bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-teal-50/30 [&_svg]:peer-data-[state=checked]:text-primary transition-all cursor-pointer"
                        >
                          <Stethoscope className="mb-2 h-6 w-6 text-gray-400" />
                          <span className="font-bold text-gray-900">Doctor</span>
                        </Label>
                      </div>
                   </RadioGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700">Full Name</Label>
                    <Input 
                      placeholder="John Doe" 
                      className="h-11 border-gray-200" 
                      {...form.register("fullName")}
                    />
                    {form.formState.errors.fullName && (
                      <p className="text-xs text-red-500 font-medium">{form.formState.errors.fullName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">Email Address</Label>
                    <Input 
                      placeholder="john@example.com" 
                      className="h-11 border-gray-200"
                      {...form.register("email")}
                    />
                    {form.formState.errors.email && (
                      <p className="text-xs text-red-500 font-medium">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700">Phone (Optional)</Label>
                    <Input 
                      placeholder="+91 9876543210" 
                      className="h-11 border-gray-200"
                      {...form.register("phone")}
                    />
                    {form.formState.errors.phone && (
                      <p className="text-xs text-red-500 font-medium">{form.formState.errors.phone.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">Date of Birth</Label>
                    <Input 
                      type="date" 
                      className="h-11 border-gray-200"
                      {...form.register("dateOfBirth")}
                    />
                    {form.formState.errors.dateOfBirth && (
                      <p className="text-xs text-red-500 font-medium">{form.formState.errors.dateOfBirth.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700">Gender</Label>
                  <Select onValueChange={(v) => form.setValue("gender", (v as any) || "MALE")}>
                    <SelectTrigger className="h-11 border-gray-200">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.gender && (
                    <p className="text-xs text-red-500 font-medium">{form.formState.errors.gender.message}</p>
                  )}
                </div>

                {/* Conditional Doctor Fields */}
                {selectedUserType === "DOCTOR" && (
                  <div className="space-y-4 border-t pt-4 border-gray-100 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="p-3 bg-teal-50/50 rounded-xl mb-4">
                      <p className="text-primary font-bold text-sm">Doctor Professional Details</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-gray-700">Specialization</Label>
                        <Select onValueChange={(v) => form.setValue("specialization", (v as string) || undefined)}>
                          <SelectTrigger className="h-11 border-gray-200">
                            <SelectValue placeholder="Select specialty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="General Physician">General Physician</SelectItem>
                            <SelectItem value="Cardiologist">Cardiologist</SelectItem>
                            <SelectItem value="Dermatologist">Dermatologist</SelectItem>
                            <SelectItem value="Pediatrician">Pediatrician</SelectItem>
                            <SelectItem value="Neurologist">Neurologist</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-700">Medical License No.</Label>
                        <Input 
                          placeholder="MC-123456" 
                          className="h-11 border-gray-200"
                          {...form.register("medicalLicense")}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-gray-700">Experience (Years)</Label>
                        <Input 
                          type="number" 
                          placeholder="e.g. 5" 
                          className="h-11 border-gray-200"
                          {...form.register("experienceYears")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-700">Consultation Fee (₹)</Label>
                        <Input 
                          type="number" 
                          placeholder="e.g. 500" 
                          className="h-11 border-gray-200"
                          {...form.register("consultationFee")}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <Label className="text-gray-700">Password</Label>
                       <div className="relative">
                         <Input 
                           type={showPassword ? "text" : "password"} 
                           className="h-11 border-gray-200 pr-10"
                           {...form.register("password")}
                         />
                         <button 
                           type="button" 
                           onClick={() => setShowPassword(!showPassword)}
                           className="absolute right-3 top-2.5 text-gray-400 hover:text-primary"
                         >
                           {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                         </button>
                       </div>
                     </div>
                     <div className="space-y-2">
                       <Label className="text-gray-700">Confirm Password</Label>
                       <Input 
                         type="password" 
                         className="h-11 border-gray-200"
                         {...form.register("confirmPassword")}
                       />
                       {form.formState.errors.confirmPassword && (
                         <p className="text-xs text-red-500 font-medium">{form.formState.errors.confirmPassword.message}</p>
                       )}
                     </div>
                   </div>

                   {/* Strength Indicator */}
                   <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                      <p className="text-sm font-bold text-gray-700 mb-2">Password Requirements:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {strengthChecks.map((check, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                             {check.met ? (
                               <Check className="w-3.5 h-3.5 text-green-500" />
                             ) : (
                               <X className="w-3.5 h-3.5 text-gray-300" />
                             )}
                             <span className={check.met ? "text-green-600 font-semibold" : "text-gray-500"}>
                               {check.label}
                             </span>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-bold bg-[#0D9488] hover:bg-[#0b7a6e] transition-all active:scale-[0.98]"
                  disabled={isLoading || !form.formState.isValid}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Complete Registration"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-gray-500 font-medium pt-4">
            Already have an account? <Link href="/login" className="text-primary font-bold hover:underline underline-offset-4">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
