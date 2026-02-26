"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { X, ImagePlus, History } from "lucide-react";

import SuccessHeader from "@/components/ui/success/SuccessHeader";
import SuccessSummaryCard from "@/components/ui/success/SuccessSummaryCard";

import type { Booking } from "@/lib/booking/booking.types";
import { bookingMock } from "@/lib/booking/booking.mock";
import { QRCodeSVG } from "qrcode.react";
import type { PetPicked, ServiceType } from "@/lib/walkin/walkin/types.mock";

/* ===== labels ===== */

type BookingStatus = Booking["status"];

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "รออนุมัติ",
  WaitingSlip: "รอชำระเงิน",
  slip_uploaded: "รอตรวจสลิป",
  slip_verified: "ชำระเงินแล้ว",
  "check-in": "กำลังใช้บริการ",
  finished: "เสร็จสิ้น",
  cancelled: "ยกเลิกแล้ว",
  rejected: "ปฏิเสธ",
};

function serviceLabel(t: Booking["serviceType"]) {
  return t === "boarding" ? "ฝากเลี้ยง" : "ว่ายน้ำ";
}

/* =========================
   room assignment helpers
========================= */

type RoomType = "SMALL" | "LARGE" | "VIP";
type RoomAssignment = {
  type: RoomType;
  roomNo: number;
  pets: Array<{ id: number; name: string; breed?: string | null; size?: "small" | "large" }>;
};

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function buildRoomAssignments(params: {
  pets: Array<{ id: number; name: string; size: "small" | "large"; breed?: string | null }>;
  plan: 1 | 2 | 3;
}): RoomAssignment[] {
  const { pets, plan } = params;
  if (!pets.length) return [];

  if (plan === 3) {
    return [
      {
        type: "VIP",
        roomNo: 1,
        pets: pets.map((p) => ({ ...p })),
      },
    ];
  }

  const small = pets.filter((p) => p.size === "small");
  const large = pets.filter((p) => p.size === "large");

  if (plan === 1) {
    const smallRooms: RoomAssignment[] = small.map((p, idx) => ({
      type: "SMALL",
      roomNo: idx + 1,
      pets: [{ ...p }],
    }));
    const largeRooms: RoomAssignment[] = large.map((p, idx) => ({
      type: "LARGE",
      roomNo: idx + 1,
      pets: [{ ...p }],
    }));
    return [...smallRooms, ...largeRooms];
  }

  // plan 2: small 3/room, large 2/room
  const smallRooms: RoomAssignment[] = chunk(small, 3).map((grp, idx) => ({
    type: "SMALL",
    roomNo: idx + 1,
    pets: grp.map((p) => ({ ...p })),
  }));

  const largeRooms: RoomAssignment[] = chunk(large, 2).map((grp, idx) => ({
    type: "LARGE",
    roomNo: idx + 1,
    pets: grp.map((p) => ({ ...p })),
  }));

  return [...smallRooms, ...largeRooms];
}

function planLabel(plan: 1 | 2 | 3) {
  if (plan === 1) return "แบบ 1 : มาตรฐาน";
  if (plan === 2) return "แบบ 2 : นอนด้วยกัน";
  return "แบบ 3 : VIP บ้านเดี่ยว";
}

/* =========================
   timeline types/helpers
========================= */

type HistoryItem = {
  key:
    | "created"
    | "approved"
    | "waiting_slip"
    | "slip_uploaded"
    | "slip_verified"
    | "check_in"
    | "finished"
    | "cancelled"
    | "rejected";
  label: string;
  at?: string;
  tone?: "success" | "info" | "danger";
  note?: string;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function formatThaiDateTime(d: Date) {
  const day = pad2(d.getDate());
  const month = pad2(d.getMonth() + 1);
  const year = d.getFullYear();
  const hr = d.getHours();
  const min = pad2(d.getMinutes());
  const ampm = hr >= 12 ? "PM" : "AM";
  const hr12 = hr % 12 === 0 ? 12 : hr % 12;
  return `เมื่อ ${day}/${month}/${year} ${hr12}:${min} ${ampm}`;
}

function buildMockHistory(status: BookingStatus): HistoryItem[] {
  const base = new Date("2025-11-02T10:50:00");
  const t1 = new Date(base.getTime() + 24 * 60 * 60 * 1000);
  const t2 = new Date(t1.getTime() + 30 * 60 * 1000);
  const t3 = new Date(t2.getTime() + 5 * 60 * 60 * 1000);

  const statusToKeys: Record<BookingStatus, HistoryItem["key"][]> = {
    pending: ["created"],
    WaitingSlip: ["created", "waiting_slip"],
    slip_uploaded: ["created", "waiting_slip", "slip_uploaded"],
    slip_verified: ["created", "waiting_slip", "slip_uploaded", "slip_verified"],
    "check-in": ["created", "waiting_slip", "slip_uploaded", "slip_verified", "check_in"],
    finished: ["created", "waiting_slip", "slip_uploaded", "slip_verified", "check_in", "finished"],
    cancelled: ["created", "cancelled"],
    rejected: ["created", "rejected"],
  };

  const autoLabel: Record<HistoryItem["key"], string> = {
    created: "สร้างรายการจอง",
    approved: "อนุมัติแล้ว",
    waiting_slip: "รอชำระเงิน",
    slip_uploaded: "แนบสลิปแล้ว",
    slip_verified: "ตรวจสลิปผ่าน",
    check_in: "เช็คอินใช้บริการ",
    finished: "เสร็จสิ้น",
    cancelled: "ยกเลิกการจอง",
    rejected: "ปฏิเสธรายการ",
  };

  const autoTone: Record<HistoryItem["key"], HistoryItem["tone"]> = {
    created: "info",
    approved: "success",
    waiting_slip: "info",
    slip_uploaded: "info",
    slip_verified: "success",
    check_in: "info",
    finished: "success",
    cancelled: "danger",
    rejected: "danger",
  };

  const allow = new Set(statusToKeys[status]);

  const baseSteps: HistoryItem[] = [
    { key: "created", label: "สร้างรายการจอง", at: formatThaiDateTime(base), tone: "info" },
    { key: "waiting_slip", label: "รอชำระเงิน", at: formatThaiDateTime(t1), tone: "info" },
    { key: "slip_uploaded", label: "แนบสลิปแล้ว", at: formatThaiDateTime(t2), tone: "info" },
    {
      key: "slip_verified",
      label: "ยืนยันการชำระเงินโดยพนักงาน",
      at: formatThaiDateTime(t3),
      tone: "success",
      note: "ผู้ตรวจ: staff01",
    },
  ];

  const known = baseSteps.filter((s) => allow.has(s.key));
  const existKeys = new Set(known.map((x) => x.key));

  const missing = Array.from(allow)
    .filter((k) => !existKeys.has(k))
    .map((k, i) => ({
      key: k,
      label: autoLabel[k],
      tone: autoTone[k],
      at: formatThaiDateTime(new Date(base.getTime() + (i + 3) * 60 * 60 * 1000)),
    }));

  return [...known, ...missing];
}

/* =========================
   UI: BottomSheet Modal
========================= */

function BottomSheet({
  open,
  title,
  rightAction,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  rightAction?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" aria-label="close overlay" className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-md px-4 pb-4">
        <div className="rounded-t-3xl bg-white shadow-2xl ring-1 ring-black/10 max-h-[85vh] flex flex-col overflow-hidden">
          <div className="flex justify-center pt-3">
            <div className="h-1.5 w-12 rounded-full bg-black/10" />
          </div>

          <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
            <div className="text-[16px] font-extrabold text-black/90">{title}</div>
            <div className="flex items-center gap-2">
              {rightAction}
              <button
                type="button"
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-full bg-black/[0.04] active:scale-95 transition"
                aria-label="ปิด"
              >
                <X className="h-5 w-5 text-black/70" />
              </button>
            </div>
          </div>

          <div className="px-4 pb-5 overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}

function TimelineList({ items }: { items: HistoryItem[] }) {
  return (
    <div className="rounded-2xl bg-black/[0.02] ring-1 ring-black/5 overflow-hidden">
      <div className="divide-y divide-black/5">
        {items.map((it) => {
          const dot =
            it.tone === "danger" ? "bg-red-500" : it.tone === "success" ? "bg-emerald-500" : "bg-emerald-500";

          return (
            <div key={it.key} className="px-4 py-3">
              <div className="flex items-start gap-3">
                <span className={`mt-1 h-2.5 w-2.5 rounded-full ${dot}`} />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-black">{it.label}</div>
                  {it.at ? <div className="mt-1 text-xs text-black/50">{it.at}</div> : null}
                  {it.note ? <div className="mt-1 text-xs text-black/60">{it.note}</div> : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================
   Image Preview Modal (FULLSCREEN)
========================= */

function ImagePreviewModal({
  open,
  src,
  title = "ดูรูปเต็ม",
  onClose,
}: {
  open: boolean;
  src: string | null;
  title?: string;
  onClose: () => void;
}) {
  if (!open || !src) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        aria-label="close preview overlay"
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      <div className="absolute inset-0 flex items-center justify-center p-3">
        <div
          className="relative w-full max-w-3xl rounded-2xl bg-black/30 ring-1 ring-white/10 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-3 py-2 bg-black/40">
            <div className="text-xs font-extrabold text-white/90">{title}</div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/15 active:scale-95 transition"
              aria-label="ปิด"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          <div className="w-full h-[78vh] bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="preview" className="w-full h-full object-contain" />
          </div>

          <div className="px-3 py-2 bg-black/40 text-[11px] text-white/70">แตะ/คลิกพื้นหลังเพื่อปิด</div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Slip Upload content (inside modal)
========================= */

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-gray-600 text-sm">{label}</p>
      <div className="font-semibold text-gray-900 text-sm text-right">{value}</div>
    </div>
  );
}

function SlipUploadPanel({
  disabled,
  defaultPreview,
  onPick,
  onSubmit,
}: {
  disabled?: boolean;
  defaultPreview?: string | null;
  onPick: (file: File, previewUrl: string) => void;
  onSubmit: () => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultPreview ?? null);
  const [fileName, setFileName] = useState<string>("");
  const [openPreview, setOpenPreview] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!previewUrl) setOpenPreview(false);
  }, [previewUrl]);

  return (
    <div className="space-y-3">
      <div className="text-[13px] text-black/55">
        รองรับไฟล์รูปภาพ • แนะนำให้เป็นรูปชัดเจน (mock ตอนนี้ยังไม่อัปโหลดจริง)
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-extrabold text-gray-900">แนบสลิปใหม่</p>
            <p className="text-xs text-black/45 mt-0.5">กรุณาตรวจสอบรูปและข้อมูลก่อนกดส่ง</p>
          </div>

          {previewUrl ? (
            <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-extrabold text-emerald-700 ring-1 ring-emerald-100">
              พร้อมส่ง
            </span>
          ) : (
            <span className="shrink-0 rounded-full bg-black/[0.04] px-2 py-1 text-[11px] font-extrabold text-black/50 ring-1 ring-black/10">
              ยังไม่เลือกไฟล์
            </span>
          )}
        </div>

        <div className="text-sm text-gray-700 space-y-1">
          <Row label="แนบโดย" value="ลูกค้า: (mock)" />
          <Row label="เวลาแนบ" value={previewUrl ? new Date().toLocaleString("th-TH") : "-"} />
        </div>

        {previewUrl ? (
          <div className="rounded-2xl overflow-hidden ring-1 ring-black/10 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="slip preview"
              className="w-full h-64 object-cover cursor-zoom-in"
              onClick={() => setOpenPreview(true)}
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-black/15 bg-black/[0.02] p-8 text-center text-sm text-black/50">
            ยังไม่ได้เลือกไฟล์
          </div>
        )}

        <div className="flex items-center gap-2">
          <label
            className={[
              "flex-1 cursor-pointer rounded-2xl py-3 text-center font-extrabold transition",
              disabled
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-white ring-1 ring-black/10 text-black hover:bg-black/[0.02]",
            ].join(" ")}
          >
            เลือกรูปสลิป
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={disabled}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;

                setFileName(f.name);
                const url = URL.createObjectURL(f);
                setPreviewUrl(url);
                onPick(f, url);
              }}
            />
          </label>

          <button
            type="button"
            disabled={!previewUrl || disabled}
            className={[
              "rounded-2xl px-4 py-3 font-extrabold transition active:scale-[0.99]",
              !previewUrl || disabled
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-[#F0A23A] text-white hover:bg-[#e99625]",
            ].join(" ")}
            onClick={() => {
              onSubmit();
              alert(fileName ? `ส่งสลิปแล้ว: ${fileName}` : "ส่งสลิปแล้ว");
            }}
          >
            ส่ง
          </button>
        </div>

        <p className="text-xs text-black/45">* หลังส่งแล้ว staff จะตรวจสอบและอัปเดตสถานะการชำระเงิน</p>
      </div>

      <ImagePreviewModal
        open={openPreview}
        src={previewUrl}
        title={fileName ? `ดูรูปเต็ม • ${fileName}` : "ดูรูปเต็ม"}
        onClose={() => setOpenPreview(false)}
      />
    </div>
  );
}

/* =========================
   Page
========================= */

export default function BookingDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params?.id ?? "");

  const booking = useMemo<Booking | undefined>(() => {
    return bookingMock.find((bb) => bb.id === id);
  }, [id]);

  const [localStatus, setLocalStatus] = useState<BookingStatus | null>(null);

  const [openHistory, setOpenHistory] = useState(false);
  const [openSlip, setOpenSlip] = useState(false);

  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);

  if (!booking) {
    return (
      <main className="min-h-screen bg-[#F7F4E8] px-4 py-6 pb-28 max-w-md mx-auto">
        <div className="mx-auto w-full max-w-md space-y-4">
          <div className="text-black/70 text-center">ไม่พบรายการจอง</div>
          <button
            type="button"
            className="w-full rounded-2xl bg-[#F0A23A] py-4 text-xl font-bold text-white"
            onClick={() => router.push("/service/schedule")}
          >
            กลับไปหน้าปฏิทิน
          </button>
          <div className="text-center text-xs text-black/40">debug id: {id}</div>
        </div>
      </main>
    );
  }

  const b: Booking = localStatus ? { ...booking, status: localStatus } : booking;

  const canCancel = b.status === "pending";
  const canUploadSlip = b.status === "WaitingSlip" || b.status === "slip_uploaded";

  const showQr = b.status === "slip_verified" || b.status === "check-in" || b.status === "finished";

  // ✅ map booking serviceType -> walkin serviceType ("boarding" | "swimming")
  const walkinServiceType: ServiceType = b.serviceType === "boarding" ? "boarding" : "swimming";

  // ✅ 1) ดึง pets ให้ถูกกับ booking.mock (petId/petName/petSize)
  const pickedPets = useMemo<PetPicked[]>(() => {
    const arr = (b as any).pets as Array<any> | undefined;

    if (Array.isArray(arr) && arr.length > 0) {
      return arr.map((p) => ({
        id: Number(p.petId ?? p.id),
        name: String(p.petName ?? p.name ?? `ID:${p.petId ?? p.id}`),
        size: ((p.petSize ?? p.size) === "large" ? "large" : "small") as "small" | "large",
        breed: (p.breed ?? null) as string | null,
        weightKg: (p.weightKg ?? null) as number | null,
      }));
    }

    const singleName = String((b as any).petName ?? "").trim();
    if (singleName) {
      return [{ id: 1, name: singleName, size: "small", breed: null, weightKg: null }];
    }

    return [];
  }, [b]);

  // ✅ 2) หา plan (ประเภทห้อง)
  const plan = useMemo(() => {
    const p = (b as any).plan as 1 | 2 | 3 | undefined;
    return (p === 1 || p === 2 || p === 3 ? p : 1) as 1 | 2 | 3;
  }, [b]);

  // ✅ 3) สร้าง roomAssignments เฉพาะ boarding
  const roomAssignments = useMemo(() => {
    if (b.serviceType !== "boarding") return undefined;
    if (!pickedPets.length) return undefined;

    // buildRoomAssignments ต้องการ {id,name,size,breed}
    const petsForRoom = pickedPets.map((p) => ({
      id: p.id,
      name: p.name,
      size: p.size,
      breed: p.breed ?? null,
    }));

    return buildRoomAssignments({ pets: petsForRoom, plan });
  }, [b.serviceType, pickedPets, plan]);

  const rows = useMemo(() => {
    const isBoarding = b.serviceType === "boarding";

    return [
      { label: "สถานะ", value: STATUS_LABEL[b.status] },
      { label: "รายการจอง", value: b.id },
      { label: "ประเภทบริการ", value: serviceLabel(b.serviceType) },

      ...(b.serviceType === "boarding" ? [{ label: "ประเภทห้อง", value: planLabel(plan) }] : []),

      ...(isBoarding
        ? [
            { label: "วันที่เข้า", value: (b as any).startAt || "-" },
            { label: "วันที่ออก", value: (b as any).endAt || "-" },
          ]
        : [
            { label: "วันที่ใช้บริการ", value: (b as any).startAt || "-" },
            { label: "รอบเวลา", value: (b as any).slotLabel || "-" },
          ]),

      { label: "ราคา", value: `${(b as any).price?.toLocaleString?.() ?? (b as any).price ?? 0} บาท` },
    ];
  }, [b, plan]);

  const historyItems = useMemo(() => {
    const items = buildMockHistory(b.status);

    if ((b as any).verifiedBy || (b as any).verifiedAt) {
      return items.map((it) => {
        if (it.key !== "slip_verified") return it;
        return {
          ...it,
          note: [
            (b as any).verifiedBy ? `ผู้ตรวจ: ${(b as any).verifiedBy}` : null,
            (b as any).verifiedAt ? `เวลา: ${(b as any).verifiedAt}` : null,
          ]
            .filter(Boolean)
            .join(" • "),
        };
      });
    }

    if ((b as any).cancelledReason) {
      return items.map((it) => (it.key === "cancelled" ? { ...it, note: (b as any).cancelledReason } : it));
    }

    return items;
  }, [b]);

  const [openCancelConfirm, setOpenCancelConfirm] = useState(false);

  return (
    <main className="min-h-screen bg-[#F7F4E8] px-4 py-6 pb-28 max-w-md mx-auto">
      <SuccessHeader serviceLabel="รายละเอียดการจอง" />

      <div className="mx-auto w-full max-w-md space-y-4">
        <div className="rounded-2xl bg-white/80 ring-1 ring-black/5 shadow-sm px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-black/45">Booking ID</p>
              <p className="text-sm font-extrabold text-black/90 truncate">{b.id}</p>
            </div>

            <span className="shrink-0 rounded-full bg-black/[0.06] px-3 py-1 text-xs font-bold text-black/70">
              {STATUS_LABEL[b.status]}
            </span>
          </div>

          <p className="mt-2 text-xs text-black/45">
            {canUploadSlip ? "แนบสลิปเพื่อให้พนักงานตรวจสอบ" : "การแนบสลิปจะเปิดได้เฉพาะสถานะที่กำหนด"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setOpenHistory(true)}
            className="rounded-2xl bg-white ring-1 ring-black/10 py-4 font-extrabold text-black/90 active:scale-[0.99] transition flex items-center justify-center gap-2"
          >
            <History className="h-5 w-5 text-black/60" />
            ประวัติสถานะ
          </button>

          <button
            type="button"
            disabled={!canUploadSlip}
            onClick={() => setOpenSlip(true)}
            className={[
              "rounded-2xl py-4 font-extrabold active:scale-[0.99] transition flex items-center justify-center gap-2",
              canUploadSlip ? "bg-[#111] text-white" : "bg-gray-200 text-gray-500",
            ].join(" ")}
          >
            <ImagePlus className="h-5 w-5" />
            แนบสลิป
          </button>
        </div>

        {/* ✅ QR */}
        {showQr ? (
          <div className="rounded-2xl bg-white ring-1 ring-black/10 p-4">
            <p className="font-extrabold text-gray-900 mb-2">QR การจอง</p>

            <div className="rounded-2xl border border-black/10 bg-white p-4 flex flex-col items-center gap-2">
              <QRCodeSVG value={`BOOKING:${b.id}`} size={180} marginSize={2} />
              <p className="text-xs text-black/55 text-center">
                แสดงหลังตรวจสลิปแล้ว (Slip Verified) • รหัส:{" "}
                <span className="font-semibold break-all">{b.id}</span>
              </p>
            </div>
          </div>
        ) : null}

        {/* ✅ Details card */}
        <SuccessSummaryCard
          title=""
          subtitle=""
          rows={rows}
          // selectedContent={
          //   <span className="text-sm font-semibold text-black/70">
          //     {pickedPets.length ? pickedPets.map((p) => p.name).join(", ") : "-"}
          //   </span>
          // }
          totalValue={<span className="text-black/60">{(b as any).cancelledReason ?? "-"}</span>}
          refCode={b.id}
          serviceType={walkinServiceType} // ✅ ส่งเป็น "boarding" | "swimming"
          petsPicked={pickedPets} // ✅ ส่งตรง ๆ (PetPicked รองรับ null แล้ว)
          roomAssignments={roomAssignments}
        />

        <div className="rounded-2xl bg-white/70 ring-1 ring-black/5 p-4">
          <p className="text-sm font-extrabold text-black/80">การจัดการ</p>
          <p className="text-xs text-black/45 mt-1">การยกเลิกทำได้เฉพาะสถานะ “รออนุมัติ”</p>

          <button
            type="button"
            disabled={!canCancel}
            onClick={() => setOpenCancelConfirm(true)}
            className={[
              "mt-3 w-full rounded-2xl py-4 text-base font-extrabold transition",
              canCancel ? "bg-white text-red-600 ring-1 ring-red-200 active:scale-[0.99]" : "bg-gray-200 text-gray-500",
            ].join(" ")}
          >
            {b.status === "cancelled" ? "ยกเลิกแล้ว" : "ยกเลิกการจอง"}
          </button>
        </div>

        <button
          type="button"
          className="w-full rounded-2xl bg-white ring-1 ring-black/10 py-4 text-base font-extrabold text-black/80 active:scale-[0.99] transition"
          onClick={() => router.push("/service/booking")}
        >
          กลับไปหน้ารายการจอง
        </button>

        {slipFile ? <div className="text-center text-xs text-black/40">debug slip: {slipFile.name}</div> : null}
      </div>

      <BottomSheet
        open={openHistory}
        title="สถานะบิล"
        onClose={() => setOpenHistory(false)}
        rightAction={<span className="text-[12px] text-black/45 font-semibold">ปัจจุบัน: {STATUS_LABEL[b.status]}</span>}
      >
        <TimelineList items={historyItems} />
      </BottomSheet>

      <BottomSheet open={openSlip} title="แนบหลักฐานการชำระเงิน" onClose={() => setOpenSlip(false)}>
        <SlipUploadPanel
          disabled={!canUploadSlip}
          defaultPreview={slipPreview ?? (b as any).slipUrl ?? null}
          onPick={(file, previewUrl) => {
            setSlipFile(file);
            setSlipPreview(previewUrl);
            setLocalStatus("slip_uploaded");
          }}
          onSubmit={() => setOpenSlip(false)}
        />
      </BottomSheet>

      {openCancelConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setOpenCancelConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white shadow-2xl ring-1 ring-black/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-black/5">
              <p className="text-base font-extrabold text-gray-900">ยืนยันการยกเลิกการจอง</p>
              <p className="mt-1 text-sm text-black/55">การยกเลิกไม่สามารถย้อนกลับได้</p>
            </div>

            <div className="px-5 py-4">
              <div className="rounded-2xl bg-red-50 ring-1 ring-red-100 p-4">
                <p className="text-sm text-red-700">คุณต้องการยกเลิกรายการจองนี้ใช่หรือไม่?</p>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  className="flex-1 rounded-2xl bg-black/[0.06] py-3 font-extrabold text-black/70 active:scale-[0.99] transition"
                  onClick={() => setOpenCancelConfirm(false)}
                >
                  ยกเลิก
                </button>

                <button
                  type="button"
                  className="flex-1 rounded-2xl bg-red-600 py-3 font-extrabold text-white active:scale-[0.99] transition"
                  onClick={() => {
                    setOpenCancelConfirm(false);
                    setLocalStatus("cancelled");
                  }}
                >
                  ยืนยันการยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}