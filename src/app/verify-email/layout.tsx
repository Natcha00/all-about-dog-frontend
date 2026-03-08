import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ยืนยันอีเมล",
  description: "ยืนยันอีเมลด้วย OTP",
};

export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
