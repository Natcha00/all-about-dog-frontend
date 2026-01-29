"use client";

import React, { useMemo, useRef, useState } from "react";

type RangeValue = {
  start?: string; // "YYYY-MM-DD"
  end?: string; // "YYYY-MM-DD"
};

type Props = {
  value: RangeValue;
  onChange: (next: RangeValue) => void;
  monthsToShow?: number; // default 1
  className?: string;

  /** ✅ ห้ามเลือกวันก่อน minDate (เช่น วันนี้) */
  minDate?: string; // "YYYY-MM-DD"
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toYMD(d: Date) {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}-${m}-${day}`;
}

function fromYMD(ymd: string) {
  return new Date(`${ymd}T00:00:00`);
}

function clampRange(a?: string, b?: string): RangeValue {
  if (!a && !b) return {};
  if (a && !b) return { start: a, end: a };
  if (!a && b) return { start: b, end: b };
  if (!a || !b) return {};
  return fromYMD(a) <= fromYMD(b) ? { start: a, end: b } : { start: b, end: a };
}

function addMonths(d: Date, delta: number) {
  const x = new Date(d);
  x.setDate(1);
  x.setMonth(x.getMonth() + delta);
  return x;
}

function startOfMonth(d: Date) {
  const x = new Date(d);
  x.setDate(1);
  x.setHours(0, 0, 0, 0);
  return x;
}

function daysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

function weekdayOfFirst(d: Date) {
  return startOfMonth(d).getDay();
}

function isSameYMD(a: string, b: string) {
  return a === b;
}

function isBetweenInclusive(ymd: string, start: string, end: string) {
  const x = fromYMD(ymd).getTime();
  const s = fromYMD(start).getTime();
  const e = fromYMD(end).getTime();
  return x >= s && x <= e;
}

function maxYMD(a: string, b: string) {
  return fromYMD(a) >= fromYMD(b) ? a : b;
}

const TH_MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const TH_DOW = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

export default function RangeCalendar({
  value,
  onChange,
  monthsToShow = 1,
  className = "",
  minDate,
}: Props) {
  const todayYMD = useMemo(() => toYMD(new Date()), []);
  const minYMD = minDate ?? todayYMD;

  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));

  const [dragging, setDragging] = useState(false);
  const [anchor, setAnchor] = useState<string | null>(null);

  const lastHoverRef = useRef<string | null>(null);

  const effectiveRange = useMemo(() => clampRange(value.start, value.end), [value.start, value.end]);

  const commitRange = (a: string, b: string) => {
    const next = clampRange(a, b);
    onChange(next);
  };

  const isDisabled = (ymd: string) => {
    return fromYMD(ymd) < fromYMD(minYMD);
  };

  const clampToMin = (ymd: string) => {
    // ถ้า ymd < minYMD ให้ใช้ minYMD แทน
    return isDisabled(ymd) ? minYMD : ymd;
  };

  const findDayUnderPointer = (clientX: number, clientY: number) => {
    const el = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
    if (!el) return null;
    const dayEl = el.closest?.("[data-ymd]") as HTMLElement | null;
    if (!dayEl) return null;
    const ymd = dayEl.getAttribute("data-ymd");
    return ymd || null;
  };

  const renderMonth = (monthDate: Date) => {
    const y = monthDate.getFullYear();
    const mIdx = monthDate.getMonth();
    const totalDays = daysInMonth(monthDate);
    const firstW = weekdayOfFirst(monthDate);

    const blanks = Array.from({ length: firstW }, (_, i) => i);

    const days = Array.from({ length: totalDays }, (_, i) => {
      const d = new Date(y, mIdx, i + 1);
      return toYMD(d);
    });

    const start = effectiveRange.start;
    const end = effectiveRange.end;

    const onPointerDownDay = (e: React.PointerEvent, ymd: string) => {
      e.preventDefault();

      // ✅ ห้ามเริ่มลากจากวันย้อนหลัง
      if (isDisabled(ymd)) return;

      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);

      setDragging(true);
      setAnchor(ymd);
      lastHoverRef.current = ymd;

      commitRange(ymd, ymd);
    };

    const onPointerMoveGrid = (e: React.PointerEvent) => {
      if (!dragging || !anchor) return;

      const raw = findDayUnderPointer(e.clientX, e.clientY);
      if (!raw) return;

      // ✅ กันลากไปโดนวันย้อนหลัง -> clamp กลับมาเป็น minYMD
      const ymd = clampToMin(raw);

      if (lastHoverRef.current === ymd) return;
      lastHoverRef.current = ymd;

      // ✅ ถ้า anchor เผลอเป็นวันก่อน min (ไม่ควรเกิด) ก็ clamp
      commitRange(clampToMin(anchor), ymd);
    };

    const onPointerUpGrid = () => {
      setDragging(false);
      setAnchor(null);
      lastHoverRef.current = null;
    };

    return (
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-center gap-2 pb-2">
          <p className="text-sm font-semibold text-gray-900">
            {TH_MONTHS[mIdx]} {y + 543}
          </p>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500">
          {TH_DOW.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        <div
          className="mt-1 grid grid-cols-7 gap-1"
          style={{ touchAction: "none" }}
          onPointerMove={onPointerMoveGrid}
          onPointerUp={onPointerUpGrid}
          onPointerCancel={onPointerUpGrid}
          onPointerLeave={() => {
            if (dragging) {
              setDragging(false);
              setAnchor(null);
              lastHoverRef.current = null;
            }
          }}
        >
          {blanks.map((i) => (
            <div key={`b-${i}`} className="h-10" />
          ))}

          {days.map((ymd) => {
            const disabled = isDisabled(ymd);

            const inRange = start && end ? isBetweenInclusive(ymd, start, end) : false;
            const isStart = start ? isSameYMD(ymd, start) : false;
            const isEnd = end ? isSameYMD(ymd, end) : false;

            const base =
              "h-10 rounded-xl flex items-center justify-center text-sm select-none transition";

            const cls = [
              base,
              disabled
                ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                : "cursor-pointer hover:bg-gray-100",
              !disabled && inRange ? "bg-[#E9F4F4]" : "",
              !disabled && (isStart || isEnd) ? "bg-[#BFE7E9] font-semibold text-gray-900" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <button
                key={ymd}
                type="button"
                data-ymd={ymd}
                className={cls}
                disabled={disabled}
                onPointerDown={(e) => onPointerDownDay(e, ymd)}
              >
                {Number(ymd.slice(8, 10))}
              </button>
            );
          })}
        </div>

        {/* ✅ hint เล็กๆ */}
        <p className="mt-3 text-xs text-gray-500">
          เลือกได้ตั้งแต่วันที่ {minYMD.split("-").reverse().join("/")} เป็นต้นไป
        </p>
      </div>
    );
  };

  const months = Array.from({ length: monthsToShow }, (_, i) => addMonths(viewMonth, i));

  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          className="rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-black/5"
          onClick={() => setViewMonth((d) => addMonths(d, -1))}
        >
          ← เดือนก่อน
        </button>

        <button
          type="button"
          className="rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-black/5"
          onClick={() => setViewMonth(startOfMonth(new Date()))}
        >
          วันนี้
        </button>

        <button
          type="button"
          className="rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-black/5"
          onClick={() => setViewMonth((d) => addMonths(d, +1))}
        >
          เดือนถัดไป →
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {months.map((m) => (
          <div key={toYMD(m)}>{renderMonth(m)}</div>
        ))}
      </div>
    </div>
  );
}
