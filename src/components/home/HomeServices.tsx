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
    iconBg: "bg-amber-100",
  },
  {
    title: "ว่ายน้ำ",
    subtitle: "สระว่ายน้ำสุนัข",
    icon: "/images/dogSwimmingLanding.jpg",
    path: "/walkin?service=swimming",
    iconBg: "bg-sky-100",
  },
] as const;

export default function HomeServices() {
  return (
    <section className="rounded-3xl bg-white/80 shadow-lg shadow-black/5 ring-1 ring-black/5 overflow-hidden">
      <div className="p-5 pb-4">
        <h2 className="text-base font-extrabold text-gray-900">บริการของเรา</h2>
        <p className="text-sm text-black/50 mt-0.5">เลือกบริการเพื่อสร้างการจอง</p>
      </div>

      <div className="grid grid-cols-2 gap-3 px-4 pb-5">
        {SERVICES.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className="
              group flex flex-col rounded-2xl overflow-hidden
              bg-white ring-1 ring-black/5
              hover:ring-2 hover:ring-[#F2A245]/40 hover:shadow-md
              active:scale-[0.98] transition-all duration-200
            "
          >
            <div className={`aspect-[4/3] relative overflow-hidden ${item.iconBg}`}>
              <AppImage
                src={item.icon}
                alt={item.title}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
            <div className="p-3 text-center">
              <p className="text-sm font-extrabold text-gray-900">{item.title}</p>
              <p className="text-xs text-black/50 mt-0.5">{item.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
