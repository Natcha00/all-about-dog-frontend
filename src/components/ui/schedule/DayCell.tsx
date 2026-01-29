"use client";

export default function DayCell({
  label,
  muted,
  selected,
  hasSwim,
  hasBoarding,
  onClick,
}: {
  label: string;
  muted: boolean;
  selected: boolean;
  hasSwim: boolean;
  hasBoarding: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative h-[88px] w-full border-r border-b border-black/20",
        "px-2 pt-2",
        selected ? "bg-[#F6D9B5]" : "bg-transparent",
      ].join(" ")}
    >
      {/* 🔹 เลขวัน (อยู่ตำแหน่งเดิมเสมอ) */}
      <div className={muted ? "text-black/30 font-semibold" : "text-black font-semibold"}>
        {label}
      </div>

      {/* 🔹 พื้นที่จุด (ล็อกตำแหน่งไว้เสมอ) */}
      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1 h-2">
        {hasSwim && <span className="h-2 w-2 rounded-full bg-sky-500" />}
        {hasBoarding && <span className="h-2 w-2 rounded-full bg-orange-400" />}
      </div>
    </button>

  );
}
