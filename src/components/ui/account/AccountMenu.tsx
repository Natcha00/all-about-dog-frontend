"use client";

import { useRouter } from "next/navigation";
import AccountMenuItem from "./AccountMenuItem";
import { accountMenu } from "@/lib/account/account.menu";

export default function AccountMenu() {
  const router = useRouter();

  function handleLogout() {
    // TODO: call logout API / clear token (localStorage/cookies)
    router.push("/login");
  }

  return (
    <div className="mt-5 p-5 space-y-3">
      {accountMenu.map((it) => {
        const Icon = it.icon;

        return (
          <AccountMenuItem
            key={it.key}
            title={it.title}
            subtitle={it.subtitle}
            tone={it.tone}
            icon={<Icon className="h-5 w-5" />}
            onClick={() => {
              if (it.key === "logout") return handleLogout();
              if (it.href) router.push(it.href);
            }}
          />
        );
      })}
    </div>
  );
}
