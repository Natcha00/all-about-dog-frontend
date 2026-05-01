"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { CalendarDays, ChevronDown, ImagePlus, Syringe, X, Pencil, Trash2 } from "lucide-react";
import { formatDateThai, toDateInputValue } from "@/lib/date/date.utils";
import AppImage from "@/components/ui/AppImage";
import { useAuthorizedApi } from "@/hooks/useAuthorizedApi";

export type VaccineTypeOption = { value: string; label: string };

export interface VaccineRecord {
  id: string;
  date: string; // yyyy-mm-dd
  type: string; // vaccineName from API
  dose: number;
  clinic?: string;
  proofImage?: string; // object url / url
}

interface VaccineTabProps {
  currentItem: string;
  dogId?: string;
  /** Initial list from GET /dog/:id/profile (vaccine.vaccineList); shown until GET /vaccinations returns */
  initialVaccineList?: VaccineRecord[];
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

export default function VaccineTab({ currentItem, dogId, initialVaccineList = [] }: VaccineTabProps) {
  const authorizedApi = useAuthorizedApi();
  const [open, setOpen] = useState(false);

  const [vaccineTypeOptions, setVaccineTypeOptions] = useState<VaccineTypeOption[]>([]);
  const [records, setRecords] = useState<VaccineRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentItem !== "vaccine") return;
    authorizedApi("/api/dog/options/vaccine-types")
      .then((res) => res.ok ? res.json() : [])
      .then((data: VaccineTypeOption[]) => setVaccineTypeOptions(Array.isArray(data) ? data : []))
      .catch(() => setVaccineTypeOptions([]));
  }, [authorizedApi, currentItem]);

  // Backend has no GET /dog/:id/vaccinations; list comes from profile (initialVaccineList) only
  useEffect(() => {
    if (currentItem !== "vaccine" || !dogId) {
      setRecords([]);
      return;
    }
    setRecords(initialVaccineList);
  }, [currentItem, dogId, initialVaccineList]);

  // default type when options first load
  useEffect(() => {
    if (vaccineTypeOptions.length > 0 && !type) setType(vaccineTypeOptions[0].value);
  }, [vaccineTypeOptions]);

  // edit mode
  const [editingId, setEditingId] = useState<string | null>(null);

  // form states
  const [date, setDate] = useState("");
  const [type, setType] = useState<string>(""); // vaccineName
  const [dose, setDose] = useState<string>("");
  const [clinic, setClinic] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofUrl, setProofUrl] = useState<string>(""); // ใช้เก็บรูปเดิมตอน edit

  const proofPreview = useMemo(() => {
    if (proofFile) return URL.createObjectURL(proofFile);
    return proofUrl || "";
  }, [proofFile, proofUrl]);

  const maxDateToday = (() => {
    const t = new Date();
    const y = t.getFullYear();
    const m = String(t.getMonth() + 1).padStart(2, "0");
    const d = String(t.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  })();

  const [errors, setErrors] = useState<{ date?: string; dose?: string; type?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ดูรูปหลักฐานแบบเต็ม
  const [proofViewSrc, setProofViewSrc] = useState<string | null>(null);

  if (currentItem !== "vaccine") return null;

  const resetForm = () => {
    setEditingId(null);
    setDate("");
    setType(vaccineTypeOptions[0]?.value ?? "");
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
    const dateVal = toDateInputValue(r.date) || r.date || "";
    setDate(dateVal > maxDateToday ? maxDateToday : dateVal);
    setType(r.type || (vaccineTypeOptions[0]?.value ?? ""));
    setDose(String(r.dose ?? ""));
    setClinic(r.clinic ?? "");
    setProofFile(null);
    setProofUrl(r.proofImage ?? "");
    setErrors({});
    setOpen(true);
  };

  const onDelete = (id: string) => {
    const ok = window.confirm("ต้องการลบข้อมูลวัคซีนรายการนี้ใช่ไหม?");
    if (!ok) return;
    if (!dogId) {
      setRecords((prev) => prev.filter((x) => x.id !== id));
      if (editingId === id) closeModal();
      return;
    }
    setSaving(true);
    authorizedApi(`/api/dog/${dogId}/vaccinations/${id}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) return res.json().then((e) => Promise.reject(e));
      })
      .then(() => {
        setRecords((prev) => prev.filter((x) => x.id !== id));
        if (editingId === id) closeModal();
      })
      .catch(() => {
        window.alert("ไม่สามารถลบได้ กรุณาลองใหม่");
      })
      .finally(() => setSaving(false));
  };

  const onSave = () => {
    const nextErrors: typeof errors = {};
    if (!date) nextErrors.date = "กรุณาเลือกวันที่ฉีดวัคซีน";
    else if (date > maxDateToday) nextErrors.date = "ไม่สามารถเลือกวันที่ฉีดเกินวันปัจจุบันได้";
    if (!type) nextErrors.type = "กรุณาเลือกประเภทวัคซีน";
    if (!dose || Number(dose) <= 0) nextErrors.dose = "กรุณากรอกจำนวนโดสเป็นตัวเลข";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (editingId) {
      if (!dogId) {
        closeModal();
        return;
      }
      setSaving(true);
      const form = new FormData();
      form.append("vaccinationDate", date);
      form.append("vaccineName", type);
      form.append("dose", String(Number(dose)));
      form.append("clinicName", clinic.trim() || "");
      if (proofFile) {
        form.append("file", proofFile);
      }
      authorizedApi(`/api/dog/${dogId}/vaccinations/${editingId}`, {
        method: "PUT",
        body: form,
      })
        .then((res) => {
          if (!res.ok) return res.json().then((e) => Promise.reject(e));
          return res.json();
        })
        .then((data) => {
          const nextProof =
            proofFile ? URL.createObjectURL(proofFile) : (data?.evidenceImageUrl ?? proofUrl) || undefined;
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
          closeModal();
        })
        .catch(() => {
          setErrors({ type: "ไม่สามารถบันทึกได้ กรุณาลองใหม่" });
        })
        .finally(() => setSaving(false));
      return;
    }

    if (!dogId) {
      closeModal();
      return;
    }

    setSaving(true);

    const form = new FormData();
    form.append("vaccinationDate", date);
    form.append("vaccineName", type);
    form.append("dose", String(Number(dose)));
    form.append("clinicName", clinic.trim() || "");
    if (proofFile) {
      form.append("file", proofFile);
    }

    authorizedApi(`/api/dog/${dogId}/vaccinations`, {
      method: "POST",
      body: form,
    })
      .then((res) => {
        if (!res.ok) return res.json().then((e) => Promise.reject(e));
        return res.json();
      })
      .then((data) => {
        const newRecord: VaccineRecord = {
          id: (data?.id != null ? String(data.id) : crypto.randomUUID()),
          date,
          type,
          dose: Number(dose),
          clinic: clinic.trim() || undefined,
          proofImage: (data?.evidenceImageUrl ?? proofUrl?.trim()) || undefined,
        };
        setRecords((prev) => [newRecord, ...prev]);
        closeModal();
      })
      .catch(() => {
        setErrors({ type: "ไม่สามารถบันทึกได้ กรุณาลองใหม่" });
      })
      .finally(() => setSaving(false));
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 sm:px-6 pb-8 pb-[calc(2rem+env(safe-area-inset-bottom))]">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="min-w-0">
          <p className="text-sm text-gray-500">สมุดวัคซีน</p>
          <p className="text-base sm:text-lg font-semibold text-gray-900 truncate">ประวัติการฉีดวัคซีน</p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          disabled={!dogId || saving}
          className="
            rounded-2xl bg-[#f0a23a] text-white
            px-4 py-3 min-h-[44px] text-sm font-semibold
            shadow-sm hover:opacity-95 active:scale-[0.99] transition touch-manipulation shrink-0
            disabled:opacity-50 disabled:pointer-events-none
          "
        >
          + เพิ่มวัคซีน
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="rounded-3xl bg-white ring-1 ring-gray-100 shadow-sm p-5 sm:p-6 text-center">
            <p className="text-gray-600 text-sm sm:text-base">กำลังโหลด...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="rounded-3xl bg-white ring-1 ring-gray-100 shadow-sm p-5 sm:p-6 text-center">
            <p className="text-gray-600 text-sm sm:text-base">ยังไม่มีข้อมูลวัคซีน</p>
            <p className="text-xs text-gray-500 mt-1">กด “เพิ่มวัคซีน” เพื่อเริ่มบันทึก</p>
          </div>
        ) : (
          records.map((r) => (
            <div key={r.id} className="rounded-3xl bg-white ring-1 ring-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-gradient-to-r from-[#E8F7F6] via-white to-[#E8F7F6] border-b border-gray-100">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="grid h-9 w-9 min-w-[2.25rem] shrink-0 place-items-center rounded-2xl bg-white ring-1 ring-[#BFE7E9]">
                      <Syringe className="w-5 h-5 text-[#f0a23a]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{r.type}</p>
                      <p className="text-xs text-gray-500">วันที่: {formatDateThai(r.date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <Chip tone="neutral">โดส {r.dose}</Chip>

                    {/* actions */}
                    <button
                      type="button"
                      onClick={() => openEdit(r)}
                      className="grid h-9 w-9 min-w-[2.25rem] place-items-center rounded-2xl bg-white ring-1 ring-gray-200 hover:bg-gray-50 active:scale-95 transition touch-manipulation"
                      aria-label="แก้ไข"
                      title="แก้ไข"
                    >
                      <Pencil className="w-4 h-4 text-gray-700" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(r.id)}
                      className="grid h-9 w-9 min-w-[2.25rem] place-items-center rounded-2xl bg-white ring-1 ring-gray-200 hover:bg-red-50 active:scale-95 transition touch-manipulation"
                      aria-label="ลบ"
                      title="ลบ"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="px-4 py-4 sm:px-5 space-y-2">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-gray-500 shrink-0">คลินิก/โรงพยาบาล</span>
                  <span className="font-medium text-gray-900 text-right break-words min-w-0">{r.clinic || "-"}</span>
                </div>

                {r.proofImage ? (
                  <div className="flex items-center justify-between gap-2 text-sm">
                 <span className="text-gray-500 shrink-0">หลักฐานการฉีดวัคซีน</span>

                    <button
                      type="button"
                      className="ml-auto flex items-center gap-1 text-xs font-semibold text-[#F2A245] px-2.5 py-1 rounded-xl bg-[#FFF6EC] hover:bg-[#FFE1BE] active:scale-95 transition cursor-pointer"
                      onClick={() => setProofViewSrc(r.proofImage ?? null)}
                      style={{ display: 'inline-flex' }}
                    >
                      กดเพื่อดูรูปหลักฐาน
                    </button>
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
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/35 backdrop-blur-sm px-0 sm:px-4 pb-0 sm:pb-0"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          onClick={closeModal}
        >
          <div
            className="
              w-full max-w-md max-h-[95dvh] sm:max-h-[90vh]
              rounded-t-3xl sm:rounded-3xl bg-white
              shadow-[0_20px_60px_rgba(0,0,0,0.25)]
              ring-1 ring-gray-100
              overflow-hidden
              flex flex-col
              animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* modal header */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-[#E8F7F6] via-white to-[#E8F7F6] shrink-0">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {editingId ? "แก้ไขข้อมูลวัคซีน" : "เพิ่มข้อมูลวัคซีน"}
                </p>
                <p className="text-xs text-gray-500">กรอกข้อมูลให้ครบตามช่องที่มี *</p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="grid h-10 w-10 min-w-[2.5rem] place-items-center rounded-2xl hover:bg-gray-50 active:scale-95 transition touch-manipulation shrink-0"
                aria-label="ปิด"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {/* form - scrollable on mobile */}
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 min-h-0">
              {/* date */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  วันที่ฉีดวัคซีน<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    max={maxDateToday}
                    onChange={(e) => {
                      const v = e.target.value;
                      setDate(v > maxDateToday ? maxDateToday : v);
                    }}
                    className="
                      w-full rounded-2xl min-h-[48px]
                      border border-gray-200
                      bg-white px-4 py-3 pr-12
                      text-base sm:text-sm outline-none
                      focus:ring-2 focus:ring-[#BFE7E9] focus:border-[#f0a23a]
                      touch-manipulation
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
                    onChange={(e) => setType(e.target.value)}
                    className="
                      w-full appearance-none rounded-2xl min-h-[48px]
                      border border-gray-200
                      bg-white px-4 py-3 pr-12
                      text-base sm:text-sm outline-none
                      focus:ring-2 focus:ring-[#BFE7E9] focus:border-[#f0a23a]
                      touch-manipulation
                    "
                  >
                    <option value="">-- เลือกประเภทวัคซีน --</option>
                    {vaccineTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
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
                    w-full rounded-2xl min-h-[48px]
                    border border-gray-200
                    bg-white px-4 py-3
                    text-base sm:text-sm outline-none
                    focus:ring-2 focus:ring-[#BFE7E9] focus:border-[#f0a23a]
                    touch-manipulation
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
                    w-full rounded-2xl min-h-[48px]
                    border border-gray-200
                    bg-white px-4 py-3
                    text-base sm:text-sm outline-none
                    focus:ring-2 focus:ring-[#BFE7E9] focus:border-[#f0a23a]
                    touch-manipulation
                  "
                />
              </div>

              {/* proof upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  หลักฐานการฉีดวัคซีน
                </label>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                  <div className="text-sm text-gray-600 min-w-0 truncate">
                    {proofFile ? proofFile.name : proofUrl ? "มีรูปแนบอยู่แล้ว" : "แนบรูปหลักฐาน (ถ้ามี)"}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    aria-hidden
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setProofFile(f);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="
                      inline-flex items-center justify-center gap-2
                      rounded-2xl border border-[#F2B680]
                      bg-white px-4 py-2.5 min-h-[44px]
                      text-sm font-semibold text-[#D77F2F]
                      hover:bg-[#FFF6EC] active:scale-[0.99] cursor-pointer
                      transition touch-manipulation shrink-0
                    "
                  >
                    <ImagePlus className="w-5 h-5" />
                    เพิ่มรูป
                  </button>
                </div>

                {proofPreview ? (
                  <div className="mt-3 rounded-2xl bg-gray-50 border border-gray-100 p-3 flex justify-center">
                    <AppImage
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

            {/* actions - sticky on mobile with safe area */}
            <div className="px-4 sm:px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-3 bg-white border-t border-gray-100 shrink-0">
              <button
                type="button"
                onClick={onSave}
                disabled={saving}
                className="
                  w-full rounded-2xl min-h-[48px]
                  bg-[#F2A245] text-white
                  py-3 text-sm font-semibold
                  hover:opacity-95 active:scale-[0.99]
                  transition touch-manipulation
                  disabled:opacity-50 disabled:pointer-events-none
                "
              >
                {saving ? "กำลังบันทึก..." : editingId ? "บันทึกการแก้ไข" : "บันทึก"}
              </button>

              {/* delete in edit mode */}
              {editingId ? (
                <button
                  type="button"
                  onClick={() => onDelete(editingId)}
                  className="
                    w-full rounded-2xl min-h-[48px]
                    border border-red-200
                    bg-red-50 text-red-700
                    py-3 text-sm font-semibold
                    hover:bg-red-100 active:scale-[0.99]
                    transition touch-manipulation
                  "
                >
                  ลบรายการนี้
                </button>
              ) : null}

              <button
                type="button"
                onClick={closeModal}
                className="
                  w-full rounded-2xl min-h-[48px]
                  border-2 border-[#F2A245]
                  bg-white text-[#F2A245]
                  py-3 text-sm font-semibold
                  hover:bg-[#FFF6EC] active:scale-[0.99]
                  transition touch-manipulation
                "
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ดูรูปหลักฐานเต็ม - responsive */}
      {proofViewSrc && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-2 sm:p-4"
          style={{ paddingLeft: "max(0.5rem, env(safe-area-inset-left))", paddingRight: "max(0.5rem, env(safe-area-inset-right))" }}
          onClick={() => setProofViewSrc(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90dvh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <AppImage
              src={proofViewSrc}
              alt="หลักฐานการฉีดวัคซีน"
              className="max-w-full max-h-[80dvh] sm:max-h-[85vh] w-auto object-contain rounded-2xl shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setProofViewSrc(null)}
              className="absolute -top-1 -right-1 sm:top-0 sm:right-0 grid h-12 w-12 sm:h-10 sm:w-10 place-items-center rounded-full bg-white text-gray-800 shadow-lg hover:bg-gray-100 active:scale-95 transition touch-manipulation"
              aria-label="ปิด"
            >
              <X className="w-6 h-6 sm:w-5 sm:h-5" />
            </button>
            <p className="absolute -bottom-0 left-0 right-0 text-center text-white/80 text-xs sm:text-sm py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              คลิกนอกภาพเพื่อปิด
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
