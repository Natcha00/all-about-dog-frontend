import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";

export function page() {
  return (
    <div className="main flex flex-col w-full min-h-screen justify-center items-center">
      {/* Logo Section */}
      <div className="Logo flex justify-center w-full mb-8">
        <Image
          src="/images/landingDog.png"
          alt="imgLanding"
          width={400}
          height={400}
        />
      </div>

      {/* Login Form Section */}
      <div className="login flex flex-col w-full max-w-md">
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ระบุอีเมลที่ลงทะเบียน"
                  className="bg-stone-50 ring-gray-400 ring-1"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">รหัสผ่าน</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="ระบุรหัสผ่าน"
                  className="bg-stone-50 ring-gray-400 ring-1"
                  required
                />
              </div>
            </div>
          </form>
          <div className="text-right">
            <a
              href="#"
              className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
            >
              ลืมรหัสผ่าน
            </a>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button type="submit" className="w-full">
            เข้าสู่ระบบ
          </Button>
          <div className="flex items-center">
            <p>ยังไม่มีผู้ใช้งาน?</p>
            <Link href="/register"><Button variant="link">ลงทะเบียน</Button></Link>
          </div>
        </CardFooter>
      </div>
    </div>
  );
}

export default page;

