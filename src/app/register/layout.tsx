import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ลงทะเบียนสมาชิก",
  description: "ลงทะเบียนสมาชิก All About Dog",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
