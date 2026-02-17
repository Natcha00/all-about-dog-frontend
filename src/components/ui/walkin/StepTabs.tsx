"use client";

type StepKey = "customer" | "pet" | "service" | "detail" | "confirm" | "success";

export default function StepTabs(props: {
  active: StepKey;
  allowed: Record<StepKey, boolean>;
  onClick: (k: StepKey) => void;
}) {
  const { active, allowed, onClick } = props;

  const steps: { key: StepKey; label: string }[] = [
    { key: "customer", label: "1 ลูกค้า" },
    { key: "pet", label: "2 สุนัข" },
    { key: "service", label: "3 บริการ" },
    { key: "detail", label: "4 รายละเอียด" },
    { key: "confirm", label: "5 ยืนยัน" },
    { key: "success", label: "6 สำเร็จ" },
  ];

  const idx = steps.findIndex((s) => s.key === active);
  const pct = ((idx + 1) / steps.length) * 100;

  return (
    <div className="rounded-3xl bg-white/70 ring-1 ring-black/5 shadow-sm p-4 space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        {steps.map((s) => {
          const isActive = s.key === active;
          const canClick = allowed[s.key];

          return (
            <button
              key={s.key}
              type="button"
              disabled={!canClick}
              onClick={() => onClick(s.key)}
              className={[
                "rounded-full px-3 py-2 text-xs font-extrabold transition",
                isActive ? "bg-[#F0A23A] text-white" : "bg-white ring-1 ring-black/10 text-black/60",
                canClick ? "hover:bg-black/[0.04] active:scale-[0.99]" : "opacity-40 cursor-not-allowed",
              ].join(" ")}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="h-2 rounded-full bg-black/5 overflow-hidden">
        <div className="h-full bg-[#F0A23A] transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
