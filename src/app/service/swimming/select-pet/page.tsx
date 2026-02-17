"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import PetSelectCard from "@/components/ui/PetSelectCard";
import { writeSelectedPetsToSession } from "@/lib/boarding/selectedPetsSession";

type PetSize = "small" | "large";

type Pet = {
    id: number;
    name: string;
    image: string;
    size: PetSize;
};

const pets: Pet[] = [
    {
        id: 1,
        name: "อังเปา",
        image: "/images/dogSwimmingLanding.jpg",
        size: "large",
    },
    {
        id: 2,
        name: "อัลมอนด์",
        image: "/images/pug-dog-isolated-white-background.jpg",
        size: "large",
    },
    {
        id: 3,
        name: "โลมา",
        image: "/images/smiley-dog-with-alerted-ears-sitting.jpg",
        size: "small",
    },
    {
        id: 4,
        name: "ปลาทอง",
        image: "/images/smiley-dog-with-alerted-ears-sitting.jpg",
        size: "small",
    },
    {
        id: 5,
        name: "อีโต้",
        image: "/images/smiley-dog-with-alerted-ears-sitting.jpg",
        size: "small",
    },
];

export default function SwimmingServicePage() {
    const router = useRouter();
    const [selectedPets, setSelectedPets] = useState<number[]>([]);

    const togglePet = (id: number) => {
        setSelectedPets((prev) =>
            prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
        );
    };

    const goNext = () => {
        // ✅ เอาข้อมูลเต็มของสัตว์ที่เลือก (id,name,image,size)
        // const selected = pets.filter((p) => selectedPets.includes(p.id));

        // ✅ เก็บไว้ให้หน้า calendar อ่านชื่อ/รูป/ไซส์ได้
        // sessionStorage.setItem("selectedPets", JSON.stringify(selected));
        const selected = pets.filter((p) => selectedPets.includes(p.id));
        writeSelectedPetsToSession(selected);

        // ✅ ส่ง URL แค่ id ล้วน (สั้น/ชัวร์)
        const petsParam = selectedPets.join(",");
        router.push(`/service/swimming/calendar?pets=${encodeURIComponent(petsParam)}`);
    };

    return (
        <main className="min-h-screen bg-[#F7F4E8] px-4 py-6 pb-28 max-w-md mx-auto">
            {/* Title */}
            <h1 className="text-3xl font-extrabold text-center text-gray-900">
                จองสระว่ายน้ำ
            </h1>

            {/* Subtitle */}
            <div className="mt-6 text-center">
                <p className="text-xl font-bold text-gray-900">เลือกสัตว์เลี้ยง</p>
                <p className="text-sm text-gray-600 mt-1">
                    (สามารถเลือกสัตว์เลี้ยงได้มากกว่า 1 ตัว)
                </p>
            </div>

            {/* Pet list */}
            <div className="mt-10 grid grid-cols-2 gap-y-10 gap-x-6 place-items-center">
                {pets.map((pet) => (
                    <PetSelectCard
                        key={pet.id}
                        {...pet}
                        selected={selectedPets.includes(pet.id)}
                        onToggle={togglePet}
                    />
                ))}
            </div>

            {/* Bottom CTA */}
            <div className="fixed inset-x-0 bottom-0 z-20 bg-[#F7F4E8]/95 backdrop-blur border-t border-black/5">
                <div className="mx-auto max-w-md px-6 py-4">
                    <button
                        type="button"
                        disabled={selectedPets.length === 0}
                        onClick={goNext}
                        className={`w-full py-4 rounded-2xl text-xl font-bold text-white transition ${selectedPets.length === 0
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-[#F0A23A] hover:bg-[#e99625]"
                            }`}
                    >
                        ต่อไป
                    </button>
                </div>
            </div>
        </main>
    );
}
