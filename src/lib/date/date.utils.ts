export function parseIsoToDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
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
  const d = parseIsoToDate(value);
  if (!d) return value || "-";

  return d.toLocaleString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

