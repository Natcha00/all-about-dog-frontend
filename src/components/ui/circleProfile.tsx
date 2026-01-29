"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

/* =======================
   Types
======================= */
export interface CircleItemProps {
  id: number;
  image: string;
  name: string;
}

interface CircleProfilesProps {
  items: CircleItemProps[];
}

interface CircleProfileProps extends CircleItemProps {
  openNameId: number | null;
  setOpenNameId: React.Dispatch<React.SetStateAction<number | null>>;
}

/* =======================
   Add Circle
======================= */
export const CircleAdd = () => {
  return (
    <Link
      href="/my-dogs/create"
      className="inline-flex flex-col items-center group"
      aria-label="เพิ่มสัตว์เลี้ยง"
    >
      <div
        className="
          flex items-center justify-center
          w-24 h-24 mx-auto
          rounded-full
          bg-white/70
          ring-1 ring-black/10
          shadow-sm
          transition
          group-hover:scale-[1.03]
          group-active:scale-[0.97]
        "
      >
        <Plus className="w-8 h-8 text-black/60" />
      </div>

      <div className="mt-2 w-28 text-center text-[13px] font-semibold text-black/70 truncate">
        เพิ่มสัตว์เลี้ยง
      </div>
    </Link>
  );
};

/* =======================
   Profiles Wrapper
======================= */
export const CircleProfiles = ({ items }: CircleProfilesProps) => {
  const [openNameId, setOpenNameId] = useState<number | null>(null);

  return (
    <>
      {items.map((item) => (
        <CircleProfile
          key={item.id}
          {...item}
          openNameId={openNameId}
          setOpenNameId={setOpenNameId}
        />
      ))}
    </>
  );
};

/* =======================
   Single Profile
======================= */
const CircleProfile = ({
  id,
  image,
  name,
  openNameId,
  setOpenNameId,
}: CircleProfileProps) => {
  const router = useRouter();

  return (
    <article className="w-28 text-center relative">
      {/* Avatar (กดแล้วไปหน้า profile) */}
      <button
        type="button"
        onClick={() => router.push(`/my-dogs/${id}`)}
        className="
          w-24 h-24 mx-auto
          rounded-full
          bg-white/70
          ring-1 ring-black/10
          shadow-sm
          overflow-hidden
          transition
          hover:scale-[1.03]
          active:scale-[0.97]
          focus:outline-none
          focus-visible:ring-2 focus-visible:ring-black/20
        "
        aria-label={`ไปหน้าโปรไฟล์ ${name}`}
      >
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />
      </button>

      {/* Name (tap to toggle on mobile, hover on desktop) */}
      <button
        type="button"
        className="
          mt-2 mx-auto
          w-fit max-w-[7rem]
          px-3 py-1
          rounded-full
          bg-white/60
          ring-1 ring-black/5
          text-[13px] font-semibold text-black/70
          truncate
          select-none
        "
        onClick={(e) => {
          e.stopPropagation();
          setOpenNameId(openNameId === id ? null : id);
        }}
        onMouseEnter={() => setOpenNameId(id)}
        onMouseLeave={() => setOpenNameId(null)}
      >
        {name}
      </button>

      {/* Tooltip (ชื่อเต็ม) */}
      {openNameId === id && (
        <div
          className="
            absolute left-1/2 -translate-x-1/2
            -top-2 -translate-y-full
            z-20
            px-3 py-2
            rounded-xl
            bg-black/80
            text-white text-sm
            shadow-lg
            max-w-[220px]
            text-center break-words
          "
        >
          {name}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-black/80 rotate-45" />
        </div>
      )}
    </article>
  );
};
