"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/ui/navbar";
import BottomBar from "@/components/ui/bottombar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const normalized = pathname.replace(/\/$/, "");
  const showBottomBar = ["/service", "/my-dogs", "/notifications", "/account", ""].includes(normalized);

  return (
    <>
      <Navbar />
      <main className="px-6 py-4 md:px-10 lg:px-16 pb-[calc(4rem+env(safe-area-inset-bottom))]">
        {children}
      </main>
      {showBottomBar && <BottomBar />}
    </>
  );
}
