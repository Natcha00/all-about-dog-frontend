"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

type Step = "verify-otp" | "set-password";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") ?? "";
  const [step, setStep] = useState<Step>("verify-otp");
  const [email, setEmail] = useState(emailFromQuery);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (emailFromQuery) setEmail(emailFromQuery);
  }, [emailFromQuery]);

  function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const emailTrim = email.trim();
    const otpTrim = otp.trim();
    if (!emailTrim || !otpTrim) {
      setError("กรุณาระบุอีเมลและ OTP");
      return;
    }
    if (!/^\d{6}$/.test(otpTrim)) {
      setError("OTP ต้องเป็นตัวเลข 6 หลัก");
      return;
    }
    setStep("set-password");
  }

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const emailTrim = email.trim();
    const otpTrim = otp.trim();
    if (!newPassword || newPassword.length < 6) {
      setError("รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("รหัสผ่านใหม่กับยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailTrim, otp: otpTrim, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        router.replace("/login");
        return;
      }
      setError((data.error as string) || (data.message as string) || "ตั้งรหัสผ่านใหม่ไม่สำเร็จ");
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  if (step === "verify-otp") {
    return (
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl">
        <CardContent className="flex flex-col gap-6 pt-6">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">ยืนยัน OTP</h1>
            <p className="mt-1 text-sm text-black/60">
              กรอกอีเมลและ OTP 6 หลักที่ส่งไปให้คุณ ก่อนตั้งรหัสผ่านใหม่
            </p>
          </div>

          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">อีเมล</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                className="bg-stone-50 ring-gray-400 ring-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="otp">OTP (6 หลัก)</Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                placeholder="000000"
                maxLength={6}
                className="bg-stone-50 ring-gray-400 ring-1 font-mono text-lg tracking-widest"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
              />
            </div>
            <CardFooter className="flex-col gap-3 px-0 pt-2 pb-0">
              <Button type="submit" className="w-full">
                ถัดไป — ตั้งรหัสผ่านใหม่
              </Button>
              <Link href="/login">
                <Button type="button" variant="link" className="w-full">
                  กลับไปเข้าสู่ระบบ
                </Button>
              </Link>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl">
      <CardContent className="flex flex-col gap-6 pt-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">ตั้งรหัสผ่านใหม่</h1>
          <p className="mt-1 text-sm text-black/60">กรอกรหัสผ่านใหม่อย่างน้อย 6 ตัว</p>
        </div>

        <form onSubmit={handleSetPassword} className="flex flex-col gap-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}
          <div className="grid gap-2">
            <Label>อีเมล</Label>
            <Input
              type="email"
              className="bg-stone-100 ring-gray-300 ring-1 text-black/70"
              value={email}
              readOnly
              disabled
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="newPassword">รหัสผ่านใหม่</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="อย่างน้อย 6 ตัว"
              className="bg-stone-50 ring-gray-400 ring-1"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              required
              disabled={loading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">ยืนยันรหัสผ่านใหม่</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              className="bg-stone-50 ring-gray-400 ring-1"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              required
              disabled={loading}
            />
          </div>
          <CardFooter className="flex-col gap-3 px-0 pt-2 pb-0">
            <Button type="button" variant="outline" className="w-full" onClick={() => setStep("verify-otp")}>
              ย้อนกลับ
            </Button>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "กำลังตั้งรหัสผ่าน..." : "ตั้งรหัสผ่านใหม่"}
            </Button>
            <Link href="/login">
              <Button type="button" variant="link" className="w-full">
                กลับไปเข้าสู่ระบบ
              </Button>
            </Link>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Suspense fallback={<p className="text-black/50">กำลังโหลด...</p>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
