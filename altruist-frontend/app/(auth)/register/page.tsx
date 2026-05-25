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
  Stethoscope,
  ShieldCheck,
  Lock,
  Mail,
  User,
  Phone
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
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
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  }),
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

const getAuthErrorMessage = (error: any) => {
  const code = error?.code || "";
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address.';
    case 'auth/invalid-email':
      return 'The email address is invalid.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled.';
    case 'auth/weak-password':
      return 'The password is not strong enough.';
    default:
      return error?.response?.data?.message || error?.message || 'An error occurred during registration.';
  }
};

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
      termsAccepted: false,
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
    { label: "Contains special char", met: /[^A-Za-z0-9]/.test(password) },
  ];
  
  const strengthScore = strengthChecks.filter(c => c.met).length;

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

      toast.success("Registration successful! Check your inbox to verify your email.");
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);

    } catch (error: any) {
      console.error(error);
      toast.error(getAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface overflow-x-hidden">
      {/* Left Side: Trust Panel Hero */}
      <div className="hidden md:flex flex-1 relative bg-surface-muted overflow-hidden sticky top-0 h-screen">
        {/* Background Decorative Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#0D9488_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full max-w-2xl mx-auto h-full">
          <div>
            <Link href="/" className="inline-flex items-center mb-16">
              <img src="/logo.png" alt="Altruist Wellness" className="h-10 w-auto object-contain" />
            </Link>
            
            <h1 className="text-5xl font-heading font-extrabold leading-[1.1] text-foreground mb-6 tracking-tight">
              Join the future of <br />
              <span className="text-accent">digital healthcare.</span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium max-w-md">
              Create an account to access verified doctors, secure medical records, and hassle-free prescription delivery.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-12">
            {[
              { icon: UserIcon, title: "1-on-1 Care", desc: "Dedicated attention" },
              { icon: ShieldCheck, title: "Verified Profiles", desc: "Rigorous vetting" },
              { icon: HeartPulse, title: "Lifelong Records", desc: "Stored securely" },
              { icon: Lock, title: "Total Privacy", desc: "End-to-end encrypted" }
            ].map((feature, i) => (
              <div key={i} className="flex gap-4 items-start bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-border">
                <div className="bg-accent/10 p-3 rounded-xl text-accent shrink-0">
                  <feature.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">{feature.title}</h3>
                  <p className="text-muted-foreground text-xs mt-1 font-medium">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-auto pt-12 text-sm text-muted-foreground font-medium">
            © {new Date().getFullYear()} Altruist Healthcare. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Side: Register Form */}
      <div className="flex-1 overflow-y-auto px-6 py-12 md:px-12 bg-white relative">
        <div className="w-full max-w-xl mx-auto space-y-8 relative z-10 pb-12">
          {/* Logo mobile only */}
          <div className="md:hidden flex flex-col items-center gap-3 mb-4">
             <img src="/logo.png" alt="Altruist Wellness" className="h-12 w-auto object-contain" />
          </div>

          <div className="space-y-3 text-center md:text-left">
            <h2 className="text-3xl font-heading font-extrabold text-foreground tracking-tight">Create an account</h2>
            <p className="text-muted-foreground font-medium text-lg">Join Altruist for quality medical consultation</p>
          </div>

          <Card className="border-border shadow-xl shadow-accent/5 rounded-3xl bg-white">
            <CardContent className="p-8">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* User Type Selection */}
                <div className="space-y-3">
                   <Label className="text-foreground font-bold">I am registering as a:</Label>
                   <RadioGroup 
                     defaultValue="PATIENT" 
                     className="grid grid-cols-2 gap-4"
                     onValueChange={(val) => form.setValue("userType", val as any)}
                   >
                      <div>
                        <RadioGroupItem value="PATIENT" id="patient" className="peer sr-only" />
                        <Label 
                          htmlFor="patient" 
                          className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-border bg-surface-muted/30 p-5 hover:bg-surface-muted peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/5 [&_svg]:peer-data-[state=checked]:text-accent transition-all cursor-pointer shadow-sm"
                        >
                          <UserIcon className="h-8 w-8 text-muted-foreground transition-colors" />
                          <span className="font-bold text-foreground">Patient</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="DOCTOR" id="doctor" className="peer sr-only" />
                        <Label 
                          htmlFor="doctor" 
                          className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-border bg-surface-muted/30 p-5 hover:bg-surface-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&_svg]:peer-data-[state=checked]:text-primary transition-all cursor-pointer shadow-sm"
                        >
                          <Stethoscope className="h-8 w-8 text-muted-foreground transition-colors" />
                          <span className="font-bold text-foreground">Doctor</span>
                        </Label>
                      </div>
                   </RadioGroup>
                </div>

                {/* Basic Info */}
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground font-bold text-sm">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          placeholder="John Doe" 
                          className={cn("h-12 pl-10 rounded-xl bg-surface-muted/50 border-transparent focus:bg-white focus:border-accent transition-all", form.formState.errors.fullName && "border-red-500")} 
                          {...form.register("fullName")}
                        />
                      </div>
                      {form.formState.errors.fullName && (
                        <p className="text-xs text-red-500 font-bold px-1">{form.formState.errors.fullName.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-bold text-sm">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          placeholder="john@example.com" 
                          className={cn("h-12 pl-10 rounded-xl bg-surface-muted/50 border-transparent focus:bg-white focus:border-accent transition-all", form.formState.errors.email && "border-red-500")}
                          {...form.register("email")}
                        />
                      </div>
                      {form.formState.errors.email && (
                        <p className="text-xs text-red-500 font-bold px-1">{form.formState.errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground font-bold text-sm">Phone (Optional)</Label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          placeholder="+91 9876543210" 
                          className={cn("h-12 pl-10 rounded-xl bg-surface-muted/50 border-transparent focus:bg-white focus:border-accent transition-all", form.formState.errors.phone && "border-red-500")}
                          {...form.register("phone")}
                        />
                      </div>
                      {form.formState.errors.phone && (
                        <p className="text-xs text-red-500 font-bold px-1">{form.formState.errors.phone.message}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-foreground font-bold text-sm">DOB</Label>
                        <Input 
                          type="date" 
                          className={cn("h-12 rounded-xl bg-surface-muted/50 border-transparent focus:bg-white focus:border-accent transition-all px-3", form.formState.errors.dateOfBirth && "border-red-500")}
                          {...form.register("dateOfBirth")}
                        />
                        {form.formState.errors.dateOfBirth && (
                          <p className="text-xs text-red-500 font-bold px-1">{form.formState.errors.dateOfBirth.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground font-bold text-sm">Gender</Label>
                        <Select onValueChange={(v) => form.setValue("gender", (v as any) || "MALE")}>
                          <SelectTrigger className="h-12 rounded-xl bg-surface-muted/50 border-transparent focus:bg-white focus:border-accent transition-all">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MALE">Male</SelectItem>
                            <SelectItem value="FEMALE">Female</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conditional Doctor Fields */}
                {selectedUserType === "DOCTOR" && (
                  <div className="space-y-4 border-t border-border pt-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-2 mb-2">
                      <Stethoscope className="w-5 h-5 text-primary" />
                      <h3 className="font-bold text-foreground">Professional Details</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-foreground font-bold text-sm">Specialization</Label>
                        <Select onValueChange={(v) => form.setValue("specialization", (v as string) || undefined)}>
                          <SelectTrigger className={cn("h-12 rounded-xl bg-surface-muted/50 border-transparent focus:bg-white focus:border-primary transition-all", form.formState.errors.specialization && "border-red-500")}>
                            <SelectValue placeholder="Select specialty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="General Physician">General Physician</SelectItem>
                            <SelectItem value="Cardiologist">Cardiologist</SelectItem>
                            <SelectItem value="Dermatologist">Dermatologist</SelectItem>
                            <SelectItem value="Pediatrician">Pediatrician</SelectItem>
                            <SelectItem value="Neurologist">Neurologist</SelectItem>
                            <SelectItem value="Psychiatrist">Psychiatrist</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground font-bold text-sm">Medical License No.</Label>
                        <Input 
                          placeholder="MC-123456" 
                          className={cn("h-12 rounded-xl bg-surface-muted/50 border-transparent focus:bg-white focus:border-primary transition-all", form.formState.errors.medicalLicense && "border-red-500")}
                          {...form.register("medicalLicense")}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-foreground font-bold text-sm">Experience (Years)</Label>
                        <Input 
                          type="number" 
                          placeholder="e.g. 5" 
                          className="h-12 rounded-xl bg-surface-muted/50 border-transparent focus:bg-white focus:border-primary transition-all"
                          {...form.register("experienceYears")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground font-bold text-sm">Consultation Fee (₹)</Label>
                        <Input 
                          type="number" 
                          placeholder="e.g. 500" 
                          className="h-12 rounded-xl bg-surface-muted/50 border-transparent focus:bg-white focus:border-primary transition-all"
                          {...form.register("consultationFee")}
                        />
                      </div>
                    </div>
                    {form.formState.errors.medicalLicense && (
                      <p className="text-sm text-red-500 font-bold px-1 bg-red-50 p-2 rounded-lg">{form.formState.errors.medicalLicense.message}</p>
                    )}
                  </div>
                )}

                {/* Password Section */}
                <div className="space-y-4 border-t border-border pt-6">
                   <div className="grid grid-cols-1 gap-4">
                     <div className="space-y-2">
                       <Label className="text-foreground font-bold text-sm">Password</Label>
                       <div className="relative">
                         <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                         <Input 
                           type={showPassword ? "text" : "password"} 
                           className={cn("h-12 pl-10 pr-12 rounded-xl bg-surface-muted/50 border-transparent focus:bg-white focus:border-accent transition-all", form.formState.errors.password && "border-red-500")}
                           {...form.register("password")}
                         />
                         <button 
                           type="button" 
                           onClick={() => setShowPassword(!showPassword)}
                           className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors"
                         >
                           {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                         </button>
                       </div>
                       
                       {/* Password Strength Bar */}
                       {password.length > 0 && (
                         <div className="pt-2">
                           <div className="flex gap-1 h-1.5 w-full rounded-full overflow-hidden">
                              <div className={cn("h-full flex-1", strengthScore >= 1 ? "bg-red-400" : "bg-surface-muted")} />
                              <div className={cn("h-full flex-1", strengthScore >= 2 ? "bg-amber-400" : "bg-surface-muted")} />
                              <div className={cn("h-full flex-1", strengthScore >= 3 ? "bg-accent/60" : "bg-surface-muted")} />
                              <div className={cn("h-full flex-1", strengthScore >= 4 ? "bg-accent" : "bg-surface-muted")} />
                           </div>
                           <p className="text-xs text-muted-foreground font-medium mt-2">
                             {strengthScore < 2 && "Weak"}
                             {strengthScore === 2 && "Fair"}
                             {strengthScore === 3 && "Good"}
                             {strengthScore === 4 && "Strong"}
                           </p>
                         </div>
                       )}
                     </div>
                     <div className="space-y-2">
                       <Label className="text-foreground font-bold text-sm">Confirm Password</Label>
                       <div className="relative">
                         <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                         <Input 
                           type="password" 
                           className={cn("h-12 pl-10 rounded-xl bg-surface-muted/50 border-transparent focus:bg-white focus:border-accent transition-all", form.formState.errors.confirmPassword && "border-red-500")}
                           {...form.register("confirmPassword")}
                         />
                       </div>
                       {form.formState.errors.confirmPassword && (
                         <p className="text-xs text-red-500 font-bold px-1">{form.formState.errors.confirmPassword.message}</p>
                       )}
                     </div>
                   </div>

                   {/* Terms Checkbox */}
                   <div className="flex items-start space-x-3 pt-2">
                      <Checkbox 
                        id="terms" 
                        onCheckedChange={(checked) => form.setValue("termsAccepted", checked === true)} 
                        className="mt-1 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor="terms"
                          className="text-sm font-medium text-foreground leading-snug cursor-pointer"
                        >
                          I agree to the <Link href="/terms" className="text-accent hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link>.
                        </label>
                        {form.formState.errors.termsAccepted && (
                          <p className="text-xs text-red-500 font-bold">{form.formState.errors.termsAccepted.message}</p>
                        )}
                      </div>
                    </div>
                </div>

                <Button 
                  type="submit" 
                  className={cn(
                    "w-full h-14 text-base font-bold rounded-xl shadow-lg transition-all active:scale-[0.98]",
                    selectedUserType === "DOCTOR" ? "bg-primary hover:bg-primary/90 shadow-primary/20" : "bg-accent hover:bg-accent/90 shadow-accent/20"
                  )}
                  disabled={isLoading || !form.formState.isValid}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Complete Registration"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-muted-foreground font-medium pt-2">
            Already have an account? <Link href="/login" className="text-accent font-bold hover:underline underline-offset-4">Log in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
