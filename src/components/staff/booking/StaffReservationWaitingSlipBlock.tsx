"use client";

import React, { useCallback, useId, useRef, useState } from "react";
import Image from "next/image";
import { Banknote, Upload } from "lucide-react";

import BottomSheetModal from "@/components/ui/BottomSheetModal";

/** ข้อมูลขั้นต่ำที่ต้องใช้จับเงื่อนไข showPickPayment / showUploadSlip (ฝั่ง staff) */
export type StaffReservationPaymentBooking = {
  id: string;
  serviceType: "boarding" | "swimming";
  status: string;
  paymentMethod?: "slip" | "cash" | null;
  reservationActions?: {
    canSelectPaymentMethod?: boolean;
    canUploadSlip?: boolean;
  };
};

/* รองรับมือถือที่ file.type เป็น "" */
function validateSlip(file: File) {
  const maxMB = 5;
  const name = file.name.toLowerCase();
  const extOk =
    name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".png") || name.endsWith(".pdf");
  const typeOk =
    file.type === "image/jpeg" ||
    file.type === "image/png" ||
    file.type === "application/pdf";
  if (!typeOk && !extOk) return "ไฟล์ต้องเป็น JPG/PNG/PDF เท่านั้น";
  if (file.size > maxMB * 1024 * 1024) return `ไฟล์ต้องไม่เกิน ${maxMB}MB`;
  return null;
}

function MobileSlipUploader({
  file,
  error,
  disabled,
  onPick,
  onClear,
  inputRef,
}: {
  file: File | null;
  error?: string | null;
  disabled?: boolean;
  onPick: (f: File | null) => void;
  onClear: () => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}) {
  const inputId = useId();

  return (
    <div className="space-y-4">
      <label htmlFor={inputId} className="block cursor-pointer">
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/png,image/jpeg,application/pdf"
          className="hidden"
          disabled={disabled}
          onChange={(e) => onPick(e.target.files?.[0] ?? null)}
        />

        <div className="w-full rounded-3xl bg-black py-4 text-center text-white font-extrabold active:scale-[0.98] transition">
          {file ? "เปลี่ยนไฟล์" : "เลือกไฟล์สลิป"}
        </div>
      </label>

      <p className="text-xs text-black/50 text-center">รองรับ PNG / JPG / PDF • ไม่เกิน 5MB</p>

      {file ? (
        <div className="rounded-3xl bg-white ring-1 ring-black/10 p-4 space-y-2">
          <div className="text-sm font-extrabold text-gray-900">✓ เลือกไฟล์แล้ว</div>
          <div className="text-xs text-black/60 break-all">{file.name}</div>
          <div className="text-xs text-black/40">ขนาด {(file.size / (1024 * 1024)).toFixed(2)} MB</div>

          <button
            type="button"
            onClick={onClear}
            className="w-full rounded-2xl bg-white ring-1 ring-black/10 py-2 text-xs font-extrabold text-rose-600"
          >
            ล้างไฟล์
          </button>
        </div>
      ) : null}

      {error ? <p className="text-xs text-rose-600 text-center">{error}</p> : null}
    </div>
  );
}

export type StaffReservationWaitingSlipBlockProps = {
  booking: StaffReservationPaymentBooking;
  /** เลือกชำระด้วยสลิป (เรียก API / อัปเดต state จาก parent) */
  onSelectSlipPayment: () => void | Promise<void>;
  /** เลือกรอชำระหน้าร้าน → pay_at_store */
  onSelectCashPayment: () => void | Promise<void>;
  /** อัปโหลดสลิปหลังเลือกไฟล์แล้ว */
  onUploadSlip: (file: File) => void | Promise<void>;
};

/**
 * บล็อก UI ขั้นที่ 1–2 สำหรับ staff เมื่อ `waiting_slip`
 * — ใช้ logic เดียวกับ BookingActions: reservationActions + paymentMethod
 * — ผูก API จริงผ่าน props callback (เช่น selectPaymentMethod, staffUploadSlipByStaff)
 */
export default function StaffReservationWaitingSlipBlock({
  booking,
  onSelectSlipPayment,
  onSelectCashPayment,
  onUploadSlip,
}: StaffReservationWaitingSlipBlockProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreviewUrl, setSlipPreviewUrl] = useState<string | null>(null);
  const [fileErr, setFileErr] = useState<string | null>(null);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const hasApiActions = booking.reservationActions !== undefined;

  const canSelectPaymentMethod =
    booking.status === "waiting_slip" &&
    (hasApiActions ? Boolean(booking.reservationActions?.canSelectPaymentMethod) : true);

  const canUploadSlip =
    booking.status === "waiting_slip" &&
    (hasApiActions ? Boolean(booking.reservationActions?.canUploadSlip) : true);

  const showPickPayment = canSelectPaymentMethod && booking.paymentMethod !== "slip";

  const showUploadSlip =
    canUploadSlip && (booking.paymentMethod === "slip" || !canSelectPaymentMethod);

  const clearSlipPreview = useCallback(() => {
    if (slipPreviewUrl) {
      URL.revokeObjectURL(slipPreviewUrl);
      setSlipPreviewUrl(null);
    }
    setSlipFile(null);
    setFileErr(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [slipPreviewUrl]);

  const handleSlipPick = useCallback(
    (f: File | null) => {
      if (slipPreviewUrl) {
        URL.revokeObjectURL(slipPreviewUrl);
        setSlipPreviewUrl(null);
      }
      if (!f) {
        setSlipFile(null);
        setFileErr(null);
        return;
      }
      setSlipFile(f);
      setFileErr(validateSlip(f));
      if (f.type.startsWith("image/")) {
        setSlipPreviewUrl(URL.createObjectURL(f));
      }
    },
    [slipPreviewUrl],
  );

  const handleUploadSheetClose = useCallback(() => {
    if (slipPreviewUrl) {
      URL.revokeObjectURL(slipPreviewUrl);
      setSlipPreviewUrl(null);
    }
    setSlipFile(null);
    setFileErr(null);
    setUploadOpen(false);
  }, [slipPreviewUrl]);

  async function runSelectSlip() {
    const msg =
      booking.serviceType === "boarding"
        ? "กดยืนยันเพื่อไปขั้นถัดไปเพื่ออัปโหลดสลิป — ต้องการดำเนินการต่อหรือไม่?"
        : "หลังยืนยันแล้วระบบจะบันทึกวิธีชำระแบบโอนเงิน และไปขั้นถัดไปให้อัปโหลดสลิป ต้องการดำเนินการต่อหรือไม่?";
    if (!window.confirm(msg)) return;
    setLoadingKey("selectSlip");
    try {
      await onSelectSlipPayment();
    } finally {
      setLoadingKey(null);
    }
  }

  async function runSelectCash() {
    const msg =
      booking.serviceType === "boarding"
        ? "ยืนยันรอชำระเงินหน้าร้าน — ระบบจะไม่มีการสำรองห้องให้ ต้องการดำเนินการต่อหรือไม่?"
        : "ยืนยันรอชำระเงินหน้าร้าน?";
    if (!window.confirm(msg)) return;
    setLoadingKey("selectCash");
    try {
      await onSelectCashPayment();
    } finally {
      setLoadingKey(null);
    }
  }

  async function runUploadSlip() {
    if (!slipFile || fileErr) return;
    if (!window.confirm("ยืนยันการแนบสลิป?")) return;
    setLoadingKey("uploadSlip");
    try {
      await onUploadSlip(slipFile);
      handleUploadSheetClose();
    } finally {
      setLoadingKey(null);
    }
  }

  if (!showPickPayment && !showUploadSlip) return null;

  return (
    <>
      {showPickPayment ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-black/50">ขั้นที่ 1 — เลือกวิธีชำระเงิน</p>
          {booking.serviceType === "boarding" ? (
            <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-3 text-[11px] text-slate-700 space-y-2 leading-relaxed">
              <p>
                <span className="font-bold text-slate-900">ชำระเงินหน้าร้าน:</span> ห้องจะถูกสำรองให้
                <span className="font-semibold"> เมื่อชำระเงินเรียบร้อยแล้วเท่านั้น</span>
              </p>
              <div className="border-t border-slate-200 pt-2">
                <p className="font-bold text-slate-900 mb-1">ชำระค่าบริการล่วงหน้า:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>ห้องถูกสำรองไว้ให้แน่นอน</li>
                  <li>
                    แจ้งล่วงหน้า <span className="font-semibold">ก่อนวันฝาก 7 วันขึ้นไป</span> — คืนยอดเต็มจำนวน
                  </li>
                  <li>
                    แจ้งล่วงหน้า <span className="font-semibold">ภายใน 7 วัน</span> ก่อนวันฝาก — คืนยอด 50%
                  </li>
                  <li>
                    แจ้งกะทันหัน <span className="font-semibold">ในวันฝาก</span> — ไม่คืนยอดทุกกรณี
                  </li>
                </ul>
              </div>
            </div>
          ) : null}
          <button
            type="button"
            disabled={loadingKey === "selectSlip"}
            className="w-full rounded-2xl bg-black py-3 font-extrabold text-white flex items-center justify-center gap-2 disabled:opacity-50"
            onClick={() => void runSelectSlip()}
          >
            <Upload className="h-4 w-4 shrink-0" />
            {booking.serviceType === "swimming"
              ? "ชำระด้วยสลิปโอน"
              : "ต้องการชำระค่าบริการล่วงหน้า"}
          </button>
          <button
            type="button"
            disabled={loadingKey === "selectCash"}
            className="w-full rounded-2xl bg-emerald-600 py-3 font-extrabold text-white flex items-center justify-center gap-2 ring-1 ring-emerald-700/30 disabled:opacity-50"
            onClick={() => void runSelectCash()}
          >
            <Banknote className="h-4 w-4 shrink-0" />
            รอชำระเงินหน้าร้าน
          </button>
        </div>
      ) : null}

      {showUploadSlip ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-black/50">ขั้นที่ 2 — แนบหลักฐานการโอน</p>
          {booking.serviceType === "boarding" ? (
            <p className="text-[10px] text-slate-600 leading-relaxed rounded-xl bg-slate-50 ring-1 ring-slate-100 px-2.5 py-2">
              <span className="font-semibold text-slate-800">นโยบายคืนเงิน:</span> แจ้งก่อนวันฝาก 7 วันขึ้นไป
              คืนเต็มจำนวน • ภายใน 7 วันก่อนวันฝาก คืน 50% • แจ้งในวันฝาก ไม่คืนทุกกรณี
            </p>
          ) : null}
          <button
            type="button"
            className="w-full rounded-2xl bg-black py-3 font-extrabold text-white flex items-center justify-center gap-2"
            onClick={() => setUploadOpen(true)}
          >
            <Upload className="h-4 w-4 shrink-0" />
            อัปโหลดสลิป
          </button>
        </div>
      ) : null}

      <BottomSheetModal
        open={uploadOpen && showUploadSlip}
        onClose={handleUploadSheetClose}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[16px] font-extrabold text-black/90">
              {booking.serviceType === "swimming" ? "แนบสลิปการโอน" : "แนบสลิป (จ่ายเลย)"}
            </p>
            <button
              type="button"
              onClick={handleUploadSheetClose}
              className="grid h-9 w-9 place-items-center rounded-full bg-black/[0.04] text-black/70 font-bold"
              aria-label="ปิด"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {booking.serviceType === "swimming" ? (
              <div className="rounded-2xl bg-amber-50 ring-1 ring-amber-200 p-3 text-xs text-amber-800">
                ราคาว่ายน้ำเป็นราคาประมาณในระบบ และชำระเงินจริงหน้างานได้
              </div>
            ) : null}

            <MobileSlipUploader
              file={slipFile}
              error={fileErr}
              inputRef={fileInputRef}
              onPick={handleSlipPick}
              onClear={clearSlipPreview}
            />

            {slipFile && slipPreviewUrl ? (
              <div className="rounded-3xl bg-white ring-1 ring-black/10 p-4 space-y-2">
                <div className="text-sm font-extrabold text-gray-900">ตัวอย่างสลิป</div>
                <div className="relative w-full min-h-[160px] rounded-2xl ring-1 ring-black/10 overflow-hidden bg-black/5">
                  <Image
                    src={slipPreviewUrl}
                    alt="preview"
                    fill
                    className="object-contain"
                    sizes="(max-width: 448px) 100vw, 448px"
                    unoptimized
                  />
                </div>
                <p className="text-xs text-black/50">แสดงตัวอย่างจากไฟล์ที่เลือก</p>
              </div>
            ) : slipFile && !slipPreviewUrl ? (
              <div className="rounded-3xl bg-white ring-1 ring-black/10 p-4">
                <div className="text-sm font-extrabold text-gray-900">✓ เลือกไฟล์ PDF แล้ว</div>
                <p className="text-xs text-black/50 mt-1">กดยืนยันแนบสลิปเพื่ออัปโหลด</p>
              </div>
            ) : null}

            <button
              type="button"
              disabled={!slipFile || !!fileErr || loadingKey === "uploadSlip"}
              onClick={() => void runUploadSlip()}
              className="w-full rounded-2xl bg-[#f0a23a] py-3 font-extrabold text-white disabled:opacity-50"
            >
              {loadingKey === "uploadSlip" ? "กำลังอัปโหลด…" : "ยืนยันแนบสลิป"}
            </button>
          </div>
        </div>
      </BottomSheetModal>
    </>
  );
}
