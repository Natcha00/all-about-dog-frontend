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
    <section className="w-full rounded-2xl overflow-hidden bg-black/5 ring-1 ring-black/10">
      <div className="relative aspect-[16/9] min-h-[140px] w-full">
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
        {total > 1 && (
          <div className="absolute bottom-2 left-0 right-0 z-10 flex justify-center gap-1.5">
            {BANNER_IMAGES.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`ไปสไลด์ ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-5 bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
