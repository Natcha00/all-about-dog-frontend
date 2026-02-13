// src/app/account/contact/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, Phone, Mail, MapPin, Facebook } from "lucide-react";

const ORANGE = "#F2A245";

// ✅ แก้ค่าตรงนี้ได้เลย
const CONTACT = {
  placeName: "All About Dog",
  address:
    "10/1 ทางหลวงชนบทหมายเลข นน.1016 ตำบลบางแม่นาง อำเภอบางใหญ่ จ.นนทบุรี 11140",
  phones: ["02-2785836", "083-2129756"],
  email: "allaboutdogcareservice@gmail.com",
  lineId: "@AllAboutdog",
  facebookName: "All About Dog โรงแรมสุนัข รับฝากสุนัข",
  // ใช้ลิงก์ embed ของ Google Maps (ใส่ของจริงทีหลังได้)
  mapEmbedSrc:
    "https://www.google.com/maps?q=13.8167,100.4167&z=15&output=embed",
  // ลิงก์นำทาง (Google Maps)
  directionsHref:
    "https://www.google.com/maps/search/?api=1&query=All%20About%20Dog",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-[18px] font-extrabold text-black mt-6">{children}</p>;
}

function Row({
  icon,
  title,
  desc,
  right,
}: {
  icon: React.ReactNode;
  title: string;
  desc: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white/70 ring-1 ring-black/5 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-black/[0.04] ring-1 ring-black/5">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-black/85">{title}</p>
          <div className="mt-1 text-[15px] leading-relaxed text-black/80 break-words">
            {desc}
          </div>
        </div>

        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#FFF7EA] pb-10">
      <div className="mx-auto w-full max-w-md px-4 pt-6">
        {/* Top bar */}
        <div className="flex items-center gap-2">
          <Link
            href="/account"
            className="grid h-10 w-10 place-items-center rounded-full bg-white/70 ring-1 ring-black/10 active:scale-95 transition"
            aria-label="กลับ"
          >
            <ChevronLeft className="h-5 w-5 text-black/70" />
          </Link>

          <div className="flex-1 text-center">
            <h1 className="text-[34px] font-extrabold tracking-tight text-black">
              ติดต่อโรงแรม
            </h1>
          </div>

          <div className="h-10 w-10" />
        </div>

        {/* Map card */}
        <section className="mt-5 rounded-3xl bg-white/70 ring-1 ring-black/5 shadow-sm overflow-hidden">
          <div className="relative">
            <iframe
              title="map"
              src={CONTACT.mapEmbedSrc}
              className="h-48 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="absolute right-4 bottom-4">
              <a
                href={CONTACT.directionsHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-[15px] font-extrabold text-white shadow-sm active:scale-[0.99] transition"
                style={{ background: "#2E8A99" }}
              >
                นำทาง
              </a>
            </div>
          </div>
        </section>

        {/* Address */}
        <SectionTitle>ที่อยู่</SectionTitle>
        <Row
          icon={<MapPin className="h-5 w-5 text-black/60" />}
          title={CONTACT.placeName}
          desc={CONTACT.address}
        />

        {/* Phones */}
        <SectionTitle>เบอร์ติดต่อ</SectionTitle>
        <Row
          icon={<Phone className="h-5 w-5 text-black/60" />}
          title="โทร"
          desc={
            <div className="space-y-1">
              {CONTACT.phones.map((p) => (
                <a
                  key={p}
                  href={`tel:${p.replace(/[^0-9+]/g, "")}`}
                  className="block font-semibold text-black/80 underline decoration-black/20 underline-offset-4"
                >
                  {p}
                </a>
              ))}
            </div>
          }
          right={
            <a
              href={`tel:${CONTACT.phones[0].replace(/[^0-9+]/g, "")}`}
              className="rounded-2xl px-4 py-2 text-[13px] font-extrabold text-white active:scale-[0.99] transition"
              style={{ background: ORANGE }}
            >
              โทรเลย
            </a>
          }
        />

        {/* Email */}
        <SectionTitle>อีเมล</SectionTitle>
        <Row
          icon={<Mail className="h-5 w-5 text-black/60" />}
          title="Email"
          desc={
            <a
              href={`mailto:${CONTACT.email}`}
              className="font-semibold text-black/80 underline decoration-black/20 underline-offset-4 break-all"
            >
              {CONTACT.email}
            </a>
          }
          right={
            <a
              href={`mailto:${CONTACT.email}`}
              className="rounded-2xl bg-white ring-1 ring-black/10 px-4 py-2 text-[13px] font-extrabold text-black/70 active:scale-[0.99] transition"
            >
              ส่งเมล
            </a>
          }
        />

        {/* Social */}
        <SectionTitle>โซเชียลมีเดีย</SectionTitle>

        {/* LINE */}
        <Row
          icon={
            <div className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-white text-[11px] font-extrabold">
              L
            </div>
          }
          title="LINE"
          desc={
            <div>
              <div className="font-semibold text-black/85">{CONTACT.lineId} (มี @ นำหน้า)</div>
              <div className="mt-1 text-xs text-black/50">
                * แตะเพื่อคัดลอก แล้วไปค้นหาใน LINE
              </div>
            </div>
          }
          right={
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(CONTACT.lineId);
                  alert("คัดลอก LINE ID แล้ว");
                } catch {
                  alert("คัดลอกไม่สำเร็จ (ลองคัดลอกด้วยตนเอง)");
                }
              }}
              className="rounded-2xl bg-white ring-1 ring-black/10 px-4 py-2 text-[13px] font-extrabold text-black/70 active:scale-[0.99] transition"
            >
              คัดลอก
            </button>
          }
        />

        {/* Facebook */}
        <Row
          icon={<Facebook className="h-5 w-5 text-black/60" />}
          title="Facebook"
          desc={CONTACT.facebookName}
          right={
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl bg-white ring-1 ring-black/10 px-4 py-2 text-[13px] font-extrabold text-black/70 active:scale-[0.99] transition"
            >
              เปิด
            </a>
          }
        />

        {/* bottom space */}
        <div className="h-8" />
      </div>
    </main>
  );
}
