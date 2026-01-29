"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Bell,
  PawPrint,
  Users,
  UserCircle2,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { label: "บริการ", href: "/service", Icon: LayoutGrid },
  { label: "สัตว์เลี้ยง", href: "/my-dogs", Icon: PawPrint },
  { label: "แจ้งเตือน", href: "/notifications", Icon: Bell },
  { label: "บัญชีผู้ใช้", href: "/account", Icon: UserCircle2 },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function BottomBar() {
  const pathname = usePathname();

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-50
        border-t border-black/10 bg-white/90 backdrop-blur
      "
      aria-label="Bottom navigation"
    >
      <div className="mx-auto max-w-md px-3 pb-[calc(env(safe-area-inset-bottom,0px)+10px)] pt-2">
        <div className="flex items-center">
          {navItems.map(({ label, href, Icon }) => {
            const active = isActivePath(pathname, href);

            return (
              <Link
                key={href}
                href={href}
                className={[
                  "flex-1", // ✅ หัวใจ: แบ่งพื้นที่เท่ากันอัตโนมัติ
                  "flex flex-col items-center justify-center gap-1",
                  "rounded-2xl py-2 transition active:scale-[0.98]",
                  active
                    ? "text-[#F0A23A]"
                    : "text-black/55 hover:text-black",
                ].join(" ")}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-6 w-6" />
                <span className="text-[11px] font-semibold leading-none">
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
