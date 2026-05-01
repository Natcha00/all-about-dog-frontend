"use client";

import React, { useEffect, useRef, useState } from "react";
import { DefaultCardProfileDog } from "@/components/ui/profileDogTab";
import QrCode from "@/components/ui/qrCode";
import BtnContainerHeath, { TabItem } from "@/components/ui/btnContainerHeath";
import InfoDog, { PetInfoMock } from "@/components/ui/infoDog";
import VaccineTab, { type VaccineRecord } from "@/components/ui/vaccineTab";
import HistoryTab, { ServiceHistoryItem } from "@/components/ui/historyTab";
import type { DogNameWithGender } from "@/components/ui/profileDogTab";
import type { QrCodeProps } from "@/components/ui/qrCode";
import type { DogProfileApiResponse } from "@/lib/dogs/dog.type";
import EditDogSheet from "./EditDogSheet";
import { Pencil } from "lucide-react";
import { useAuthorizedApi } from "@/hooks/useAuthorizedApi";

const tabs: TabItem[] = [
  { id: "info", label: "ข้อมูลสัตว์" },
  { id: "vaccine", label: "สมุดวัคซีน" },
  { id: "history", label: "ประวัติการใช้" },
];

export interface DogProfileClientProps {
  dogId?: string;
  card: DogNameWithGender;
  qr: QrCodeProps;
  petInfo: PetInfoMock;
  /** ข้อมูลโปรไฟล์เต็ม สำหรับฟอร์มแก้ไข */
  profile?: DogProfileApiResponse | null;
  historyItems?: ServiceHistoryItem[];
  initialVaccineList?: VaccineRecord[];
  onProfilePictureChange?: () => void;
  /** เรียกหลังแก้ไขข้อมูลสำเร็จ (refetch profile) */
  onProfileRefresh?: () => void;
}

export default function DogProfileClient({
  dogId,
  card,
  qr,
  petInfo,
  profile = null,
  historyItems = [],
  initialVaccineList = [],
  onProfilePictureChange,
  onProfileRefresh,
}: DogProfileClientProps) {
  const authorizedApi = useAuthorizedApi();
  const [currentItem, setCurrentItem] = useState<string>("info");
  const [pictureUploading, setPictureUploading] = useState(false);
  const [pictureError, setPictureError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyItemsState, setHistoryItemsState] = useState<ServiceHistoryItem[]>(historyItems ?? []);

  const handleRefresh = () => {
    onProfilePictureChange?.();
    onProfileRefresh?.();
  };

  const handleEditPictureClick = () => {
    if (!dogId) return;
    setPictureError(null);
    fileInputRef.current?.click();
  };

  const handlePictureFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !dogId) return;

    setPictureUploading(true);
    setPictureError(null);
    const formData = new FormData();
    formData.set("file", file);

    try {
      const res = await authorizedApi(`/api/dog/${encodeURIComponent(dogId)}/profile-picture`, {
        method: "PUT",
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? body.error ?? body.detail ?? `${res.status} ${res.statusText}`);
      }
      onProfilePictureChange?.();
    } catch (err) {
      setPictureError(err instanceof Error ? err.message : "อัปโหลดรูปไม่สำเร็จ");
    } finally {
      setPictureUploading(false);
    }
  };

  // Fetch reservation histories from dedicated API when user opens history tab
  useEffect(() => {
    if (currentItem !== "history") return;
    if (!dogId) return;
    // ถ้าเคยโหลดแล้วและไม่มี error ไม่ต้องโหลดซ้ำ
    if (historyItemsState.length > 0 && !historyError) return;

    let cancelled = false;
    setHistoryLoading(true);
    setHistoryError(null);

    authorizedApi(`/api/dog/${encodeURIComponent(dogId)}/reservation-histories`)
      .then((res) => {
        if (!res.ok) {
          return res
            .json()
            .then((d) => Promise.reject(new Error(d.message ?? d.error ?? d.detail ?? `${res.status} ${res.statusText}`)));
        }
        return res.json() as Promise<
          Array<{
            offeringType: "boarding" | "swimming";
            code: string;
            startDate?: string;
            endDate?: string;
            date?: string;
            time?: string;
          }>
        >;
      })
      .then((list) => {
        if (cancelled) return;
        const mapped: ServiceHistoryItem[] = (list ?? []).map((it, idx) => {
          const isBoarding = it.offeringType === "boarding";
          const id = it.code || idx;
          if (isBoarding) {
            const start = it.startDate ?? "";
            const end = it.endDate ?? "";
            // แสดงวันที่แบบสั้น ๆ (YYYY-MM-DD) ในช่องเวลาเข้า/ออก
            return {
              id,
              serviceType: "ฝากเลี้ยง",
              refCode: it.code,
              checkIn: start || "-",
              checkOut: end || "-",
              nights:
                start && end
                  ? Math.max(
                      1,
                      Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24))
                    )
                  : 0,
              roomType: undefined,
            };
          }
          const date = it.date ?? "";
          const time = it.time ?? "";
          const label = [date, time].filter(Boolean).join(" ");
          return {
            id,
            serviceType: "ว่ายน้ำ",
            refCode: it.code,
            checkIn: label || "-",
            checkOut: label || "-",
          };
        });
        setHistoryItemsState(mapped);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setHistoryError(e.message || "โหลดประวัติการใช้งานไม่สำเร็จ");
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authorizedApi, currentItem, dogId, historyError, historyItemsState.length]);

  return (
    <div className="flex flex-col gap-4 min-h-screen overflow-y-auto">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-hidden
        onChange={handlePictureFileChange}
      />
      <div className="text-center text-2xl font-semibold m-4 text-gray-700">สัตว์เลี้ยงของฉัน</div>

      <DefaultCardProfileDog
        name={card.name}
        gender={card.gender}
        img={card.img}
        age={card.age}
        allergic={card.allergic}
        onEditPictureClick={dogId ? handleEditPictureClick : undefined}
      />

      {pictureUploading && <p className="text-center text-sm text-gray-500">กำลังอัปโหลดรูป...</p>}
      {pictureError && (
        <p className="text-center text-sm text-amber-700 bg-amber-100 rounded-lg px-3 py-2">{pictureError}</p>
      )}

      {/* <QrCode iconSrc={qr.iconSrc} qrSrc={qr.qrSrc} label={qr.label} /> */}
      <BtnContainerHeath data={tabs} currentItem={currentItem} setCurrentItem={setCurrentItem} />

      {currentItem === "info" && dogId && profile && (
        <div className="mx-auto w-full max-w-md px-4">
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#f0a23a] text-white px-4 py-3 min-h-[44px] sm:min-h-[48px] text-sm sm:text-base font-semibold shadow-sm hover:opacity-95 active:scale-[0.99] transition touch-manipulation shrink-0 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Pencil className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" aria-hidden />
            แก้ไขข้อมูล
          </button>
        </div>
      )}

      <InfoDog currentItem={currentItem} petInfoMock={petInfo} />
      <VaccineTab currentItem={currentItem} dogId={dogId} initialVaccineList={initialVaccineList} />

      {currentItem === "history" && (
        <>
          {historyLoading && <p className="text-center text-sm text-gray-500 mt-2">กำลังโหลดประวัติการใช้งาน...</p>}
          {historyError && (
            <p className="text-center text-sm text-amber-700 bg-amber-100 rounded-lg px-3 py-2 mt-2">{historyError}</p>
          )}
        </>
      )}

      <HistoryTab currentItem={currentItem} items={historyItemsState.length > 0 ? historyItemsState : historyItems} />

      {editOpen && profile && dogId && (
        <EditDogSheet
          dogId={dogId}
          profile={profile}
          onClose={() => setEditOpen(false)}
          onSaved={handleRefresh}
        />
      )}
    </div>
  );
}

