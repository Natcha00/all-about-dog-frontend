"use client";

import { CustomerDraft, MOCK_CUSTOMERS } from "@/lib/walkin/walkin/types.mock";
import React, { useMemo, useState } from "react";


export type CustomerMode = "new" | "existing";

type ExistingCustomer = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
};

export default function StepCustomer(props: {
  value: CustomerDraft;
  onChange: React.Dispatch<React.SetStateAction<CustomerDraft>>;
  onCreated: (customerId: string, customerDraft: CustomerDraft) => void;
}) {
  const { value, onChange, onCreated } = props;

  const [mode, setMode] = useState<CustomerMode | null>(null);

  // existing search
  const [searchPhone, setSearchPhone] = useState("");
  const [searchName, setSearchName] = useState("");
  const [selectedExistingId, setSelectedExistingId] = useState<string>("");

  // confirm switch
  const [pendingMode, setPendingMode] = useState<CustomerMode | null>(null);
  const [showSwitchConfirm, setShowSwitchConfirm] = useState(false);

  const existingList: ExistingCustomer[] = useMemo(() => {
    return MOCK_CUSTOMERS.map((c) => ({ ...c }));
  }, []);

  const filteredExisting = useMemo(() => {
    const p = searchPhone.trim();
    const n = searchName.trim().toLowerCase();
    return existingList.filter((c) => {
      const okPhone = !p || c.phone.includes(p);
      const full = `${c.firstName} ${c.lastName}`.toLowerCase();
      const okName = !n || full.includes(n);
      return okPhone && okName;
    });
  }, [existingList, searchPhone, searchName]);

  const selectedExisting = useMemo(() => {
    return filteredExisting.find((c) => c.id === selectedExistingId) || null;
  }, [filteredExisting, selectedExistingId]);

  const canSubmitNew = useMemo(() => {
    return (
      value.firstName.trim().length > 0 &&
      value.lastName.trim().length > 0 &&
      /^\d{10}$/.test(value.phone.trim())
    );
  }, [value.firstName, value.lastName, value.phone]);

  const requestMode = (next: CustomerMode) => {
    if (mode === null) return setMode(next);
    if (mode === next) return;

    const hasNewInput =
      value.firstName.trim() ||
      value.lastName.trim() ||
      value.phone.trim() ||
      value.email.trim() ||
      value.address.trim();

    const hasExistingSelection =
      !!selectedExistingId || !!searchPhone.trim() || !!searchName.trim();

    if ((mode === "new" && hasNewInput) || (mode === "existing" && hasExistingSelection)) {
      setPendingMode(next);
      setShowSwitchConfirm(true);
      return;
    }

    switchMode(next);
  };

  const resetNewDraft = () => {
    onChange(() => ({
      id: undefined,
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      address: "",
    }));
  };

  const resetExisting = () => {
    setSearchPhone("");
    setSearchName("");
    setSelectedExistingId("");
  };

  const switchMode = (next: CustomerMode) => {
    if (mode === "new") resetNewDraft();
    if (mode === "existing") resetExisting();
    setMode(next);
  };

  const createNewCustomer = () => {
    // mock create -> id
    const id = `cus_${Date.now()}`;
    const draft: CustomerDraft = { ...value, id };
    onCreated(id, draft);
  };

  const pickExistingCustomer = () => {
    if (!selectedExisting) return;
    const draft: CustomerDraft = {
      id: selectedExisting.id,
      firstName: selectedExisting.firstName,
      lastName: selectedExisting.lastName,
      phone: selectedExisting.phone,
      email: selectedExisting.email || "",
      address: value.address || "",
    };
    onCreated(selectedExisting.id, draft);
  };

  return (
    <section className="rounded-3xl bg-white/70 ring-1 ring-black/5 shadow-sm p-5 space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900">ลูกค้า</h2>
        <p className="text-sm text-black/50">เลือกก่อนว่าเป็นลูกค้าใหม่หรือเก่า</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => requestMode("new")}
          className={[
            "rounded-2xl py-3 text-sm font-extrabold ring-2 transition active:scale-[0.99]",
            mode === "new"
              ? "bg-[#F7F4E8] ring-[#F0A23A] text-gray-900"
              : "bg-white ring-black/10 text-black/60 hover:bg-black/5",
          ].join(" ")}
        >
          ลูกค้าใหม่
        </button>

        <button
          type="button"
          onClick={() => requestMode("existing")}
          className={[
            "rounded-2xl py-3 text-sm font-extrabold ring-2 transition active:scale-[0.99]",
            mode === "existing"
              ? "bg-[#F7F4E8] ring-[#F0A23A] text-gray-900"
              : "bg-white ring-black/10 text-black/60 hover:bg-black/5",
          ].join(" ")}
        >
          ลูกค้าเก่า
        </button>
      </div>

      {mode === null ? (
        <div className="rounded-2xl bg-black/[0.03] ring-1 ring-black/5 p-4 text-sm text-black/60">
          กรุณาเลือก <b>ลูกค้าใหม่</b> หรือ <b>ลูกค้าเก่า</b> ก่อนเพื่อเริ่มทำรายการ
        </div>
      ) : null}

      {/* NEW */}
      {mode === "new" ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="ชื่อ*"
              value={value.firstName}
              onChange={(v: string) => onChange((p) => ({ ...p, firstName: v }))}
              placeholder="โปรดระบุ"
            />
            <Field
              label="นามสกุล*"
              value={value.lastName}
              onChange={(v: string) => onChange((p) => ({ ...p, lastName: v }))}
              placeholder="โปรดระบุ"
            />
          </div>

          <Field
            label="เบอร์โทรศัพท์*"
            value={value.phone}
            onChange={(v: string) =>
              onChange((p) => ({ ...p, phone: v.replace(/[^\d]/g, "").slice(0, 10) }))
            }
            placeholder="เช่น 089xxxxxxx"
            inputMode="numeric"
          />

          {value.phone && !/^\d{10}$/.test(value.phone) ? (
            <p className="text-xs text-rose-600">เบอร์โทรต้องเป็น 10 หลัก</p>
          ) : null}

          <Field
            label="อีเมล"
            value={value.email}
            onChange={(v: string) => onChange((p) => ({ ...p, email: v }))}
            placeholder="example@email.com"
          />

          <Field
            label="ที่อยู่ปัจจุบัน"
            value={value.address}
            onChange={(v: string) => onChange((p) => ({ ...p, address: v }))}
            placeholder="โปรดระบุ"
          />

          <button
            type="button"
            disabled={!canSubmitNew}
            onClick={createNewCustomer}
            className={[
              "w-full rounded-2xl py-4 text-base font-extrabold text-white transition active:scale-[0.99]",
              canSubmitNew ? "bg-[#F0A23A] hover:bg-[#e99625]" : "bg-gray-300 cursor-not-allowed",
            ].join(" ")}
          >
            ลงทะเบียนลูกค้า → ต่อไป
          </button>

          {!canSubmitNew ? (
            <p className="text-xs text-rose-600 text-center">
              กรุณากรอก ชื่อ + นามสกุล + เบอร์โทร(10 หลัก) ให้ครบ
            </p>
          ) : null}
        </div>
      ) : null}

      {/* EXISTING */}
      {mode === "existing" ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="ค้นหาด้วยเบอร์"
              value={searchPhone}
              onChange={(v: string) => setSearchPhone(v.replace(/[^\d]/g, "").slice(0, 10))}
              placeholder="เช่น 089xxxxxxx"
              inputMode="numeric"
            />
            <Field
              label="ค้นหาด้วยชื่อ"
              value={searchName}
              onChange={(v: string) => setSearchName(v)}
              placeholder="เช่น พิม"
            />
          </div>

          <div className="rounded-2xl ring-1 ring-black/10 bg-white overflow-hidden">
            <div className="px-4 py-3 text-xs font-extrabold text-black/50 bg-black/[0.03]">
              ผลการค้นหา ({filteredExisting.length})
            </div>

            {filteredExisting.length === 0 ? (
              <div className="px-4 py-4 text-sm text-black/60">ไม่พบลูกค้า</div>
            ) : (
              <div className="divide-y divide-black/5">
                {filteredExisting.map((c) => {
                  const active = c.id === selectedExistingId;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedExistingId(c.id)}
                      className={[
                        "w-full px-4 py-4 text-left transition",
                        active ? "bg-[#F7F4E8]" : "bg-white hover:bg-black/[0.03]",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-extrabold text-gray-900 truncate">
                            {c.firstName} {c.lastName}
                          </p>
                          <p className="text-xs text-black/50">{c.phone}</p>
                        </div>
                        {active ? (
                          <span className="shrink-0 rounded-full bg-[#F0A23A] text-white text-xs font-extrabold px-3 py-1">
                            เลือกแล้ว
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={!selectedExisting}
            onClick={pickExistingCustomer}
            className={[
              "w-full rounded-2xl py-4 text-base font-extrabold text-white transition active:scale-[0.99]",
              selectedExisting ? "bg-[#F0A23A] hover:bg-[#e99625]" : "bg-gray-300 cursor-not-allowed",
            ].join(" ")}
          >
            เลือกลูกค้า → ต่อไป
          </button>

          {!selectedExisting ? (
            <p className="text-xs text-rose-600 text-center">กรุณาเลือกลูกค้าจากรายการก่อน</p>
          ) : null}
        </div>
      ) : null}

      {showSwitchConfirm ? (
        <Modal
          title="สลับโหมดลูกค้า?"
          desc="การสลับโหมดจะล้างข้อมูลที่กรอก/เลือกไว้"
          onClose={() => {
            setShowSwitchConfirm(false);
            setPendingMode(null);
          }}
          onConfirm={() => {
            const next = pendingMode;
            setShowSwitchConfirm(false);
            setPendingMode(null);
            if (next) switchMode(next);
          }}
        />
      ) : null}
    </section>
  );
}

/* ========== UI helpers ========== */

function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  const { label, value, onChange, placeholder, inputMode } = props;
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-semibold text-gray-900">{label}</p>
      <input
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className="appearance-none appearance-none h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[#BFE7E9] focus:border-[#399199]"
      />
    </div>
  );
}

function Modal(props: { title: string; desc: string; onClose: () => void; onConfirm: () => void }) {
  const { title, desc, onClose, onConfirm } = props;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-3xl bg-white ring-1 ring-black/10 shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden"
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-black/5 bg-white/70">
          <p className="text-base font-extrabold text-gray-900">{title}</p>
          <p className="mt-1 text-sm text-black/55">{desc}</p>
        </div>

        <div className="px-5 py-4">
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              className="flex-1 rounded-2xl bg-black/[0.06] py-3 font-extrabold text-black/70 active:scale-[0.99] transition"
              onClick={onClose}
            >
              ยกเลิก
            </button>

            <button
              type="button"
              className="flex-1 rounded-2xl bg-[#F0A23A] py-3 font-extrabold text-white active:scale-[0.99] transition"
              onClick={onConfirm}
            >
              สลับโหมด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
