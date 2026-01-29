"use client";

export type Slot = {
  time: string;
  capacity: number;
  booked: number;
  bigCount: number;
  smallCount: number;
};

export default function SlotCard({
  slot,
  active,
  disabled,
  isVip,
  onSelect,
}: {
  slot: Slot;
  active: boolean;
  disabled: boolean;
  isVip: boolean;
  onSelect: (time: string) => void;
}) {
  const remaining = Math.max(0, slot.capacity - slot.booked);
  const isEmpty = slot.booked === 0;

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect(slot.time)}
        className={[
          "w-auto rounded-2xl border-2 px-4 py-3 text-center transition",
          active ? "border-[#399199] bg-[#E9F4F4]" : "border-[#399199] bg-white",
          disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-black/5",
        ].join(" ")}
      >
        <div className="text-xl font-medium">{slot.time}</div>
      </button>

      <div className="mt-2 text-xs text-gray-800 space-y-1 text-center">
        {slot.booked >= slot.capacity ? (
          <p className="font-semibold">เต็ม</p>
        ) : isVip ? (
          isEmpty ? (
            <p className="font-semibold text-emerald-700">ว่าง (VIP ได้)</p>
          ) : (
            <p className="font-semibold text-red-600">ไม่ว่างสำหรับ VIP</p>
          )
        ) : (
          <>
            <p>เหลืออีก {remaining} ที่</p>
            <p>จองแล้ว {slot.booked}/{slot.capacity}</p>
            <p>พันธุ์ใหญ่: {slot.bigCount}</p>
            <p>พันธุ์เล็ก: {slot.smallCount}</p>
          </>
        )}
      </div>
    </div>
  );
}
