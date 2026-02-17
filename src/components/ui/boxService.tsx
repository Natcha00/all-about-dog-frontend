"use client";

import Link from "next/link";

export interface ServiceItemProps {
  title: string;
  icon: string;
  path: string;
  type: ServiceType;
}

export type ServiceType =
  | "swimming"
  | "boarding"
  | "schedule"
  | "history"
  | "reservation";

interface ServiceCardsProps {
  items: ServiceItemProps[];
}

export default function ServiceCards({ items }: ServiceCardsProps) {
  const isSingle = items.length === 1;

  return (
    <div
      className="
        grid
        gap-4
        grid-cols-1 
        sm:grid-cols-2 
        lg:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]
      "
    >
      {items.map((item) => (
        <div
          key={item.title}
          className={isSingle ? "sm:col-span-2 flex justify-center" : ""}
        >
          <div className={isSingle ? "w-full sm:w-1/2" : "w-full"}>
            <ServiceCard {...item} />
          </div>
        </div>
      ))}
    </div>
  );
}



function ServiceCard({ title, icon, path }: ServiceItemProps) {
  const cardClass =
    [
      "w-full rounded-3xl bg-white/80 ring-1 ring-black/5 shadow-sm",
      "hover:shadow-md active:scale-[0.98] transition",
      "flex flex-col items-center justify-center gap-2 text-center",
      // ✅ responsive size: ไม่บังคับ aspect-square เสมอ (มือถือจะอึดอัด)
      "h-28 sm:h-32",
      "p-3 sm:p-4",
    ].join(" ");

  return (
    <Link href={path} className={cardClass}>
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#F7F4E8] ring-1 ring-black/5 flex items-center justify-center">
        <img src={icon} alt={title} className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
      </div>

      <p className="text-xs sm:text-sm font-extrabold text-gray-900">{title}</p>
    </Link>
  );
}
