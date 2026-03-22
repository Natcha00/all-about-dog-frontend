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

function formatBangkokDateTime(input?: string) {
  if (!input) return "";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  try {
    return d.toLocaleString("th-TH", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return d.toLocaleString();
  }
}

export function parseTimelineAt(at: string | null): string | undefined {
  if (!at) return undefined;
  try {
    const formatted = formatBangkokDateTime(at);
    if (formatted) return formatted;
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
    pay_at_store: ["created", "waiting_slip"],
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
    waiting_slip: "รอแนบสลิป",
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
    { key: "created", label: "สร้างรายการจอง", at: formatBangkokDateTime(base.toISOString()), tone: "info" },
    { key: "waiting_slip", label: "รอแนบสลิป", at: formatBangkokDateTime(t1.toISOString()), tone: "info" },
    { key: "slip_uploaded", label: "แนบสลิปแล้ว", at: formatBangkokDateTime(t2.toISOString()), tone: "info" },
    {
      key: "slip_verified",
      label: "ยืนยันการชำระเงินโดยพนักงาน",
      at: formatBangkokDateTime(t3.toISOString()),
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
      at: formatBangkokDateTime(new Date(base.getTime() + (i + 3) * 60 * 60 * 1000).toISOString()),
    }));

  return [...known, ...missing];
}

