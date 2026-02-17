"use client";

import React, { useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/* =======================
   Small UI helpers (Poikai)
======================= */

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-semibold text-black/80 mb-1.5">{children}</p>;
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-black/50 mt-1">{children}</p>;
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-rose-600 mt-1">{children}</p>;
}

/* ✅ IMPORTANT:
   Declare as a top-level component (NOT inside page)
   so input won't lose focus and "type only 1 char" bug won't happen.
*/
function PasswordInput({
  label,
  value,
  onChange,
  placeholder = "ระบุรหัสผ่าน",
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <Label>{label}</Label>

      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={[
            "h-12 w-full rounded-2xl border bg-white px-4 pr-12 text-sm outline-none",
            "border-black/15 focus:border-[#F2A245] focus:ring-2 focus:ring-[#F2A245]/25",
            error ? "border-rose-500 focus:border-rose-500 focus:ring-rose-100" : "",
          ].join(" ")}
          autoComplete="off"
        />

        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-black/[0.04] text-black/50 active:scale-95 transition"
          aria-label={show ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {error ? <ErrorText>{error}</ErrorText> : null}
    </div>
  );
}

function ConfirmModal({
  open,
  title,
  desc,
  onClose,
  onConfirm,
  confirmText = "ยืนยัน",
  cancelText = "ยกเลิก",
}: {
  open: boolean;
  title: string;
  desc?: string;
  onClose: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-white ring-1 ring-black/10 shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-black/5 bg-white/70">
          <p className="text-base font-extrabold text-black/90">{title}</p>
          {desc ? <p className="mt-1 text-sm text-black/55">{desc}</p> : null}
        </div>

        <div className="px-5 py-4">
          <div className="flex gap-3">
            <button
              type="button"
              className="flex-1 rounded-2xl bg-black/[0.06] py-3 font-extrabold text-black/70 active:scale-[0.99] transition"
              onClick={onClose}
            >
              {cancelText}
            </button>

            <button
              type="button"
              className="flex-1 rounded-2xl bg-[#F2A245] py-3 font-extrabold text-white active:scale-[0.99] transition"
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =======================
   Page
======================= */

export default function ChangePasswordPage() {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [openConfirm, setOpenConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const errors = useMemo(() => {
    const e: { old?: string; next?: string; confirm?: string } = {};

    if (oldPass.length > 0 && oldPass.length < 4) {
      e.old = "รหัสผ่านเดิมดูสั้นผิดปกติ";
    }

    if (newPass.length > 0 && newPass.length < 8) {
      e.next = "รหัสผ่านใหม่ต้องอย่างน้อย 8 ตัวอักษร";
    }

    if (confirmPass.length > 0 && newPass !== confirmPass) {
      e.confirm = "รหัสผ่านใหม่และการยืนยันไม่ตรงกัน";
    }

    return e;
  }, [oldPass, newPass, confirmPass]);

  const canSubmit =
    !!oldPass &&
    !!newPass &&
    !!confirmPass &&
    !errors.old &&
    !errors.next &&
    !errors.confirm &&
    newPass.length >= 8 &&
    newPass === confirmPass;

  const doSubmit = async () => {
    setOpenConfirm(false);
    setSaving(true);
    try {
      // TODO: replace with real API call
      // await fetch("/api/account/change-password", { method: "POST", ... })

      await new Promise((r) => setTimeout(r, 500)); // mock
      alert("เปลี่ยนรหัสผ่านสำเร็จ (mock)");

      // clear
      setOldPass("");
      setNewPass("");
      setConfirmPass("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F4E8] px-4 py-6 pb-28 max-w-md mx-auto">
      <div className="mx-auto w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-black">รหัสผ่าน</h1>
          <p className="mt-1 text-sm text-black/55">ตั้งค่ารหัสผ่านใหม่เพื่อความปลอดภัย</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-white/75 ring-1 ring-black/5 shadow-sm p-5 space-y-4">
          <PasswordInput
            label="รหัสผ่านเดิม"
            value={oldPass}
            onChange={setOldPass}
            placeholder="กรอกรหัสผ่านเดิม"
            error={errors.old}
          />

          <PasswordInput
            label="รหัสผ่านใหม่"
            value={newPass}
            onChange={setNewPass}
            placeholder="อย่างน้อย 8 ตัวอักษร"
            error={errors.next}
          />
          {!errors.next ? <Hint>แนะนำให้ใช้ตัวพิมพ์ใหญ่/เล็ก + ตัวเลข เพื่อความปลอดภัย</Hint> : null}

          <PasswordInput
            label="ยืนยันรหัสผ่านใหม่"
            value={confirmPass}
            onChange={setConfirmPass}
            placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
            error={errors.confirm}
          />
        </div>

        {/* CTA */}
        <button
          type="button"
          disabled={!canSubmit || saving}
          onClick={() => setOpenConfirm(true)}
          className={[
            "w-full rounded-2xl py-4 text-lg font-extrabold text-white transition",
            canSubmit && !saving
              ? "bg-[#F2A245] active:scale-[0.99]"
              : "bg-gray-300 cursor-not-allowed",
          ].join(" ")}
        >
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </button>

        <p className="text-center text-xs text-black/45">
          * หากลืมรหัสผ่าน กรุณาออกจากระบบแล้วใช้ “ลืมรหัสผ่าน” (เมื่อทำจริงเชื่อม backend)
        </p>
      </div>

      {/* Confirm Popup */}
      <ConfirmModal
        open={openConfirm}
        title="ยืนยันการเปลี่ยนรหัสผ่าน"
        desc="ต้องการเปลี่ยนรหัสผ่านเป็นรหัสใหม่ใช่หรือไม่?"
        onClose={() => setOpenConfirm(false)}
        onConfirm={doSubmit}
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
      />
    </main>
  );
}
