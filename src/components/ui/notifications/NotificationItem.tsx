"use client";

import type { Notification } from "@/lib/notifications/notifications.types";
import { timeAgo } from "@/lib/notifications/notifications.utils";

export default function NotificationItem({ item }: { item: Notification }) {
  return (
    <div
      className={[
        "rounded-2xl p-4 transition",
        item.isRead
          ? "bg-white/60 ring-1 ring-black/5"
          : "bg-black/[0.03] ring-1 ring-black/10",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        {/* dot */}
        <div className="mt-1">
          <div
            className={[
              "h-2.5 w-2.5 rounded-full",
              item.isRead ? "bg-black/30" : "bg-black",
            ].join(" ")}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-black">
            {item.title}
          </p>

          <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-black/70">
            {item.message}
          </p>

          <p className="mt-2 text-[11px] text-black/40">
            {timeAgo(item.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
