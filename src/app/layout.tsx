import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { prisma } from "@/lib/prisma";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.siteSetting.findFirst();
  let faviconUrl = "/favicon.ico"; // default
  
  if (settings?.favicon) {
    if (settings.favicon.startsWith('http')) {
      faviconUrl = settings.favicon;
    } else {
      faviconUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${settings.favicon}`;
    }
  }

  return {
    title: "Tabia Team - Internal Operations System",
    description: "Sistem Operasional Internal Rumah Tahfidz Tabia",
    icons: {
      icon: faviconUrl,
    },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
