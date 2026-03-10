"use client";

import { useRouter } from "next/navigation";

export default function StepSuccess(props: { refCode: string; onReset: () => void }) {
  const { refCode, onReset } = props;
  const router = useRouter();
  return (
    <>
    <section className="rounded-3xl bg-white/70 ring-1 ring-black/5 shadow-sm p-6 space-y-4 text-center">
      <div className="text-4xl">✅</div>
      <h2 className="text-2xl font-extrabold text-gray-900">ทำรายการสำเร็จ</h2>

      <button
        type="button"
        onClick={onReset}
        className="w-full rounded-2xl bg-[#F0A23A] py-4 text-lg font-extrabold text-white active:scale-[0.99] transition"
      >
        ทำรายการใหม่
      </button>
    </section>
        <button
        type="button"
        onClick={() => router.push("/")}
        className="w-full rounded-2xl bg-black/[0.07] py-4 text-lg font-extrabold text-black active:scale-[0.99] transition"
      >
        กลับหน้าหลัก
      </button>
    </>
  );
}
