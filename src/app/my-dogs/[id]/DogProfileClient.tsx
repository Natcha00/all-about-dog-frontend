"use client";

import React, { useState } from "react";
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
}

export default function DogProfileClient({
  dogId,
  card,
  qr,
  petInfo,
  historyItems = [],
  initialVaccineList = [],
}: DogProfileClientProps) {
  const [currentItem, setCurrentItem] = useState<string>("info");

  return (
    <div className="flex flex-col gap-4 min-h-screen overflow-y-auto">
      <div className="text-center text-2xl font-semibold m-4 text-gray-700">
        สัตว์เลี้ยงของฉัน
      </div>

      <DefaultCardProfileDog
        name={card.name}
        gender={card.gender}
        img={card.img}
        age={card.age}
        allergic={card.allergic}
      />

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
