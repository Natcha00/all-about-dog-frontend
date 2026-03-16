"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ImagePlus, History } from "lucide-react";

import SuccessHeader from "@/components/ui/success/SuccessHeader";
import SuccessSummaryCard from "@/components/ui/success/SuccessSummaryCard";
import PageLoading from "@/components/ui/PageLoading";
import BookingHistorySheet from "@/components/ui/booking/BookingHistorySheet";
import BookingSlipSheet from "@/components/ui/booking/BookingSlipSheet";
import CancelBookingDialog from "@/components/ui/booking/CancelBookingDialog";

import type { Booking } from "@/lib/booking/booking.types";
import { mapDetailToBooking } from "@/lib/booking/booking.detail-mapper";
import {
  type BackendTimelineEntry,
  buildHistoryFromBackendTimeline,
} from "@/lib/booking/booking.timeline";
import { QRCodeSVG } from "qrcode.react";
import type { PetPicked, ServiceType } from "@/lib/walkin/walkin/types.mock";
import type { ReservationDetailResult } from "@/app/api/reservation/detail/route";
import { formatDateThai } from "@/lib/date/date.utils";

/* ===== labels ===== */

type BookingStatus = Booking["status"];

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "รออนุมัติ",
  waiting_slip: "รอชำระเงิน",
  slip_uploaded: "รอตรวจสลิป",
  slip_verified: "ชำระเงินสำเร็จ",
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
   Page
========================= */

export default function BookingDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params?.id ?? "");

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [localStatus, setLocalStatus] = useState<BookingStatus | null>(null);

  const [openHistory, setOpenHistory] = useState(false);
  const [openSlip, setOpenSlip] = useState(false);

  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [openCancelConfirm, setOpenCancelConfirm] = useState(false);
  const [uploadingSlip, setUploadingSlip] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const url = `/api/reservation/detail?code=${encodeURIComponent(id)}`;
        const res = await fetch(url);
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          if (cancelled) return;
          setError((data as any)?.error ?? "ไม่สามารถโหลดรายละเอียดการจองได้");
          setBooking(null);
          return;
        }

        const detail = (data as any)?.result as ReservationDetailResult | undefined;
        if (!detail) {
          if (cancelled) return;
          setError("ไม่พบรายละเอียดการจอง");
          setBooking(null);
          return;
        }

        if (cancelled) return;
        setBooking(mapDetailToBooking(detail));
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาดในการโหลดรายละเอียดการจอง");
        setBooking(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const b = localStatus && booking ? ({ ...booking, status: localStatus } as Booking) : booking;

  // ✅ 1) ดึง pets ให้ถูกกับ booking.mock (petId/petName/petSize)
  const pickedPets = useMemo<PetPicked[]>(() => {
    if (!b) return [];

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
    if (!b) return 1 as 1;
    const p = (b as any).plan as 1 | 2 | 3 | undefined;
    return (p === 1 || p === 2 || p === 3 ? p : 1) as 1 | 2 | 3;
  }, [b]);

  // ✅ 3) สร้าง roomAssignments เฉพาะ boarding
  const roomAssignments = useMemo(() => {
    if (!b) return undefined;
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
  }, [b, pickedPets, plan]);

  const rows = useMemo(() => {
    if (!b) return [];

    const isBoarding = b.serviceType === "boarding";

    return [
      { label: "สถานะ", value: STATUS_LABEL[b.status] },
      { label: "รายการจอง", value: b.id },
      { label: "ประเภทบริการ", value: serviceLabel(b.serviceType) },

      ...(b.serviceType === "boarding" ? [{ label: "ประเภทห้อง", value: planLabel(plan) }] : []),

      ...(isBoarding
        ? [
            {
              label: "วันที่เข้า",
              value: formatDateThai((b as any).startAt || "") || "-",
            },
            {
              label: "วันที่ออก",
              value: formatDateThai((b as any).endAt || "") || "-",
            },
          ]
        : [
            {
              label: "วันที่ใช้บริการ",
              value: formatDateThai((b as any).startAt || "") || "-",
            },
            { label: "รอบเวลา", value: (b as any).slotLabel || "-" },
          ]),

      { label: "ราคา", value: `${(b as any).price?.toLocaleString?.() ?? (b as any).price ?? 0} บาท` },
    ];
  }, [b, plan]);

  const cancelledTimelineDetail = useMemo(() => {
    const tl = (b as any)?.timeline as
      | Array<{ key?: string; detail?: string | null }>
      | undefined;

    if (!tl) return null;

    const item = tl.find((it) => it.key && it.key.toUpperCase() === "CANCELLED");
    return item?.detail ?? null;
  }, [b]);

  const historyItems = useMemo(() => {
    if (!b) return [];

    const backendTimeline = (b as any).timeline as BackendTimelineEntry[] | undefined;
    const hasBackendTimeline = Array.isArray(backendTimeline) && backendTimeline.length > 0;

    // ถ้ายังไม่มี log จริงจาก backend ไม่แสดงช่องรอล่วงหน้า (mock)
    if (!hasBackendTimeline) return [];

    const items = buildHistoryFromBackendTimeline(backendTimeline);

   

    return items;
  }, [b, cancelledTimelineDetail]);

  async function handleSubmitSlip() {
    if (!slipFile || !b || uploadingSlip) return;
    try {
      setUploadingSlip(true);
      const form = new FormData();
      form.append("code", b.id);
      form.append("file", slipFile);

      const res = await fetch("/api/reservation/slip", {
        method: "POST",
        body: form,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // simple alert for now; can replace with toast later
        alert((data as any)?.error ?? "อัปโหลดสลิปไม่สำเร็จ");
        return;
      }

      alert("อัปโหลดสลิปสำเร็จ");
      setLocalStatus("slip_uploaded");
      setOpenSlip(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : "เกิดข้อผิดพลาดในการอัปโหลดสลิป");
    } finally {
      setUploadingSlip(false);
    }
  }

  async function handleConfirmCancel() {
    if (!b || cancelling) return;
    try {
      setCancelling(true);
      const res = await fetch("/api/reservation/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: b.id }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert((data as any)?.error ?? "ยกเลิกรายการจองไม่สำเร็จ");
        return;
      }

      // อัปเดตสถานะในหน้า detail ให้เห็นทันที
      setLocalStatus("cancelled");
      setOpenCancelConfirm(false);

      // พาผู้ใช้กลับไปที่แท็บ "ยกเลิก" ของหน้ารายการจอง
      router.replace("/service/booking?tab=cancelled");
    } catch (e) {
      alert(e instanceof Error ? e.message : "เกิดข้อผิดพลาดในการยกเลิกรายการจอง");
    } finally {
      setCancelling(false);
    }
  }
  

  if (loading) {
    return (
      <PageLoading fullScreen message="กำลังโหลดรายละเอียดการจอง..." />
    );
  }

  if (error || !b) {
    return (
      <main className="min-h-screen bg-[#F7F4E8] px-4 py-6 pb-28 max-w-md mx-auto">
        <div className="mx-auto w-full max-w-md space-y-4">
          <div className="text-black/70 text-center">
            {error ?? "ไม่พบรายการจอง"}
          </div>
          <button
            type="button"
            className="w-full rounded-2xl bg-[#F0A23A] py-4 text-xl font-bold text-white"
            onClick={() => router.push("/service/booking")}
          >
            กลับไปหน้ารายการจอง
          </button>
          <div className="text-center text-xs text-black/40">debug code: {id}</div>
        </div>
      </main>
    );
  }

  const canCancel = b.status === "pending";
  const canUploadSlip = b.status === "waiting_slip" || b.status === "slip_uploaded";
  const hasUploadedSlip = b.status === "slip_uploaded";

  const showQr = b.status === "slip_verified" || b.status === "check-in" || b.status === "finished";

  // ✅ map booking serviceType -> walkin serviceType ("boarding" | "swimming")
  const walkinServiceType: ServiceType = b.serviceType === "boarding" ? "boarding" : "swimming";

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
            {hasUploadedSlip ? "แก้ไขรูปภาพสลิป" : "แนบสลิป"}
          </button>
        </div>

        {/* ✅ QR */}
        {showQr ? (
          <div className="rounded-2xl bg-white ring-1 ring-black/10 p-4">
            <p className="font-extrabold text-gray-900 mb-2">QR การจอง</p>

            <div className="rounded-2xl border border-black/10 bg-white p-4 flex flex-col items-center gap-2">
              <QRCodeSVG value={`${b.id}`} size={180} marginSize={2} />
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
          totalValue={
            <span className="text-black/60">-</span>
          }
          refCode={b.id}
          serviceType={walkinServiceType} // ✅ ส่งเป็น "boarding" | "swimming"
          petsPicked={pickedPets} // ✅ ส่งตรง ๆ (PetPicked รองรับ null แล้ว)
          roomAssignments={roomAssignments}
          customerNote={(b as any).note ?? null}
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

      <BookingHistorySheet
        open={openHistory}
        onClose={() => setOpenHistory(false)}
        items={historyItems}
        currentStatusLabel={STATUS_LABEL[b.status]}
      />

      <BookingSlipSheet
        open={openSlip}
        onClose={() => setOpenSlip(false)}
        disabled={!canUploadSlip || uploadingSlip}
        defaultPreview={slipPreview ?? b.slip?.imageUrl ?? null}
        onPick={(file, previewUrl) => {
          setSlipFile(file);
          setSlipPreview(previewUrl);
          setLocalStatus("slip_uploaded");
        }}
        onSubmit={handleSubmitSlip}
      />

      <CancelBookingDialog
        open={openCancelConfirm}
        loading={cancelling}
        onClose={() => setOpenCancelConfirm(false)}
        onConfirm={handleConfirmCancel}
      />
    </main>
  );
}