"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CommentIcon,
  MergeIcon,
  PullRequestIcon,
  TerminalIcon,
  UserIcon,
} from "@/components/icons";

const TABS = [
  { href: "/discover", label: "review", Icon: PullRequestIcon },
  { href: "/matches", label: "merges", Icon: MergeIcon },
  { href: "/matchmaker", label: "matchmaker", Icon: TerminalIcon },
  { href: "/messages", label: "threads", Icon: CommentIcon },
  { href: "/profile", label: "profile", Icon: UserIcon },
] as const;

/**
 * Navigation as editor file tabs: the active tab lifts to the raised surface
 * and takes a 2px accent rail on top, the way an open file does.
 */
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="grid grid-cols-5 border-t border-rule bg-panel">
      {TABS.map(({ href, label, Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`relative flex h-14 flex-col items-center justify-center gap-1.5 transition-colors duration-150 ${
              active
                ? "bg-raised text-kw"
                : "text-ink-4 hover:bg-raised/50 hover:text-ink-2"
            }`}
          >
            <span
              aria-hidden
              className={`absolute inset-x-0 top-0 h-[2px] ${active ? "bg-kw" : "bg-transparent"}`}
            />
            <Icon className="h-[18px] w-[18px]" />
            <span className="text-[9px] tracking-[0.04em]">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
