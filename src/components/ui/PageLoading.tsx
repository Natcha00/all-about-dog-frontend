"use client";

import React from "react";

export type PageLoadingProps = {
  /** แสดงเต็มจอกลาง (default: true) */
  fullScreen?: boolean;
  /** ข้อความใต้ spinner (optional) */
  message?: string;
  /** ขนาด spinner: sm | md | lg (default: md) */
  size?: "sm" | "md" | "lg";
  /** คลาสเพิ่มเติมสำหรับ container */
  className?: string;
};

const sizeClasses = {
  sm: "h-6 w-6 border-2",
  md: "h-10 w-10 border-2",
  lg: "h-14 w-14 border-[3px]",
};

export default function PageLoading({
  fullScreen = true,
  message,
  size = "md",
  className = "",
}: PageLoadingProps) {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={[
          "animate-spin rounded-full border-[#f0a23a] border-t-transparent",
          sizeClasses[size],
        ].join(" ")}
        aria-hidden
      />
      {message ? (
        <p className="text-sm text-gray-500">{message}</p>
      ) : null}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className={[
          "flex min-h-screen min-w-full items-center justify-center bg-[#F7F4E8]/80",
          className,
        ].join(" ")}
        role="status"
        aria-label={message ?? "กำลังโหลด"}
      >
        {spinner}
      </div>
    );
  }

  return (
    <div
      className={["flex min-h-[12rem] items-center justify-center", className].join(" ")}
      role="status"
      aria-label={message ?? "กำลังโหลด"}
    >
      {spinner}
    </div>
  );
}
