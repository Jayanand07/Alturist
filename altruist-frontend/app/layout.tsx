import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import { cn } from "@/lib/utils";
import AppShell from "@/components/shared/AppShell";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Altruist – Medical Consultation Platform",
    template: "%s | Altruist",
  },
  description:
    "Connect with qualified doctors online. Book instant or scheduled consultations, get prescriptions, and manage your health with Altruist.",
  keywords: ["telemedicine", "online doctor", "medical consultation", "healthcare"],
  authors: [{ name: "Altruist Team" }],
  openGraph: {
    title: "Altruist – Medical Consultation Platform",
    description: "Quality healthcare at your fingertips.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", inter.variable, "font-sans", geist.variable)} data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col antialiased">
        <Providers>
          <AppShell>
            {children}
          </AppShell>
        </Providers>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
