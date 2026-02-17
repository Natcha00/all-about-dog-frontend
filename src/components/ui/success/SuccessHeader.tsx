"use client";

import React from "react";

export default function SuccessHeader({
  serviceLabel,
  title = "รายละเอียดการจอง",
}: {
  serviceLabel: string;
  title?: string;
}) {
  return (
    <div className="mb-6 flex flex-col items-center">
      <p className="text-sm text-gray-500">{serviceLabel}</p>
      <h1 className="text-3xl font-extrabold text-gray-900">{title}</h1>
    </div>
  );
}
