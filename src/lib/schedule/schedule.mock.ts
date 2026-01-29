import type { Booking } from "./schedule.types";

export const mockBookings: Booking[] = [
  // ✅ swim วันที่ 14
  {
    id: "202320080",
    status: "pending",
    serviceKind: "swimming",
    serviceLabel: "สระว่ายน้ำ",
    startAt: "2023-11-14T12:00:00",
    slotLabel: "รอบ 12.00 (VIP)",
    petNames: ["อังเปา", "อัลมอนด์", "โลมา"],
  },

  // ✅ boarding คร่อม 13-16 (รวมวันที่ 14 ด้วย)
  {
    id: "202330060",
    status: "approved",
    serviceKind: "boarding",
    serviceLabel: "รับฝากเลี้ยง",
    startAt: "2023-11-13T10:00:00",
    endAt: "2023-11-16T12:00:00",
    petNames: ["อังเปา"],
  },

  // ตัวอย่างอื่น ๆ
  {
    id: "202330061",
    status: "approved",
    serviceKind: "boarding",
    serviceLabel: "รับฝากเลี้ยง",
    startAt: "2023-11-18T10:00:00",
    endAt: "2023-11-20T12:00:00",
    petNames: ["อัลมอนด์"],
  },
];
