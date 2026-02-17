"use client";

export default function StepSuccess(props: { refCode: string; onReset: () => void }) {
  const { refCode, onReset } = props;

  return (
    <section className="rounded-3xl bg-white/70 ring-1 ring-black/5 shadow-sm p-6 space-y-4 text-center">
      <div className="text-4xl">✅</div>
      <h2 className="text-2xl font-extrabold text-gray-900">ทำรายการสำเร็จ</h2>
      <p className="text-sm text-black/50">รายการอ้างอิง</p>
      <div className="mx-auto w-fit rounded-2xl bg-[#F7F4E8] ring-1 ring-black/5 px-4 py-2 font-extrabold">
        {refCode}
      </div>

      <button
        type="button"
        onClick={onReset}
        className="w-full rounded-2xl bg-[#F0A23A] py-4 text-lg font-extrabold text-white active:scale-[0.99] transition"
      >
        ทำรายการใหม่
      </button>
    </section>
  );
}
