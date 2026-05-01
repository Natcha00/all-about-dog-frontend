"use client";

import React, { useEffect, useState } from "react";
import PoikaiCard from "@/components/ui/PoikaiCard";
import { Home } from "lucide-react";
import { toBackendUrlFromApi } from "@/lib/api/backend";
import { useAuthorizedApi } from "@/hooks/useAuthorizedApi";

type Availability = {
  capacity: { SMALL: number; LARGE: number; VIP: number };
  booked: { SMALL: number; LARGE: number; VIP: number };
  available: { SMALL: number; LARGE: number; VIP: number };
};

export default function AvailabilityBox({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) {
  const authorizedApi = useAuthorizedApi();
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      setError("");
      setAvailability(null);

      if (!startDate || !endDate) return;

      try {
        setLoading(true);

        // 👇 เปลี่ยน URL ให้ตรง backend ของคุณ
        const res = await authorizedApi(
          toBackendUrlFromApi(`/api/boarding/availability?start=${startDate}&end=${endDate}`),
          { cache: "no-store" }
        );

        if (!res.ok) throw new Error("โหลดข้อมูลห้องว่างไม่สำเร็จ");
        const data: Availability = await res.json();
        setAvailability(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [authorizedApi, startDate, endDate]);

  return (
    <PoikaiCard
      title="สถานะห้อง (ช่วงวันที่เลือก)"
      subtitle="เลือกวันเข้า–วันออกเพื่อดูจำนวนห้องว่าง"
      icon={<Home className="w-5 h-5 text-[#399199]" />}
    >
      {!startDate || !endDate ? (
        <p className="text-sm text-gray-600">เลือกวันเข้า–วันออก เพื่อดูห้องว่าง</p>
      ) : null}

      {loading ? <p className="text-sm text-gray-600">กำลังโหลดข้อมูลห้องว่าง...</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      {availability ? (
        <div className="mt-2 space-y-1 text-sm text-gray-800">
          <p>
            ตึกหมาใหญ่: จองไปแล้ว{" "}
            <b>
              {availability.booked.LARGE}/{availability.capacity.LARGE}
            </b>{" "}
            ห้อง เหลืออีก <b>{availability.available.LARGE}</b>
          </p>
          <p>
            ตึกหมาเล็ก: จองไปแล้ว{" "}
            <b>
              {availability.booked.SMALL}/{availability.capacity.SMALL}
            </b>{" "}
            ห้อง เหลืออีก <b>{availability.available.SMALL}</b>
          </p>
          <p>
            ห้อง VIP: จองไปแล้ว{" "}
            <b>
              {availability.booked.VIP}/{availability.capacity.VIP}
            </b>{" "}
            ห้อง เหลืออีก <b>{availability.available.VIP}</b>
          </p>
        </div>
      ) : null}
    </PoikaiCard>
  );
}
