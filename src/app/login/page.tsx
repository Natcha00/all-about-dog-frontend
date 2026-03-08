"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [loginStatus, setLoginStatus] = useState<string | null>(null);

  async function handleTestLogin() {
    setLoginStatus("กำลังยิง API...");
    try {
      const res = await fetch("/api/auth/test-login", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        router.replace("/");
        return;
      }
      setLoginStatus(`ผิดพลาด: ${data.error || res.status} - ${JSON.stringify(data.detail || data)}`);
    } catch (e) {
      setLoginStatus(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return (
    <div className="main flex flex-col w-full min-h-screen justify-center items-center">
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
        <form>
          <CardContent>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="ระบุอีเมลที่ลงทะเบียน"
                  className="bg-stone-50 ring-gray-400 ring-1"
                  required
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
                  required
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
            <Button type="submit" className="w-full">
              เข้าสู่ระบบ
            </Button>
            <p className="text-xs text-gray-500 mt-2">หรือ</p>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleTestLogin}
            >
              Login ทดสอบ (maya.chen@gmail.com / x)
            </Button>
            {loginStatus && (
              <pre className="w-full p-3 bg-gray-100 rounded text-sm whitespace-pre-wrap mt-2">
                {loginStatus}
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
    </div>
  );
}
