"use client";

import React, { useState } from "react";
import { Banknote, Upload } from "lucide-react";

import ConfirmActionDialog from "@/components/ui/booking/ConfirmActionDialog";

type ServiceType = "boarding" | "swimming";

export type OwnerBookingPaymentMethodStepProps = {
  serviceType: ServiceType;
  /** ระหว่างเรียก API จาก parent (เช่น paymentSelecting) */
  loading?: boolean;
  /** คืน true เมื่อสำเร็จ — ปิด modal; false = error (แสดง alert จาก parent แล้ว) */
  onSelectSlip: () => Promise<boolean>;
  onSelectCash: () => Promise<boolean>;
};

/**
 * ขั้นที่ 1 — เลือกวิธีชำระเงิน (dog owner)
 * Modal ยืนยันก่อน payment/select แบบเดียวกับแนว staff BookingActions
 */
export default function OwnerBookingPaymentMethodStep({
  serviceType,
  loading = false,
  onSelectSlip,
  onSelectCash,
}: OwnerBookingPaymentMethodStepProps) {
  const [dialog, setDialog] = useState<null | "slip" | "cash">(null);
  const [dialogLoading, setDialogLoading] = useState(false);

  const busy = dialogLoading || loading;

  const slipDescription =
    serviceType === "boarding"
      ? "กดยืนยันเพื่อไปขั้นถัดไปเพื่ออัปโหลดสลิป\nแจ้งยกเลิก/คืนเงินตามนโยบายที่แสดงด้านบน"
      : "หลังยืนยันแล้วระบบจะบันทึกวิธีชำระแบบโอนเงิน และไปขั้นถัดไปให้อัปโหลดสลิป";

  const cashDescription =
    serviceType === "boarding"
      ? "ระบบจะไม่สำรองห้องให้จนกว่าจะชำระเงินที่ร้านตามนโยบายร้าน"
      : "ยืนยันว่าจะรอชำระเงินหน้าร้านตามรอบบริการ";

  async function handleConfirmSlip() {
    setDialogLoading(true);
    try {
      const ok = await onSelectSlip();
      if (ok) setDialog(null);
    } finally {
      setDialogLoading(false);
    }
  }

  async function handleConfirmCash() {
    setDialogLoading(true);
    try {
      const ok = await onSelectCash();
      if (ok) setDialog(null);
    } finally {
      setDialogLoading(false);
    }
  }

  return (
    <>
      <div className="rounded-2xl bg-white ring-1 ring-black/10 p-4 space-y-3">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-black/50">ขั้นที่ 1 — เลือกวิธีชำระเงิน</p>

          {serviceType === "boarding" ? (
            <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-3 text-[11px] text-slate-700 space-y-2 leading-relaxed">
              <p>
                <span className="font-bold text-slate-900">ชำระเงินหน้าร้าน:</span> ห้องจะถูกสำรองให้
                <span className="font-semibold"> เมื่อชำระเงินเรียบร้อยแล้วเท่านั้น</span>
              </p>
              <div className="border-t border-slate-200 pt-2">
                <p className="font-bold text-slate-900 mb-1">ชำระเงินล่วงหน้า:</p>
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
            disabled={busy}
            className="w-full rounded-2xl bg-black py-3 font-extrabold text-white flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99] transition"
            onClick={() => setDialog("slip")}
          >
            <Upload className="h-4 w-4 shrink-0" />
            {serviceType === "swimming" ? "ชำระด้วยสลิปโอน" : "ต้องการชำระเงินล่วงหน้า"}
          </button>

          <button
            type="button"
            disabled={busy}
            className="w-full rounded-2xl bg-emerald-600 py-3 font-extrabold text-white flex items-center justify-center gap-2 ring-1 ring-emerald-700/30 disabled:opacity-50 active:scale-[0.99] transition"
            onClick={() => setDialog("cash")}
          >
            <Banknote className="h-4 w-4 shrink-0" />
            รอชำระเงินหน้าร้าน
          </button>
        </div>
      </div>

      <ConfirmActionDialog
        open={dialog === "slip"}
        title="ยืนยันเลือกชำระด้วยสลิป"
        description={slipDescription}
        confirmText="ยืนยัน"
        loading={busy}
        confirmButtonClassName="bg-black text-white hover:bg-black/90"
        onClose={() => {
          if (!busy) setDialog(null);
        }}
        onConfirm={handleConfirmSlip}
      />

      <ConfirmActionDialog
        open={dialog === "cash"}
        title="ยืนยันรอชำระเงินหน้าร้าน"
        description={cashDescription}
        confirmText="ยืนยันรอชำระเงินหน้าร้าน"
        loading={busy}
        confirmButtonClassName="bg-emerald-600 text-white hover:bg-emerald-700"
        onClose={() => {
          if (!busy) setDialog(null);
        }}
        onConfirm={handleConfirmCash}
      />
    </>
  );
}
