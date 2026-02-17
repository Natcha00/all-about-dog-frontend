"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { ChevronRight, User, Shield, Phone, LogOut } from "lucide-react";

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
        {subtitle ? (
          <p className="mt-0.5 text-[12px] text-black/45 truncate">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );

  const right = (
    <ChevronRight className={tone === "danger" ? "h-5 w-5 text-red-500" : "h-5 w-5 text-black/35"} />
  );

  if (href) {
    return (
      <Link href={href} className={[base, tone === "danger" ? danger : ""].join(" ")}>
        {content}
        {right}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={[base, tone === "danger" ? danger : ""].join(" ")}
    >
      {content}
      {right}
    </button>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const [showLogout, setShowLogout] = useState(false);

  // mock user
  const user = {
    name: "จีรกา เลา",
    subtitle: "จัดการข้อมูลบัญชีและความปลอดภัย",
    avatarText: "avatar",
  };

  const doLogout = async () => {
    // TODO: ใส่ logic logout จริงของเธอ (clear token / signOut / call API)
    // localStorage.removeItem("token");
    setShowLogout(false);
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-[#F7F4E8] px-4 py-6 pb-28 max-w-md mx-auto">
      <div className="mx-auto w-full max-w-md pt-8 space-y-5">
        <h1 className="text-center text-2xl font-extrabold text-black">บัญชีผู้ใช้</h1>

        {/* Profile card */}
        <section className="rounded-3xl bg-white/70 ring-1 ring-black/5 shadow-sm p-5 text-center">
          <div className="mx-auto h-24 w-24 rounded-full bg-white ring-1 ring-black/10 grid place-items-center overflow-hidden">
            <span className="text-sm text-black/40">{user.avatarText}</span>
          </div>

          <p className="mt-4 text-xl font-extrabold text-black">{user.name}</p>
          <p className="mt-1 text-sm text-black/45">{user.subtitle}</p>
        </section>

        {/* Menu list */}
        <section className="space-y-3">
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
