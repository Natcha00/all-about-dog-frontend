"use client";

import Link from "next/link";

export default function ScheduleHeader({
  monthLabel,
  pets,
  selectedPet,
  onPrevMonth,
  onNextMonth,
  onChangePet,
}: {
  monthLabel: string;
  pets: string[];
  selectedPet: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onChangePet: (pet: string) => void;
}) {
  return (
    <header className="mb-4">
      <h1 className="text-center text-[34px] font-extrabold text-black">
        ตารางนัด
      </h1>

      <div className="mt-3 flex flex-col items-center justify-between gap-3">
        {/* เดือน */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevMonth}
            className="rounded-xl px-3 py-2 text-lg font-bold hover:bg-black/5"
            aria-label="previous month"
          >
            ‹
          </button>

          <div className="text-lg font-semibold">{monthLabel}</div>

          <button
            onClick={onNextMonth}
            className="rounded-xl px-3 py-2 text-lg font-bold hover:bg-black/5"
            aria-label="next month"
          >
            ›
          </button>
        </div>

        {/* filter สัตว์เลี้ยง */}
        <div className="flex items-center gap-2">
          <div className="text-base font-semibold">สัตว์เลี้ยง</div>
          <select
            value={selectedPet}
            onChange={(e) => onChangePet(e.target.value)}
            className="h-10 rounded-xl border border-black/40 bg-[#FFF7EA] px-3 text-base font-semibold outline-none"
          >
            {pets.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <Link
          href="/service/booking"
          className="absolute right-0 top-1/2 -translate-y-1/2
                     rounded-xl border border-black/40 bg-[#FFF7EA]
                     p-2 shadow-sm hover:bg-black/5 active:scale-[0.98]"
          aria-label="ไปหน้ารายการจองทั้งหมด"
        >
          {/* แบบง่ายสุด */}
          <span className="text-xl leading-none">🗓️</span>

          {/* ถ้าจะใช้ lucide-react */}
          {/* <CalendarDays className="h-6 w-6" /> */}
        </Link>
      </div>
    </header>
  );
}
