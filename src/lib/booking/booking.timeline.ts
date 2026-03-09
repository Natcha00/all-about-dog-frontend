import type { BookingStatus } from "./booking.types";

export type HistoryItem = {
  key:
    | "created"
    | "approved"
    | "waiting_slip"
    | "slip_uploaded"
    | "slip_verified"
    | "check_in"
    | "finished"
    | "cancelled"
    | "rejected";
  label: string;
  at?: string;
  tone?: "success" | "info" | "danger";
  note?: string;
};

export type BackendTimelineEntry = {
  key: string;
  label: string;
  at: string | null;
  performedByName: string | null;
  detail?: string | null;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatThaiDateTime(d: Date) {
  const day = pad2(d.getDate());
  const month = pad2(d.getMonth() + 1);
  const year = d.getFullYear();
  const hr = d.getHours();
  const min = pad2(d.getMinutes());
  const ampm = hr >= 12 ? "PM" : "AM";
  const hr12 = hr % 12 === 0 ? 12 : hr % 12;
  return `เมื่อ ${day}/${month}/${year} ${hr12}:${min} ${ampm}`;
}

export function parseTimelineAt(at: string | null): string | undefined {
  if (!at) return undefined;
  try {
    const d = new Date(at);
    if (!Number.isNaN(d.getTime())) return formatThaiDateTime(d);
  } catch {
    // ignore
  }
  return at ?? undefined;
}

export function toneFromKey(key: string): HistoryItem["tone"] {
  const k = key.toUpperCase();
  if (k === "CANCELLED" || k === "REJECTED") return "danger";
  if (k === "SLIP_VERIFIED" || k === "FINISHED" || k === "APPROVED") return "success";
  return "info";
}

/** สร้างรายการสถานะบิลจาก timeline จริงจาก backend (เก็บ log ทั้งหมดตั้งแต่สร้างการจอง) */
export function buildHistoryFromBackendTimeline(timeline: BackendTimelineEntry[]): HistoryItem[] {
  if (!Array.isArray(timeline) || timeline.length === 0) return [];

  const sorted = [...timeline].sort((a, b) => {
    const tA = a.at ? new Date(a.at).getTime() : 0;
    const tB = b.at ? new Date(b.at).getTime() : 0;
    return tB - tA;
  });

  return sorted.map((entry) => {
    const key = (entry.key?.toLowerCase?.() ?? "created") as HistoryItem["key"];
    const noteParts: string[] = [];
    if (entry.performedByName) noteParts.push(`โดย: ${entry.performedByName}`);
    if (entry.detail) noteParts.push(entry.detail);
    const note = noteParts.length > 0 ? noteParts.join(" · ") : undefined;
    return {
      key,
      label: entry.label?.trim() || "สร้างรายการจอง",
      at: parseTimelineAt(entry.at),
      tone: toneFromKey(entry.key),
      note,
    };
  });
}

export function buildMockHistory(status: BookingStatus): HistoryItem[] {
  const base = new Date("2025-11-02T10:50:00");
  const t1 = new Date(base.getTime() + 24 * 60 * 60 * 1000);
  const t2 = new Date(t1.getTime() + 30 * 60 * 1000);
  const t3 = new Date(t2.getTime() + 5 * 60 * 60 * 1000);

  const statusToKeys: Record<BookingStatus, HistoryItem["key"][]> = {
    pending: ["created"],
    waiting_slip: ["created", "waiting_slip"],
    slip_uploaded: ["created", "waiting_slip", "slip_uploaded"],
    slip_verified: ["created", "waiting_slip", "slip_uploaded", "slip_verified"],
    "check-in": ["created", "waiting_slip", "slip_uploaded", "slip_verified", "check_in"],
    finished: ["created", "waiting_slip", "slip_uploaded", "slip_verified", "check_in", "finished"],
    cancelled: ["created", "cancelled"],
    rejected: ["created", "rejected"],
  };

  const autoLabel: Record<HistoryItem["key"], string> = {
    created: "สร้างรายการจอง",
    approved: "อนุมัติแล้ว",
    waiting_slip: "รอชำระเงิน",
    slip_uploaded: "แนบสลิปแล้ว",
    slip_verified: "ตรวจสลิปผ่าน",
    check_in: "เช็คอินใช้บริการ",
    finished: "เสร็จสิ้น",
    cancelled: "ยกเลิกการจอง",
    rejected: "ปฏิเสธรายการ",
  };

  const autoTone: Record<HistoryItem["key"], HistoryItem["tone"]> = {
    created: "info",
    approved: "success",
    waiting_slip: "info",
    slip_uploaded: "info",
    slip_verified: "success",
    check_in: "info",
    finished: "success",
    cancelled: "danger",
    rejected: "danger",
  };

  const allow = new Set(statusToKeys[status]);

  const baseSteps: HistoryItem[] = [
    { key: "created", label: "สร้างรายการจอง", at: formatThaiDateTime(base), tone: "info" },
    { key: "waiting_slip", label: "รอชำระเงิน", at: formatThaiDateTime(t1), tone: "info" },
    { key: "slip_uploaded", label: "แนบสลิปแล้ว", at: formatThaiDateTime(t2), tone: "info" },
    {
      key: "slip_verified",
      label: "ยืนยันการชำระเงินโดยพนักงาน",
      at: formatThaiDateTime(t3),
      tone: "success",
      note: "ผู้ตรวจ: staff01",
    },
  ];

  const known = baseSteps.filter((s) => allow.has(s.key));
  const existKeys = new Set(known.map((x) => x.key));

  const missing = Array.from(allow)
    .filter((k) => !existKeys.has(k))
    .map((k, i) => ({
      key: k,
      label: autoLabel[k],
      tone: autoTone[k],
      at: formatThaiDateTime(new Date(base.getTime() + (i + 3) * 60 * 60 * 1000)),
    }));

  return [...known, ...missing];
}

