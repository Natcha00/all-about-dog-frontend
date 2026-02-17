"use client";

import React from "react";
import { Check } from "lucide-react";

type PetSelectCardProps = {
    id: number;
    name: string;
    image: string;
    size: string;
    selected: boolean;
    onToggle: (id: number) => void;
};

export default function PetSelectCard({
    id,
    name,
    image,
    size,
    selected,
    onToggle,
}: PetSelectCardProps) {
    return (
        <button
            type="button"
            onClick={() => onToggle(id)}
            aria-pressed={selected}
            className="
        group
        flex flex-col items-center gap-3
        rounded-3xl
        px-2 py-3
        transition
        focus:outline-none
        active:scale-[0.98]
      "
        >
            {/* Avatar */}
            <div className="relative">
                <div
                    className={`
            w-24 h-24 rounded-full
            bg-[#F7F4E8]
            ring-4
            shadow-[0_10px_25px_rgba(0,0,0,0.08)]
            transition-all
            ${selected ? "ring-emerald-400" : "ring-white"}
            group-hover:shadow-[0_14px_32px_rgba(0,0,0,0.10)]
          `}
                >
                    <img
                        src={image}
                        alt={name}
                        className="
              w-full h-full rounded-full object-cover
              border border-black/5
            "
                    />
                </div>

                {/* Check badge */}
                <span
                    className={`
            absolute -bottom-1 -right-1
            grid place-items-center
            w-8 h-8 rounded-full
            ring-4 ring-[#F7F4E8]
            shadow-md
            transition-all
            ${selected
                            ? "bg-emerald-500 scale-100 opacity-100"
                            : "bg-white scale-90 opacity-0"
                        }
          `}
                >
                    <Check className="w-4 h-4 text-white" />
                </span>
            </div>

            {/* Name */}
            <div className="text-center">
                <div className="text-lg font-bold text-gray-900 leading-none">
                    {name}
                </div>

                <div
                    className={`
            mt-1 text-sm font-medium
            transition
            ${selected ? "text-emerald-600" : "text-gray-500"}
          `}
                >
                    {selected ? "เลือกแล้ว" : "แตะเพื่อเลือก"}
                </div>
            </div>
        </button>
    );
}
