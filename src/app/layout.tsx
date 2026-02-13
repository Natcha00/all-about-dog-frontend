"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono, Prompt } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/navbar";
import BottomBar from "@/components/ui/bottombar";
import { usePathname } from "next/navigation";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-prompt",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const normalized = pathname.replace(/\/$/, ""); // ตัด / ท้ายออก
  const showBottomBar = ["/service", "/my-dogs", "/notifications", "/account",""].includes(normalized);
  return (
    <html lang="th" className="h-full">
      <body className={`${prompt.variable} ${geistMono.variable} font-prompt antialiased min-h-screen overflow-x-hidden`}>
        <Navbar />
        <main className="px-6 py-4 md:px-10 lg:px-16 pb-[calc(4rem+env(safe-area-inset-bottom))]">
          {children}
        </main>
        {showBottomBar && <BottomBar />}
      </body>
    </html>
  );
}

