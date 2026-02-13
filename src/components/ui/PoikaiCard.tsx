import React from "react";
import { cn } from "@/lib/utils";

type PoikaiCardProps = {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;

  className?: string;
  headerClassName?: string;
  contentClassName?: string;
};

export default function PoikaiCard({
  title,
  subtitle,
  icon,
  children,
  className,
  headerClassName,
  contentClassName,
}: PoikaiCardProps) {
  const hasHeader = !!(title || subtitle || icon);

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
          <div className="flex items-center gap-3">
            {icon && (
              <div className="grid h-9 w-9 place-items-center rounded-2xl bg-white ring-1 ring-black/5">
                {icon}
              </div>
            )}

            {(title || subtitle) && (
              <div className="min-w-0">
                {title && (
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {title}
                  </p>
                )}
                {subtitle && (
                  <p className="truncate text-xs text-gray-500">{subtitle}</p>
                )}
              </div>
            )}
          </div>
        </header>
      )}

      <div className={cn("p-4", contentClassName)}>{children}</div>
    </section>
  );
}
