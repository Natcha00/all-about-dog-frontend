"use client";

import { useMemo, useState } from "react";
import NotificationItem from "@/components/ui/notifications/NotificationItem";

import type { Notification } from "@/lib/notifications/notifications.types";
import NotificationTabs, { NotificationTab } from "@/components/ui/notifications/NotificationsTabs";

export default function NotificationsPage() {
  const [tab, setTab] = useState<NotificationTab>("all");

  const notifications: Notification[] = [
    {
      id: "n1",
      type: "booking",
      title: "ยืนยันการจองสำเร็จ",
      message: "น้องโมจิ • Boarding 2 คืน เริ่ม 25 ม.ค.",
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      isRead: false,
    },
    {
      id: "n2",
      type: "payment",
      title: "ชำระเงินเรียบร้อย",
      message: "ยอด 890 บาท • ขอบคุณที่ใช้บริการ",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      isRead: true,
    },
  ];

  const filtered = useMemo(() => {
    if (tab === "unread") return notifications.filter((n) => !n.isRead);
    return notifications;
  }, [tab, notifications]);

  return (
    <div className="min-h-screen bg-[#F7F4E8] px-4 py-6 pb-28 max-w-md mx-auto">
        <NotificationTabs value={tab} onChange={setTab} />

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-black/50">
              ไม่มีแจ้งเตือน
            </p>
          ) : (
            filtered.map((it) => <NotificationItem key={it.id} item={it} />)
          )}
        </div>
      </div>
  );
}
