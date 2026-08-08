"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChatIcon, CheckIcon, MailIcon, UserIcon } from "@/components/icons";

const TABS = [
  { href: "/discover", label: "Review", Icon: CheckIcon },
  { href: "/matches", label: "Merges", Icon: ChatIcon },
  { href: "/messages", label: "Messages", Icon: MailIcon },
  { href: "/profile", label: "Profile", Icon: UserIcon },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="sticky bottom-0 mx-auto w-full max-w-md border-t border-line bg-background/95 backdrop-blur">
      <div className="flex items-stretch justify-around pb-2 pt-2.5">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex w-16 flex-col items-center gap-1.5 text-[10px] tracking-wide transition ${
                active ? "text-rose" : "text-faint hover:text-muted"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
              <span
                className={`h-0.5 w-6 rounded-full ${active ? "bg-rose" : "bg-transparent"}`}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
