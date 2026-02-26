"use client";

import React, { useMemo, useState } from "react";
import HistoryCard from "./HistoryCard";
import type { ServiceHistoryItem, ServiceKind } from "./types";

const filters: { key: "all" | ServiceKind; label: string }[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "SWIMMING", label: "สระว่ายน้ำ" },
  { key: "BOARDING", label: "ฝากเลี้ยง" },
];

function FilterChip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        rounded-full px-4 py-2 text-sm font-semibold transition
        ring-1
        ${active
          ? "bg-[#f0a23a] text-white ring-[#f0a23a]"
          : "bg-white text-[#f0a23a] ring-[#f0a23a] hover:bg-[#f0a23a]"}
      `}
    >
      {children}
    </button>
  );
}

export default function HistoryList({ items }: { items: ServiceHistoryItem[] }) {
  const [filter, setFilter] = useState<"all" | ServiceKind>("all");

  const visible = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((x) => x.type === filter);
  }, [items, filter]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 justify-center">
        {filters.map((f) => (
          <FilterChip key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>
            {f.label}
          </FilterChip>
        ))}
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <div className="rounded-3xl bg-white ring-1 ring-gray-100 shadow-sm p-6 text-center">
          <p className="font-semibold text-gray-900">ยังไม่มีประวัติการใช้บริการ</p>
          <p className="text-sm text-gray-600 mt-1">เมื่อมีรายการจองสำเร็จ จะมาแสดงที่หน้านี้</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((it) => (
            <HistoryCard key={it.id} item={it} />
          ))}
        </div>
      )}
    </div>
  );
}
