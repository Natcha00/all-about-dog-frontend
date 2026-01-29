export default function NotificationsEmpty({
    mode,
  }: {
    mode: "all" | "unread";
  }) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-6 text-center">
        <p className="text-[15px] font-semibold text-black">
          {mode === "unread" ? "ไม่มีแจ้งเตือนที่ยังไม่อ่าน" : "ยังไม่มีแจ้งเตือน"}
        </p>
        <p className="mt-2 text-[13px] text-black/60">
          เมื่อมีอัปเดตเกี่ยวกับการจอง/การชำระเงิน ระบบจะแจ้งให้คุณที่นี่
        </p>
      </div>
    );
  }
  