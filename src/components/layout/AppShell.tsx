"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/ui/navbar";
import BottomBar from "@/components/ui/bottombar";

export default function AppShell({
  children,
  avatarSrc,
}: {
  children: React.ReactNode;
  /** URL รูปโปรไฟล์ผู้ใช้ (ส่งจาก layout หรือ context เมื่อมี) */
  avatarSrc?: string | null;
}) {
  const pathname = usePathname();
  const normalized = pathname.replace(/\/$/, "");
  const showBottomBar = ["/service", "/my-dogs", "/notifications", "/account", ""].includes(normalized);

  return (
    <>
      <Navbar avatarSrc={avatarSrc} />
      <main className="px-6 py-4 md:px-10 lg:px-16 pb-[calc(4rem+env(safe-area-inset-bottom))]">
        {children}
      </main>
      {showBottomBar && <BottomBar />}
    </>
  );
}
