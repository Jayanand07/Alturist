import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "./providers";
import AppShell from "@/components/shared/AppShell";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Altruist – India's Most Trusted Healthcare Platform",
    template: "%s | Altruist",
  },
  description:
    "Connect with 500+ verified doctors online. Book instant chat consultations, order genuine medicines, and manage your health — anytime, anywhere.",
  keywords: ["telemedicine", "online doctor", "medical consultation", "healthcare", "medicine delivery", "lab tests"],
  authors: [{ name: "Altruist Healthcare" }],
  openGraph: {
    title: "Altruist – India's Most Trusted Healthcare Platform",
    description: "Quality healthcare at your fingertips. 50,000+ consultations completed.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html 
      lang="en" 
      className={`${plusJakartaSans.variable} ${outfit.variable} h-full`} 
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
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
