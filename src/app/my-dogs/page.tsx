"use client";

import { useCallback, useEffect, useState } from "react";
import type { CircleItemProps } from "@/components/ui/circleProfile";
import type { DogApiItem } from "@/lib/dogs/dog.type";
import MyDogsGrid from "@/components/my-dogs/MyDogsGrid";
import { getApiErrorMessage } from "@/lib/api/error";
import { useAuthorizedApi } from "@/hooks/useAuthorizedApi";

function mapDogToCircleItem(dog: DogApiItem): CircleItemProps {
  return {
    id: dog.id,
    image: dog.dogPictureUrl || "/images/placeholder.svg",
    name: dog.name,
  };
}

export default function MyPetsPage() {
  const authorizedApi = useAuthorizedApi();
  const [dogs, setDogs] = useState<CircleItemProps[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadDogs = useCallback(() => {
    setLoading(true);
    setErrorMessage(null);
    authorizedApi("/api/dog")
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(await getApiErrorMessage(res, "โหลดรายการสัตว์เลี้ยงไม่สำเร็จ"));
        }
        return res.json();
      })
      .then((data: unknown) => {
        const list = Array.isArray(data) ? data : [];
        setDogs(list.map((d: DogApiItem) => mapDogToCircleItem(d)));
      })
      .catch((e) => {
        console.error("getDogs failed:", e);
        setErrorMessage(e instanceof Error ? e.message : "โหลดรายการสัตว์เลี้ยงไม่สำเร็จ กรุณาลองใหม่ภายหลัง");
      })
      .finally(() => setLoading(false));
  }, [authorizedApi]);

  useEffect(() => {
    loadDogs();
  }, [loadDogs]);

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm("ต้องการลบสัตว์เลี้ยงตัวนี้ใช่หรือไม่?")) return;
    setDeletingId(id);
    try {
      const res = await authorizedApi(`/api/dog/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const msg = await getApiErrorMessage(res, `ลบล้มเหลว (${res.status})`);
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
  }, [authorizedApi]);

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
