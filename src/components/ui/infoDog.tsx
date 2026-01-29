import React from "react";
import {
    PawPrint,
    Dog,
    Ruler,
    Weight,
    CalendarDays,
    Syringe,
    HeartPulse,
    AlertTriangle,
    IdCard,
    Droplets,
    Utensils,
    StickyNote,
    ShieldCheck,
} from "lucide-react";

export interface PetInfoMock {
    name: string;
    gender: "male" | "female";
    breed: string;
    color: string;
    weightKg: number;
    heightCm: number;
    size: "เล็ก" | "กลาง" | "ใหญ่";
    birthDate: string;
    age: number;

    sterilizeHistory: string;
    microchip: "มี" | "ไม่มี" | "-";
    bloodType: string;
    disease: string;
    allergic: string;
    mealsPerDay: number;
    mealTime: string[];
    note: string;
}

interface InfoDogProps {
    currentItem: string;
    petInfoMock: PetInfoMock;
}

function Chip({
    children,
    tone = "neutral",
}: {
    children: React.ReactNode;
    tone?: "neutral" | "danger" | "success";
}) {
    const toneClass =
        tone === "danger"
            ? "bg-red-50 text-red-700 ring-red-100"
            : tone === "success"
                ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                : "bg-gray-50 text-gray-700 ring-gray-100";

    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${toneClass}`}>
            {children}
        </span>
    );
}

function StatCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-gray-50 text-gray-700">
                    {icon}
                </div>
                <div className="min-w-0">
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
                </div>
            </div>
        </div>
    );
}

function Row({
    icon,
    label,
    value,
    valueClassName = "",
}: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
    valueClassName?: string;
}) {
    return (
        <div className="flex items-start justify-between gap-3 py-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="mt-0.5 text-gray-500">{icon}</span>
                <span>{label}</span>
            </div>
            <div className={`text-sm font-medium text-gray-800 text-right ${valueClassName}`}>
                {value}
            </div>
        </div>
    );
}

function Section({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                {/* <p className="text-sm font-semibold text-gray-800">{title}</p> */}
                {subtitle ? <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p> : null}
            </div>
            <div className="px-4 divide-y divide-gray-100">{children}</div>
        </div>
    );
}

export default function InfoDog({ currentItem, petInfoMock }: InfoDogProps) {
    if (currentItem !== "info") return null;

    const genderText = petInfoMock.gender === "male" ? "ผู้" : "เมีย";
    const mealTimeText =
        petInfoMock.mealTime?.length ? petInfoMock.mealTime.join(" • ") : "-";

    const hasAllergy =
        !!petInfoMock.allergic &&
        petInfoMock.allergic.trim() !== "" &&
        petInfoMock.allergic !== "-" &&
        petInfoMock.allergic !== "ไม่มี";

    const microchipTone =
        petInfoMock.microchip === "มี" ? "success" : petInfoMock.microchip === "ไม่มี" ? "danger" : "neutral";

    return (
        <div className="mx-auto w-full max-w-md px-4 pb-8">
            
            {/* Sections */}
            <div className="space-y-3">
                <Section title="ข้อมูลพื้นฐาน" subtitle="รายละเอียดทั่วไปของน้อง">
                    <Row icon={<PawPrint className="h-4 w-4" />} label="ชื่อ" value={petInfoMock.name} />
                    <Row icon={<CalendarDays className="h-4 w-4" />} label="อายุ" value={`${petInfoMock.age} ปี`} />
                    <Row icon={<Weight className="h-4 w-4" />} label="น้ำหนัก" value={`${petInfoMock.weightKg} กก.`} />
                    <Row icon={<Ruler className="h-4 w-4" />} label="ส่วนสูง" value={`${petInfoMock.heightCm} ซม.`} />
                    <Row icon={<Dog className="h-4 w-4" />} label="สายพันธุ์" value={petInfoMock.breed || "-"} />
                    <Row icon={<Droplets className="h-4 w-4" />} label="สี" value={petInfoMock.color || "-"} />
                    <Row icon={<PawPrint className="h-4 w-4" />} label="ขนาด" value={petInfoMock.size} />
                    <Row icon={<CalendarDays className="h-4 w-4" />} label="วันเกิด" value={petInfoMock.birthDate || "-"} />
                </Section>

                <Section title="ข้อมูลสุขภาพและทั่วไป" subtitle="ข้อมูลสำคัญสำหรับการดูแล">
                    <Row
                        icon={<ShieldCheck className="h-4 w-4" />}
                        label="ทำหมัน"
                        value={petInfoMock.sterilizeHistory || "-"}
                    />
                    <Row
                        icon={<IdCard className="h-4 w-4" />}
                        label="ไมโครชิป"
                        value={<Chip tone={microchipTone as any}>{petInfoMock.microchip || "-"}</Chip>}
                    />
                    <Row icon={<Droplets className="h-4 w-4" />} label="กรุ๊ปเลือด" value={petInfoMock.bloodType || "-"} />
                    <Row icon={<HeartPulse className="h-4 w-4" />} label="โรคประจำตัว" value={petInfoMock.disease || "-"} />

                    <Row
                        icon={<AlertTriangle className="h-4 w-4" />}
                        label="สิ่งที่แพ้"
                        value={
                            hasAllergy ? (
                                <Chip tone="danger">{petInfoMock.allergic}</Chip>
                            ) : (
                                <Chip tone="success">ไม่มี</Chip>
                            )
                        }
                    />

                    <Row
                        icon={<Utensils className="h-4 w-4" />}
                        label="อาหาร/วัน"
                        value={`${petInfoMock.mealsPerDay ?? "-"} มื้อ`}
                    />
                    <Row
                        icon={<Syringe className="h-4 w-4" />}
                        label="เวลาให้อาหาร"
                        value={mealTimeText}
                    />
                </Section>

                {/* Note */}
                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                    <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex items-center gap-2">
                        <StickyNote className="h-4 w-4 text-gray-600" />
                        <p className="text-sm font-semibold text-gray-800">หมายเหตุเพิ่มเติม</p>
                    </div>
                    <div className="p-4">
                        <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 text-sm text-gray-700 leading-relaxed">
                            {petInfoMock.note || "-"}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
