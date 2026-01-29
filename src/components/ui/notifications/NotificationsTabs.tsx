"use client";

export type NotificationTab = "all" | "unread";

export default function NotificationTabs({
  value,
  onChange,
}: {
  value: NotificationTab;
  onChange: (v: NotificationTab) => void;
}) {
  return (
    <div className="flex justify-center">
    <div className="inline-flex rounded-full bg-black/[0.03] p-1">
      <button
        type="button"
        onClick={() => onChange("all")}
        className={[
          "h-9 rounded-full px-4 text-[13px] font-semibold transition",
          value === "all"
            ? "bg-white text-black shadow-sm"
            : "text-black/60 hover:text-black",
        ].join(" ")}
      >
        ทั้งหมด
      </button>

      <button
        type="button"
        onClick={() => onChange("unread")}
        className={[
          "h-9 rounded-full px-4 text-[13px] font-semibold transition",
          value === "unread"
            ? "bg-white text-black shadow-sm"
            : "text-black/60 hover:text-black",
        ].join(" ")}
      >
        ยังไม่อ่าน
      </button>
    </div>
    </div>
  );
}
