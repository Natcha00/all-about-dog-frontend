import { getDogProfile } from "@/app/api/dog/backend";
import {
  mapProfileToCardProps,
  mapProfileToQrProps,
  mapProfileToPetInfoMock,
  mapProfileToHistoryItems,
  mapProfileToVaccineRecords,
} from "@/lib/dogs/dogProfile.mapper";
import DogProfileClient from "./DogProfileClient";

type PageProps = { params: Promise<{ id: string }> };

export default async function DogProfilePage({ params }: PageProps) {
  const { id } = await params;
  const data = await getDogProfile(id);

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
    />
  );
}
