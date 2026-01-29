import type { Notification } from "./notifications.types";

export const mockNotifications: Notification[] = [
  {
    id: "n1",
    type: "booking",
    title: "ยืนยันการจองสำเร็จ",
    message: "น้องโมจิ • Boarding 2 คืน เริ่ม 25 ม.ค.",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    isRead: false,
    actionLabel: "ดูรายละเอียด",
    actionHref: "/service/boarding",
  },
  {
    id: "n2",
    type: "payment",
    title: "ชำระเงินเรียบร้อย",
    message: "ยอด 890 บาท • ขอบคุณที่ใช้บริการ",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    isRead: true,
  },
  {
    id: "n3",
    type: "system",
    title: "อัปเดตโปรไฟล์สัตว์เลี้ยง",
    message: "เพิ่มรูปน้องเพื่อให้ทีมดูแลได้สะดวกขึ้น",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    isRead: false,
    actionLabel: "ไปที่โปรไฟล์",
    actionHref: "/pets",
  },
];
