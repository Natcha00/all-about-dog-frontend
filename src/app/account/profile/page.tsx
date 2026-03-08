"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Camera, MapPin } from "lucide-react";
import AppImage from "@/components/ui/AppImage";
import { DEFAULT_AVATAR_IMAGE } from "@/lib/constants";

const ORANGE = "#F2A245";

export type ProfileData = {
  id: number;
  code: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  address: string | null;
  profilePictureUrl: string | null;
  isEmailVerified: boolean;
};

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
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
        email: "",
    });

    useEffect(() => {
        let cancelled = false;
        fetch("/api/account/profile", { credentials: "include" })
            .then((res) => {
                if (!res.ok) throw new Error(res.status === 401 ? "Unauthorized" : `${res.status}`);
                return res.json();
            })
            .then((data: ProfileData) => {
                if (cancelled) return;
                setProfile(data);
                setForm({
                    firstName: data.firstName ?? "",
                    lastName: data.lastName ?? "",
                    phone: data.phoneNumber ?? "",
                    address: data.address ?? "",
                    email: data.email ?? "",
                });
            })
            .catch((e) => {
                if (!cancelled) setError(e instanceof Error ? e.message : "โหลดข้อมูลไม่สำเร็จ");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [avatarError, setAvatarError] = useState<string | null>(null);
    const [uploadedProfilePictureUrl, setUploadedProfilePictureUrl] = useState<string | null>(null);
    const [saveLoading, setSaveLoading] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const avatarSrc = avatarPreview || uploadedProfilePictureUrl || profile?.profilePictureUrl || DEFAULT_AVATAR_IMAGE;

    const onSave = () => {
        setShowConfirm(false);
        setSaveError(null);
        setSaveLoading(true);
        const payload: Record<string, string | null> = {};
        if (form.firstName !== undefined) payload.firstName = form.firstName.trim();
        if (form.lastName !== undefined) payload.lastName = form.lastName.trim();
        if (form.phone !== undefined) payload.phoneNumber = form.phone.trim();
        if (form.address !== undefined) payload.address = form.address.trim() || null;
        fetch("/api/account/profile", {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })
            .then(async (res) => {
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    throw new Error((data as { error?: string }).error || "บันทึกไม่สำเร็จ");
                }
                if (profile) {
                    setProfile({
                        ...profile,
                        firstName: form.firstName.trim(),
                        lastName: form.lastName.trim(),
                        phoneNumber: form.phone.trim() || null,
                        address: form.address.trim() || null,
                    });
                }
                alert("บันทึกแล้ว");
            })
            .catch((e) => {
                setSaveError(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
            })
            .finally(() => {
                setSaveLoading(false);
            });
    };

    async function handleAvatarChange(file: File) {
        const MAX_SIZE = 5 * 1024 * 1024;
        const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        const type = (file.type ?? "").toLowerCase();
        if (!allowed.includes(type)) {
            setAvatarError("รองรับเฉพาะไฟล์รูปภาพ (jpeg, png, webp)");
            return;
        }
        if (file.size > MAX_SIZE) {
            setAvatarError("ขนาดไฟล์ไม่เกิน 5 MB");
            return;
        }
        setAvatarError(null);
        const previewUrl = URL.createObjectURL(file);
        setAvatarPreview(previewUrl);
        setAvatarUploading(true);
        try {
            const form = new FormData();
            form.append("file", file);
            const res = await fetch("/api/account/profile-picture", {
                method: "POST",
                credentials: "include",
                body: form,
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                const msg = (data as { error?: string }).error || (res.status === 401 ? "กรุณาเข้าสู่ระบบใหม่" : "อัปโหลดไม่สำเร็จ");
                setAvatarError(msg);
                return;
            }
            const url = (data as { profilePictureUrl?: string }).profilePictureUrl;
            if (url) {
                URL.revokeObjectURL(previewUrl);
                setUploadedProfilePictureUrl(url);
                setAvatarPreview(null);
                if (profile) setProfile({ ...profile, profilePictureUrl: url });
            }
        } catch (e) {
            setAvatarError(e instanceof Error ? e.message : "อัปโหลดไม่สำเร็จ");
        } finally {
            setAvatarUploading(false);
        }
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-[#F7F4E8] px-4 py-6 pb-28 max-w-md mx-auto flex items-center justify-center">
                <p className="text-black/50">กำลังโหลด...</p>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-[#F7F4E8] px-4 py-6 pb-28 max-w-md mx-auto">
                <div className="flex items-center gap-2 pt-6 px-4">
                    <Link href="/account" className="grid h-10 w-10 place-items-center rounded-full bg-white/70 ring-1 ring-black/10" aria-label="กลับ">
                        <ChevronLeft className="h-5 w-5 text-black/70" />
                    </Link>
                    <h1 className="text-[20px] font-extrabold text-black">แก้ไขข้อมูลส่วนตัว</h1>
                </div>
                <div className="mt-8 mx-4 rounded-2xl bg-white/70 ring-1 ring-red-100 p-5 text-center">
                    <p className="text-red-600">{error}</p>
                    {error === "Unauthorized" && (
                        <Link href="/login">
                            <button type="button" className="mt-3 text-sm font-semibold text-[#F2A245] underline">
                                ไปหน้าเข้าสู่ระบบ
                            </button>
                        </Link>
                    )}
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#F7F4E8] px-4 py-6 pb-28 max-w-md mx-auto">
            <div className="mx-auto w-full max-w-md pt-8 space-y-4">
                <h1 className="text-center text-2xl font-extrabold text-black">แก้ไขข้อมูลส่วนตัว</h1>

                {/* Back */}
                <div className="flex justify-start">
                    <Link
                        href="/account"
                        className="grid h-10 w-10 place-items-center rounded-full bg-white/70 ring-1 ring-black/10 active:scale-95 transition"
                        aria-label="กลับ"
                    >
                        <ChevronLeft className="h-5 w-5 text-black/70" />
                    </Link>
                </div>

                {/* Profile summary */}
                <section className="rounded-3xl bg-white/70 ring-1 ring-black/5 shadow-sm p-5">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="h-24 w-24 rounded-full bg-white ring-1 ring-black/10 overflow-hidden">
                                <AppImage
                                    src={avatarSrc}
                                    alt="avatar preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Change button */}
                            <label
                                className="absolute -right-2 -bottom-2 grid h-10 w-10 place-items-center rounded-full bg-black text-white shadow-sm cursor-pointer active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="เปลี่ยนรูปโปรไฟล์"
                                style={avatarUploading ? { pointerEvents: "none" } : undefined}
                            >
                                {avatarUploading ? (
                                    <span className="text-xs">...</span>
                                ) : (
                                    <Camera className="h-5 w-5" />
                                )}

                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    disabled={avatarUploading}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        setAvatarFile(file);
                                        handleAvatarChange(file);
                                        e.target.value = "";
                                    }}
                                />
                            </label>
                        </div>

                        {avatarError ? (
                            <p className="mt-2 text-xs text-rose-600">{avatarError}</p>
                        ) : null}

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
                    {saveError ? (
                        <p className="text-sm text-rose-600 mb-2 text-center">{saveError}</p>
                    ) : null}
                    <button
                        type="button"
                        className="w-full rounded-2xl py-3.5 text-base font-extrabold text-white active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{ background: ORANGE }}
                        onClick={() => { setSaveError(null); setShowConfirm(true); }}
                        disabled={saveLoading}
                    >
                        {saveLoading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
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
                                    disabled={saveLoading}
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="button"
                                    className="flex-1 rounded-2xl py-3 font-extrabold text-white disabled:opacity-60"
                                    style={{ background: ORANGE }}
                                    onClick={onSave}
                                    disabled={saveLoading}
                                >
                                    {saveLoading ? "กำลังบันทึก..." : "ยืนยัน"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
