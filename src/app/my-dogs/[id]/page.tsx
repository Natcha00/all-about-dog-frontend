"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { DogProfileApiResponse } from "@/lib/dogs/dog.type";
import {
  mapProfileToCardProps,
  mapProfileToQrProps,
  mapProfileToPetInfoMock,
  mapProfileToHistoryItems,
  mapProfileToVaccineRecords,
} from "@/lib/dogs/dogProfile.mapper";
import DogProfileClient from "./DogProfileClient";

export default function DogProfilePage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : params.id?.[0] ?? "";

  const [data, setData] = useState<DogProfileApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!id) return;
    setError(null);
    const res = await fetch(`/api/dog/${encodeURIComponent(id)}/profile`);
    if (res.status === 404) return;
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const profile = (await res.json()) as DogProfileApiResponse;
    setData(profile);
  }, [id]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Missing dog id");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);

    fetch(`/api/dog/${encodeURIComponent(id)}/profile`)
      .then((res) => {
        if (res.status === 404) return null;
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return res.json() as Promise<DogProfileApiResponse>;
      })
      .then((profile) => {
        if (cancelled) return;
        setData(profile);
      })
      .catch((e) => {
        if (cancelled) return;
        console.error("getDogProfile failed:", e);
        setError("โหลดข้อมูลสัตว์เลี้ยงไม่สำเร็จ กรุณาลองใหม่ภายหลัง");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        กำลังโหลด...
      </div>
    );
  }

  if (error || !id) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        {error ?? "ไม่พบข้อมูลสัตว์เลี้ยง"}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        ไม่พบข้อมูลสัตว์เลี้ยง
      </div>
    );
  }

  const card = mapProfileToCardProps(data);
  const qr = mapProfileToQrProps(data);
  const petInfo = mapProfileToPetInfoMock(data);
  const historyItems = mapProfileToHistoryItems(data);
  const initialVaccineList = mapProfileToVaccineRecords(data);

  return (
    <DogProfileClient
      dogId={id}
      card={card}
      qr={qr}
      petInfo={petInfo}
      historyItems={historyItems}
      initialVaccineList={initialVaccineList}
      onProfilePictureChange={fetchProfile}
    />
  );
}
