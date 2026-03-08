"use client";

import { useEffect, useState } from "react";
import type { CircleItemProps } from "@/components/ui/circleProfile";
import type { DogApiItem } from "@/lib/dogs/dog.type";
import MyDogsGrid from "./MyDogsGrid";

function mapDogToCircleItem(dog: DogApiItem): CircleItemProps {
  return {
    id: dog.id,
    image: dog.dogPictureUrl || "/images/landingDog.png",
    name: dog.name,
  };
}

export default function MyPetsPage() {
  const [dogs, setDogs] = useState<CircleItemProps[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErrorMessage(null);
    fetch("/api/dog")
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((data: unknown) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        setDogs(list.map((d: DogApiItem) => mapDogToCircleItem(d)));
      })
      .catch((e) => {
        if (cancelled) return;
        console.error("getDogs failed:", e);
        setErrorMessage("โหลดรายการสัตว์เลี้ยงไม่สำเร็จ กรุณาลองใหม่ภายหลัง");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F4E8] px-4 py-6 pb-28 max-w-md mx-auto">
      <h1 className="text-center text-2xl font-extrabold text-gray-900 mb-6">
        สัตว์เลี้ยงของฉัน
      </h1>
      {loading && (
        <p className="text-center text-gray-500 py-4">กำลังโหลด...</p>
      )}
      {errorMessage && (
        <p className="text-center text-amber-700 bg-amber-100 rounded-lg px-4 py-2 mb-4 text-sm">
          {errorMessage}
        </p>
      )}
      {!loading && !errorMessage && <MyDogsGrid dogs={dogs} />}
    </div>
  );
}
