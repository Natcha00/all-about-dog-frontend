"use client";

import React, { useRef, useState } from "react";
import { DefaultCardProfileDog } from "@/components/ui/profileDogTab";
import QrCode from "@/components/ui/qrCode";
import BtnContainerHeath, { TabItem } from "@/components/ui/btnContainerHeath";
import InfoDog, { PetInfoMock } from "@/components/ui/infoDog";
import VaccineTab, { type VaccineRecord } from "@/components/ui/vaccineTab";
import HistoryTab, { ServiceHistoryItem } from "@/components/ui/historyTab";
import type { DogNameWithGender } from "@/components/ui/profileDogTab";
import type { QrCodeProps } from "@/components/ui/qrCode";

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
  historyItems?: ServiceHistoryItem[];
  initialVaccineList?: VaccineRecord[];
  onProfilePictureChange?: () => void;
}

export default function DogProfileClient({
  dogId,
  card,
  qr,
  petInfo,
  historyItems = [],
  initialVaccineList = [],
  onProfilePictureChange,
}: DogProfileClientProps) {
  const [currentItem, setCurrentItem] = useState<string>("info");
  const [pictureUploading, setPictureUploading] = useState(false);
  const [pictureError, setPictureError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const res = await fetch(`/api/dog/${encodeURIComponent(dogId)}/profile-picture`, {
        method: "PUT",
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? body.error ?? `${res.status} ${res.statusText}`);
      }
      onProfilePictureChange?.();
    } catch (err) {
      setPictureError(err instanceof Error ? err.message : "อัปโหลดรูปไม่สำเร็จ");
    } finally {
      setPictureUploading(false);
    }
  };

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
      <div className="text-center text-2xl font-semibold m-4 text-gray-700">
        สัตว์เลี้ยงของฉัน
      </div>

      <DefaultCardProfileDog
        name={card.name}
        gender={card.gender}
        img={card.img}
        age={card.age}
        allergic={card.allergic}
        onEditPictureClick={dogId ? handleEditPictureClick : undefined}
      />

      {pictureUploading && (
        <p className="text-center text-sm text-gray-500">กำลังอัปโหลดรูป...</p>
      )}
      {pictureError && (
        <p className="text-center text-sm text-amber-700 bg-amber-100 rounded-lg px-3 py-2">
          {pictureError}
        </p>
      )}

      <QrCode iconSrc={qr.iconSrc} qrSrc={qr.qrSrc} label={qr.label} />

      <BtnContainerHeath
        data={tabs}
        currentItem={currentItem}
        setCurrentItem={setCurrentItem}
      />

      <InfoDog currentItem={currentItem} petInfoMock={petInfo} />
      <VaccineTab currentItem={currentItem} dogId={dogId} initialVaccineList={initialVaccineList} />
      <HistoryTab currentItem={currentItem} items={historyItems} />
    </div>
  );
}
