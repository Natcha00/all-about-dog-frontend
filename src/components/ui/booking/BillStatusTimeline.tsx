"use client";

import React from "react";
import type { Booking } from "@/lib/booking/booking.types";
import { buildBillTimeline, statusLabel, statusTone } from "@/lib/booking/booking.logic";

function Dot({ tone, done }: { tone: "neutral" | "warning" | "info" | "success" | "danger"; done: boolean }) {
  const cls =
    tone === "danger"
      ? "bg-red-500"
      : tone === "success"
        ? "bg-emerald-500"
        : tone === "warning"
          ? "bg-amber-500"
          : tone === "info"
            ? "bg-sky-500"
            : "bg-gray-400";

  return (
    <span className={`mt-1 inline-flex h-3.5 w-3.5 rounded-full ${cls} ${done ? "" : "opacity-40"}`} />
  );
}

export default function BillStatusTimeline({ b }: { b: Booking }) {
  const events = buildBillTimeline(b);

  // ใช้สถานะปัจจุบันทำให้รู้ว่าอันไหน "ผ่านแล้ว"
  // (ในระบบจริงคุณควรมี event log; อันนี้เป็น UI demo)
  const currentTone = statusTone(b.status);
  const currentLabel = statusLabel(b.status);

  return (
    <div className="rounded-3xl bg-white/70 ring-1 ring-black/5 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[18px] font-semibold text-black/90">สถานะบิล</p>
          <p className="mt-1 text-[13px] text-black/45">สถานะปัจจุบัน: {currentLabel}</p>
        </div>

        <span className="inline-flex items-center rounded-full bg-black/[0.03] px-3 py-1.5 text-[13px] font-semibold text-black/70">
          {currentTone === "warning" ? "กำลังรอ" : currentTone === "success" ? "สำเร็จ" : "ติดตาม"}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {events.map((e, idx) => {
          // heuristic: ถ้า event มี at/by/note หรือสถานะปัจจุบันอยู่หลัง ๆ ให้ถือว่า done
          const done = Boolean(e.at || e.by || e.note) || (b.status === "finished" && e.key !== "cancelled");
          const isLast = idx === events.length - 1;

          return (
            <div key={e.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <Dot tone={e.tone} done={done} />
                {!isLast ? <div className={`mt-1 w-px flex-1 ${done ? "bg-black/15" : "bg-black/8"}`} /> : null}
              </div>

              <div className="min-w-0 flex-1">
                <p className={`text-[14px] font-semibold ${done ? "text-black/85" : "text-black/45"}`}>
                  {e.label}
                </p>

                <div className="mt-1 space-y-1">
                  {e.at ? <p className="text-[12px] text-black/45">{e.at}</p> : null}
                  {e.by ? <p className="text-[12px] text-black/55">ผู้ตรวจ: <span className="font-semibold">{e.by}</span></p> : null}
                  {e.note ? <p className="text-[12px] text-black/55">หมายเหตุ: {e.note}</p> : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

