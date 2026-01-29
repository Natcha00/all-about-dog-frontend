import React from "react";

export default function PoikaiCard({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl bg-white ring-1 ring-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-[#E8F7F6] via-white to-[#E8F7F6] border-b border-gray-100">
        <div className="flex items-center gap-2">
          {icon ? (
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-white ring-1 ring-[#BFE7E9]">
              {icon}
            </div>
          ) : null}

          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            {subtitle ? (
              <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="p-4">{children}</div>
    </div>
  );
}
