"use client";

import React from "react";

export interface TabItem {
  id: string;
  label: string;
}

interface BtnContainerHeathProps {
  data: TabItem[];
  currentItem: string;
  setCurrentItem: React.Dispatch<React.SetStateAction<string>>;
}

export default function BtnContainerHeath({
  data,
  currentItem,
  setCurrentItem,
}: BtnContainerHeathProps) {
  return (
    <div className="mx-auto w-full max-w-md px-4">
      <div className="rounded-2xl bg-gray-50 ring-1 ring-gray-200 p-1 shadow-sm">
        <div className="flex gap-1">
          {data.map((item) => {
            const active = currentItem === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrentItem(item.id)}
                className={`
                  flex-1
                  rounded-xl
                  px-3 py-2.5
                  text-sm font-semibold
                  transition
                  ${active
                    ? "bg-[#f0a23a] text-white shadow-sm"
                    : "bg-transparent text-gray-600 hover:bg-white hover:text-gray-900"}
                `}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
