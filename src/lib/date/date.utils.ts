export function parseIsoToDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

/** Normalize date string to yyyy-mm-dd for <input type="date" /> (handles ISO, vaccinationDate, empty) */
export function toDateInputValue(value?: string | null): string {
  if (!value || typeof value !== "string") return "";
  const s = value.trim();
  if (!s) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const d = parseIsoToDate(s);
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatDateThai(value?: string | null): string {
  const d = parseIsoToDate(value);
  if (!d) return value || "-";

  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatDateTimeThai(value?: string | null): string {
  return formatBangkokDateTime(value ?? undefined);
}

export function formatBangkokDateTime(input?: string) {
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

