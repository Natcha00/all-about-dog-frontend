"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [testLoginStatus, setTestLoginStatus] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // If already verified (valid session), redirect to home and never show login
  useEffect(() => {
    let cancelled = false;
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (cancelled) return;
        if (res.ok) {
          router.replace("/");
          return;
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
    if (!email.trim() || !password) {
      setError("กรุณาระบุอีเมลและรหัสผ่าน");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        router.replace("/");
        return;
      }
      setError((data.error as string) || data.message || `เกิดข้อผิดพลาด (${res.status})`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  async function handleTestLogin() {
    setTestLoginStatus("กำลังยิง API...");
    try {
      const res = await fetch("/api/auth/test-login", { method: "POST", credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        router.replace("/");
        return;
      }
      setTestLoginStatus(`ผิดพลาด: ${data.error || res.status} - ${JSON.stringify(data.detail || data)}`);
    } catch (e) {
      setTestLoginStatus(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return (
    <div className="main flex flex-col w-full min-h-screen justify-center items-center">
      {checkingAuth ? (
        <p className="text-gray-500">กำลังตรวจสอบ...</p>
      ) : (
        <>
      {/* Logo Section - above-the-fold, use priority for LCP */}
      <div className="Logo flex justify-center w-full mb-8">
        <Image
          src="/images/landingDog.png"
          alt="All About Dog - โลโก้"
          width={150}
          height={150}
          priority
        />
      </div>

      {/* Login Form Section */}
      <div className="login flex flex-col w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="flex flex-col gap-6">
              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              <div className="grid gap-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="ระบุอีเมลที่ลงทะเบียน"
                  className="bg-stone-50 ring-gray-400 ring-1"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">รหัสผ่าน</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="ระบุรหัสผ่าน"
                  className="bg-stone-50 ring-gray-400 ring-1"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div className="text-right">
              <Link
                href="#"
                className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
              >
                ลืมรหัสผ่าน
              </Link>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </Button>
            <p className="text-xs text-gray-500 mt-2">หรือ</p>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleTestLogin}
              disabled={loading}
            >
              Login ทดสอบ (maya.chen@gmail.com / x)
            </Button>
            {testLoginStatus && (
              <pre className="w-full p-3 bg-gray-100 rounded text-sm whitespace-pre-wrap mt-2">
                {testLoginStatus}
              </pre>
            )}
            <div className="flex items-center">
              <p>ยังไม่มีผู้ใช้งาน?</p>
              <Link href="/register">
                <Button type="button" variant="link">
                  ลงทะเบียน
                </Button>
              </Link>
            </div>
          </CardFooter>
        </form>
      </div>
        </>
      )}
    </div>
  );
}
