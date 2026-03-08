import Image from "next/image";
import { DEFAULT_AVATAR_IMAGE } from "@/lib/constants";

export default function AccountHeader({
  name = "จิรภา เลา",
  subtitle = "จัดการข้อมูลบัญชีและความปลอดภัย",
  avatarSrc,
}: {
  name?: string;
  subtitle?: string;
  avatarSrc?: string;
}) {
  return (
    <div className="pt-6 text-center">
      <h1 className="text-[28px] font-extrabold tracking-tight text-black">
        บัญชีผู้ใช้
      </h1>

      <div className="mt-5 rounded-3xl bg-white/70 ring-1 ring-black/5 shadow-sm p-5">
        <div className="flex flex-col items-center">
          <div className="relative h-20 w-20 overflow-hidden rounded-full ring-1 ring-black/10 bg-white">
            <Image src={avatarSrc?.trim() || DEFAULT_AVATAR_IMAGE} alt="โปรไฟล์" fill className="object-cover" />
          </div>

          <p className="mt-4 text-[22px] font-extrabold text-black">{name}</p>
          <p className="mt-1 text-[13px] text-black/55">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
