"use client";

import React from "react";
import { ClipboardList, Waves, Home, Clock } from "lucide-react";

export type ServiceType = "ว่ายน้ำ" | "ฝากเลี้ยง";

type BaseHistory = {
  id: string | number;
  serviceType: ServiceType;
  refCode?: string; // อ้างอิงรายการจอง
  note?: string;
};

export type SwimHistory = BaseHistory & {
  serviceType: "ว่ายน้ำ";
  checkIn: string; // 17/03/2023 14:45
  checkOut: string; // 17/03/2023 16:00
};

export type BoardingHistory = BaseHistory & {
  serviceType: "ฝากเลี้ยง";
  checkIn: string; // 19/03/2023 10:00
  checkOut: string; // 21/03/2023 18:00
  nights: number; // จำนวนคืน
  roomType?: string; // ห้องเดี่ยว/ห้องรวม/ห้องแอร์
};

export type ServiceHistoryItem = SwimHistory | BoardingHistory;

interface HistoryTabProps {
  currentItem: string;
  items: ServiceHistoryItem[];
}

function Chip({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success";
}) {
  const cls =
    tone === "success"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
      : "bg-gray-50 text-gray-700 ring-gray-100";

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ${cls}`}>
      {children}
    </span>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-3 border-b border-gray-100 last:border-b-0">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900 text-right break-words">{value}</p>
    </div>
  );
}

function ServiceIcon({ type }: { type: ServiceType }) {
  const Icon = type === "ว่ายน้ำ" ? Waves : Home;
  return (
    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white ring-1 ring-[#BFE7E9]">
      <Icon className="w-5 h-5 text-[#f0a23a]" />
    </div>
  );
}

function TitleText({ item }: { item: ServiceHistoryItem }) {
  const isSwim = item.serviceType === "ว่ายน้ำ";
  return (
    <div className="min-w-0">
      <p className="text-sm font-semibold text-gray-900 truncate">
        {isSwim ? "บริการว่ายน้ำ" : "บริการฝากเลี้ยง"}
      </p>
      <p className="text-xs text-gray-500">
        {item.refCode ? `อ้างอิง: #${item.refCode}` : "ไม่มีเลขอ้างอิง"}
      </p>
    </div>
  );
}

function HistoryCard({ item }: { item: ServiceHistoryItem }) {
  const isSwim = item.serviceType === "ว่ายน้ำ";

  return (
    <div className="rounded-3xl bg-white ring-1 ring-gray-100 shadow-sm overflow-hidden">
      {/* SoftCard header */}
      <div className="px-4 py-3 bg-gradient-to-r from-[#E8F7F6] via-white to-[#E8F7F6] border-b border-gray-100">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <ServiceIcon type={item.serviceType} />
            <TitleText item={item} />
          </div>

          {/* right chips */}
          <div className="flex items-center gap-2 shrink-0">
            <Chip tone="neutral">{item.serviceType}</Chip>
            {!isSwim ? <Chip tone="success">{item.nights} คืน</Chip> : null}
          </div>
        </div>
      </div>

      {/* SoftCard body */}
      <div className="px-4 py-4">
        <Row label="เข้าใช้บริการ" value={`${item.checkIn} น.`} />
        <Row label="ออกจากบริการ" value={`${item.checkOut} น.`} />

        {!isSwim ? (
          <div className="pt-3">
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-gray-50 ring-1 ring-gray-100 px-3 py-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="font-medium">รายละเอียดฝากเลี้ยง</span>
              </div>
              {item.roomType ? <Chip>{item.roomType}</Chip> : <Chip>ไม่ระบุห้อง</Chip>}
            </div>
          </div>
        ) : null}

        {item.note ? (
          <div className="pt-3">
            <p className="text-xs text-gray-500 mb-2">หมายเหตุ</p>
            <div className="rounded-2xl bg-gray-50 ring-1 ring-gray-100 px-3 py-3 text-sm text-gray-700 leading-relaxed">
              {item.note}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function HistoryTab({ currentItem, items }: HistoryTabProps) {
  if (currentItem !== "history") return null;

  return (
    <div className="mx-auto w-full max-w-md px-4 pb-8">
      {/* Header (Poikai SoftCard style) */}
      <div className="flex items-center gap-3 mb-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gray-900 text-white shadow-sm">
          <ClipboardList className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-gray-500 leading-none">ประวัติการใช้งาน</p>
          <p className="mt-1 text-base font-semibold text-gray-900">ว่ายน้ำ / ฝากเลี้ยง</p>
        </div>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-3xl bg-white ring-1 ring-gray-100 shadow-sm p-5 text-center">
            <p className="text-gray-600">ยังไม่มีประวัติการใช้งาน</p>
            <p className="text-xs text-gray-500 mt-1">เมื่อมีการใช้บริการ ระบบจะแสดงรายการที่นี่</p>
          </div>
        ) : (
          items.map((it) => <HistoryCard key={it.id} item={it} />)
        )}
      </div>
    </div>
  );
}
