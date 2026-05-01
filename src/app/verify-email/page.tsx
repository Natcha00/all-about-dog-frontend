"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toBackendUrlFromApi } from "@/lib/api/backend";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") ?? "";
  const [email, setEmail] = useState(emailFromQuery);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");

  useEffect(() => {
    if (emailFromQuery) setEmail(emailFromQuery);
  }, [emailFromQuery]);

  async function handleSubmit(e: React.FormEvent) {
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
    setLoading(true);
    try {
      const res = await fetch(toBackendUrlFromApi("/api/auth/verify-email"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailTrim, otp: otpTrim }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        router.replace("/login");
        return;
      }
      setError((data.message as string) || (data.error as string) || "ยืนยันอีเมลไม่สำเร็จ");
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    const emailTrim = email.trim();
    if (!emailTrim) {
      setError("กรุณาระบุอีเมลก่อนส่ง OTP อีกครั้ง");
      return;
    }
    setResendStatus("sending");
    setError(null);
    try {
      const res = await fetch(toBackendUrlFromApi("/api/auth/resend-verify-otp"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailTrim }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setResendStatus("ok");
      } else {
        setResendStatus("err");
        setError((data.message as string) || (data.error as string) || "ส่ง OTP อีกครั้งไม่สำเร็จ");
      }
    } catch (e) {
      setResendStatus("err");
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    }
  }

  return (
    <Card className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl">
      <CardContent className="flex flex-col gap-6 pt-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">ยืนยันอีเมล</h1>
          <p className="mt-1 text-sm text-black/60">กรอก OTP 6 หลักที่ส่งไปยังอีเมลของคุณ</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}
          {resendStatus === "ok" && (
            <p className="text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">ส่ง OTP ไปแล้ว กรุณาตรวจสอบอีเมล</p>
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
              disabled={loading}
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
              disabled={loading}
            />
          </div>
          <CardFooter className="flex-col gap-3 px-0 pt-2 pb-0">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "กำลังยืนยัน..." : "ยืนยันอีเมล"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleResend}
              disabled={loading || resendStatus === "sending"}
            >
              {resendStatus === "sending" ? "กำลังส่ง..." : "ส่ง OTP อีกครั้ง"}
            </Button>
            <div className="flex items-center gap-1">
              <p className="text-sm text-black/70">ยืนยันแล้ว?</p>
              <Link href="/login">
                <Button type="button" variant="link" className="p-0 h-auto">
                  เข้าสู่ระบบ
                </Button>
              </Link>
            </div>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Suspense fallback={<p className="text-black/50">กำลังโหลด...</p>}>
        <VerifyEmailForm />
      </Suspense>
    </div>
  );
}
