"use client";

import React from "react";

export default function SuccessHeader({
  serviceLabel,
  title = "จองสำเร็จ ✅",
  subtitle = "ระบบได้รับรายการของคุณแล้ว",
}: {
  serviceLabel: string;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6 flex flex-col items-center">
      <p className="text-sm text-gray-500">{serviceLabel}</p>
      <h1 className="text-3xl font-extrabold text-gray-900">{title}</h1>
      <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
    </div>
  );
}
