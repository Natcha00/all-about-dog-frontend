"use client";

import React, { useEffect, useMemo, useState } from "react";
import PoikaiCard from "@/components/ui/PoikaiCard";
import type { BookingDraft } from "@/lib/walkin/walkin/types.mock";

export type SummaryRow = {
  label: string;
  value: React.ReactNode;
};

/** =========================================================
 *  Mock backend: ดึง note จาก refCode
 *  (ภายหลังค่อยเปลี่ยนเป็น fetch API จริงได้)
 * ========================================================= */
const MOCK_NOTE_BY_REF: Record<string, string> = {
  "RSV-20260004": "⚠️ โปรดนำอาหาร/สายจูง/เบาะนอนของน้องมาด้วย (ไม่รวมในค่าบริการ)",
  "BK-0002": "✅ ห้องใกล้กล้องมีจำกัด หากต้องการระบุเพิ่มเติม กรุณาโทรแจ้งก่อนเข้าพัก",
  "SW-0001": "💦 แนะนำให้น้องงดอาหารก่อนว่ายน้ำ 2 ชั่วโมง เพื่อลดโอกาสอาเจียน",
};
async function fetchBookingNoteByRef(args: {
  refCode: string;
  booking?: BookingDraft;
}): Promise<string | null> {
  // ถ้ามี note มากับ booking อยู่แล้ว ให้ใช้ก่อน
  const noteFromBooking = (args.booking?.customerNote ?? "").trim();
  
  if (noteFromBooking) return noteFromBooking;

  // mock delay
  await new Promise((r) => setTimeout(r, 350));

  const note = (MOCK_NOTE_BY_REF[args.refCode] ?? "").trim();
    return note || null;
}

export default function SuccessSummaryCard({
  title = "สรุปรายการ",
  subtitle = "รายละเอียดการจอง",
  rows,
  selectedTitle = "สัตว์ที่เลือก",
  selectedContent,
  totalLabel = "ราคารวม",
  totalValue,
  customerNote,
  booking,
  refCode,
}: {
  title?: string;
  subtitle?: string;
  rows: SummaryRow[];
  selectedTitle?: string;
  selectedContent?: React.ReactNode;
  totalLabel?: string;
  totalValue: React.ReactNode;

  // ✅ ส่ง note มาเองก็ได้
  customerNote?: string | null;

  // ✅ optional (กัน error ฝั่ง caller)
  booking?: BookingDraft;

  // ✅ ใช้เป็น key ไปดึง note (mock backend)
  refCode?: string;
}) {
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canFetch = useMemo(() => Boolean(refCode && refCode !== "-"), [refCode]);

  // ✅ priority: customerNote prop > booking.customerNote > fetch by ref
  const noteFromPropsOrBooking = useMemo(() => {
    const t = (customerNote ?? booking?.customerNote ?? "").trim();
    return t || null;
  }, [customerNote, booking]);

  useEffect(() => {
    let alive = true;

    (async () => {
      // ถ้ามี note มาแล้ว ไม่ต้อง fetch
      if (noteFromPropsOrBooking) {
        setNoteText(noteFromPropsOrBooking);
        setNoteOpen(true);
        return;
      }

      if (!canFetch) {
        setNoteText(null);
        setNoteOpen(false);
        return;
      }

      setLoading(true);
      try {
        const note = await fetchBookingNoteByRef({
          refCode: String(refCode),
          booking,
        });
        if (!alive) return;
        setNoteText(note);
        setNoteOpen(Boolean(note));
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [canFetch, refCode, booking, noteFromPropsOrBooking]);

  return (
    <PoikaiCard title={title} subtitle={subtitle}>
      <div className="space-y-4">
        {/* 1) Details */}
        <section className="rounded-2xl bg-white ring-1 ring-black/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-black/5">
            <p className="text-sm font-semibold text-gray-900">รายละเอียด</p>
            <p className="text-xs text-gray-500 mt-0.5">ตรวจสอบข้อมูลก่อนยืนยัน</p>
          </div>

          <div className="px-4">
            {rows.map((r, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between gap-4 py-2 border-b border-black/5 last:border-b-0"
              >
                <p className="text-sm text-gray-600">{r.label}</p>
                <div className="text-sm font-semibold text-gray-900 text-right">
                  {r.value}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2) Selected */}
        {selectedContent ? (
          <section className="rounded-2xl bg-[#F7F4E8]/60 ring-1 ring-black/5 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-gray-900">{selectedTitle}</p>
              <span className="text-xs text-gray-500">Selected</span>
            </div>
            <div className="mt-2 text-sm text-gray-700">{selectedContent}</div>
          </section>
        ) : null}

        {/* 3) Total + Note */}
        {/* <section className="rounded-2xl bg-white ring-1 ring-black/5 p-4 space-y-3"> */}
          {/* <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">{totalLabel}</p>
            <p className="text-lg font-extrabold text-gray-900">{totalValue}</p>
          </div> */}

          {/* Note box */}
          <div className="rounded-2xl ring-1 ring-black/10 overflow-hidden bg-white">
            <button
              type="button"
              onClick={() => setNoteOpen((v) => !v)}
              className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-black/[0.03] transition"
            >
              <div className="text-left">
                <p className="text-sm font-extrabold text-gray-900">หมายเหตุจากลูกค้า</p>
                <p className="text-xs text-black/45">
                  {loading
                    ? "กำลังโหลดหมายเหตุ..."
                    : noteText
                    ? "มีหมายเหตุแนบมากับรายการนี้"
                    : "ไม่มีหมายเหตุ"}
                </p>
              </div>

              <span
                className={[
                  "shrink-0 rounded-full px-3 py-1 text-xs font-extrabold ring-1",
                  noteText
                    ? "bg-[#F7F4E8] text-[#B25A00] ring-[#F0A23A]/40"
                    : "bg-black/[0.04] text-black/60 ring-black/10",
                ].join(" ")}
              >
                {noteOpen ? "ซ่อน" : "เปิด"}
              </span>
            </button>

            {noteOpen ? (
              <div className="px-4 pb-4">
                {loading ? (
                  <div className="mt-2 space-y-2">
                    <div className="h-3 w-10/12 rounded bg-black/10" />
                    <div className="h-3 w-8/12 rounded bg-black/10" />
                  </div>
                ) : noteText ? (
                  <p className="mt-2 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {noteText}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-gray-500">—</p>
                )}
              </div>
            ) : null}
          </div>

          {refCode ? <p className="text-[11px] text-black/40">ref: {refCode}</p> : null}
        {/* </section> */}
      </div>
    </PoikaiCard>
  );
}
