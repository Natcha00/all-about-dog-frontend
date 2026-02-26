export type ServiceKind = "SWIMMING" | "BOARDING";

export type HistoryStatus = "completed" | "cancelled";

export type ServiceHistoryItem =
  | {
      type: "BOARDING";
      id: string;
      kindLabel: string;
      iconSrc?: string;
      startAt: string;
      endAt: string;
    }
  | {
      type: "SWIMMING";
      id: string;
      kindLabel: string;
      iconSrc?: string;
      date: string;       // วันที่
      slotLabel: string;  // รอบ เช่น 12:00
    };
