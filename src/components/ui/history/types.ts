export type ServiceKind = "swimming" | "boarding";

export type HistoryStatus = "completed" | "cancelled";

export interface ServiceHistoryItem {
  id: string; // booking reference
  kind: ServiceKind;
  kindLabel: string; // "สระว่ายน้ำ" / "อาบน้ำตัดขน"
  iconSrc?: string; // path รูปไอคอน (png/svg)
  startAt: string; // ISO: "2023-03-17T14:45:00"
  endAt: string;   // ISO: "2023-03-17T16:00:00"
  status?: HistoryStatus;
}
