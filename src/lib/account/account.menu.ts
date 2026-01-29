import { User, Shield, Phone, LogOut } from "lucide-react";

export type AccountMenuKey = "profile" | "password" | "contact" | "logout";

export type AccountMenuItem = {
  key: AccountMenuKey;
  title: string;
  subtitle: string;
  href?: string;
  tone?: "default" | "danger";
  icon: any; // lucide icon component
};

export const accountMenu: AccountMenuItem[] = [
  {
    key: "profile",
    title: "ข้อมูลส่วนตัว",
    subtitle: "ชื่อ-เบอร์โทร-ที่อยู่",
    href: "/account/profile",
    icon: User,
  },
  {
    key: "password",
    title: "เปลี่ยนรหัสผ่าน",
    subtitle: "อัปเดตความปลอดภัยบัญชี",
    href: "/account/password",
    icon: Shield,
  },
  {
    key: "contact",
    title: "ติดต่อโรงแรม",
    subtitle: "โทร / แชท / ข้อมูลสาขา",
    href: "/contact",
    icon: Phone,
  },
  {
    key: "logout",
    title: "ออกจากระบบ",
    subtitle: "ออกจากบัญชีนี้บนเครื่อง",
    tone: "danger",
    icon: LogOut,
  },
];
