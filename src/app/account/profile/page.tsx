"use client";

import React, { useState } from "react";
import { Camera, Mail, Phone, MapPin } from "lucide-react";

const ORANGE = "#F2A245";

function Label({ children }: { children: React.ReactNode }) {
    return <p className="text-sm font-semibold text-black/80 mb-1.5">{children}</p>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
    const { error, className, ...rest } = props;
    return (
        <div className="space-y-1">
            <input
                {...rest}
                className={[
                    "h-11 w-full rounded-2xl border bg-white px-4 text-sm outline-none",
                    "border-black/10 focus:border-black/20 focus:ring-2 focus:ring-[#BFE7E9]",
                    error ? "border-rose-500 focus:ring-rose-100" : "",
                    className || "",
                ].join(" ")}
            />
            {error ? <p className="text-xs text-rose-600">{error}</p> : null}
        </div>
    );
}

export default function ProfilePage() {
    const [showConfirm, setShowConfirm] = useState(false);

    // mock
    const [form, setForm] = useState({
        firstName: "จีรกา",
        lastName: "เลา",
        phone: "0817172354",
        address: "71/200 Life Ladphrao 18 แขวงจอมพล เขตจตุจักร กรุงเทพมหานคร 10910",
        email: "jirapalao@gmail.com",
    });

    const onSave = () => {
        setShowConfirm(false);
        // TODO: call API save
        alert("บันทึกแล้ว (mock)");
    };
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    return (
        <main className="min-h-screen bg-[#F7F4E8] px-4 py-6 pb-28 max-w-md mx-auto">
            <div className="mx-auto w-full max-w-md pt-8 space-y-4">
                <h1 className="text-center text-2xl font-extrabold text-black">แก้ไขข้อมูลส่วนตัว</h1>

                {/* Profile summary */}
                <section className="rounded-3xl bg-white/70 ring-1 ring-black/5 shadow-sm p-5">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="h-24 w-24 rounded-full bg-white ring-1 ring-black/10 overflow-hidden">
                                {avatarPreview ? (
                                    <img
                                        src={avatarPreview}
                                        alt="avatar preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="grid h-full w-full place-items-center text-black/40 text-sm">
                                        avatar
                                    </div>
                                )}
                            </div>

                            {/* Change button */}
                            <label
                                className="absolute -right-2 -bottom-2 grid h-10 w-10 place-items-center rounded-full bg-black text-white shadow-sm cursor-pointer active:scale-95 transition"
                                aria-label="เปลี่ยนรูปโปรไฟล์"
                            >
                                <Camera className="h-5 w-5" />

                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        setAvatarFile(file);

                                        const previewUrl = URL.createObjectURL(file);
                                        setAvatarPreview(previewUrl);
                                    }}
                                />
                            </label>
                        </div>

                        <div className="min-w-0">
                            <p className="mt-3 text-lg font-extrabold text-black text-center">
                                {form.firstName} {form.lastName}
                            </p>
                        </div>
                    </div>

                </section>

                {/* Form */}
                <section className="rounded-3xl bg-white/70 ring-1 ring-black/5 shadow-sm p-5 space-y-4">
                    <p className="text-sm font-extrabold text-black/80">ข้อมูลหลัก</p>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label>ชื่อ*</Label>
                            <Input
                                value={form.firstName}
                                onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label>นามสกุล*</Label>
                            <Input
                                value={form.lastName}
                                onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div>
                        <Label>เบอร์โทรศัพท์*</Label>
                        <Input
                            inputMode="numeric"
                            value={form.phone}
                            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                        />
                    </div>

                    <div className="pt-2 border-t border-black/5">
                        <p className="text-sm font-extrabold text-black/80 mb-3">ที่อยู่</p>
                        <div className="rounded-2xl border border-black/10 bg-white p-3">
                            <div className="flex items-start gap-2 text-black/70">
                                <MapPin className="h-4 w-4 mt-0.5" />
                                <textarea
                                    className="w-full bg-transparent outline-none text-sm resize-none"
                                    rows={3}
                                    value={form.address}
                                    onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-black/5">
                        <p className="text-sm font-extrabold text-black/80 mb-2">อีเมล</p>
                        <Input value={form.email} disabled className="bg-black/5 text-black/50" />
                    </div>
                </section>
            </div>

            {/* Sticky CTA */}
            <div className="fixed inset-x-0 bottom-0 z-50 bg-[#F7F4E8]/95 backdrop-blur border-t border-black/5">
                <div className="mx-auto max-w-md px-5 py-4">
                    <button
                        type="button"
                        className="w-full rounded-2xl py-3.5 text-base font-extrabold text-white active:scale-[0.99] transition"
                        style={{ background: ORANGE }}
                        onClick={() => setShowConfirm(true)}
                    >
                        บันทึกข้อมูล
                    </button>
                </div>
            </div>

            {/* Confirm modal */}
            {showConfirm && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-sm p-4"
                    onClick={() => setShowConfirm(false)}
                >
                    <div
                        className="w-full max-w-sm rounded-3xl bg-white ring-1 ring-black/10 shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-5 py-4 border-b border-black/5 bg-white/70">
                            <p className="text-base font-extrabold text-black">ยืนยันการบันทึก</p>
                            <p className="mt-1 text-sm text-black/55">ต้องการบันทึกข้อมูลส่วนตัวใช่ไหม</p>
                        </div>

                        <div className="px-5 py-4">
                            <div className="mt-3 flex gap-3">
                                <button
                                    type="button"
                                    className="flex-1 rounded-2xl bg-black/[0.06] py-3 font-extrabold text-black/70"
                                    onClick={() => setShowConfirm(false)}
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="button"
                                    className="flex-1 rounded-2xl py-3 font-extrabold text-white"
                                    style={{ background: ORANGE }}
                                    onClick={onSave}
                                >
                                    ยืนยัน
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
