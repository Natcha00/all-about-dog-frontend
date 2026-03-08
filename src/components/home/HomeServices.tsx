"use client";

import React from "react";
import Link from "next/link";
import AppImage from "@/components/ui/AppImage";

const SERVICES = [
  {
    title: "ฝากเลี้ยง",
    subtitle: "รับฝากเลี้ยงสุนัข",
    icon: "/images/dogRoomLanding.jpg",
    path: "/walkin?service=boarding",
  },
  {
    title: "ว่ายน้ำ",
    subtitle: "สระว่ายน้ำสุนัข",
    icon: "/images/dogSwimmingLanding.jpg",
    path: "/walkin?service=swimming",
  },
] as const;

export default function HomeServices() {
  return (
    <section className="rounded-3xl bg-white/70 ring-1 ring-black/5 shadow-sm p-5 space-y-4">
      <div>
        <h2 className="text-base font-extrabold text-gray-900">บริการของฉัน</h2>
        <p className="text-sm text-black/50">เลือกบริการเพื่อสร้างการจอง</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {SERVICES.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className="
              flex flex-col items-center justify-center gap-2 text-center
              rounded-2xl bg-[#F7F4E8] ring-1 ring-black/5
              hover:ring-[#F2A245]/50 hover:shadow-md
              active:scale-[0.98] transition
              h-28 sm:h-32 p-4
            "
          >
            <p className="text-sm font-extrabold text-gray-900">{item.title}</p>
            <p className="text-xs text-black/50">{item.subtitle}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
