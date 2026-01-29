"use client";

import React from "react";
import { ChevronRight } from "lucide-react";

export default function AccountMenuItem({
  title,
  subtitle,
  icon,
  tone = "default",
  onClick,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tone?: "default" | "danger";
  onClick: () => void;
}) {
  const danger = tone === "danger";

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full text-left",
        "rounded-2xl p-4",
        "bg-white/70 ring-1 ring-black/5 shadow-sm",
        "transition active:scale-[0.99] hover:bg-white/85",
        "flex items-center gap-3",
      ].join(" ")}
    >
      <div
        className={[
          "h-11 w-11 rounded-2xl grid place-items-center",
          danger ? "bg-red-50 text-red-600" : "bg-black/[0.04] text-black",
        ].join(" ")}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={[
            "truncate text-[15px] font-semibold",
            danger ? "text-red-700" : "text-black",
          ].join(" ")}
        >
          {title}
        </p>
        <p className="mt-0.5 truncate text-[12px] text-black/55">{subtitle}</p>
      </div>

      <ChevronRight
        className={danger ? "h-5 w-5 text-red-400" : "h-5 w-5 text-black/35"}
      />
    </button>
  );
}
