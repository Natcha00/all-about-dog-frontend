"use client";

import React from "react";

export type ConfirmActionDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  /** class สำหรับปุ่มยืนยัน (เช่น slip = ดำ, cash = emerald) */
  confirmButtonClassName?: string;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

/**
 * Modal ยืนยันแบบเดียวกับแนว staff ConfirmDialog — ใช้ร่วม owner/staff สำหรับเลือกวิธีชำระ ฯลฯ
 */
export default function ConfirmActionDialog({
  open,
  title,
  description,
  confirmText = "ยืนยัน",
  cancelText = "ยกเลิก",
  loading = false,
  confirmButtonClassName = "bg-[#111] text-white hover:bg-black/90",
  onClose,
  onConfirm,
}: ConfirmActionDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={() => {
        if (!loading) onClose();
      }}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-white shadow-2xl ring-1 ring-black/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-black/5">
          <p className="text-base font-extrabold text-gray-900">{title}</p>
          {description ? (
            <p className="mt-2 text-sm text-black/55 leading-relaxed whitespace-pre-line">{description}</p>
          ) : null}
        </div>

        <div className="px-5 py-4">
          <div className="flex gap-3">
            <button
              type="button"
              className="flex-1 rounded-2xl bg-black/[0.06] py-3 font-extrabold text-black/70 active:scale-[0.99] transition disabled:opacity-50"
              disabled={loading}
              onClick={onClose}
            >
              {cancelText}
            </button>
            <button
              type="button"
              className={[
                "flex-1 rounded-2xl py-3 font-extrabold active:scale-[0.99] transition disabled:opacity-50",
                confirmButtonClassName,
              ].join(" ")}
              disabled={loading}
              onClick={() => void onConfirm()}
            >
              {loading ? "กำลังดำเนินการ…" : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
