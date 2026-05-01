"use client";

import type { ServiceKey, ServiceRulesDTO } from "@/lib/walkin/walkin/mockServiceRules";
import { mapAnnouncementToServiceRules } from "@/lib/walkin/walkin/announcementApi";
import React, { useEffect, useRef, useState } from "react";
import SwimmingRulesTab from "./SwimmingRulesTab";
import BoardingRulesTab from "./BoardingRulesTab";
import { useAuthorizedApi } from "@/hooks/useAuthorizedApi";

export default function ServiceRulesModal(props: {
  open: boolean;
  defaultTab?: ServiceKey;
  onClose: () => void;
}) {
  const { open, defaultTab = "swimming", onClose } = props;
  const authorizedApi = useAuthorizedApi();

  const [tab, setTab] = useState<ServiceKey>(defaultTab);
  const [rules, setRules] = useState<Record<ServiceKey, ServiceRulesDTO> | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync tab to selected service when modal opens or defaultTab changes
  useEffect(() => {
    if (open) setTab(defaultTab);
  }, [open, defaultTab]);

  // ✅ แยก ref ของ scroll แต่ละ tab
  const swimRef = useRef<HTMLDivElement | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      setRules(null);
      setError(null);
      return;
    }
    authorizedApi("/api/offering/announcement")
      .then((res) => {
        if (!res.ok) return res.json().then((b) => Promise.reject(new Error(b.message ?? b.error ?? b.detail ?? res.statusText)));
        return res.json();
      })
      .then((data) => {
        setRules(mapAnnouncementToServiceRules(data));
        setError(null);
      })
      .catch((e) => {
        setRules(null);
        setError(e instanceof Error ? e.message : "โหลดข้อมูลไม่สำเร็จ");
      });
  }, [authorizedApi, open]);

  // ✅ ทุกครั้งที่เปลี่ยน tab ให้ "tab ที่ถูกเปิด" เด้งบนสุด
  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      const el = tab === "swimming" ? swimRef.current : boardRef.current;
      if (el) el.scrollTop = 0;
    });
  }, [tab, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/35 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-white ring-1 ring-black/10 shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* X */}
        <button
          type="button"
          onClick={onClose}
          aria-label="ปิด"
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-lg border border-black/30 bg-white grid place-items-center hover:bg-gray-50 active:scale-[0.98]"
        >
          <span className="text-xl leading-none">×</span>
        </button>

        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-black/5 bg-white/70">
          <p className="text-lg font-extrabold text-gray-900 text-center">ข้อกำหนดการให้บริการ</p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTab("swimming")}
              className={[
                "rounded-2xl py-2 text-sm font-extrabold ring-2 transition",
                tab === "swimming"
                  ? "bg-[#fff7ea] ring-[#F0A23A] text-gray-900"
                  : "bg-white ring-black/10 text-black/60 hover:bg-black/[0.03]",
              ].join(" ")}
            >
              สระว่ายน้ำ
            </button>

            <button
              type="button"
              onClick={() => setTab("boarding")}
              className={[
                "rounded-2xl py-2 text-sm font-extrabold ring-2 transition",
                tab === "boarding"
                  ? "bg-[#fff7ea] ring-[#F0A23A] text-gray-900"
                  : "bg-white ring-black/10 text-black/60 hover:bg-black/[0.03]",
              ].join(" ")}
            >
              ฝากเลี้ยง
            </button>
          </div>
        </div>

        {/* Body: แยก scroll container ต่อ tab */}
        <div className="px-5 py-4">
          {error ? (
            <div className="text-sm text-red-600 rounded-2xl bg-red-50 ring-1 ring-red-100 p-4">
              {error}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  authorizedApi("/api/offering/announcement")
                    .then((res) => {
                      if (!res.ok) return res.json().then((b) => Promise.reject(new Error(b.message ?? b.error ?? b.detail ?? res.statusText)));
                      return res.json();
                    })
                    .then((data) => {
                      setRules(mapAnnouncementToServiceRules(data));
                      setError(null);
                    })
                    .catch((e) => setError(e instanceof Error ? e.message : "โหลดข้อมูลไม่สำเร็จ"));
                }}
                className="mt-2 block text-[#F0A23A] font-semibold hover:underline"
              >
                ลองใหม่
              </button>
            </div>
          ) : !rules ? (
            <div className="text-sm text-black/60">กำลังโหลดข้อมูล...</div>
          ) : (
            <>
              <div
                ref={swimRef}
                className={[
                  "max-h-[65vh] overflow-y-auto",
                  tab === "swimming" ? "block" : "hidden",
                ].join(" ")}
              >
                <SwimmingRulesTab data={rules.swimming} />
              </div>

              <div
                ref={boardRef}
                className={[
                  "max-h-[65vh] overflow-y-auto",
                  tab === "boarding" ? "block" : "hidden",
                ].join(" ")}
              >
                <BoardingRulesTab data={rules.boarding} />
              </div>
            </>
          )}
        </div>

        {/* CTA */}
        <div className="px-5 py-4 border-t border-black/5 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl bg-[#F0A23A] hover:bg-[#e99625] active:scale-[0.99] transition text-white font-extrabold py-4 text-base"
          >
            เข้าใจแล้ว เริ่มจอง
          </button>
        </div>
      </div>
    </div>
  );
}
