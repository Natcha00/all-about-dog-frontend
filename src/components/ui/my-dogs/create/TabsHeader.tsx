"use client";

export default function TabsHeader(props: {
  active: 1 | 2;
  progress: number;
  leftLabel: string;
  rightLabel: string;
}) {
  const { active, progress, leftLabel, rightLabel } = props;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm font-semibold">
        <button
          type="button"
          className={active === 1 ? "text-gray-900" : "text-gray-400"}
        >
          {leftLabel}
        </button>
        <button
          type="button"
          className={active === 2 ? "text-gray-900" : "text-gray-400"}
        >
          {rightLabel}
        </button>
      </div>

      <div className="h-2 w-full rounded-full bg-black/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-[#F2A245]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
