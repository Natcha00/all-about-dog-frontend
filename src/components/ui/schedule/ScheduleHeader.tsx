"use client";

import Image from "next/image";
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
    <header>
      <h1 className="text-center text-[34px] font-extrabold text-black pb-3">
        ตารางนัด
      </h1>

      <div className="flex flex-col items-center justify-between">
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
        <div className=" flex items-center justify-center gap-3">
          <div className="text-base font-semibold">สัตว์เลี้ยง</div>
          <select
            value={selectedPet}
            onChange={(e) => onChangePet(e.target.value)}
            className="h-10 rounded-xl border border-black/40 bg-[#fff7ea] px-3 text-base font-semibold outline-none"
          >
            {pets.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <Link
            href="/service/booking"
            className="rounded-xl border border-black/40 bg-[#fff7ea]
          p-2 shadow-sm hover:bg-black/5 active:scale-[0.98]"
            aria-label="ไปหน้ารายการจองทั้งหมด"
          >
            {/* แบบง่ายสุด */}
            <Image
              src="/images/tickets.png"
              alt="tickets"
              width={24}
              height={24}
              className="object-contain"
            />

            {/* ถ้าจะใช้ lucide-react */}
            {/* <CalendarDays className="h-6 w-6" /> */}
          </Link>
        </div>


      </div>
    </header>
  );
}
