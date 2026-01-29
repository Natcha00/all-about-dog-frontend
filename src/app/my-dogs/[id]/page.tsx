"use client";

import React, { useMemo, useState } from "react";
import { useParams } from "next/navigation";

import {
  DefaultCardProfileDog,
  DogNameWithGender,
} from "@/components/ui/profileDogTab";
import QrCode, { QrCodeProps } from "@/components/ui/qrCode";
import BtnContainerHeath, { TabItem } from "@/components/ui/btnContainerHeath";
import InfoDog, { PetInfoMock } from "@/components/ui/infoDog";
import VaccineTab from "@/components/ui/vaccineTab";
import HistoryTab, { ServiceHistoryItem } from "@/components/ui/historyTab";

/* ---------------- mock data (ชั่วคราว) ---------------- */

// ✅ ใช้ Record ตาม id / id
const dogsMock: Record<string, DogNameWithGender> = {
  "1": {
    name: "Robertnajaaaa ilobveuRobertnajaaaa ilobveu",
    gender: "female",
    img: "/images/dogSwimmingLanding.jpg",
    age: 3,
    allergic: "ถั่วเหลือง",
  },
};

const petInfoMock: PetInfoMock = {
  name: "อัลมอนด์",
  gender: "male",
  breed: "คอร์กี้",
  color: "ขาว-น้ำตาล",
  weightKg: 10,
  heightCm: 30,
  size: "เล็ก",
  birthDate: "13/07/2020",
  age: 3,
  sterilizeHistory: "ไม่เคยทำหมัน",
  microchip: "มี",
  bloodType: "DEA 3",
  disease: "ไม่มี",
  allergic: "ถั่วเหลือง",
  mealsPerDay: 2,
  mealTime: ["เช้า", "เย็น"],
  note: "ชอบเห่า ร่าเริง ชอบวิ่งเล่น",
};

const historyMock: ServiceHistoryItem[] = [
  {
    id: 1,
    serviceType: "ว่ายน้ำ",
    checkIn: "17/03/2023 14:45",
    checkOut: "17/03/2023 16:00",
    refCode: "202320034",
  },
];

/* ---------------- page ---------------- */

const tabs: TabItem[] = [
  { id: "info", label: "ข้อมูลสัตว์" },
  { id: "vaccine", label: "สมุดวัคซีน" },
  { id: "history", label: "ประวัติการใช้" },
];

const qrCode: QrCodeProps = {
  iconSrc: "/images/qr-code.png",
  qrSrc: "/images/qr-code.png",
};

export default function DogProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [currentItem, setCurrentItem] = useState<string>("info");

  // 🔥 อนาคตเปลี่ยนตรงนี้เป็น fetch(`/api/dogs/${id}`)
  const dog = useMemo(() => {
    return dogsMock[id];
  }, [id]);

  if (!dog) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        ไม่พบข้อมูลสัตว์เลี้ยง
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 min-h-screen overflow-y-auto">
      <div className="text-center text-2xl font-semibold m-4 text-gray-700">
        สัตว์เลี้ยงของฉัน
      </div>

      <DefaultCardProfileDog
        name={dog.name}
        gender={dog.gender}
        img={dog.img}
        age={dog.age}
        allergic={dog.allergic}
      />

      <QrCode iconSrc={qrCode.iconSrc} qrSrc={qrCode.qrSrc} />

      <BtnContainerHeath
        data={tabs}
        currentItem={currentItem}
        setCurrentItem={setCurrentItem}
      />

      <InfoDog currentItem={currentItem} petInfoMock={petInfoMock} />
      <VaccineTab currentItem={currentItem} />
      <HistoryTab currentItem={currentItem} items={historyMock} />
    </div>
  );
}
