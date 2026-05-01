"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { toBackendUrlFromApi } from "@/lib/api/backend";

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const errorAlertRef = useRef<HTMLParagraphElement>(null);

  const mismatchMessage = "รหัสผ่านกับยืนยันรหัสผ่านไม่ตรงกัน";
  const confirmPasswordError =
    confirmPassword.length > 0 && password.trim() !== confirmPassword.trim()
      ? mismatchMessage
      : null;

  // On iPhone the keyboard can push the error off-screen; scroll it into view when mismatch appears
  useEffect(() => {
    if (!confirmPasswordError || !errorAlertRef.current) return;
    const el = errorAlertRef.current;
    const id = requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(id);
  }, [confirmPasswordError]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const emailTrim = email.trim();
    const phoneTrim = phoneNumber.trim();

    if (!firstName.trim() || !lastName.trim() || !emailTrim || !password || !confirmPassword || !phoneTrim) {
      setError("กรุณากรอก ชื่อ นามสกุล อีเมล รหัสผ่าน ยืนยันรหัสผ่าน และเบอร์โทร");
      return;
    }
    if (password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    if (password !== confirmPassword) {
      setError("รหัสผ่านกับยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }
    if (phoneTrim.length < 9 || phoneTrim.length > 20) {
      setError("เบอร์โทรต้อง 9–20 ตัวอักษร");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(toBackendUrlFromApi("/api/auth/register"), {
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
      setError((data.message as string) || (data.error as string) || "ลงทะเบียนไม่สำเร็จ");
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="main min-h-screen w-full bg-gradient-to-br from-amber-50 via-white to-sky-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-center">
        {/* Left: brand / hero */}
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
            About Dog
          </h1>
          <p className="mt-1 text-xs text-black/50">ลงทะเบียนผู้ใช้งานใหม่</p>
        </div>

        {/* Right: register card */}
        <div className="login w-full max-w-md mx-auto">
          <Card className="border-none shadow-[0_18px_45px_rgba(15,23,42,0.14)] bg-white/90 backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-baseline justify-center gap-4">
                <span className="text-lg md:text-xl">ลงทะเบียน</span>
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                กรอกข้อมูลเพื่อสร้างบัญชีผู้ใช้งานใหม่
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit} className="space-y-1">
              <CardContent className="space-y-4 pt-0">
                {(error || confirmPasswordError) && (
                  <p
                    ref={errorAlertRef}
                    role="alert"
                    className="text-xs md:text-sm text-red-600 bg-red-50/90 border border-red-100 rounded-lg px-3 py-2 min-h-[2.5rem] flex items-center"
                  >
                    {confirmPasswordError ?? error}
                  </p>
                )}

                <div className="grid gap-2">
                  <Label
                    htmlFor="firstName"
                    className="text-xs md:text-sm text-stone-700 flex items-center gap-1"
                  >
                    ชื่อ
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="โปรดระบุชื่อ"
                    className="bg-stone-50/80 border-stone-200 focus-visible:ring-amber-400 text-sm"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="grid gap-2">
                  <Label
                    htmlFor="lastName"
                    className="text-xs md:text-sm text-stone-700 flex items-center gap-1"
                  >
                    นามสกุล
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="โปรดระบุนามสกุล"
                    className="bg-stone-50/80 border-stone-200 focus-visible:ring-amber-400 text-sm"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="grid gap-2">
                  <Label
                    htmlFor="phone"
                    className="text-xs md:text-sm text-stone-700 flex items-center gap-1"
                  >
                    เบอร์โทรศัพท์
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="เช่น 0812345678"
                    inputMode="numeric"
                    className="bg-stone-50/80 border-stone-200 focus-visible:ring-amber-400 text-sm"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    minLength={9}
                    maxLength={20}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="grid gap-2">
                  <Label
                    htmlFor="address"
                    className="text-xs md:text-sm text-stone-700"
                  >
                    ที่อยู่
                  </Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="โปรดระบุที่อยู่ (ถ้ามี)"
                    className="bg-stone-50/80 border-stone-200 focus-visible:ring-amber-400 text-sm"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="grid gap-2">
                  <Label
                    htmlFor="email"
                    className="text-xs md:text-sm text-stone-700 flex items-center gap-1"
                  >
                    อีเมล
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ระบุอีเมลที่ใช้งานได้"
                    className="bg-stone-50/80 border-stone-200 focus-visible:ring-amber-400 text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="grid gap-2">
                  <Label
                    htmlFor="password"
                    className="text-xs md:text-sm text-stone-700 flex items-center gap-1"
                  >
                    รหัสผ่าน
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="โปรดระบุรหัสผ่าน (อย่างน้อย 6 ตัว)"
                      className="bg-stone-50/80 border-stone-200 focus-visible:ring-amber-400 text-sm pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={6}
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400 hover:text-stone-600"
                      aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-xs md:text-sm text-stone-700 flex items-center gap-1"
                  >
                    ยืนยันรหัสผ่าน
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="กรอกรหัสผ่านอีกครั้ง"
                      className="bg-stone-50/80 border-stone-200 focus-visible:ring-amber-400 text-sm pr-10"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400 hover:text-stone-600"
                      aria-label={showConfirmPassword ? "ซ่อนยืนยันรหัสผ่าน" : "แสดงยืนยันรหัสผ่าน"}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {confirmPasswordError && (
                    <p role="alert" className="text-sm text-red-600 min-h-[1.25rem]">
                      {confirmPasswordError}
                    </p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex-col gap-4 pt-2 pb-5">
                <Button
                  type="submit"
                  className="w-full mx-auto bg-[#F0A23A] text-white hover:bg-[#e18f26] hover:shadow-[0_18px_40px_rgba(245,158,11,0.65)] transition-all duration-200 text-sm md:text-base"
                  disabled={loading}
                >
                  {loading ? "กำลังลงทะเบียน..." : "ลงทะเบียน"}
                </Button>
                <div className="flex flex-col items-center gap-1 text-xs md:text-sm text-stone-600">
                  <p>มีบัญชีอยู่แล้ว?</p>
                  <Link href="/login">
                    <Button type="button" variant="link" className="px-0 text-amber-600 hover:text-amber-700">
                      เข้าสู่ระบบ
                    </Button>
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
