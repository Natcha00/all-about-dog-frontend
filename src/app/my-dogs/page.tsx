import type { CircleItemProps } from "@/components/ui/circleProfile";
import type { DogApiItem } from "@/lib/dogs/dog.type";
import { getDogs } from "@/app/api/dog/backend";
import MyDogsGrid from "./MyDogsGrid";

function mapDogToCircleItem(dog: DogApiItem): CircleItemProps {
  return {
    id: dog.id,
    image: dog.dogPictureUrl || "/images/landingDog.png",
    name: dog.name,
  };
}

export default async function MyPetsPage() {
  let dogs: CircleItemProps[] = [];
  let errorMessage: string | null = null;
  try {
    const list = await getDogs();
    dogs = list.map(mapDogToCircleItem);
  } catch (e) {
    console.error("getDogs failed:", e);
    errorMessage = "โหลดรายการสัตว์เลี้ยงไม่สำเร็จ กรุณาลองใหม่ภายหลัง";
  }

  return (
    <div className="min-h-screen bg-[#F7F4E8] px-4 py-6 pb-28 max-w-md mx-auto">
      <h1 className="text-center text-2xl font-extrabold text-gray-900 mb-6">
        สัตว์เลี้ยงของฉัน
      </h1>
      {errorMessage && (
        <p className="text-center text-amber-700 bg-amber-100 rounded-lg px-4 py-2 mb-4 text-sm">
          {errorMessage}
        </p>
      )}
      <MyDogsGrid dogs={dogs} />
    </div>
  );
}
