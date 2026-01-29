export type NotificationType = "booking" | "payment" | "promo" | "system";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string; // ISO
  isRead: boolean;
  actionLabel?: string;
  actionHref?: string; // future use
};
