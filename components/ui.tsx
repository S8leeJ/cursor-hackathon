import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import {
  BranchIcon,
  CheckCircleIcon,
  FailCircleIcon,
  MergeIcon,
  PendingCircleIcon,
  PullRequestIcon,
} from "@/components/icons";

/* ------------------------------- Buttons --------------------------------- */

type Variant = "primary" | "approve" | "ghost" | "danger" | "quiet";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  // Pink is "merged" — the goal state — so it carries the primary action.
  primary:
    "bg-kw text-editor font-semibold hover:brightness-110 disabled:hover:brightness-100",
  // Green is "approve", straight from the review UI a CS student lives in.
  approve:
    "bg-added text-editor font-semibold hover:brightness-110 disabled:hover:brightness-100",
  ghost:
    "border border-rule-strong text-ink-2 hover:border-rule-loud hover:bg-raised hover:text-ink",
  danger:
    "border border-deleted/40 text-deleted hover:border-deleted/70 hover:bg-deleted/10",
  quiet: "text-ink-3 hover:text-ink",
};

const SIZES: Record<Size, string> = {
  sm: "h-7 gap-1.5 px-2.5 text-[11px]",
  md: "h-9 gap-2 px-3.5 text-[12px]",
  lg: "h-11 gap-2 px-4 text-[13px]",
};

export function buttonClass(
  variant: Variant = "primary",
  size: Size = "md",
  extra = "",
) {
  return [
    "inline-flex items-center justify-center rounded-sm transition-[background-color,border-color,color,transform,filter] duration-150 ease-[var(--ease-out)]",
    "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40",
    VARIANTS[variant],
    SIZES[size],
    extra,
  ].join(" ");
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      type="button"
      className={buttonClass(variant, size, className)}
      {...props}
    />
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)}>
      {children}
    </Link>
  );
}

/* -------------------------------- Panels ---------------------------------- */

/**
 * A bordered surface with an optional editor tab bar. Depth is borders and
 * one-step surface tints only — no drop shadows outside true overlays.
 */
export function Panel({
  filename,
  modified = false,
  right,
  className = "",
  bodyClassName = "",
  children,
}: {
  filename?: string;
  modified?: boolean;
  right?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={`overflow-hidden rounded-md border border-rule bg-panel ${className}`}
    >
      {filename && (
        <header className="flex h-9 items-center gap-2 border-b border-rule bg-raised px-3">
          {modified && <span className="h-1.5 w-1.5 rounded-full bg-kw" />}
          <span className="truncate text-[11px] text-ink-2">{filename}</span>
          {right && <span className="ml-auto flex items-center">{right}</span>}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

/* ---------------------------- Review-state pills -------------------------- */

export type ReviewState = "open" | "merged" | "closed" | "changes" | "draft";

const STATES: Record<
  ReviewState,
  { label: string; text: string; bg: string; Icon: (p: never) => ReactNode }
> = {
  open: {
    label: "open",
    text: "text-added",
    bg: "bg-added/12",
    Icon: PullRequestIcon as never,
  },
  merged: {
    label: "merged",
    text: "text-kw",
    bg: "bg-kw/14",
    Icon: MergeIcon as never,
  },
  closed: {
    label: "closed",
    text: "text-deleted",
    bg: "bg-deleted/12",
    Icon: FailCircleIcon as never,
  },
  changes: {
    label: "changes requested",
    text: "text-pending",
    bg: "bg-pending/12",
    Icon: PendingCircleIcon as never,
  },
  draft: {
    label: "draft",
    text: "text-ink-3",
    bg: "bg-white/5",
    Icon: BranchIcon as never,
  },
};

export function StateBadge({
  state,
  label,
  className = "",
}: {
  state: ReviewState;
  label?: string;
  className?: string;
}) {
  const s = STATES[state];
  const Icon = s.Icon as (p: { className?: string }) => ReactNode;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold ${s.bg} ${s.text} ${className}`}
    >
      <Icon className="h-3 w-3" />
      {label ?? s.label}
    </span>
  );
}

/* --------------------------------- Chips ---------------------------------- */

export function Chip({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-rule-strong bg-raised px-2.5 py-1 text-[10.5px] text-ink-2 ${className}`}
    >
      {children}
    </span>
  );
}

/* ------------------------------- Check runs -------------------------------- */

export type CheckStatus = "pass" | "pending" | "fail";

const CHECK_ICON: Record<
  CheckStatus,
  { Icon: (p: { className?: string }) => ReactNode; color: string }
> = {
  pass: { Icon: CheckCircleIcon, color: "text-added" },
  pending: { Icon: PendingCircleIcon, color: "text-pending" },
  fail: { Icon: FailCircleIcon, color: "text-deleted" },
};

export type Check = { name: string; status: CheckStatus; detail: string };

/**
 * The match score, expressed the way a CS student already reads confidence:
 * a check run. A bare percentage says nothing about *why* it's a good match.
 */
export function CheckRun({ checks }: { checks: Check[] }) {
  const passing = checks.filter((c) => c.status === "pass").length;
  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className="text-[10px] uppercase tracking-[0.18em] text-ink-4">
          checks
        </span>
        <span className="text-[10.5px] text-ink-3">
          <span className={passing === checks.length ? "text-added" : "text-pending"}>
            {passing}
          </span>
          /{checks.length} passing
        </span>
      </div>
      <ul className="mt-2 space-y-1.5">
        {checks.map((c) => {
          const { Icon, color } = CHECK_ICON[c.status];
          return (
            <li key={c.name} className="flex items-center gap-2">
              <Icon className={`h-3.5 w-3.5 shrink-0 ${color}`} />
              <span className="truncate text-[11px] text-ink-2">{c.name}</span>
              <span className="ml-auto shrink-0 text-[10.5px] text-ink-3">
                {c.detail}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* -------------------------------- Keycaps --------------------------------- */

export function Key({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex min-w-5 items-center justify-center rounded-xs border border-rule-strong border-b-rule-loud bg-inset px-1 py-0.5 text-[10px] leading-none text-ink-2">
      {children}
    </kbd>
  );
}

/* ------------------------------ Empty states ------------------------------ */

export function EmptyState({
  glyph,
  code,
  title,
  body,
  href,
  cta,
  variant = "primary",
}: {
  glyph?: ReactNode;
  code?: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  variant?: Variant;
}) {
  return (
    <div className="rise mt-14 flex flex-col items-center px-6 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-sm border border-rule-strong bg-panel text-ink-3">
        {glyph}
      </span>
      {code && (
        <p className="mt-4 text-[10px] uppercase tracking-[0.22em] text-ink-4">
          {code}
        </p>
      )}
      <h2 className="mt-2 text-[15px] font-semibold tracking-tight text-ink">
        {title}
      </h2>
      <p className="mt-2 max-w-62 text-[11.5px] leading-relaxed text-ink-3">
        {body}
      </p>
      <ButtonLink href={href} variant={variant} className="mt-6">
        {cta}
      </ButtonLink>
    </div>
  );
}

/* ----------------------------- Section labels ----------------------------- */

export function Label({
  children,
  tone = "quiet",
}: {
  children: ReactNode;
  tone?: "quiet" | "accent";
}) {
  return (
    <p
      className={`text-[10px] uppercase tracking-[0.2em] ${
        tone === "accent" ? "text-kw" : "text-ink-4"
      }`}
    >
      {children}
    </p>
  );
}

/* -------------------------------- Loading -------------------------------- */

/** Terminal-style progress: a command that hasn't returned yet. */
export function Loading({ what = "loading" }: { what?: string }) {
  return (
    <p className="mt-16 flex items-center justify-center gap-2 text-[11px] text-ink-3">
      <span className="text-cmt">$</span>
      {what}
      <span className="flex gap-1">
        <span className="blip h-1 w-1 rounded-full bg-kw" />
        <span className="blip h-1 w-1 rounded-full bg-kw" />
        <span className="blip h-1 w-1 rounded-full bg-kw" />
      </span>
    </p>
  );
}
