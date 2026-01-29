"use client";

import React, { useEffect, useState } from "react";
import { QrCode as QrIcon, X } from "lucide-react";

export interface QrCodeProps {
  iconSrc?: string; // optional: ถ้ามีรูปไอคอนเอง
  qrSrc?: string;
  label?: string;
}

export default function QrCode({ iconSrc, qrSrc, label }: QrCodeProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Button Card */}
      <div className="mx-auto w-full max-w-md px-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="
            w-full
            rounded-2xl
            border border-gray-100
            bg-white
            shadow-sm
            hover:shadow-md
            active:scale-[0.99]
            transition
          "
        >
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div
                className="
                  grid h-12 w-12 place-items-center
                  rounded-2xl
                  bg-gradient-to-br from-[#E8F7F6] to-white
                  ring-1 ring-[#BFE7E9]
                "
              >
                {iconSrc ? (
                  <img
                    src={iconSrc}
                    alt="qr icon"
                    className="w-7 h-7 object-contain"
                  />
                ) : (
                  <QrIcon className="w-6 h-6 text-[#399199]" />
                )}
              </div>

              <div className="text-left">
                <p className="text-sm text-gray-500 leading-none">
                  {label ?? "คิวอาร์โค้ดสัตว์เลี้ยง"}
                </p>
                <p className="mt-1 text-base font-semibold text-gray-900">
                  แตะเพื่อแสดง QR Code
                </p>
              </div>
            </div>

            <span
              className="
                inline-flex items-center rounded-full
                bg-[#E8F7F6] text-[#2B7D82]
                px-3 py-1 text-xs font-medium
                ring-1 ring-[#BFE7E9]
              "
            >
              เปิด
            </span>
          </div>
        </button>
      </div>

      {/* Modal */}
      {open && (
        <div
          className="
            fixed inset-0 z-50
            flex items-center justify-center
            bg-white/10 backdrop-blur-sm
            px-4
          "
          onClick={() => setOpen(false)}
        >
          <div
            className="
              w-full max-w-sm
              rounded-3xl bg-white
              shadow-[0_20px_60px_rgba(0,0,0,0.25)]
              ring-1 ring-gray-100
              overflow-hidden
              animate-in fade-in zoom-in-95
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* header */}
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#E8F7F6] via-white to-[#E8F7F6] border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-2xl bg-white ring-1 ring-[#BFE7E9]">
                  <QrIcon className="w-5 h-5 text-[#399199]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    QR Code สัตว์เลี้ยง
                  </p>
                  <p className="text-xs text-gray-500">แสดงเพื่อสแกนหรือบันทึก</p>
                </div>
              </div>

              <button
                type="button"
                className="
                  grid h-10 w-10 place-items-center
                  rounded-2xl
                  hover:bg-gray-50
                  active:scale-95
                  transition
                "
                onClick={() => setOpen(false)}
                aria-label="ปิด"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {/* body */}
            <div className="p-5">
              <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 flex items-center justify-center">
                {qrSrc ? (
                  <img
                    src={qrSrc}
                    alt="pet qr code"
                    className="w-64 h-64 object-contain"
                  />
                ) : (
                  <div className="w-64 h-64 grid place-items-center text-sm text-gray-500">
                    ยังไม่มีรูป QR
                  </div>
                )}
              </div>

              <p className="mt-3 text-xs text-gray-500 text-center">
                แตะพื้นหลังเพื่อปิด
              </p>
            </div>

            {/* footer */}
            <div className="px-5 pb-5">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="
                  w-full rounded-2xl
                  bg-[#399199] text-white
                  py-3 text-sm font-semibold
                  hover:opacity-95 active:scale-[0.99]
                  transition
                "
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
