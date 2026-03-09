"use client";

import React from "react";

type CancelBookingDialogProps = {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function CancelBookingDialog({
  open,
  loading,
  onClose,
  onConfirm,
}: CancelBookingDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
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
              onClick={onClose}
            >
              ยกเลิก
            </button>

            <button
              type="button"
              className="flex-1 rounded-2xl bg-red-600 py-3 font-extrabold text-white active:scale-[0.99] transition disabled:opacity-60"
              disabled={loading}
              onClick={onConfirm}
            >
              ยืนยันการยกเลิก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

