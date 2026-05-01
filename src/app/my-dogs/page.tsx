"use client";

import { useCallback, useEffect, useState } from "react";
import type { CircleItemProps } from "@/components/ui/circleProfile";
import type { DogApiItem } from "@/lib/dogs/dog.type";
import MyDogsGrid from "@/components/my-dogs/MyDogsGrid";

function mapDogToCircleItem(dog: DogApiItem): CircleItemProps {
  return {
    id: dog.id,
    image: dog.dogPictureUrl || "/images/placeholder.svg",
    name: dog.name,
  };
}

export default function MyPetsPage() {
  const [dogs, setDogs] = useState<CircleItemProps[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadDogs = useCallback(() => {
    setLoading(true);
    setErrorMessage(null);
    fetch("/api/dog", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((data: unknown) => {
        const list = Array.isArray(data) ? data : [];
        setDogs(list.map((d: DogApiItem) => mapDogToCircleItem(d)));
      })
      .catch((e) => {
        console.error("getDogs failed:", e);
        setErrorMessage("โหลดรายการสัตว์เลี้ยงไม่สำเร็จ กรุณาลองใหม่ภายหลัง");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadDogs();
  }, [loadDogs]);

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm("ต้องการลบสัตว์เลี้ยงตัวนี้ใช่หรือไม่?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/dog/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = (data.message as string) || (data.message as string) || `ลบล้มเหลว (${res.status})`;
        alert(msg);
        return;
      }
      setDogs((prev) => prev.filter((d) => d.id !== id));
    } catch (e) {
      console.error("deleteDog failed:", e);
      alert(e instanceof Error ? e.message : "ลบล้มเหลว");
    } finally {
      setDeletingId(null);
    }
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
      {!loading && !errorMessage && (
        <MyDogsGrid
          dogs={dogs}
          onDelete={deletingId !== null ? undefined : handleDelete}
        />
      )}
      {deletingId !== null && (
        <p className="text-center text-gray-500 text-sm mt-2">กำลังลบ...</p>
      )}
    </div>
  );
}
