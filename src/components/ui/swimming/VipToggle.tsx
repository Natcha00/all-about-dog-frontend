"use client";

import React from "react";

type Props = {
  isVip: boolean;
  onChange: (next: boolean) => void;
};

export default function VipToggle({ isVip, onChange }: Props) {
  return (
    <label className="mt-8 flex items-start gap-3">
      <input
        type="checkbox"
        className="mt-1 h-5 w-5"
        checked={isVip}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="text-sm font-semibold text-gray-900 leading-relaxed">
        จองเป็นรอบ VIP มีเฉพาะบ้านเรา <br />
        <span className="font-normal text-gray-700">
          (เฉพาะวันธรรมดา ไม่รวมวันหยุดและนักขัตฤกษ์)
        </span>
      </span>
    </label>
  );
}
