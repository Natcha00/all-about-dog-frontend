"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toBackendUrlFromApi } from "@/lib/api/backend";
import { buildAuthHeaders, clearAuthTokens, getAccessToken, setAuthTokens } from "@/lib/auth/clientToken";

function extractLoginTokens(payload: unknown): { accessToken: string | null; refreshToken: string | null } {
  if (!payload || typeof payload !== "object") {
    return { accessToken: null, refreshToken: null };
  }

  const record = payload as Record<string, unknown>;
  const nested =
    record.data && typeof record.data === "object" ? (record.data as Record<string, unknown>) : null;

  const accessToken =
    (typeof record.accessToken === "string" && record.accessToken) ||
    (typeof nested?.accessToken === "string" && nested.accessToken) ||
    null;
  const refreshToken =
    (typeof record.refreshToken === "string" && record.refreshToken) ||
    (typeof nested?.refreshToken === "string" && nested.refreshToken) ||
    null;

  return { accessToken, refreshToken };
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [verifyEmailHint, setVerifyEmailHint] = useState(false);

  // If already verified (valid session), redirect to home and never show login
  useEffect(() => {
    let cancelled = false;
    async function checkAuth() {
      if (!getAccessToken()) {
        setCheckingAuth(false);
        return;
      }
      try {
        const res = await fetch(toBackendUrlFromApi("/api/auth/me"), {
          credentials: "include",
          headers: buildAuthHeaders(),
        });
        if (cancelled) return;
        if (res.ok) {
          router.replace("/");
          return;
        }
        if (res.status === 401) {
          clearAuthTokens();
        }
      } catch {
        if (!cancelled) setCheckingAuth(false);
        return;
      }
      setCheckingAuth(false);
    }
    checkAuth();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setVerifyEmailHint(false);
    if (!email.trim() || !password) {
      setError("กรุณาระบุอีเมลและรหัสผ่าน");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(toBackendUrlFromApi("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        const { accessToken, refreshToken } = extractLoginTokens(data);
        if (!accessToken) {
          setError("เข้าสู่ระบบสำเร็จแต่ไม่ได้รับ access token จากระบบ");
          return;
        }
        setAuthTokens(accessToken, refreshToken);
        router.replace("/");
        return;
      }
      const errMsg = (data.message as string) || (data.error as string) || `เกิดข้อผิดพลาด (${res.status})`;
      setError(errMsg);
      setVerifyEmailHint(!!errMsg && /ยืนยันอีเมล|verify.*email|email.*verify/i.test(String(errMsg)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="main min-h-screen w-full bg-gradient-to-br from-amber-50 via-white to-sky-50 flex items-center justify-center px-4 py-10">
      {checkingAuth ? (
        <p className="text-gray-500 text-sm">กำลังตรวจสอบ...</p>
      ) : (
        <>
          <div className="w-full max-w-5xl grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-center">
            {/* Left: brand / hero */}
            <div className="flex flex-col items-center mb-8">
            <div className="rounded-3xl bg-white/80 ring-1 ring-black/5 shadow-sm p-3 mb-3">
              <Image
                src="/images/landingDog.png"
                alt="About Dog - โลโก้"
                width={90}
                height={90}
                priority
                className="rounded-2xl"
              />
            </div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
              About Dog
            </h1>
            <p className="mt-1 text-xs text-black/50">
              เข้าสู่ระบบสำหรับผู้ใช้งาน
            </p>
          </div>
            {/* Right: login card */}
            <div className="login w-full max-w-md mx-auto">
              <Card className="border-none shadow-[0_18px_45px_rgba(15,23,42,0.14)] bg-white/90 backdrop-blur-md">
                <CardHeader className="pb-2 ">
                  <CardTitle className="flex items-baseline justify-center gap-4">
                    <span className="text-lg md:text-xl">เข้าสู่ระบบ</span>
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    เข้าสู่ระบบด้วยอีเมลและรหัสผ่านที่ลงทะเบียนไว้
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit} className="space-y-1">
                  <CardContent className="space-y-4 pt-0">
                    {error && (
                      <p className="text-xs md:text-sm text-red-600 bg-red-50/90 border border-red-100 rounded-lg px-3 py-2">
                        {error}
                      </p>
                    )}
                    {verifyEmailHint && email.trim() && (
                      <p className="text-xs md:text-sm text-sky-700 bg-sky-50/90 border border-sky-100 rounded-lg px-3 py-2">
                        <Link
                          href={`/verify-email?email=${encodeURIComponent(
                            email.trim(),
                          )}`}
                          className="underline font-medium"
                        >
                          ไปยืนยันอีเมล
                        </Link>
                      </p>
                    )}
                    <div className="grid gap-2">
                      <Label htmlFor="email" className="text-xs md:text-sm text-stone-700">
                        อีเมล
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="ระบุอีเมลที่ลงทะเบียน"
                        className="bg-stone-50/80 border-stone-200 focus-visible:ring-amber-400 text-sm"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password" className="text-xs md:text-sm text-stone-700">
                        รหัสผ่าน
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="ระบุรหัสผ่าน"
                          className="bg-stone-50/80 border-stone-200 focus-visible:ring-amber-400 text-sm pr-10"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
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
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <Link
                        href="/forgot-password"
                        className="text-xs md:text-sm text-sky-700 hover:text-sky-800 underline-offset-4 hover:underline"
                      >
                        ลืมรหัสผ่าน
                      </Link>
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col gap-4 pt-2 pb-5">
                    <Button
                      type="submit"
                      className="w-full mx-auto bg-[#F0A23A] text-white hover:bg-[#e18f26] hover:shadow-[0_18px_40px_rgba(245,158,11,0.65)] transition-all duration-200 text-sm md:text-base"
                      disabled={loading}
                    >
                      {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                    </Button>
                    <div className="flex flex-col items-center gap-1 text-xs md:text-sm text-stone-600">
                      <p>ยังไม่มีผู้ใช้งาน?</p>
                      <Link href="/register">
                        <Button type="button" variant="link" className="px-0 text-amber-600 hover:text-amber-700">
                          ลงทะเบียน
                        </Button>
                      </Link>
                    </div>
                  </CardFooter>
                </form>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
