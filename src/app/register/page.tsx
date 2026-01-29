import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center ">
      <Card className="w-full max-w-md bg-white/15 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl">
        <CardContent className="flex flex-col gap-8">
          <div className="text-center text-2xl font-semibold">
            ลงทะเบียนสมาชิก
          </div>

          <form className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="firstName">ชื่อ</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="โปรดระบุ"
                pattern="^[A-Za-zก-๙\s]+$"
                title="กรุณากรอกเฉพาะตัวอักษร"
                className="bg-stone-50 ring-gray-400 ring-1"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lastName">นามสกุล</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="โปรดระบุ"
                pattern="^[A-Za-zก-๙\s]+$"
                title="กรุณากรอกเฉพาะตัวอักษร"
                className="bg-stone-50 ring-gray-400 ring-1"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="โปรดระบุ"
                pattern="^[0-9]{10}$"
                inputMode="numeric"
                title="กรุณากรอกตัวเลข 10 หลัก"
                className="bg-stone-50 ring-gray-400 ring-1"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">ที่อยู่ปัจจุบัน</Label>
              <Input
                id="address"
                type="text"
                placeholder="โปรดระบุ"
                pattern="^[A-Za-z0-9ก-๙\s\/\.,-]+$"
                title="กรุณากรอกเฉพาะตัวอักษร ตัวเลข และสัญลักษณ์ / . , -"
                className="bg-stone-50 ring-gray-400 ring-1"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">อีเมล</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                title="กรุณากรอกอีเมลให้ถูกต้อง"
                className="bg-stone-50 ring-gray-400 ring-1"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <Input
                id="password"
                type="password"
                placeholder="โปรดระบุ"
                className="bg-stone-50 ring-gray-400 ring-1"
                required
              />
            </div>

            <CardFooter className="flex-col gap-2 px-0 pt-2">
              <Button type="submit" className="w-full">
                ลงทะเบียน
              </Button>
              <div className="flex items-center">
                <p>มีบัญชีอยู่แล้ว?</p>
                <Link href="/login">
                  <Button variant="link">เข้าสู่ระบบ</Button>
                </Link>
              </div>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
