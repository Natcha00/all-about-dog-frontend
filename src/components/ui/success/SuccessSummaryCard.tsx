"use client";

import React, { useEffect, useMemo, useState } from "react";
import PoikaiCard from "@/components/ui/PoikaiCard";

import type { BookingDraft, PetPicked, ServiceType } from "@/lib/walkin/walkin/types.mock";

export type SummaryRow = {
  label: string;
  value: React.ReactNode;
};

type RoomType = "SMALL" | "LARGE" | "VIP";

export type RoomAssignment = {
  type: RoomType;
  roomNo: number;
  pets: Array<{
    id: number;
    name: string;
    breed?: string | null;
    size?: "small" | "large";
  }>;
};

function roomTypeLabel(t: RoomType) {
  if (t === "VIP") return "ห้อง VIP";
  if (t === "SMALL") return "ตึกหมาเล็ก";
  return "ตึกหมาใหญ่";
}

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export function buildRoomAssignments(params: {
  pets: { id: number; name: string; size: "small" | "large"; breed?: string | null }[];
  plan: 1 | 2 | 3;
}): RoomAssignment[] {
  const { pets, plan } = params;
  if (!pets.length) return [];

  if (plan === 3) {
    return [
      {
        type: "VIP",
        roomNo: 1,
        pets: pets.map((p) => ({
          id: p.id,
          name: p.name,
          breed: p.breed ?? null,
          size: p.size,
        })),
      },
    ];
  }

  const small = pets.filter((p) => p.size === "small");
  const large = pets.filter((p) => p.size === "large");

  if (plan === 1) {
    const smallRooms: RoomAssignment[] = small.map((p, idx) => ({
      type: "SMALL",
      roomNo: idx + 1,
      pets: [{ id: p.id, name: p.name, breed: p.breed ?? null, size: p.size }],
    }));

    const largeRooms: RoomAssignment[] = large.map((p, idx) => ({
      type: "LARGE",
      roomNo: idx + 1,
      pets: [{ id: p.id, name: p.name, breed: p.breed ?? null, size: p.size }],
    }));

    return [...smallRooms, ...largeRooms];
  }

  const smallChunks = chunk(small, 3);
  const largeChunks = chunk(large, 2);

  const smallRooms: RoomAssignment[] = smallChunks.map((group, idx) => ({
    type: "SMALL",
    roomNo: idx + 1,
    pets: group.map((p) => ({
      id: p.id,
      name: p.name,
      breed: p.breed ?? null,
      size: p.size,
    })),
  }));

  const largeRooms: RoomAssignment[] = largeChunks.map((group, idx) => ({
    type: "LARGE",
    roomNo: idx + 1,
    pets: group.map((p) => ({
      id: p.id,
      name: p.name,
      breed: p.breed ?? null,
      size: p.size,
    })),
  }));

  return [...smallRooms, ...largeRooms];
}

/** =========================
 *  Mock backend: note by ref
 * ========================= */
const MOCK_NOTE_BY_REF: Record<string, string> = {
  "RSV-20260004": "⚠️ โปรดนำอาหาร/สายจูง/เบาะนอนของน้องมาด้วย (ไม่รวมในค่าบริการ)",
  "BK-0002": "✅ ห้องใกล้กล้องมีจำกัด หากต้องการระบุเพิ่มเติม กรุณาโทรแจ้งก่อนเข้าพัก",
  "SW-0001": "💦 แนะนำให้น้องงดอาหารก่อนว่ายน้ำ 2 ชั่วโมง เพื่อลดโอกาสอาเจียน",
};

async function fetchBookingNoteByRef(args: {
  refCode: string;
  booking?: BookingDraft;
  customerNote?: string | null;
}): Promise<string | null> {
  const noteFromPropsOrBooking = (args.customerNote ?? args.booking?.customerNote ?? "").trim();
  if (noteFromPropsOrBooking) return noteFromPropsOrBooking;

  await new Promise((r) => setTimeout(r, 350));

  const note = (MOCK_NOTE_BY_REF[args.refCode] ?? "").trim();
  return note || null;
}

/** =========================
 *  Component
 * ========================= */
export default function SuccessSummaryCard({
  title = "",
  subtitle = "",
  rows,
  selectedContent,
  // totalLabel = "ราคารวม",
  totalValue,

  customerNote,
  booking,
  refCode,

  // ✅ NEW: ใช้ได้แม้ไม่ได้ส่ง bookingDraft
  serviceType,

  // ✅ IMPORTANT
  petsPicked,
  roomAssignments,
}: {
  title?: string;
  subtitle?: string;
  rows: SummaryRow[];
  selectedTitle?: string;
  selectedContent?: React.ReactNode;
  totalLabel?: string;
  totalValue: React.ReactNode;

  customerNote?: string | null;
  booking?: BookingDraft;
  refCode?: string;

  // ✅ NEW
  serviceType?: ServiceType;

  petsPicked?: PetPicked[];
  roomAssignments?: RoomAssignment[];
}) {
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canFetch = useMemo(() => Boolean(refCode && refCode !== "-"), [refCode]);

  // ✅ FIX: ตัดสินจาก prop ก่อน ถ้าไม่มีค่อยดูจาก bookingDraft
  const normalizedServiceType = (serviceType ?? booking?.serviceType) as ServiceType | undefined;

  const isBoarding = normalizedServiceType === "boarding";
  const isSwimming = normalizedServiceType === "swimming";

  const showRooms = useMemo(() => (roomAssignments?.length ?? 0) > 0, [roomAssignments]);
  const swimPets = useMemo(() => petsPicked ?? [], [petsPicked]);

  const petsCountLabel = useMemo(() => {
    if (showRooms && roomAssignments) {
      const c = roomAssignments.reduce((sum, r) => sum + r.pets.length, 0);
      return `${c} ตัว`;
    }
    if (isSwimming && swimPets.length > 0) return `${swimPets.length} ตัว`;
    return "";
  }, [showRooms, roomAssignments, isSwimming, swimPets.length]);

  useEffect(() => {
    let alive = true;

    (async () => {
      const direct = (customerNote ?? booking?.customerNote ?? "").trim();
      if (direct) {
        setNoteText(direct);
        setNoteOpen(true);
        return;
      }

      if (!canFetch) {
        setNoteText(null);
        setNoteOpen(false);
        return;
      }

      setLoading(true);
      try {
        const note = await fetchBookingNoteByRef({
          refCode: String(refCode),
          booking,
          customerNote,
        });
        if (!alive) return;
        setNoteText(note);
        setNoteOpen(Boolean(note));
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [canFetch, refCode, booking, customerNote]);

  return (
    <PoikaiCard title={title} subtitle={subtitle}>
      <div className="space-y-4">
        {/* 1) Details */}
        <section className="rounded-2xl bg-white ring-1 ring-black/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-black/5">
            <p className="text-sm font-semibold text-gray-900">รายละเอียด</p>
            <p className="text-xs text-gray-500 mt-0.5">ตรวจสอบข้อมูลก่อนยืนยัน</p>
          </div>

          <div className="px-4">
            {rows.map((r, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between gap-4 py-2 border-b border-black/5 last:border-b-0"
              >
                <p className="text-sm text-gray-600">{r.label}</p>
                <div className="text-sm font-semibold text-gray-900 text-right">{r.value}</div>
              </div>
            ))}
          </div>

          {selectedContent ? <div className="px-4 pb-3">{selectedContent}</div> : null}
        </section>

        {/* 2) Pets / Rooms section */}
        {(showRooms || (isSwimming && swimPets.length > 0)) ? (
          <section className="rounded-2xl bg-white ring-1 ring-black/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-extrabold text-gray-900 pb-4">สัตว์เลี้ยงที่ใช้บริการ</p>
              </div>
              <div className="text-xs font-extrabold text-black/70 text-right leading-snug">
                {petsCountLabel}
              </div>
            </div>

            <div>
              {/* ✅ Boarding */}
              {showRooms && roomAssignments ? (
                roomAssignments.map((r) => (
                  <div
                    key={`${r.type}-${r.roomNo}`}
                    className="rounded-2xl bg-black/[0.03] ring-1 ring-black/5 p-3 overflow-y-auto max-h-56"
                  >
                    <div className="flex justify-between">
                      <p className="text-xs font-extrabold text-black/70">
                        {roomTypeLabel(r.type)} • ห้อง {r.roomNo}
                      </p>
                      <p className="text-xs font-extrabold text-black/70">{r.pets.length} ตัว</p>
                    </div>

                    <div className="mt-1 text-sm text-black/70 space-y-1">
                      {r.pets.map((p) => (
                        <div key={p.id} className="flex items-center justify-between text-black/45">
                          <span className="font-semibold">{p.name}</span>
                          <span className="text-xs">{p.size ?? "-"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : null}

              {/* ✅ Swimming */}
              {isSwimming && !showRooms ? (
                <div className="rounded-2xl bg-black/[0.03] ring-1 ring-black/5 p-3 overflow-y-auto max-h-56">
                  <div className="mt-1 text-sm text-black/70 space-y-1 ">
                    {swimPets.map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-black/45 ">
                        <span className="font-semibold">{p.name}</span>
                        <span className="text-xs">{p.size}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* 3) Total */}
        {/* <section className="rounded-2xl bg-white ring-1 ring-black/5 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">{totalLabel}</p>
            <div className="text-lg font-extrabold text-gray-900">{totalValue}</div>
          </div>
        </section> */}

        {/* 4) Note box */}
        <div className="rounded-2xl ring-1 ring-black/10 overflow-hidden bg-white">
          <button
            type="button"
            onClick={() => setNoteOpen((v) => !v)}
            className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-black/[0.03] transition"
          >
            <div className="text-left">
              <p className="text-sm font-extrabold text-gray-900">หมายเหตุจากลูกค้า</p>
              <p className="text-xs text-black/45">
                {loading ? "กำลังโหลดหมายเหตุ..." : noteText ? "มีหมายเหตุแนบมากับรายการนี้" : "ไม่มีหมายเหตุ"}
              </p>
            </div>

            <span
              className={[
                "shrink-0 rounded-full px-3 py-1 text-xs font-extrabold ring-1",
                noteText
                  ? "bg-[#fff7ea] text-[#B25A00] ring-[#F0A23A]/40"
                  : "bg-black/[0.04] text-black/60 ring-black/10",
              ].join(" ")}
            >
              {noteOpen ? "ซ่อน" : "เปิด"}
            </span>
          </button>

          {noteOpen ? (
            <div className="px-4 pb-4">
              {loading ? (
                <div className="mt-2 space-y-2">
                  <div className="h-3 w-10/12 rounded bg-black/10" />
                  <div className="h-3 w-8/12 rounded bg-black/10" />
                </div>
              ) : noteText ? (
                <p className="mt-2 text-sm text-gray-700 leading-relaxed whitespace-pre-line">{noteText}</p>
              ) : (
                <p className="mt-2 text-sm text-gray-500">—</p>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </PoikaiCard>
  );
}