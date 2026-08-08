import type { SVGProps } from "react";
import type { Chip } from "@/lib/swender";

type IconProps = SVGProps<SVGSVGElement>;

/* -------------------------------- Agents --------------------------------- */

export function CursorLogo(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path fill="#e8e8e8" d="M12 1 2.5 6.5v11L12 23l9.5-5.5v-11z" opacity="0.15" />
      <path fill="#e8e8e8" d="M12 1 2.5 6.5 12 12l9.5-5.5z" opacity="0.55" />
      <path fill="#e8e8e8" d="M12 12v11l9.5-5.5v-11z" opacity="0.85" />
      <path fill="#e8e8e8" d="M2.5 6.5 12 12v11l-9.5-5.5z" opacity="0.35" />
    </svg>
  );
}

export function ClaudeLogo(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#D97757" {...props}>
      <g strokeWidth="1.9" strokeLinecap="round">
        <path d="M12 3.2v17.6M3.2 12h17.6" />
        <path d="M5.8 5.8l12.4 12.4M18.2 5.8 5.8 18.2" />
      </g>
    </svg>
  );
}

export function CopilotLogo(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        fill="#e8e8e8"
        d="M12 4.2c-2.6 0-4.2 1-5 2.2-1.5-.5-3-.3-3.6.2-.5.4-.3 1.6.2 2.7-.5.9-.8 2-.8 3.2 0 3.9 3.6 6.3 9.2 6.3s9.2-2.4 9.2-6.3c0-1.2-.3-2.3-.8-3.2.5-1.1.7-2.3.2-2.7-.6-.5-2.1-.7-3.6-.2-.8-1.2-2.4-2.2-5-2.2Z"
      />
      <ellipse cx="8.6" cy="13.2" rx="2.3" ry="2.9" fill="#0a0d13" />
      <ellipse cx="15.4" cy="13.2" rx="2.3" ry="2.9" fill="#0a0d13" />
    </svg>
  );
}

export const AGENT_LOGOS: Record<string, (p: IconProps) => React.JSX.Element> = {
  cursor: CursorLogo,
  claude_code: ClaudeLogo,
  copilot: CopilotLogo,
};

export function AgentLogo({
  agentId,
  className,
}: {
  agentId: string;
  className?: string;
}) {
  const Logo = AGENT_LOGOS[agentId];
  return Logo ? <Logo className={className} /> : null;
}

/* ----------------------------- Model families ----------------------------- */

const MODEL_STYLES: Record<string, { abbr: string; bg: string }> = {
  Opus: { abbr: "OP", bg: "#D97757" },
  GPT: { abbr: "AI", bg: "#10A37F" },
  Gemini: { abbr: "GM", bg: "#4285F4" },
};

export function ModelBadge({ model }: { model: string }) {
  const s = MODEL_STYLES[model];
  if (!s) return null;
  return (
    <span
      className="inline-flex h-4 w-4 items-center justify-center rounded-xs text-[8px] font-bold leading-none text-white"
      style={{ background: s.bg }}
    >
      {s.abbr}
    </span>
  );
}

/* -------------------------------- UI icons -------------------------------- */

function Stroke({
  children,
  ...props
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

/* --- git --- */

export function PullRequestIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <circle cx="6.5" cy="6" r="2.2" />
      <circle cx="6.5" cy="18.5" r="2.2" />
      <path d="M6.5 8.2v8.1" />
      <circle cx="17.5" cy="18.5" r="2.2" />
      <path d="M17.5 16.3V8.2" />
      <path d="M15 10.4l2.5-2.6 2.5 2.6" />
    </Stroke>
  );
}

export function MergeIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <circle cx="7" cy="5.5" r="2.2" />
      <circle cx="7" cy="18.5" r="2.2" />
      <path d="M7 7.7v8.6" />
      <circle cx="17" cy="9" r="2.2" />
      <path d="M17 11.2c0 3.2-2.4 5-7.6 5.2" />
    </Stroke>
  );
}

export function BranchIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <circle cx="7" cy="18" r="2.1" />
      <circle cx="7" cy="6" r="2.1" />
      <circle cx="17" cy="6" r="2.1" />
      <path d="M7 8.1v7.8" />
      <path d="M17 8.1c0 3.4-2.6 4.6-6.4 5.1" />
    </Stroke>
  );
}

export function CommitIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3v5.8M12 15.2V21" />
    </Stroke>
  );
}

export function TerminalIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <rect x="2.8" y="4.2" width="18.4" height="15.6" rx="2.4" />
      <path d="M7 10l2.6 2.4L7 14.8M12.4 15.2h4.2" />
    </Stroke>
  );
}

export function CommentIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M20.5 13.4c0 1.3-1 2.4-2.3 2.4H10l-4.5 3.4v-3.4h-.7a2.3 2.3 0 0 1-2.3-2.4V6.6c0-1.3 1-2.4 2.3-2.4h13.4c1.3 0 2.3 1.1 2.3 2.4Z" />
    </Stroke>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <circle cx="12" cy="8" r="3.8" />
      <path d="M4.5 20.5c0-3.7 3.4-6 7.5-6s7.5 2.3 7.5 6" />
    </Stroke>
  );
}

/* --- review actions --- */

export function CheckIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="m5 13 4.6 4.6L19.5 7" />
    </Stroke>
  );
}

export function XIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Stroke>
  );
}

/** Requested changes — the "~" of a modified hunk, drawn as a comment-edit. */
export function RequestChangesIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M4 8.5c0-1.3 1-2.3 2.3-2.3h8.4c1.3 0 2.3 1 2.3 2.3v4.2c0 1.3-1 2.3-2.3 2.3H9.6L5.4 18v-2.9c-.8 0-1.4-1-1.4-2.3Z" />
      <path d="M20.2 3.6 21.8 5l-5 5-2.1.5.5-2.1Z" />
    </Stroke>
  );
}

/* --- CI check states --- */

export function CheckCircleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.2A9.8 9.8 0 1 0 21.8 12A9.8 9.8 0 0 0 12 2.2Zm4.9 7.6-5.7 6a1.1 1.1 0 0 1-1.6 0L7.1 13a1.1 1.1 0 0 1 1.6-1.6l1.7 1.8 4.9-5.2a1.1 1.1 0 0 1 1.6 1.5Z" />
    </svg>
  );
}

export function PendingCircleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeDasharray="2.4 2.6"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="3.1" fill="currentColor" />
    </svg>
  );
}

export function FailCircleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.2A9.8 9.8 0 1 0 21.8 12A9.8 9.8 0 0 0 12 2.2Zm3.5 12a1.1 1.1 0 0 1-1.5 1.5L12 13.6l-2 2.1A1.1 1.1 0 0 1 8.5 14l2-2.1-2-2A1.1 1.1 0 0 1 10 8.4l2 2 2-2a1.1 1.1 0 0 1 1.5 1.5l-2 2Z" />
    </svg>
  );
}

/* --- misc --- */

export function FilterIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M4.5 7h15M7.5 12h9M10.5 17h3" />
    </Stroke>
  );
}

export function ShareIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M12 15.5V4m0 0L8.2 7.8M12 4l3.8 3.8" />
      <path d="M5 13.5V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-5.5" />
    </Stroke>
  );
}

export function SendIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M12 19.5V5m0 0-6 6m6-6 6 6" />
    </Stroke>
  );
}

export function FlameIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M12 3c3 3.4 5.5 5.8 5.5 9.2A5.5 5.5 0 0 1 12 21a5.5 5.5 0 0 1-5.5-8.8C6.5 8.8 9 6.4 12 3Z" />
      <path d="M12 21a2.6 2.6 0 0 0 2.6-2.6c0-1.6-1.2-2.5-2.6-4.2-1.4 1.7-2.6 2.6-2.6 4.2A2.6 2.6 0 0 0 12 21Z" />
    </Stroke>
  );
}

export function SchoolIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="m12 4 9 4.5-9 4.5-9-4.5L12 4Z" />
      <path d="M6.5 10.8V16c0 1.4 2.5 2.6 5.5 2.6s5.5-1.2 5.5-2.6v-5.2" />
    </Stroke>
  );
}

export function HeartIcon({
  filled,
  ...props
}: IconProps & { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M19.5 12.6 12 20l-7.5-7.4a5 5 0 1 1 7.5-6.6 5 5 0 1 1 7.5 6.6Z" />
    </svg>
  );
}

export function TagIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M12.6 3.4H20a.6.6 0 0 1 .6.6v7.4a1 1 0 0 1-.3.7l-8.2 8.2a1 1 0 0 1-1.4 0l-7-7a1 1 0 0 1 0-1.4l8.2-8.2a1 1 0 0 1 .7-.3Z" />
      <circle cx="16.6" cy="7.4" r="1.4" fill="currentColor" stroke="none" />
    </Stroke>
  );
}

/** Verified .edu student — a check sunk into a badge, GitHub style. */
export function VerifiedBadge(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 1.8 14.7 4l3.5-.3.8 3.4 3 1.8-1.5 3.1 1.5 3.1-3 1.8-.8 3.4-3.5-.3L12 22.2 9.3 20l-3.5.3L5 16.9 2 15.1 3.5 12 2 8.9 5 7.1l.8-3.4L9.3 4Z" />
      <path
        d="m8.6 12.2 2.3 2.3 4.5-4.7"
        fill="none"
        stroke="#0a0d13"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Wordmark glyph: a heart nested in curly braces. */
export function BracketHeart(props: IconProps) {
  return (
    <svg viewBox="0 0 48 24" fill="none" {...props}>
      <path
        d="M10 2C6 2 6.5 6 6.5 8.5S6 12 3 12c3 0 3.5 1 3.5 3.5S6 22 10 22"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <path
        d="M38 2c4 0 3.5 4 3.5 6.5S42 12 45 12c-3 0-3.5 1-3.5 3.5S42 22 38 22"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <path
        d="M28.8 12.4 24 17.6l-4.8-5.2a3.2 3.2 0 1 1 4.8-4.2 3.2 3.2 0 1 1 4.8 4.2Z"
        fill="#ff79c6"
      />
    </svg>
  );
}

/** Renders the right logo/glyph for a fingerprint chip. */
export function ChipIcon({ chip }: { chip: Chip }) {
  switch (chip.kind) {
    case "agent":
      return <AgentLogo agentId={chip.agentId} className="h-3.5 w-3.5" />;
    case "model":
      return <ModelBadge model={chip.label} />;
    case "burn":
      return <FlameIcon className="h-3.5 w-3.5 text-pending" />;
    case "school":
      return <SchoolIcon className="h-3.5 w-3.5 text-ink-3" />;
  }
}
