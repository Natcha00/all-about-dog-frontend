// src/components/ui/PoikaiCard.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";

type PoikaiCardProps = {
  title?: React.ReactNode;         // ✅ เดิม string -> ReactNode
  subtitle?: React.ReactNode;      // ✅ เดิม string -> ReactNode
  right?: React.ReactNode;         // ✅ เพิ่ม right

  icon?: React.ReactNode;
  children: React.ReactNode;

  className?: string;
  headerClassName?: string;
  contentClassName?: string;
};

export default function PoikaiCard({
  title,
  subtitle,
  right,
  icon,
  children,
  className,
  headerClassName,
  contentClassName,
}: PoikaiCardProps) {
  const hasHeader = !!(title || subtitle || icon || right);

  return (
    <section
      className={cn(
        "rounded-3xl bg-white/80 ring-1 ring-black/5 shadow-sm overflow-hidden",
        className
      )}
    >
      {hasHeader && (
        <header
          className={cn(
            "px-4 py-3 border-b border-black/5 bg-white/70",
            headerClassName
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-3 min-w-0">
                {icon ? (
                  <div className="grid h-9 w-9 place-items-center rounded-2xl bg-black/[0.04] ring-1 ring-black/10 shrink-0">
                    {icon}
                  </div>
                ) : null}

                <div className="min-w-0">
                  {title ? (
                    <div className="min-w-0 truncate">{title}</div>
                  ) : null}
                  {subtitle ? (
                    <div className="text-[12px] text-black/55 mt-0.5">
                      {subtitle}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {right ? <div className="shrink-0">{right}</div> : null}
          </div>
        </header>
      )}

      <div className={cn("p-4", contentClassName)}>{children}</div>
    </section>
  );
}