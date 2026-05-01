"use client";

import React, { useState, useEffect, useCallback } from "react";
import AppImage from "@/components/ui/AppImage";
import { useAuthorizedApi } from "@/hooks/useAuthorizedApi";

type BannerItem = {
  id: number;
  imageUrl: string;
};

const BANNER_DURATION_MS = 4000;
const SWIPE_THRESHOLD = 40;

export default function HomeBanner() {
  const authorizedApi = useAuthorizedApi();
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [index, setIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [fullImageUrl, setFullImageUrl] = useState<string | null>(null);
  const total = banners.length || 0;

  useEffect(() => {
    let cancelled = false;

    async function loadBanners() {
      try {
        const res = await authorizedApi("/api/news/banner", {
          cache: "no-store",
        });

        if (!res.ok) {
          return;
        }

        const data: unknown = await res.json();
        if (!cancelled && Array.isArray(data)) {
          const list = (data as BannerItem[]).filter(
            (b) =>
              !!b &&
              typeof b.imageUrl === "string" &&
              b.imageUrl.length > 0,
          );
          setBanners(list);
          setIndex(0);
        }
      } catch {
        // ignore – banner is optional
      }
    }

    void loadBanners();

    return () => {
      cancelled = true;
    };
  }, [authorizedApi]);

  const goNext = useCallback(() => {
    if (total <= 1) return;
    setIndex((i) => (i + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    if (total <= 1) return;
    setIndex((i) => (i - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (total <= 1) return;
    const id = setInterval(goNext, BANNER_DURATION_MS);
    return () => clearInterval(id);
  }, [total, goNext]);

  if (total === 0) return null;

  const handleTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (e.touches.length !== 1) return;
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (touchStartX == null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX;
    const deltaX = endX - touchStartX;
    if (deltaX > SWIPE_THRESHOLD) {
      goPrev();
    } else if (deltaX < -SWIPE_THRESHOLD) {
      goNext();
    } else {
      const target = e.target instanceof Node ? e.target : null;
      const isDotButton = target && (target as HTMLElement).closest?.("[data-banner-dot]");
      if (!isDotButton) {
        const current = banners[index];
        if (current?.imageUrl) setFullImageUrl(current.imageUrl);
      }
    }
    setTouchStartX(null);
  };

  const openFullImage = (imageUrl: string) => () => setFullImageUrl(imageUrl);
  const closeFullImage = () => setFullImageUrl(null);

  return (
    <section className="w-full rounded-3xl overflow-hidden bg-white/80 shadow-lg shadow-black/5 ring-1 ring-black/5">
      <div
        className="relative aspect-[16/9] min-h-[160px] w-full touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {banners.map((banner, i) => (
          <button
            type="button"
            key={banner.id ?? banner.imageUrl ?? i}
            className="absolute inset-0 transition-opacity duration-500 ease-out w-full h-full cursor-pointer border-0 p-0 bg-transparent text-left"
            style={{
              opacity: i === index ? 1 : 0,
              zIndex: i === index ? 1 : 0,
              pointerEvents: i === index ? "auto" : "none",
            }}
            onClick={openFullImage(banner.imageUrl)}
            aria-label={`ดูรูปเต็มแบนเนอร์ ${i + 1}`}
          >
            <AppImage
              src={banner.imageUrl}
              alt={`Banner ${i + 1}`}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
        {total > 1 && (
          <div className="absolute bottom-3 left-0 right-0 z-10 flex justify-center gap-2" data-banner-dot>
            {banners.map((_, i) => (
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

      {fullImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={closeFullImage}
          role="dialog"
          aria-modal="true"
          aria-label="รูปแบนเนอร์เต็ม"
        >
          <div
            className="relative max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeFullImage}
              className="absolute -top-10 right-0 z-10 rounded-full bg-white/20 p-2 text-white hover:bg-white/30 transition"
              aria-label="ปิด"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <AppImage
              src={fullImageUrl}
              alt="รูปแบนเนอร์เต็ม"
              className="max-w-[100vw] max-h-[80vh] w-auto h-auto object-contain"
            />
          </div>
        </div>
      )}
    </section>
  );
}
