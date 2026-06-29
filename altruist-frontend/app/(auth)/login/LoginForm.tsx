"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { 
  MessageSquare, 
  TestTube, 
  Pill, 
  HeartPulse, 
  Eye, 
  EyeOff, 
  Loader2, 
  ShieldCheck,
  Lock,
  Mail
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  signInWithGoogle, 
  signInWithEmail
} from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Validation Schemas
const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type EmailFormValues = z.infer<typeof emailSchema>;

const getAuthErrorMessage = (error: any) => {
  const code = error?.code || "";
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Invalid email or password. Please try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Please try again later.';
    default:
      return error?.message || 'An error occurred during authentication. Please try again.';
  }
};

const isValidRedirect = (url: string): boolean => {
  // Must start with '/' and not '//' (to prevent protocol-relative redirects like //evil.com)
  return url.startsWith('/') && !url.startsWith('//');
};

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || searchParams.get('redirect');
  const { user, userType, loading: authLoading, syncing } = useAuth();
  
  const redirectAfterLogin = (role: string | null) => {
    if (callbackUrl && isValidRedirect(callbackUrl)) {
      router.push(callbackUrl);
      return;
    }
    switch(role) {
      case 'ADMIN':
      case 'SUPER_ADMIN':
        router.push('/admin/dashboard');
        break;
      case 'DOCTOR':
        router.push('/doctor');
        break;
      case 'PATIENT':
      default:
        router.push('/patient');
        break;
    }
  };
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Wait for background sync to finish before redirecting
  useEffect(() => {
    if (!authLoading && user && userType && !syncing) {
      redirectAfterLogin(userType);
    }
  }, [user, userType, authLoading, syncing]);

  // Safety net: if user is logged in but sync is taking too long (new user), redirect to /patient
  useEffect(() => {
    if (!authLoading && user && !userType && syncing) {
      const timeout = setTimeout(() => {
        redirectAfterLogin('PATIENT');
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [authLoading, user, userType, syncing]);

  // Email form
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "", password: "" },
  });

  const onGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      toast.success("Welcome back!");
    } catch (error: any) {
      toast.error(getAuthErrorMessage(error));
      setIsLoading(false);
    }
  };

  const onEmailLogin = async (data: EmailFormValues) => {
    setIsLoading(true);
    try {
      await signInWithEmail(data.email, data.password);
      toast.success("Logged in successfully!");
    } catch (error: any) {
      toast.error(getAuthErrorMessage(error));
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (user && !userType && syncing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-surface">
        <div className="bg-gradient-to-br from-primary to-primary-hover p-6 rounded-3xl shadow-xl animate-pulse">
          <HeartPulse className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-2xl font-heading font-extrabold text-foreground mt-4">Setting up your account...</h2>
        <p className="text-muted-foreground font-medium">Securing your healthcare profile</p>
        <Loader2 className="w-6 h-6 animate-spin text-primary mt-4" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface">
      {/* Left Side: Trust Panel Hero */}
      <div className="hidden md:flex flex-1 relative bg-surface-muted overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#1A7A6D_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full max-w-2xl mx-auto h-full">
          <div>
            <Link href="/" className="inline-flex items-center mb-16">
              <img src="/logo.png" alt="Altruist Wellness" className="h-10 w-auto object-contain" />
            </Link>
            
            <Badge variant="primary" className="mb-6 py-1.5 px-4"><ShieldCheck className="w-4 h-4 mr-2" /> 100% Secure & Confidential</Badge>
            <h1 className="text-5xl font-heading font-extrabold leading-[1.1] text-foreground mb-6 tracking-tight">
              Your health data,<br />
              <span className="text-primary">safely in your hands.</span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium max-w-md">
              Log in to access your digital prescriptions, book chat consultations, and manage your health records seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-12">
            {[
              { icon: MessageSquare, title: "Chat Consults", desc: "Private & encrypted" },
              { icon: Pill, title: "Genuine Medicines", desc: "Verified pharmacies" },
              { icon: TestTube, title: "Lab Reports", desc: "Stored securely" },
              { icon: Lock, title: "Data Privacy", desc: "Strictly secure" }
            ].map((feature, i) => (
              <div key={i} className="flex gap-4 items-start bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-border">
                <div className="bg-primary/10 p-3 rounded-xl text-primary shrink-0">
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

      {/* Right Side: Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 bg-white relative">
        <div className="w-full max-w-[440px] space-y-8 relative z-10">
          <div className="md:hidden flex flex-col items-center gap-3 mb-8">
             <img src="/logo.png" alt="Altruist Wellness" className="h-12 w-auto object-contain" />
          </div>

          <div className="space-y-3 text-center md:text-left">
            <h2 className="text-3xl font-heading font-extrabold text-foreground tracking-tight">Welcome Back</h2>
            <p className="text-muted-foreground font-medium text-lg">Log in to your account to continue</p>
          </div>

          <Card className="border-border shadow-xl shadow-primary/5 rounded-3xl bg-white overflow-hidden">
            <CardContent className="p-8">
              <form onSubmit={emailForm.handleSubmit(onEmailLogin)} className="space-y-5">
                <div className="space-y-2">
                   <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input 
                        type="email" 
                        placeholder="Email address" 
                        className={cn("h-14 pl-12 rounded-xl bg-surface-muted/50 border-transparent focus:bg-white focus:border-primary transition-all font-medium", emailForm.formState.errors.email && "border-red-500 focus:border-red-500")}
                        disabled={isLoading}
                        {...emailForm.register("email")}
                      />
                   </div>
                   {emailForm.formState.errors.email && (
                     <p className="text-sm text-red-500 font-bold px-1">{emailForm.formState.errors.email.message}</p>
                   )}
                </div>

                <div className="space-y-2">
                   <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Password" 
                        className={cn("h-14 pl-12 pr-12 rounded-xl bg-surface-muted/50 border-transparent focus:bg-white focus:border-primary transition-all font-medium", emailForm.formState.errors.password && "border-red-500 focus:border-red-500")}
                        disabled={isLoading}
                        {...emailForm.register("password")}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                   </div>
                   {emailForm.formState.errors.password && (
                     <p className="text-sm text-red-500 font-bold px-1">{emailForm.formState.errors.password.message}</p>
                   )}
                   <div className="text-right pt-1">
                      <Link href="#" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Forgot password?</Link>
                   </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 text-base font-bold bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Log in to Account"}
                </Button>
              </form>

              {/* Google Login Shared Divider */}
              <div className="relative py-6">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border"></span></div>
                <div className="relative flex justify-center text-xs font-bold uppercase tracking-wider text-muted-foreground"><span className="bg-white px-4">Or continue with</span></div>
              </div>

              <Button 
                type="button"
                variant="outline" 
                className="w-full h-14 text-base font-bold bg-white hover:bg-surface-muted border-border transition-all active:scale-[0.98] rounded-xl"
                onClick={onGoogleLogin}
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </Button>
            </CardContent>
          </Card>

          <p className="text-center text-muted-foreground font-medium pt-2">
            New to Altruist? <Link href="/register" className="text-primary font-bold hover:underline underline-offset-4">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
