import ServiceCards, { ServiceItemProps } from "@/components/ui/boxService";

const services: ServiceItemProps[] = [
  { title: "รายการจอง", icon: "/images/tickets.png", path: "/service/booking", type: "reservation" },
];

const histories: ServiceItemProps[] = [
  { title: "ตารางนัด", icon: "/images/calenda.png", path: "/service/schedule", type: "schedule" },
  { title: "ประวัติการใช้", icon: "/images/history.png", path: "/service/history", type: "history" },
];

export default function Service() {
  return (
    <div className="min-h-screen bg-[#F7F4E8]">
      <div className="mx-auto w-full max-w-md px-4 py-6 space-y-6">
        {/* Header (Poikai style) */}
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-gray-900">บริการ</h1>
          <p className="mt-1 text-sm text-black/50">จัดการการจอง ตารางนัด และประวัติ</p>
        </div>

        {/* Section: Booking */}
        <section className="rounded-3xl bg-white/70 ring-1 ring-black/5 shadow-sm p-5 space-y-4">
          <div>
            <h2 className="text-base font-extrabold text-gray-900">รายการจอง</h2>
            <p className="text-sm text-black/50">ดูสถานะการจอง และดำเนินการต่อ</p>
          </div>

          <ServiceCards items={services} />
        </section>

        {/* Divider */}
        <div className="h-[1px] w-full bg-black/10" />

        {/* Section: Schedule & History */}
        <section className="rounded-3xl bg-white/70 ring-1 ring-black/5 shadow-sm p-5 space-y-4">
          <div>
            <h2 className="text-base font-extrabold text-gray-900">การนัดหมาย & ประวัติ</h2>
            <p className="text-sm text-black/50">ตารางนัด และประวัติการใช้บริการทั้งหมด</p>
          </div>

          <ServiceCards items={histories} />
        </section>

        {/* Small footer hint (optional) */}
      </div>
    </div>
  );
}
