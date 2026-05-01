"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { ChevronRight, User, Shield, Phone, LogOut, PawPrint } from "lucide-react";
import AppImage from "@/components/ui/AppImage";
import { toBackendUrlFromApi } from "@/lib/api/backend";
import { getApiErrorMessage } from "@/lib/api/error";
import { useAuthorizedApi } from "@/hooks/useAuthorizedApi";
import { clearAuthTokens } from "@/lib/auth/clientToken";

export type AccountProfile = {
  id: number;
  code: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  address: string | null;
  profilePictureUrl: string | null;
  isEmailVerified: boolean;
};

function MenuItem({
  href,
  icon,
  title,
  subtitle,
  tone = "default",
  onClick,
}: {
  href?: string;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  tone?: "default" | "danger";
  onClick?: () => void;
}) {
  const base =
    "w-full rounded-2xl bg-white/70 ring-1 ring-black/10 shadow-sm px-4 py-3 flex items-center justify-between gap-3 active:scale-[0.99] transition";
  const danger = "ring-red-200 bg-white text-red-600";

  const content = (
    <div className="flex items-center gap-3 min-w-0">
      <div
        className={[
          "grid h-10 w-10 place-items-center rounded-2xl",
          tone === "danger" ? "bg-red-50 text-red-600" : "bg-black/[0.04] text-black/70",
        ].join(" ")}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p
          className={[
            "text-[15px] font-extrabold truncate",
            tone === "danger" ? "text-red-600" : "text-black/90",
          ].join(" ")}
        >
          {title}
        </p>
        {subtitle ? <p className="mt-0.5 text-[12px] text-black/45 truncate">{subtitle}</p> : null}
      </div>
    </div>
  );

  const right = <ChevronRight className={tone === "danger" ? "h-5 w-5 text-red-500" : "h-5 w-5 text-black/35"} />;

  if (href) {
    return (
      <Link href={href} className={[base, tone === "danger" ? danger : ""].join(" ")}>
        {content}
        {right}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={[base, tone === "danger" ? danger : ""].join(" ")}>
      {content}
      {right}
    </button>
  );
}

function MyDogsCard({
  dogs,
}: {
  dogs: { id: number; name: string; breed?: string; imageUrl?: string }[];
}) {
  const total = dogs.length;
  const preview = dogs.slice(0, 4);

  return (
    <section className="rounded-3xl bg-white/70 ring-1 ring-black/5 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[16px] font-extrabold text-black/90">สุนัขของฉัน</p>
          <p className="mt-1 text-[12px] text-black/45">
            ทั้งหมด {total} ตัว {total ? "· แตะเพื่อดูทั้งหมด" : ""}
          </p>
        </div>

        <Link
          href="/account/dogs"
          className="inline-flex items-center gap-1 rounded-2xl bg-black/[0.05] px-3 py-2 text-[12px] font-extrabold text-black/70 active:scale-[0.99] transition"
        >
          ดูทั้งหมด <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {total === 0 ? (
        <div className="mt-4 rounded-2xl bg-black/[0.04] ring-1 ring-black/5 px-4 py-3">
          <p className="text-[13px] text-black/60">ยังไม่มีสุนัขในบัญชีนี้</p>
          <Link
            href="/account/dogs/new"
            className="mt-2 inline-flex rounded-2xl bg-[#F2A245] px-4 py-2 text-[13px] font-extrabold text-white active:scale-[0.99] transition"
          >
            + เพิ่มสุนัข
          </Link>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {preview.map((d) => (
            <span
              key={d.id}
              className="inline-flex items-center gap-2 rounded-full bg-white ring-1 ring-black/10 px-3 py-1.5 text-[13px] font-semibold text-black/80"
            >
              <span className="h-6 w-6 rounded-full bg-black/[0.05] ring-1 ring-black/10 overflow-hidden grid place-items-center">
                <AppImage src={d.imageUrl} alt={d.name} className="h-full w-full object-cover" />
              </span>
              <span className="max-w-[140px] truncate">{d.name}</span>
            </span>
          ))}

          {total > preview.length ? (
            <span className="inline-flex items-center rounded-full bg-black/[0.04] ring-1 ring-black/5 px-3 py-1.5 text-[13px] font-extrabold text-black/60">
              +{total - preview.length} ตัว
            </span>
          ) : null}
        </div>
      )}
    </section>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const authorizedApi = useAuthorizedApi();
  const [showLogout, setShowLogout] = useState(false);
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    authorizedApi("/api/account/profile")
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401) throw new Error("Unauthorized");
          throw new Error(await getApiErrorMessage(res, "โหลดข้อมูลไม่สำเร็จ"));
        }
        return res.json();
      })
      .then((data: AccountProfile) => {
        if (!cancelled) setProfile(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "โหลดข้อมูลไม่สำเร็จ");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authorizedApi]);

  const displayName = profile
    ? [profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.email
    : "";
  const subtitle = "จัดการข้อมูลบัญชีและความปลอดภัย";
  const avatarInitials = profile
    ? [profile.firstName, profile.lastName]
        .filter(Boolean)
        .map((s) => s.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2) || profile.email.charAt(0).toUpperCase()
    : "—";

  const doLogout = async () => {
    setShowLogout(false);
    try {
      await authorizedApi("/api/auth/logout", { method: "POST" });
    } finally {
      clearAuthTokens();
      router.replace("/login");
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F4E8] px-4 py-6 pb-28 max-w-md mx-auto">
      <div className="mx-auto w-full max-w-md pt-8 space-y-5">
        <h1 className="text-center text-2xl font-extrabold text-black">บัญชีผู้ใช้</h1>

        {loading ? (
          <section className="rounded-3xl bg-white/70 ring-1 ring-black/5 shadow-sm p-8 text-center">
            <p className="text-black/50">กำลังโหลด...</p>
          </section>
        ) : error ? (
          <section className="rounded-3xl bg-white/70 ring-1 ring-red-100 shadow-sm p-5 text-center">
            <p className="text-red-600">{error}</p>
            {error === "Unauthorized" && (
              <Link href="/login">
                <button type="button" className="mt-3 text-sm text-[#F2A245] font-semibold underline">
                  ไปหน้าเข้าสู่ระบบ
                </button>
              </Link>
            )}
          </section>
        ) : (
          <>
        {/* Profile card */}
        <section className="rounded-3xl bg-white/70 ring-1 ring-black/5 shadow-sm p-5 text-center">
          <div className="mx-auto h-24 w-24 rounded-full bg-white ring-1 ring-black/10 grid place-items-center overflow-hidden">
            {profile?.profilePictureUrl ? (
              <AppImage
                src={profile.profilePictureUrl}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xl font-bold text-black/40">{avatarInitials}</span>
            )}
          </div>

          <p className="mt-4 text-xl font-extrabold text-black">{displayName || "—"}</p>
          <p className="mt-1 text-sm text-black/45">{subtitle}</p>
          {profile?.email ? (
            <p className="mt-1 text-xs text-black/40">{profile.email}</p>
          ) : null}
        </section>

        {/* ✅ My Dogs summary */}
        {/* <MyDogsCard dogs={dogs} /> */}

        {/* Menu list */}
        <section className="space-y-3">
          {/* ✅ เพิ่มเมนู "สุนัขของฉัน" */}
          {/* <MenuItem
            href="/my-dogs"
            icon={<PawPrint className="h-5 w-5" />}
            title="สุนัขของฉัน"
            subtitle={`ดู/เพิ่ม/แก้ไขข้อมูลสุนัข (${dogs.length} ตัว)`}
          /> */}

          <MenuItem
            href="/account/profile"
            icon={<User className="h-5 w-5" />}
            title="ข้อมูลส่วนตัว"
            subtitle="ชื่อ–เบอร์โทร–อีเมล–ที่อยู่"
          />

          <MenuItem
            href="/account/password"
            icon={<Shield className="h-5 w-5" />}
            title="เปลี่ยนรหัสผ่าน"
            subtitle="อัปเดตความปลอดภัยบัญชี"
          />

          <MenuItem
            href="/account/contact"
            icon={<Phone className="h-5 w-5" />}
            title="ติดต่อโรงแรม"
            subtitle="โทร / แชท / แผนที่"
          />

          <MenuItem
            icon={<LogOut className="h-5 w-5" />}
            title="ออกจากระบบ"
            subtitle="ออกจากบัญชีนี้"
            tone="danger"
            onClick={() => setShowLogout(true)}
          />
        </section>
          </>
        )}
      </div>

      {/* Logout confirm (Poikai modal) */}
      {showLogout && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-sm p-4"
          onClick={() => setShowLogout(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white ring-1 ring-black/10 shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-black/5 bg-white/70">
              <p className="text-base font-extrabold text-black">ออกจากระบบ?</p>
              <p className="mt-1 text-sm text-black/55">คุณต้องการออกจากบัญชีนี้ใช่ไหม</p>
            </div>

            <div className="px-5 py-4">
              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  className="flex-1 rounded-2xl bg-black/[0.06] py-3 font-extrabold text-black/70 active:scale-[0.99] transition"
                  onClick={() => setShowLogout(false)}
                >
                  ยกเลิก
                </button>

                <button
                  type="button"
                  className="flex-1 rounded-2xl bg-[#F2A245] py-3 font-extrabold text-white active:scale-[0.99] transition"
                  onClick={doLogout}
                >
                  ออกเลย
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}