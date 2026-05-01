"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toBackendUrlFromApi } from "@/lib/api/backend";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const emailTrim = email.trim();
    if (!emailTrim) {
      setError("กรุณาระบุอีเมล");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(toBackendUrlFromApi("/api/auth/forgot-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailTrim }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSent(true);
        router.replace(`/reset-password?email=${encodeURIComponent(emailTrim)}`);
        return;
      }
      setError((data.message as string) || (data.error as string) || "ขอ OTP ไม่สำเร็จ");
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl">
          <CardContent className="pt-6 pb-6">
            <p className="text-center text-green-600">ส่ง OTP ไปที่อีเมลแล้ว กำลังนำคุณไปหน้าตั้งรหัสผ่าน...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl">
        <CardContent className="flex flex-col gap-6 pt-6">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">ลืมรหัสผ่าน</h1>
            <p className="mt-1 text-sm text-black/60">กรอกอีเมล เราจะส่ง OTP ให้คุณ</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                disabled={loading}
              />
            </div>
            <CardFooter className="flex-col gap-3 px-0 pt-2 pb-0">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "กำลังส่ง OTP..." : "ส่ง OTP"}
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
    </div>
  );
}
