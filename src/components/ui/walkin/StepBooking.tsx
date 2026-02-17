"use client";

import { useMemo, useState } from "react";

export type BookingDraft = {
  total: any;
  serviceType: "boarding" | "swimming";
  dateISO: string;
  time?: string;
  nights?: number;
  notes?: string;
};

function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export default function StepBooking({
  customerId,
  petId,
  customerName,
  petName,
  value,
  onChange,
  onBack,
  onBooked,
}: {
  customerId: string;
  petId: string;
  customerName: string;
  petName: string;
  value: BookingDraft;
  onChange: React.Dispatch<React.SetStateAction<BookingDraft>>;
  onBack: () => void;
  onBooked: (bookingId: string) => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const canBook = useMemo(() => {
    if (!value.dateISO) return false;
    if (value.serviceType === "swimming" && !value.time) return false;
    return true;
  }, [value]);

  const totalPrice = useMemo(() => {
    if (value.serviceType === "boarding") {
      return (value.nights ?? 1) * 500;
    }
    return 300;
  }, [value]);

  return (
    <section className="rounded-3xl bg-white/70 ring-1 ring-black/5 shadow-sm p-5 space-y-4">
      <div>
        <p className="text-lg font-extrabold">จองบริการแทนลูกค้า</p>
        <p className="text-sm text-black/50">
          {customerName} • {petName}
        </p>
      </div>

      {/* เลือกบริการ */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange(p => ({ ...p, serviceType: "boarding" }))}
          className={`rounded-2xl py-4 ring-2 ${
            value.serviceType === "boarding"
              ? "ring-[#399199]"
              : "ring-black/10"
          } bg-[#F7F4E8]`}
        >
          🏠 ฝากเลี้ยง
        </button>

        <button
          type="button"
          onClick={() => onChange(p => ({ ...p, serviceType: "swimming" }))}
          className={`rounded-2xl py-4 ring-2 ${
            value.serviceType === "swimming"
              ? "ring-[#399199]"
              : "ring-black/10"
          } bg-[#F7F4E8]`}
        >
          🏊 สระว่ายน้ำ
        </button>
      </div>

      {/* วันที่ */}
      <div>
        <p className="text-sm font-semibold mb-1">วันที่</p>
        <input
          type="date"
          value={value.dateISO || todayISO()}
          onChange={(e) =>
            onChange((p) => ({ ...p, dateISO: e.target.value }))
          }
          className="w-full h-11 rounded-2xl border border-black/10 px-4"
        />
      </div>

      {/* ถ้าเป็น swimming ให้เลือกรอบ */}
      {value.serviceType === "swimming" && (
        <div>
          <p className="text-sm font-semibold mb-1">รอบเวลา</p>
          <input
            type="time"
            value={value.time || ""}
            onChange={(e) =>
              onChange((p) => ({ ...p, time: e.target.value }))
            }
            className="w-full h-11 rounded-2xl border border-black/10 px-4"
          />
        </div>
      )}

      {/* Boarding nights */}
      {value.serviceType === "boarding" && (
        <div>
          <p className="text-sm font-semibold mb-1">จำนวนคืน</p>
          <input
            type="number"
            min={1}
            value={value.nights ?? 1}
            onChange={(e) =>
              onChange((p) => ({ ...p, nights: Number(e.target.value) }))
            }
            className="w-full h-11 rounded-2xl border border-black/10 px-4"
          />
        </div>
      )}

      {/* ราคา */}
      <div className="rounded-2xl bg-[#F7F4E8] p-4 font-bold text-lg flex justify-between">
        <span>ราคารวม</span>
        <span>{totalPrice.toLocaleString()} บาท</span>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-2xl border border-[#F0A23A] py-3 font-bold text-[#F0A23A]"
        >
          กลับ
        </button>

        <button
          type="button"
          disabled={!canBook}
          onClick={() => setConfirmOpen(true)}
          className={[
            "rounded-2xl py-3 font-bold text-white",
            canBook ? "bg-[#F0A23A]" : "bg-gray-300",
          ].join(" ")}
        >
          ยืนยันจอง
        </button>
      </div>

      {/* Confirm Popup */}
      {confirmOpen && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
          onClick={() => setConfirmOpen(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-extrabold text-lg">ยืนยันการจอง</p>
            <p className="text-sm text-black/50 mt-2">
              {customerName} • {petName}
            </p>

            <div className="mt-4 text-sm space-y-1">
              <div>บริการ: {value.serviceType}</div>
              <div>วันที่: {value.dateISO}</div>
              {value.time && <div>เวลา: {value.time}</div>}
              <div className="font-bold mt-2">
                รวม {totalPrice.toLocaleString()} บาท
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                className="flex-1 bg-gray-200 rounded-2xl py-3 font-bold"
                onClick={() => setConfirmOpen(false)}
              >
                ยกเลิก
              </button>
              <button
                className="flex-1 bg-[#F0A23A] text-white rounded-2xl py-3 font-bold"
                onClick={() => {
                  setConfirmOpen(false);
                  const mockBookingId = `b_${Date.now()}`;
                  onBooked(mockBookingId);
                }}
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
