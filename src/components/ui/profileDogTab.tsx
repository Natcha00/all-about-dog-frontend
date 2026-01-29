"use client";

import React from "react";
import { Camera } from "lucide-react";

type Gender = "male" | "female";

export interface DogNameWithGender {
  name: string;
  gender: Gender;
  img?: string;
  age?: number;
  allergic?: string;
}

const DEFAULT_DOG_IMAGE = "/images/facedog.png";

function Chip({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "danger" | "success";
}) {
  const cls =
    tone === "danger"
      ? "bg-red-50 text-red-700 ring-red-100"
      : tone === "success"
        ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
        : "bg-gray-50 text-gray-700 ring-gray-100";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${cls}`}>
      {children}
    </span>
  );
}

export function DefaultCardProfileDog({
  name,
  gender,
  img,
  age,
  allergic,
}: DogNameWithGender) {
  const imageSrc = img && img.trim() !== "" ? img : DEFAULT_DOG_IMAGE;

  const genderLabel = gender === "male" ? "เพศผู้" : "เพศเมีย";
  const genderSymbol = gender === "male" ? "♂" : "♀";

  const hasAllergy =
    !!allergic &&
    allergic.trim() !== "" &&
    allergic !== "-" &&
    allergic !== "ไม่มี";

  return (
    <div className="mx-auto w-full max-w-md px-4">
      <div
        className="
          relative overflow-hidden
          rounded-3xl border border-gray-100 bg-white
          shadow-sm
        "
      >
        {/* soft header background */}
        <div className="h-14 bg-gradient-to-r from-[#E8F7F6] via-white to-[#E8F7F6] " />

        <div className="px-4 pb-4 -mt-10">
          <div className="flex items-end justify-between gap-3">
            {/* Avatar */}
            <div className="relative">
              <div
                className="
                  w-24 h-24 sm:w-28 sm:h-28
                  rounded-full overflow-hidden
                  ring-4 ring-white
                  border border-[#BFE7E9]
                  shadow-md
                  bg-gray-100
                "
              >
                <img
                  src={imageSrc}
                  alt={name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_DOG_IMAGE;
                  }}
                />
              </div>

              {/* Camera button */}
              <button
                type="button"
                className="
                  absolute -bottom-1 -right-1
                  w-10 h-10 rounded-full
                  bg-white
                  border border-gray-200
                  shadow-sm
                  grid place-items-center
                  hover:bg-gray-50 active:scale-95
                  transition
                "
                aria-label="เปลี่ยนรูปโปรไฟล์"
              >
                <Camera className="w-5 h-5 text-gray-700" />
              </button>
            </div>


            <div className="flex flex-col items-center gap-6">
              <div className="min-w-0 flex-1">
                <p className="text-2xl font-semibold text-gray-900 whitespace-normal break-all">
                  {name}
                </p>

              </div>


              {/* Right top chips */}
              <div className="flex items-end gap-2 pb-2">
                <Chip tone="neutral">
                  <span className="mr-1">{genderSymbol}</span>
                  {genderLabel}
                </Chip>

                {age !== undefined ? <Chip tone="neutral">อายุ {age} ปี</Chip> : null}
              </div>
            </div>
          </div>

          {/* Name + details */}
          <div className="mt-3">

            {/* Allergy */}
            <div className="mt-3">
              {hasAllergy ? (
                <div className="flex items-center justify-between gap-2 rounded-2xl bg-red-50 px-3 py-2 ring-1 ring-red-100">
                  <p className="text-sm text-red-800">
                    <span className="font-semibold">สิ่งที่แพ้:</span> {allergic}
                  </p>
                  <Chip tone="danger">ระวัง</Chip>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2 rounded-2xl bg-emerald-50 px-3 py-2 ring-1 ring-emerald-100">
                  <p className="text-sm text-emerald-800">
                    <span className="font-semibold">สิ่งที่แพ้:</span> ไม่มี
                  </p>
                  <Chip tone="success">ปลอดภัย</Chip>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
