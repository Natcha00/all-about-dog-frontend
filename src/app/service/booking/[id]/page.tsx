"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { X, ImagePlus, History } from "lucide-react";

import SuccessHeader from "@/components/ui/success/SuccessHeader";
import SuccessSummaryCard from "@/components/ui/success/SuccessSummaryCard";

import type { Booking } from "@/lib/booking/booking.types";
import { bookingMock } from "@/lib/booking/booking.mock";

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

  // “ตัวอย่าง” ให้มี text เหมือนภาพที่คุณแนบ (โชว์ว่าใครตรวจได้)
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
  // lock scroll
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
      {/* overlay */}
      <button
        type="button"
        aria-label="close overlay"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* sheet */}
      <div className="absolute inset-x-0 bottom-16 mx-auto w-full max-w-md">
        <div className="rounded-t-3xl bg-white shadow-2xl ring-1 ring-black/10">
          {/* handle */}
          <div className="flex justify-center pt-3">
            <div className="h-1.5 w-12 rounded-full bg-black/10" />
          </div>

          {/* header */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
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

          <div className="px-4 pb-5">{children}</div>
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
            it.tone === "danger"
              ? "bg-red-500"
              : it.tone === "success"
              ? "bg-emerald-500"
              : "bg-emerald-500";

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
   Slip Upload content (inside modal)
========================= */

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

  // cleanup object url
  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="space-y-3">
      <div className="text-[13px] text-black/55">
        รองรับไฟล์รูปภาพ (mock ตอนนี้ยังไม่อัปโหลดจริง) • แนะนำให้เป็นรูปชัดเจน
      </div>

      {previewUrl ? (
        <div className="rounded-2xl overflow-hidden ring-1 ring-black/10 bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="slip preview" className="w-full h-64 object-cover" />
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
            disabled ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-white ring-1 ring-black/10 text-black",
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
            "rounded-2xl px-4 py-3 font-extrabold transition",
            !previewUrl || disabled ? "bg-gray-200 text-gray-500" : "bg-[#F0A23A] text-white",
          ].join(" ")}
          onClick={() => {
            // mock “ส่ง”
            onSubmit();
            alert(fileName ? `ส่งสลิปแล้ว: ${fileName}` : "ส่งสลิปแล้ว");
          }}
        >
          ส่ง
        </button>
      </div>
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
    return bookingMock.find((b) => b.id === id);
  }, [id]);

  const [localStatus, setLocalStatus] = useState<BookingStatus | null>(null);

  // modal states
  const [openHistory, setOpenHistory] = useState(false);
  const [openSlip, setOpenSlip] = useState(false);

  // slip state (mock)
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);

  if (!booking) {
    return (
      <main className="min-h-screen bg-[#FFF7EA] px-6 py-10">
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

  const rows = useMemo(() => {
    const isBoarding = b.serviceType === "boarding" && !!b.endAt;
    return [
      { label: "สถานะ", value: STATUS_LABEL[b.status] },
      { label: "รายการจอง", value: b.id },
      { label: "ประเภทบริการ", value: serviceLabel(b.serviceType) },
      {
        label: "วันที่จองใช้บริการ",
        value: isBoarding ? (
          <div className="text-right">
            <div>{b.startAt}</div>
            <div className="text-center">ถึง {b.endAt}</div>
          </div>
        ) : (
          <div className="text-right">
            <div>{b.startAt}</div>
            {b.slotLabel ? <div className="text-center">{b.slotLabel}</div> : null}
          </div>
        ),
      },
      { label: "ราคา", value: `${b.price.toLocaleString()} บาท` },
    ];
  }, [b]);

  const historyItems = useMemo(() => {
    // ถ้า booking มี verifiedBy/verifiedAt ให้ใส่เข้า note ด้วย
    const items = buildMockHistory(b.status);

    if (b.verifiedBy || b.verifiedAt) {
      return items.map((it) => {
        if (it.key !== "slip_verified") return it;
        return {
          ...it,
          note: [
            b.verifiedBy ? `ผู้ตรวจ: ${b.verifiedBy}` : null,
            b.verifiedAt ? `เวลา: ${b.verifiedAt}` : null,
          ]
            .filter(Boolean)
            .join(" • "),
        };
      });
    }

    if (b.cancelledReason) {
      return items.map((it) => (it.key === "cancelled" ? { ...it, note: b.cancelledReason } : it));
    }

    return items;
  }, [b.status, b.verifiedBy, b.verifiedAt, b.cancelledReason]);

  const [openCancelConfirm, setOpenCancelConfirm] = useState(false);


  return (
    <main className="min-h-screen bg-[#FFF7EA] px-6 py-8 pb-32">
      <SuccessHeader serviceLabel="รายละเอียดการจอง" />
  
      <div className="mx-auto w-full max-w-md space-y-4">
        {/* 0) Status strip (เห็นสถานะทันที) */}
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
  
          {/* quick note */}
          <p className="mt-2 text-xs text-black/45">
            {canUploadSlip
              ? "แนบสลิปเพื่อให้พนักงานตรวจสอบ"
              : "การแนบสลิปจะเปิดได้เฉพาะสถานะที่กำหนด"}
          </p>
        </div>
  
        {/* 1) Primary actions (ทำก่อน) */}
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
  
        {/* 2) Details card (อ่านทีหลัง) */}
        <SuccessSummaryCard
          title="รายละเอียดการจอง"
          subtitle="สรุปรายการ"
          rows={rows}
          selectedTitle="สัตว์เลี้ยงที่ใช้บริการ"
          selectedContent={b.petName}
          totalLabel="หมายเหตุ"
          totalValue={<span className="text-black/60">{b.cancelledReason ?? "-"}</span>}
        />
  
        {/* 3) Danger zone (แยกโซนให้ชัด) */}
        <div className="rounded-2xl bg-white/70 ring-1 ring-black/5 p-4">
          <p className="text-sm font-extrabold text-black/80">การจัดการ</p>
          <p className="text-xs text-black/45 mt-1">
            การยกเลิกทำได้เฉพาะสถานะ “รออนุมัติ”
          </p>
  
          <button
            type="button"
            disabled={!canCancel}
            onClick={() => setOpenCancelConfirm(true)}
            className={[
              "mt-3 w-full rounded-2xl py-4 text-base font-extrabold transition",
              canCancel
                ? "bg-white text-red-600 ring-1 ring-red-200 active:scale-[0.99]"
                : "bg-gray-200 text-gray-500",
            ].join(" ")}
          >
            {b.status === "cancelled" ? "ยกเลิกแล้ว" : "ยกเลิกการจอง"}
          </button>
        </div>
  
        {/* 4) Back (รอง) */}
        <button
          type="button"
          className="w-full rounded-2xl bg-white ring-1 ring-black/10 py-4 text-base font-extrabold text-black/80 active:scale-[0.99] transition"
          onClick={() => router.push("/service/schedule")}
        >
          กลับไปหน้าปฏิทิน
        </button>
  
        {/* debug */}
        {slipFile ? (
          <div className="text-center text-xs text-black/40">debug slip: {slipFile.name}</div>
        ) : null}
      </div>
  
      {/* ✅ Modal: ประวัติสถานะ */}
      <BottomSheet
        open={openHistory}
        title="สถานะบิล"
        onClose={() => setOpenHistory(false)}
        rightAction={
          <span className="text-[12px] text-black/45 font-semibold">
            ปัจจุบัน: {STATUS_LABEL[b.status]}
          </span>
        }
      >
        <TimelineList items={historyItems} />
      </BottomSheet>
  
      {/* ✅ Modal: แนบสลิป */}
      <BottomSheet
        open={openSlip}
        title="แนบหลักฐานการชำระเงิน"
        onClose={() => setOpenSlip(false)}
      >
        <SlipUploadPanel
          disabled={!canUploadSlip}
          defaultPreview={slipPreview ?? b.slipUrl ?? null}
          onPick={(file, previewUrl) => {
            setSlipFile(file);
            setSlipPreview(previewUrl);
            setLocalStatus("slip_uploaded");
          }}
          onSubmit={() => {
            setOpenSlip(false);
          }}
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
        <p className="text-base font-extrabold text-gray-900">
          ยืนยันการยกเลิกการจอง
        </p>
        <p className="mt-1 text-sm text-black/55">
          การยกเลิกไม่สามารถย้อนกลับได้
        </p>
      </div>

      <div className="px-5 py-4">
        <div className="rounded-2xl bg-red-50 ring-1 ring-red-100 p-4">
          <p className="text-sm text-red-700">
            คุณต้องการยกเลิกรายการจองนี้ใช่หรือไม่?
          </p>
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
