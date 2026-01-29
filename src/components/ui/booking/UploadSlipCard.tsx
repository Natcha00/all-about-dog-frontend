"use client";

import React, { useMemo, useRef, useState } from "react";
import type { Booking } from "@/lib/booking/booking.types";

function canUpload(b: Booking) {
  return b.status === "WaitingSlip";
}

export default function UploadSlipCard({
  b,
  onUploadSlip,
}: {
  b: Booking;
  onUploadSlip?: (file: File) => Promise<void> | void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const disabled = !canUpload(b);

  const helperText = useMemo(() => {
    if (b.status === "slip_uploaded") return "อัปโหลดแล้ว กำลังรอพนักงานตรวจสอบ";
    if (b.status === "slip_verified") return "ตรวจสอบแล้ว ✅";
    if (b.status === "cancelled") return "รายการถูกยกเลิก ไม่สามารถแนบสลิปได้";
    if (b.status === "pending") return "รออนุมัติการจองก่อน";
    if (b.status === "finished" || b.status === "check-in") return "รายการอยู่ระหว่าง/เสร็จสิ้นแล้ว";
    return "อัปโหลดหลักฐานการชำระเงิน (รูปภาพ)";
  }, [b.status]);

  function validate(f: File) {
    // รูปภาพเท่านั้น + จำกัด 5MB (ปรับได้)
    const okType = ["image/jpeg", "image/png", "image/webp"].includes(f.type);
    if (!okType) return "รองรับเฉพาะไฟล์รูปภาพ (JPG/PNG/WebP)";
    const max = 5 * 1024 * 1024;
    if (f.size > max) return "ไฟล์ใหญ่เกินไป (สูงสุด 5MB)";
    return "";
  }

  function pick() {
    if (disabled) return;
    inputRef.current?.click();
  }

  function onChangeFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    const msg = validate(f);
    if (msg) {
      setError(msg);
      setFile(null);
      setPreview("");
      return;
    }

    setError("");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function submit() {
    if (disabled) return;
    if (!file) {
      setError("กรุณาเลือกรูปสลิปก่อน");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await onUploadSlip?.(file);
      // NOTE: ในระบบจริง หลังอัปโหลดสำเร็จ → fetch ใหม่ให้ status กลายเป็น slip_uploaded
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl bg-white/70 ring-1 ring-black/5 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[18px] font-semibold text-black/90">แนบสลิป</p>
          <p className="mt-1 text-[13px] text-black/45">{helperText}</p>
        </div>
        <span className="inline-flex items-center rounded-full bg-black/[0.03] px-3 py-1.5 text-[12px] font-semibold text-black/60">
          {disabled ? "ปิดใช้งาน" : "พร้อมแนบ"}
        </span>
      </div>

      {/* Preview */}
      <div className="mt-4 rounded-3xl bg-white/70 ring-1 ring-black/10 p-4">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="preview" className="w-full rounded-2xl object-cover" />
        ) : b.slipUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={b.slipUrl} alt="slip" className="w-full rounded-2xl object-cover" />
        ) : (
          <div className="rounded-2xl bg-black/[0.03] ring-1 ring-black/5 p-6 text-center text-black/45">
            ยังไม่ได้เลือกไฟล์
          </div>
        )}
      </div>

      {error ? (
        <div className="mt-3 rounded-2xl bg-red-50 ring-1 ring-red-100 px-3 py-2 text-[12px] text-red-800">
          {error}
        </div>
      ) : null}

      {/* Buttons */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={pick}
          disabled={disabled}
          className={[
            "rounded-full px-4 py-3 text-[16px] font-semibold transition",
            disabled
              ? "bg-black/10 text-black/30"
              : "bg-white/70 ring-1 ring-black/10 text-black/75 hover:bg-black/[0.03] active:scale-[0.99]",
          ].join(" ")}
        >
          เลือกรูป
        </button>

        <button
          type="button"
          onClick={submit}
          disabled={disabled || loading}
          className={[
            "rounded-full px-4 py-3 text-[16px] font-semibold transition",
            disabled
              ? "bg-black/10 text-black/30"
              : "bg-black text-white hover:bg-black/90 active:scale-[0.99]",
          ].join(" ")}
        >
          {loading ? "กำลังอัปโหลด..." : "อัปโหลดสลิป"}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onChangeFile}
      />
    </div>
  );
}
