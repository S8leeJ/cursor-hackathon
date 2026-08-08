"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/discover", label: "Discover", icon: "♥" },
  { href: "/matches", label: "Matches", icon: "💬" },
  { href: "/messages", label: "Messages", icon: "✉" },
  { href: "/profile", label: "Profile", icon: "👤" },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="sticky bottom-0 mx-auto w-full max-w-md border-t border-line bg-background/95 backdrop-blur">
      <div className="flex items-center justify-around py-3">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 text-[11px] transition ${
                active ? "text-rose" : "text-faint hover:text-muted"
              }`}
            >
              <span className="text-base leading-none">{tab.icon}</span>
              {tab.label}
              {active && <span className="h-0.5 w-6 rounded-full bg-rose" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
