"use client";

import React, { useState, useEffect, useCallback } from "react";
import AppImage from "@/components/ui/AppImage";

const BANNER_IMAGES = [
  "/images/landingDog.png",
  "/images/dogRoomLanding.jpg",
  "/images/dogSwimmingLanding.jpg",
].filter(Boolean);

const BANNER_DURATION_MS = 4000;

export default function HomeBanner() {
  const [index, setIndex] = useState(0);
  const total = BANNER_IMAGES.length || 1;

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % total);
  }, [total]);

  useEffect(() => {
    if (total <= 1) return;
    const id = setInterval(goNext, BANNER_DURATION_MS);
    return () => clearInterval(id);
  }, [total, goNext]);

  if (BANNER_IMAGES.length === 0) return null;

  return (
    <section className="w-full rounded-3xl overflow-hidden bg-white/80 shadow-lg shadow-black/5 ring-1 ring-black/5">
      <div className="relative aspect-[16/9] min-h-[160px] w-full">
        {BANNER_IMAGES.map((src, i) => (
          <div
            key={src + i}
            className="absolute inset-0 transition-opacity duration-500 ease-out"
            style={{ opacity: i === index ? 1 : 0, zIndex: i === index ? 1 : 0 }}
          >
            <AppImage
              src={src}
              alt={`Banner ${i + 1}`}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
        {total > 1 && (
          <div className="absolute bottom-3 left-0 right-0 z-10 flex justify-center gap-2">
            {BANNER_IMAGES.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`ไปสไลด์ ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === index
                    ? "w-6 bg-white shadow-sm"
                    : "w-2 bg-white/60 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
