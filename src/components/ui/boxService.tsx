"use client";

import Link from "next/link";
import { ReactNode, useState } from "react";

export interface ServiceItemProps {
    title: string
    icon: string
    path: string
    type: ServiceType
}

export type ServiceType =
    | "swimming"
    | "boarding"
    | "schedule"
    | "history";

interface ServiceCardsProps {
    items: ServiceItemProps[];
}

export default function ServiceCards({ items }: ServiceCardsProps) {
    return (
        <div className="flex flex-wrap justify-center gap-4">
            {items.map(({ title, icon, path, type }) => (
                <ServiceCard key={title} title={title} icon={icon} path={path} type={type} />
            ))}
        </div>
    )
}




function ServiceCard({ title, icon, path, type }: ServiceItemProps) { //ต่อ 1 object
    const [openService, setOpenService] = useState<ServiceType | null>(null);

    const cardClass =
        "w-full h-full rounded-3xl border-2 border-teal-600 bg-white shadow-sm hover:shadow-md active:scale-[0.99] transition flex flex-col items-center justify-center gap-1 text-center";
    if (type === "schedule" || type === "history") {
        return (
            <>
                <div className="flex items-center justify-center mx-auto w-24 h-24 sm:w-24 sm:h-24">
                    <Link href={path} className={cardClass} aria-label={title}>
                        <img src={icon} alt={title} className="w-1/2 max-w-[48px] h-auto" />
                        <p className="text-xs sm:text-sm font-bold text-teal-600">{title}</p>
                    </Link>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="flex items-center justify-center mx-auto w-24 h-24 sm:w-24 sm:h-24">
                <button
                    type="button"
                    onClick={() => setOpenService(type)}
                    className="w-full h-full
                    rounded-3xl
                    border-2 border-teal-600
                    bg-white
                    shadow-sm
                    hover:shadow-md
                    active:scale-[0.99]
                    transition flex flex-col items-center justify-center gap-1
                    text-center  
                  ">
                    <img src={icon} alt={title} className=" w-1/2 max-w-[48px] h-auto" />
                    <p className="text-xs sm:text-sm font-bold text-teal-600">{title}</p>
                </button>
            </div>

            {openService && (
                <ServiceModal
                    title={title}
                    headerImageSrc="/images/boardingHeader.jpg"  // เปลี่ยนเป็นรูปหัวที่คุณใช้
                    onClose={() => setOpenService(null)}
                    ctaText="จองเลย"
                    onCta={() => {
                        setOpenService(null);
                        // ไปหน้าบริการฝากเลี้ยง
                        window.location.href = path; // หรือใช้ router.push(path) ก็ได้
                    }}
                >
                    {openService === "swimming" && <SwimmingPopup />}
                    {openService === "boarding" && <BoardingPopup />}
                </ServiceModal>
            )}

            {/* </Link> */}
        </>
    )
}

function ServiceModal({
    title,
    headerImageSrc,
    children,
    onClose,
    ctaText,
    onCta,
}: {
    title: string;
    headerImageSrc?: string;
    children: ReactNode;
    onClose: () => void;
    ctaText?: string;
    onCta?: () => void;
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-md bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* X */}
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="ปิด"
                    className="absolute top-3 right-3 z-10 w-9 h-9 rounded-lg border border-black/30 bg-white grid place-items-center hover:bg-gray-50 active:scale-[0.98]"
                >
                    <span className="text-xl leading-none">×</span>
                </button>

                {/* Header image */}
                {headerImageSrc ? (
                    <div className="h-32 w-full bg-gray-100 overflow-hidden">
                        <img
                            src={headerImageSrc}
                            alt={title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.style.display = "none";
                            }}
                        />
                    </div>
                ) : null}

                {/* Scroll content */}
                <div className="max-h-[72vh] overflow-y-auto px-6 pt-4 pb-28">
                    <h2 className="text-2xl font-extrabold text-center mb-4">{title}</h2>
                    {children}
                </div>

                {/* CTA */}
                {ctaText ? (
                    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
                        <button
                            type="button"
                            onClick={onCta}
                            className="w-full rounded-2xl bg-[#F0A23A] hover:bg-[#e9951f] active:scale-[0.99] transition text-white font-extrabold py-4 text-lg"
                        >
                            {ctaText}
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
}



function SwimmingPopup() {
    return (
      <div className="text-[15px] leading-relaxed">
        <p className="mb-2">
          สระว่ายน้ำระบบเกลือ ขนาดมาตรฐาน <b>8 × 3 เมตร</b> <br />
          สามารถลงว่ายได้ทั้ง <b>สุนัขและเจ้าของ</b>
        </p>
  
        <div className="mt-3 space-y-1">
          <div>• เปิดให้บริการ <b>วันอังคาร–วันอาทิตย์</b> (หยุดวันจันทร์)</div>
          <div>• เวลาให้บริการ <b>10:00 – 19:00 น.</b></div>
          <div>• ให้บริการเป็นรอบ รอบละ <b>1 ชั่วโมง</b></div>
          <div>• จำกัดจำนวน <b>ไม่เกิน 5 ตัว/รอบ</b></div>
        </div>
  
        <h3 className="mt-6 text-lg font-extrabold">อัตราค่าบริการ</h3>
        <p className="mt-1">
          ราคาเริ่มต้น <b>450 บาท</b> (ขึ้นอยู่กับน้ำหนัก/ขนาดน้อง)
        </p>
  
        <ul className="mt-3 space-y-3">
          <li className="flex gap-2">
            <span className="mt-1">•</span>
            <div>
              <div className="font-semibold">
                น้ำหนักน้อยกว่า 10 kg
              </div>
              <div>ค่าบริการต่อรอบ: <b className="text-blue-600">450 บาท</b></div>
            </div>
          </li>
  
          <li className="flex gap-2">
            <span className="mt-1">•</span>
            <div>
              <div className="font-semibold">
                น้ำหนัก 10 – 20 kg
              </div>
              <div>ค่าบริการต่อรอบ: <b className="text-sky-600">500 บาท</b></div>
            </div>
          </li>
  
          <li className="flex gap-2">
            <span className="mt-1">•</span>
            <div>
              <div className="font-semibold">
                น้ำหนัก 20 – 30 kg
              </div>
              <div>ค่าบริการต่อรอบ: <b className="text-indigo-600">550 บาท</b></div>
            </div>
          </li>
  
          <li className="flex gap-2">
            <span className="mt-1">•</span>
            <div>
              <div className="font-semibold">
                น้ำหนัก 30 – 40 kg
              </div>
              <div>ค่าบริการต่อรอบ: <b className="text-emerald-600">600 บาท</b></div>
            </div>
          </li>
  
          <li className="flex gap-2">
            <span className="mt-1">•</span>
            <div>
              <div className="font-semibold">
                น้ำหนักมากกว่า 40 kg
              </div>
              <div>ค่าบริการต่อรอบ: <b className="text-amber-600">650 บาท</b></div>
            </div>
          </li>
        </ul>
  
        <div className="mt-5 space-y-1">
          <div>* กรุณาพาน้อง <b>เข้าห้องน้ำก่อนลงสระ</b> ทุกครั้ง</div>
          <div>* เจ้าหน้าที่ดูแลความปลอดภัยตลอดเวลา</div>
        </div>
  
        <h3 className="mt-6 text-lg font-extrabold">ข้อกำหนดการให้บริการ</h3>
        <ol className="mt-2 space-y-2 list-decimal pl-5">
          <li>
            กรุณาจองรอบล่วงหน้า และมา <b>ก่อนเวลา 10 นาที</b> เพื่อเตรียมตัว
          </li>
          <li>
            น้องหมาต้องไม่มีโรคติดต่อ และ <b>ไม่อยู่ช่วงติดสัด</b>
          </li>
          <li>
            ต้องแสดงหลักฐานการฉีดวัคซีน และไม่ดุร้ายจนควบคุมไม่ได้
          </li>
          <li>
            กรณี <b>ผลัดขนหนัก</b> อาจมีค่าทำความสะอาดเพิ่ม <b>200+ บาท</b>
          </li>
        </ol>
      </div>
    );
  }
  


function BoardingPopup() {
    return (
        <div className="text-[15px] leading-relaxed">
            <p className="mb-2">โรงแรมของเรามีห้องพัก <b>3 ประเภท</b></p>

            <ul className="space-y-4">
                <li className="flex gap-2">
                    <span className="mt-1">•</span>
                    <div>
                        <div className="font-semibold">
                            ตึกหมาใหญ่ มี 9 ห้อง (คอกสูง 1.5 ม.)
                        </div>
                        <div>สำหรับหมาไซส์กลาง - ใหญ่ คืนละ: <b>600/ห้อง</b></div>
                        <div>ตัวที่ 2 นอนด้วยกัน ตัวละ: <b>510</b> ต่อคืน</div>
                    </div>
                </li>

                <li className="flex gap-2">
                    <span className="mt-1">•</span>
                    <div>
                        <div className="font-semibold">
                            ตึกหมาเล็ก มี 13 ห้อง (คอกสูง 1 ม.)
                        </div>
                        <div>สำหรับไซส์เล็ก คืนละ: <b>450</b> บาท/ห้อง</div>
                        <div>ตัวที่ 2 นอนด้วยกันตัวละ: <b>380</b> ต่อคืน</div>
                    </div>
                </li>

                <li className="flex gap-2">
                    <span className="mt-1">•</span>
                    <div>
                        <div className="font-semibold">
                            ห้อง VIP มีห้องเดียว ไซส์ 12 ตร.ม.
                        </div>
                        <div>สำหรับน้องที่มาบ้านเดียวกัน นอนบ้านเดียว</div>
                        <div>ตัวแรก <b>1500</b> ตัวต่อไปตัวละ <b>500</b></div>
                    </div>
                </li>
            </ul>

            <div className="mt-5 space-y-1">
                <div>* มี 3 สนามใหญ่ค่ะ ปล่อยวิ่ง 4-5 รอบ/วัน</div>
                <div>* มีกล้องให้ดูตามห้องพักของน้อง</div>
            </div>

            <h3 className="mt-6 text-lg font-extrabold">ข้อกำหนดการให้บริการ</h3>
            <ol className="mt-2 space-y-2 list-decimal pl-5">
                <li>
                    ราคาค่าฝากสุนัขคิดเป็นคืน เจ้าของสามารถ <b>check-in</b> ตั้งแต่ตอน
                    <b> 8.00 น.</b> เป็นต้นไป <b>check-out</b> ไม่เกิน <b>18.00 น.</b>
                    (หลัง 18.00 น. คิดค่ารับฝากชั่วโมงละ <b>50</b> บาท)
                </li>
                <li>
                    ค่าบริการไม่รวมอาหาร รบกวนนำอาหารของน้องมาเอง รวมถึงสายจูงและเบาะนอน
                </li>
                <li>
                    ต้องไม่มีเห็บหมัด ต้องแสดงหลักฐานการฉีดวัคซีน และไม่ดุร้ายจนควบคุมไม่ได้
                </li>
            </ol>
        </div>
    );
}


