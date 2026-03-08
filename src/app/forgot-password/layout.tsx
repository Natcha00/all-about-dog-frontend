import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ลืมรหัสผ่าน",
  description: "ขอ OTP รีเซ็ตรหัสผ่าน",
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
