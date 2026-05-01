"use client";

import { useCallback, useEffect, useState } from "react";
import type { DogProfileApiResponse } from "@/lib/dogs/dog.type";
import {
  mapProfileToCardProps,
  mapProfileToQrProps,
  mapProfileToPetInfoMock,
  mapProfileToHistoryItems,
  mapProfileToVaccineRecords,
} from "@/lib/dogs/dogProfile.mapper";
import DogProfileClient from "@/components/my-dogs/DogProfileClient";
import { getApiErrorMessage } from "@/lib/api/error";
import { useAuthorizedApi } from "@/hooks/useAuthorizedApi";

export default function DogProfileContainer({ dogId }: { dogId?: string }) {
  const authorizedApi = useAuthorizedApi();
  const [data, setData] = useState<DogProfileApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!dogId) return;
    setError(null);
    const res = await authorizedApi(`/api/dog/${encodeURIComponent(dogId)}/profile`);
    if (res.status === 404) return;
    if (!res.ok) throw new Error(await getApiErrorMessage(res, "โหลดข้อมูลสัตว์เลี้ยงไม่สำเร็จ"));
    const profile = (await res.json()) as DogProfileApiResponse;
    setData(profile);
  }, [authorizedApi, dogId]);

  useEffect(() => {
    if (!dogId) {
      setLoading(false);
      setError("Missing dog id");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);

    authorizedApi(`/api/dog/${encodeURIComponent(dogId)}/profile`)
      .then(async (res) => {
        if (res.status === 404) return null;
        if (!res.ok) throw new Error(await getApiErrorMessage(res, "โหลดข้อมูลสัตว์เลี้ยงไม่สำเร็จ"));
        return res.json() as Promise<DogProfileApiResponse>;
      })
      .then((profile) => {
        if (cancelled) return;
        setData(profile);
      })
      .catch((e) => {
        if (cancelled) return;
        console.error("getDogProfile failed:", e);
        setError(e instanceof Error ? e.message : "โหลดข้อมูลสัตว์เลี้ยงไม่สำเร็จ กรุณาลองใหม่ภายหลัง");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authorizedApi, dogId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        กำลังโหลด...
      </div>
    );
  }

  if (error || !dogId) {
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
      dogId={dogId}
      card={card}
      qr={qr}
      petInfo={petInfo}
      profile={data}
      historyItems={historyItems}
      initialVaccineList={initialVaccineList}
      onProfilePictureChange={fetchProfile}
      onProfileRefresh={fetchProfile}
    />
  );
}

