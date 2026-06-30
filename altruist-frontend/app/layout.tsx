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
      <head>
        <meta name="color-scheme" content="light dark" />
        {process.env.NEXT_PUBLIC_API_URL && (
          <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL} crossOrigin="anonymous" />
        )}
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} crossOrigin="anonymous" />
        )}
        {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN && (
          <link rel="dns-prefetch" href={`https://${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}`} />
        )}
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
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
