"use client";

import React from "react";
import { DEFAULT_IMAGE } from "@/lib/constants";

type AppImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string | null | undefined;
  alt: string;
};

/**
 * รูปที่ใช้รูปพื้นฐาน (placeholder) เมื่อไม่มี src หรือโหลดไม่สำเร็จ
 */
export default function AppImage({ src, alt, onError, ...props }: AppImageProps) {
  const resolvedSrc = src?.trim() ? src : DEFAULT_IMAGE;

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = DEFAULT_IMAGE;
    onError?.(e);
  };

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={resolvedSrc} alt={alt} onError={handleError} {...props} />
  );
}
