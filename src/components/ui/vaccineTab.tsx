"use client";

import React, { useMemo, useState } from "react";
import { CalendarDays, ChevronDown, ImagePlus, Syringe, X, Pencil, Trash2 } from "lucide-react";

export type VaccineType =
  | "พิษสุนัขบ้า"
  | "รวม (DHPPi)"
  | "ไข้หัดสุนัข"
  | "พาร์โว"
  | "เลปโต"
  | "บอร์เดเทลลา"
  | "อื่นๆ";

export interface VaccineRecord {
  id: string;
  date: string; // yyyy-mm-dd
  type: VaccineType;
  dose: number;
  clinic?: string;
  proofImage?: string; // object url / url
}

interface VaccineTabProps {
  currentItem: string;
}

function formatThaiDate(iso: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });
}

function Chip({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "danger" | "success";
}) {
  const cls =
    tone === "danger"
      ? "bg-red-50 text-red-700 ring-red-100"
      : tone === "success"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
      : "bg-gray-50 text-gray-700 ring-gray-100";

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ${cls}`}>
      {children}
    </span>
  );
}

export default function VaccineTab({ currentItem }: VaccineTabProps) {
  const [open, setOpen] = useState(false);

  // mock เริ่มต้น (ลบได้)
  const [records, setRecords] = useState<VaccineRecord[]>([
    {
      id: "v1",
      date: "2025-12-20",
      type: "พิษสุนัขบ้า",
      dose: 1,
      clinic: "คลินิก ABC",
    },
  ]);

  // edit mode
  const [editingId, setEditingId] = useState<string | null>(null);

  // form states
  const [date, setDate] = useState("");
  const [type, setType] = useState<VaccineType>("พิษสุนัขบ้า");
  const [dose, setDose] = useState<string>("");
  const [clinic, setClinic] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofUrl, setProofUrl] = useState<string>(""); // ใช้เก็บรูปเดิมตอน edit

  const proofPreview = useMemo(() => {
    if (proofFile) return URL.createObjectURL(proofFile);
    return proofUrl || "";
  }, [proofFile, proofUrl]);

  const [errors, setErrors] = useState<{ date?: string; dose?: string; type?: string }>({});

  if (currentItem !== "vaccine") return null;

  const resetForm = () => {
    setEditingId(null);
    setDate("");
    setType("พิษสุนัขบ้า");
    setDose("");
    setClinic("");
    setProofFile(null);
    setProofUrl("");
    setErrors({});
  };

  const closeModal = () => {
    setOpen(false);
    resetForm();
  };

  const openAdd = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = (r: VaccineRecord) => {
    setEditingId(r.id);
    setDate(r.date);
    setType(r.type);
    setDose(String(r.dose));
    setClinic(r.clinic ?? "");
    setProofFile(null);
    setProofUrl(r.proofImage ?? "");
    setErrors({});
    setOpen(true);
  };

  const onDelete = (id: string) => {
    const ok = window.confirm("ต้องการลบข้อมูลวัคซีนรายการนี้ใช่ไหม?");
    if (!ok) return;
    setRecords((prev) => prev.filter((x) => x.id !== id));
    // ถ้ากำลังแก้ไขรายการนี้อยู่ ให้ปิดโมดัล
    if (editingId === id) closeModal();
  };

  const onSave = () => {
    const nextErrors: typeof errors = {};
    if (!date) nextErrors.date = "กรุณาเลือกวันที่ฉีดวัคซีน";
    if (!type) nextErrors.type = "กรุณาเลือกประเภทวัคซีน";
    if (!dose || Number(dose) <= 0) nextErrors.dose = "กรุณากรอกจำนวนโดสเป็นตัวเลข";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    // ถ้า user เลือกรูปใหม่ -> ใช้ object url, ถ้าไม่เลือก -> ใช้รูปเดิม (proofUrl)
    const nextProof = proofFile ? URL.createObjectURL(proofFile) : proofUrl || undefined;

    if (editingId) {
      // update
      setRecords((prev) =>
        prev.map((x) =>
          x.id === editingId
            ? {
                ...x,
                date,
                type,
                dose: Number(dose),
                clinic: clinic.trim() || undefined,
                proofImage: nextProof,
              }
            : x
        )
      );
    } else {
      // create
      const newItem: VaccineRecord = {
        id: crypto.randomUUID(),
        date,
        type,
        dose: Number(dose),
        clinic: clinic.trim() || undefined,
        proofImage: nextProof,
      };
      setRecords((prev) => [newItem, ...prev]);
    }

    closeModal();
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 pb-8">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm text-gray-500">สมุดวัคซีน</p>
          <p className="text-base font-semibold text-gray-900">ประวัติการฉีดวัคซีน</p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="
            rounded-2xl bg-[#f0a23a] text-white
            px-4 py-2 text-sm font-semibold
            shadow-sm hover:opacity-95 active:scale-[0.99] transition
          "
        >
          + เพิ่มวัคซีน
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {records.length === 0 ? (
          <div className="rounded-3xl bg-white ring-1 ring-gray-100 shadow-sm p-5 text-center">
            <p className="text-gray-600">ยังไม่มีข้อมูลวัคซีน</p>
            <p className="text-xs text-gray-500 mt-1">กด “เพิ่มวัคซีน” เพื่อเริ่มบันทึก</p>
          </div>
        ) : (
          records.map((r) => (
            <div key={r.id} className="rounded-3xl bg-white ring-1 ring-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-gradient-to-r from-[#E8F7F6] via-white to-[#E8F7F6] border-b border-gray-100">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="grid h-9 w-9 place-items-center rounded-2xl bg-white ring-1 ring-[#BFE7E9]">
                      <Syringe className="w-5 h-5 text-[#f0a23a]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{r.type}</p>
                      <p className="text-xs text-gray-500">วันที่: {formatThaiDate(r.date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Chip tone="neutral">โดส {r.dose}</Chip>

                    {/* actions */}
                    <button
                      type="button"
                      onClick={() => openEdit(r)}
                      className="grid h-9 w-9 place-items-center rounded-2xl bg-white ring-1 ring-gray-200 hover:bg-gray-50 transition"
                      aria-label="แก้ไข"
                      title="แก้ไข"
                    >
                      <Pencil className="w-4 h-4 text-gray-700" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(r.id)}
                      className="grid h-9 w-9 place-items-center rounded-2xl bg-white ring-1 ring-gray-200 hover:bg-red-50 transition"
                      aria-label="ลบ"
                      title="ลบ"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="px-4 py-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">คลินิก/โรงพยาบาล</span>
                  <span className="font-medium text-gray-900 text-right">{r.clinic || "-"}</span>
                </div>

                {r.proofImage ? (
                  <div className="pt-2">
                    <p className="text-xs text-gray-500 mb-2">หลักฐานการฉีดวัคซีน</p>
                    <img
                      src={r.proofImage}
                      alt="proof"
                      className="w-full max-h-64 object-contain rounded-2xl ring-1 ring-gray-100 bg-gray-50"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-sm px-4"
          onClick={closeModal}
        >
          <div
            className="
              w-full max-w-md
              rounded-3xl bg-white
              shadow-[0_20px_60px_rgba(0,0,0,0.25)]
              ring-1 ring-gray-100
              overflow-hidden
              animate-in fade-in zoom-in-95
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-[#E8F7F6] via-white to-[#E8F7F6]">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {editingId ? "แก้ไขข้อมูลวัคซีน" : "เพิ่มข้อมูลวัคซีน"}
                </p>
                <p className="text-xs text-gray-500">กรอกข้อมูลให้ครบตามช่องที่มี *</p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="grid h-10 w-10 place-items-center rounded-2xl hover:bg-gray-50 active:scale-95 transition"
                aria-label="ปิด"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {/* form */}
            <div className="p-5 space-y-4">
              {/* date */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  วันที่ฉีดวัคซีน<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="
                      w-full rounded-2xl
                      border border-gray-200
                      bg-white px-4 py-3 pr-12
                      text-sm outline-none
                      focus:ring-2 focus:ring-[#BFE7E9] focus:border-[#f0a23a]
                    "
                  />
                  <CalendarDays className="w-5 h-5 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2" />
                </div>
                {errors.date ? <p className="mt-1 text-xs text-red-600">{errors.date}</p> : null}
              </div>

              {/* type */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  ประเภทวัคซีน<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as VaccineType)}
                    className="
                      w-full appearance-none rounded-2xl
                      border border-gray-200
                      bg-white px-4 py-3 pr-12
                      text-sm outline-none
                      focus:ring-2 focus:ring-[#BFE7E9] focus:border-[#f0a23a]
                    "
                  >
                    <option value="พิษสุนัขบ้า">พิษสุนัขบ้า</option>
                    <option value="รวม (DHPPi)">รวม (DHPPi)</option>
                    <option value="ไข้หัดสุนัข">ไข้หัดสุนัข</option>
                    <option value="พาร์โว">พาร์โว</option>
                    <option value="เลปโต">เลปโต</option>
                    <option value="บอร์เดเทลลา">บอร์เดเทลลา</option>
                    <option value="อื่นๆ">อื่นๆ</option>
                  </select>
                  <ChevronDown className="w-5 h-5 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {errors.type ? <p className="mt-1 text-xs text-red-600">{errors.type}</p> : null}
              </div>

              {/* dose */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  จำนวนโดส<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  placeholder="โปรดระบุเป็นตัวเลข"
                  value={dose}
                  onChange={(e) => setDose(e.target.value)}
                  className="
                    w-full rounded-2xl
                    border border-gray-200
                    bg-white px-4 py-3
                    text-sm outline-none
                    focus:ring-2 focus:ring-[#BFE7E9] focus:border-[#f0a23a]
                  "
                />
                {errors.dose ? <p className="mt-1 text-xs text-red-600">{errors.dose}</p> : null}
              </div>

              {/* clinic */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  คลินิก/โรงพยาบาลที่ฉีด
                </label>
                <input
                  type="text"
                  value={clinic}
                  onChange={(e) => setClinic(e.target.value)}
                  placeholder="เช่น คลินิก ABC"
                  className="
                    w-full rounded-2xl
                    border border-gray-200
                    bg-white px-4 py-3
                    text-sm outline-none
                    focus:ring-2 focus:ring-[#BFE7E9] focus:border-[#f0a23a]
                  "
                />
              </div>

              {/* proof upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  หลักฐานการฉีดวัคซีน
                </label>

                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm text-gray-600">
                    {proofFile ? proofFile.name : proofUrl ? "มีรูปแนบอยู่แล้ว" : "แนบรูปหลักฐาน (ถ้ามี)"}
                  </div>

                  <label
                    className="
                      inline-flex items-center gap-2
                      rounded-2xl border border-[#F2B680]
                      bg-white px-4 py-2
                      text-sm font-semibold text-[#D77F2F]
                      hover:bg-[#FFF6EC] cursor-pointer
                      transition
                    "
                  >
                    <ImagePlus className="w-5 h-5" />
                    เพิ่มรูป
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0] || null;
                        setProofFile(f);
                      }}
                    />
                  </label>
                </div>

                {proofPreview ? (
                  <div className="mt-3 rounded-2xl bg-gray-50 border border-gray-100 p-3 flex justify-center">
                    <img
                      src={proofPreview}
                      alt="preview"
                      className="max-h-56 w-auto object-contain rounded-xl"
                    />
                  </div>
                ) : null}

                {/* remove proof */}
                {(proofUrl || proofFile) ? (
                  <button
                    type="button"
                    onClick={() => {
                      setProofFile(null);
                      setProofUrl("");
                    }}
                    className="mt-2 text-xs font-semibold text-red-600 hover:underline"
                  >
                    ลบรูปหลักฐาน
                  </button>
                ) : null}
              </div>
            </div>

            {/* actions */}
            <div className="px-5 pb-5 space-y-3">
              <button
                type="button"
                onClick={onSave}
                className="
                  w-full rounded-2xl
                  bg-[#F2A245] text-white
                  py-3 text-sm font-semibold
                  hover:opacity-95 active:scale-[0.99]
                  transition
                "
              >
                {editingId ? "บันทึกการแก้ไข" : "บันทึก"}
              </button>

              {/* delete in edit mode */}
              {editingId ? (
                <button
                  type="button"
                  onClick={() => onDelete(editingId)}
                  className="
                    w-full rounded-2xl
                    border border-red-200
                    bg-red-50 text-red-700
                    py-3 text-sm font-semibold
                    hover:bg-red-100 active:scale-[0.99]
                    transition
                  "
                >
                  ลบรายการนี้
                </button>
              ) : null}

              <button
                type="button"
                onClick={closeModal}
                className="
                  w-full rounded-2xl
                  border-2 border-[#F2A245]
                  bg-white text-[#F2A245]
                  py-3 text-sm font-semibold
                  hover:bg-[#FFF6EC] active:scale-[0.99]
                  transition
                "
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
