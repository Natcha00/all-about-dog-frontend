"use client";

import type { Notification } from "@/lib/notifications/notifications.types";
import NotificationsEmpty from "./NotificationsEmpty";
import NotificationItem from "./NotificationItem";

export default function NotificationsList({
  items,
  mode,
  onToggleRead,
}: {
  items: Notification[];
  mode: "all" | "unread";
  onToggleRead: (id: string) => void;
}) {
  if (items.length === 0) return <NotificationsEmpty mode={mode} />;

  return (
    <div className="space-y-3">
      {items.map((it) => (
        <NotificationItem key={it.id} item={it} />
      ))}
    </div>
  );
}
