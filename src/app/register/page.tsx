"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const emailTrim = email.trim();
    const phoneTrim = phoneNumber.trim();

    if (!firstName.trim() || !lastName.trim() || !emailTrim || !password || !phoneTrim) {
      setError("กรุณากรอก ชื่อ นามสกุล อีเมล รหัสผ่าน และเบอร์โทร");
      return;
    }
    if (password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    if (phoneTrim.length < 9 || phoneTrim.length > 20) {
      setError("เบอร์โทรต้อง 9–20 ตัวอักษร");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: emailTrim,
          password,
          phoneNumber: phoneTrim,
          ...(address.trim() ? { address: address.trim() } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok || res.status === 201) {
        router.replace(`/verify-email?email=${encodeURIComponent(emailTrim)}`);
        return;
      }
      setError((data.error as string) || (data.message as string) || "ลงทะเบียนไม่สำเร็จ");
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl">
        <CardContent className="flex flex-col gap-6 pt-6">
          <div className="text-center text-2xl font-semibold">ลงทะเบียนสมาชิก</div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}
            <div className="grid gap-2">
              <Label htmlFor="firstName">ชื่อ</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="โปรดระบุ"
                className="bg-stone-50 ring-gray-400 ring-1"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">นามสกุล</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="โปรดระบุ"
                className="bg-stone-50 ring-gray-400 ring-1"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">เบอร์โทรศัพท์ (9–20 หลัก)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="เช่น 0812345678"
                inputMode="numeric"
                className="bg-stone-50 ring-gray-400 ring-1"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                minLength={9}
                maxLength={20}
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">ที่อยู่ (ไม่บังคับ)</Label>
              <Input
                id="address"
                type="text"
                placeholder="โปรดระบุ"
                className="bg-stone-50 ring-gray-400 ring-1"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={loading}
              />
            </div>
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
              <Label htmlFor="password">รหัสผ่าน (อย่างน้อย 6 ตัว)</Label>
              <Input
                id="password"
                type="password"
                placeholder="โปรดระบุ"
                className="bg-stone-50 ring-gray-400 ring-1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
                disabled={loading}
              />
            </div>
            <CardFooter className="flex-col gap-2 px-0 pt-2 pb-0">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "กำลังลงทะเบียน..." : "ลงทะเบียน"}
              </Button>
              <div className="flex items-center gap-1">
                <p className="text-sm text-black/70">มีบัญชีอยู่แล้ว?</p>
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
    </div>
  );
}
