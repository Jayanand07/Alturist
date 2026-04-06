import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import { cn } from "@/lib/utils";
import AppShell from "@/components/shared/AppShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Altruist – India's Most Trusted Healthcare Platform",
    template: "%s | Altruist",
  },
  description:
    "Connect with 500+ verified doctors online. Book instant video consultations, order genuine medicines, and manage your health — anytime, anywhere.",
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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", inter.variable, plusJakarta.variable, dmSans.variable)} data-scroll-behavior="smooth">
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
