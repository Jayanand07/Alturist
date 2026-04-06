"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { 
  Video, 
  TestTube, 
  Pill, 
  HeartPulse, 
  Eye, 
  EyeOff, 
  Loader2, 
  Chrome,
  ArrowRight
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  signInWithGoogle, 
  signInWithEmail, 
  signInWithPhone 
} from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Validation Schemas
const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const phoneSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  otp: z.string().length(6, "OTP must be 6 digits").optional(),
});

type EmailFormValues = z.infer<typeof emailSchema>;
type PhoneFormValues = z.infer<typeof phoneSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { user, userType, loading: authLoading, syncing } = useAuth();
  
  const redirectAfterLogin = (role: string | null) => {
    switch(role) {
      case 'ADMIN':
        router.push('/admin/dashboard')
        break
      case 'DOCTOR':
        router.push('/doctor')
        break
      case 'PATIENT':
      default:
        router.push('/patient')
        break
    }
  }
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [countdown, setCountdown] = useState(0);

  // Redirect as soon as we have user + userType (instant for returning users)
  useEffect(() => {
    if (!authLoading && user && userType) {
      redirectAfterLogin(userType);
    }
  }, [user, userType, authLoading]);

  // Safety net: if user is logged in but sync is taking too long (new user),
  // redirect to /patient after 3 seconds max
  useEffect(() => {
    if (!authLoading && user && !userType && syncing) {
      const timeout = setTimeout(() => {
        // Sync still hasn't resolved — default to PATIENT
        redirectAfterLogin('PATIENT');
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [authLoading, user, userType, syncing]);

  // Resend OTP timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Forms
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "", password: "" },
  });

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "+91", otp: "" },
  });

  const onGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      toast.success("Welcome to Altruist!");
      // AuthContext handles redirect — keep loading true
    } catch (error: any) {
      toast.error(error.message || "Google sign-in failed");
      setIsLoading(false);
    }
  };

  const onEmailLogin = async (data: EmailFormValues) => {
    setIsLoading(true);
    try {
      await signInWithEmail(data.email, data.password);
      toast.success("Logged in successfully!");
      // AuthContext handles redirect — keep loading true
    } catch (error: any) {
      toast.error(error.message || "Check your credentials");
      setIsLoading(false);
    }
  };

  const onSendOTP = async () => {
    const phone = phoneForm.getValues("phone");
    if (!phone || phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsLoading(true);
    try {
      const result = await signInWithPhone(phone);
      setConfirmationResult(result);
      setOtpSent(true);
      setCountdown(60);
      toast.success("OTP sent to your phone");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyOTP = async (data: PhoneFormValues) => {
    if (!confirmationResult || !data.otp) return;
    
    setIsLoading(true);
    try {
      await confirmationResult.confirm(data.otp);
      toast.success("Phone verified!");
      // AuthContext handles redirect — keep loading true
    } catch (error: any) {
      toast.error("Invalid OTP. Try again.");
      setIsLoading(false);
    }
  };

  // Show loading spinner while Firebase is initializing
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // New user: Firebase auth done but waiting for background sync
  if (user && !userType && syncing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-white">
        <div className="bg-gradient-to-br from-[#0D9488] to-[#3B82F6] p-5 rounded-2xl shadow-lg">
          <HeartPulse className="w-10 h-10 text-white animate-pulse" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Setting up your account...</h2>
        <p className="text-gray-500 text-sm">This will only take a moment</p>
        <Loader2 className="w-6 h-6 animate-spin text-primary mt-2" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
      {/* Left Side: Gradient Hero */}
      <div className="hidden md:flex flex-1 bg-gradient-to-br from-[#0D9488] to-[#3B82F6] p-12 flex-col justify-between text-white relative">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <HeartPulse className="w-10 h-10" />
            <span className="text-3xl font-bold tracking-tight">Altruist</span>
          </div>
          
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
              <div key={i} className="flex gap-4 items-start group">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-colors">
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

        {/* Decorative Circles */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo mobile only */}
          <div className="md:hidden flex flex-col items-center gap-2 mb-4">
             <div className="bg-primary p-3 rounded-2xl">
               <HeartPulse className="w-8 h-8 text-white" />
             </div>
             <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Altruist</h2>
          </div>

          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h2>
            <p className="text-gray-500 font-medium">Log in to your account to continue</p>
          </div>

          <Card className="border-none shadow-none md:shadow-sm md:border bg-white">
            <CardContent className="pt-6">
              <Tabs defaultValue="google" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8 h-12 bg-gray-50 p-1 border">
                  <TabsTrigger 
                    value="google" 
                    className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md"
                  >
                    Google
                  </TabsTrigger>
                  <TabsTrigger 
                    value="email"
                    className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md"
                  >
                    Email
                  </TabsTrigger>
                  <TabsTrigger 
                    value="phone"
                    className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md"
                  >
                    Phone
                  </TabsTrigger>
                </TabsList>

                {/* Google Tab */}
                <TabsContent value="google" className="space-y-4 focus-visible:outline-none">
                  <Button 
                    variant="outline" 
                    className="w-full h-14 text-lg font-semibold bg-white hover:bg-gray-50 border-gray-200 transition-all active:scale-[0.98] relative overflow-hidden group"
                    onClick={onGoogleLogin}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <Chrome className="w-5 h-5 mr-3 text-blue-500 group-hover:scale-110 transition-transform" />
                    )}
                    Continue with Google
                  </Button>
                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-3 text-gray-400 font-medium">Platform secured by Firebase</span></div>
                  </div>
                </TabsContent>

                {/* Email Tab */}
                <TabsContent value="email" className="space-y-4 focus-visible:outline-none">
                  <form onSubmit={emailForm.handleSubmit(onEmailLogin)} className="space-y-4">
                    <div className="space-y-2">
                       <Input 
                         type="email" 
                         placeholder="Email address" 
                         className="h-12 border-gray-200 focus:border-primary transition-colors pr-10"
                         disabled={isLoading}
                         {...emailForm.register("email")}
                       />
                       {emailForm.formState.errors.email && (
                         <p className="text-sm text-red-500 font-medium px-1">{emailForm.formState.errors.email.message}</p>
                       )}
                    </div>

                    <div className="space-y-2">
                       <div className="relative">
                         <Input 
                           type={showPassword ? "text" : "password"} 
                           placeholder="Password" 
                           className="h-12 border-gray-200 focus:border-primary transition-colors pr-10"
                           disabled={isLoading}
                           {...emailForm.register("password")}
                         />
                         <button 
                           type="button"
                           onClick={() => setShowPassword(!showPassword)}
                           className="absolute right-3 top-3 text-gray-400 hover:text-primary transition-colors"
                         >
                           {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                         </button>
                       </div>
                       {emailForm.formState.errors.password && (
                         <p className="text-sm text-red-500 font-medium px-1">{emailForm.formState.errors.password.message}</p>
                       )}
                       <div className="text-right">
                         <Link href="#" className="text-sm font-semibold text-primary/80 hover:text-primary transition-colors underline-offset-4 hover:underline">Forgot password?</Link>
                       </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 text-lg font-bold bg-[#0D9488] hover:bg-[#0b7a6e] transition-all active:scale-[0.98]"
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Log in"}
                    </Button>
                  </form>
                </TabsContent>

                {/* Phone Tab */}
                <TabsContent value="phone" className="space-y-4 focus-visible:outline-none">
                  <form onSubmit={phoneForm.handleSubmit(onVerifyOTP)} className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div className="w-24 shrink-0">
                          <Input value="+91" disabled className="h-12 text-center font-bold bg-gray-50 border-gray-200" />
                        </div>
                        <Input 
                          placeholder="Phone number" 
                          className="h-12 border-gray-200 focus:border-primary transition-colors"
                          disabled={isLoading || otpSent}
                          {...phoneForm.register("phone")}
                        />
                      </div>
                      {phoneForm.formState.errors.phone && (
                        <p className="text-sm text-red-500 font-medium px-1">{phoneForm.formState.errors.phone.message}</p>
                      )}
                    </div>

                    {otpSent && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
                        <Input 
                          placeholder="6-digit OTP" 
                          maxLength={6}
                          className="h-12 text-center text-xl font-bold tracking-[0.5em] border-gray-200 focus:border-primary transition-colors"
                          disabled={isLoading}
                          {...phoneForm.register("otp")}
                        />
                         {phoneForm.formState.errors.otp && (
                           <p className="text-sm text-red-500 font-medium px-1">{phoneForm.formState.errors.otp.message}</p>
                         )}
                         <div className="flex justify-between items-center text-sm px-1">
                           <button 
                             type="button" 
                             onClick={onSendOTP}
                             disabled={countdown > 0 || isLoading}
                             className={cn("font-semibold transition-colors", 
                               countdown > 0 ? "text-gray-400" : "text-primary hover:text-primary/80")}
                           >
                             Resend OTP
                           </button>
                           {countdown > 0 && <span className="text-gray-500 font-medium">00:{countdown.toString().padStart(2, '0')}</span>}
                         </div>
                      </div>
                    )}

                    <Button 
                      type={otpSent ? "submit" : "button"} 
                      onClick={!otpSent ? onSendOTP : undefined}
                      className="w-full h-12 text-lg font-bold bg-primary hover:bg-[#0b7a6e] transition-all active:scale-[0.98]"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      ) : (
                        otpSent ? "Verify & Log in" : "Send OTP"
                      )}
                    </Button>
                  </form>
                   <div id="recaptcha-container" className="flex justify-center mt-4 overflow-hidden"></div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <p className="text-center text-gray-500 font-medium pt-4">
            New user? <Link href="/register" className="text-primary font-bold hover:underline underline-offset-4">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
