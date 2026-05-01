"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/ui/navbar";
import BottomBar from "@/components/ui/bottombar";
import { clearAuthTokens, getAccessToken } from "@/lib/auth/clientToken";
import { useAuthorizedApi } from "@/hooks/useAuthorizedApi";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
];

function isPublicPath(pathname: string) {
  const normalized = pathname.replace(/\/$/, "") || "/";
  return PUBLIC_PATHS.some((p) => normalized === p || normalized.startsWith(p + "/"));
}

export default function AppShell({
  children,
  avatarSrc,
}: {
  children: React.ReactNode;
  /** URL รูปโปรไฟล์ผู้ใช้ (ส่งจาก layout หรือ context เมื่อมี) */
  avatarSrc?: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const authorizedApi = useAuthorizedApi();
  const [authChecked, setAuthChecked] = useState(false);
  const checkingRef = useRef(false);

  useEffect(() => {
    if (isPublicPath(pathname)) {
      setAuthChecked(true);
      return;
    }
    if (!getAccessToken()) {
      clearAuthTokens();
      const loginUrl = "/login";
      const current = pathname && pathname !== "/" ? `?redirect=${encodeURIComponent(pathname)}` : "";
      router.replace(loginUrl + current);
      return;
    }
    if (checkingRef.current) return;
    checkingRef.current = true;
    let cancelled = false;
    authorizedApi("/api/auth/me")
      .then((res) => {
        if (cancelled) return;
        if (res.status === 401) {
          clearAuthTokens();
          const loginUrl = "/login";
          const current = pathname && pathname !== "/" ? `?redirect=${encodeURIComponent(pathname)}` : "";
          router.replace(loginUrl + current);
          return;
        }
        setAuthChecked(true);
      })
      .catch(() => {
        if (!cancelled) setAuthChecked(true);
      })
      .finally(() => {
        checkingRef.current = false;
      });
    return () => {
      cancelled = true;
    };
  }, [authorizedApi, pathname, router]);

  const normalized = pathname.replace(/\/$/, "");
  const showBottomBar = ["/service", "/my-dogs", "/notifications", "/account", ""].includes(normalized);
  const hideChromeForAuth =
    normalized === "/login" ||
    normalized === "/register" ||
    normalized === "/verify-email" ||
    normalized === "/forgot-password" ||
    normalized === "/reset-password";

  if (!authChecked && !isPublicPath(pathname)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F4E8]">
        <p className="text-gray-500">กำลังตรวจสอบ...</p>
      </div>
    );
  }

  if (hideChromeForAuth) {
    return <>{children}</>;
  }

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
