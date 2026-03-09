"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import BottomSheetModal from "@/components/ui/BottomSheetModal";
import AppImage from "@/components/ui/AppImage";
import { DEFAULT_IMAGE } from "@/lib/constants";
import { formatDateTimeThai } from "@/lib/date/date.utils";

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
            <AppImage src={src || DEFAULT_IMAGE} alt="preview" className="w-full h-full object-contain" />
          </div>

          <div className="px-3 py-2 bg-black/40 text-[11px] text-white/70">แตะ/คลิกพื้นหลังเพื่อปิด</div>
        </div>
      </div>
    </div>
  );
}

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
          <Row
            label="เวลาแนบ"
            value={previewUrl ? formatDateTimeThai(new Date().toISOString()) : "-"}
          />
        </div>

        {previewUrl ? (
          <div className="rounded-2xl overflow-hidden ring-1 ring-black/10 bg-white">
            <AppImage
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
            onClick={onSubmit}
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

type BookingSlipSheetProps = {
  open: boolean;
  onClose: () => void;
  disabled: boolean;
  defaultPreview?: string | null;
  onPick: (file: File, previewUrl: string) => void;
  onSubmit: () => void;
};

export default function BookingSlipSheet({
  open,
  onClose,
  disabled,
  defaultPreview,
  onPick,
  onSubmit,
}: BookingSlipSheetProps) {
  return (
    <BottomSheetModal open={open} onClose={onClose}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[16px] font-extrabold text-black/90">แนบหลักฐานการชำระเงิน</p>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-black/[0.04] active:scale-95 transition"
            aria-label="ปิด"
          >
            <X className="h-5 w-5 text-black/70" />
          </button>
        </div>

        <SlipUploadPanel
          disabled={disabled}
          defaultPreview={defaultPreview}
          onPick={onPick}
          onSubmit={onSubmit}
        />
      </div>
    </BottomSheetModal>
  );
}

