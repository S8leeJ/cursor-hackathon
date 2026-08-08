"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { BottomNav } from "@/components/BottomNav";
import { CodePicture } from "@/components/CodePicture";
import {
  CheckIcon,
  ChipIcon,
  FilterIcon,
  StarIcon,
  VerifiedBadge,
  XIcon,
} from "@/components/icons";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  computePersona,
  fingerprintChips,
  gradientForId,
  snippetFilename,
  snippetForProfile,
  type ModelMix,
} from "@/lib/swender";

const SWIPE_THRESHOLD = 110;
const UP_THRESHOLD = 90;
const FLY_MS = 380;

type ReviewAction = "accept" | "deny" | "request_changes";
type ExitDir = "left" | "right" | "up";

const EXIT_TRANSFORM: Record<
  ExitDir,
  { x: number; y: number; rotate: number }
> = {
  left: { x: -520, y: 90, rotate: -22 },
  right: { x: 520, y: 90, rotate: 22 },
  up: { x: 0, y: -560, rotate: -4 },
};

type PublicCandidate = {
  _id: Id<"users">;
  name: string;
  school?: string;
  bio?: string;
  avatarUrl?: string;
  preferredAgents: string[];
  modelMix: { opus: number; gpt: number; gemini: number };
  typicalTokenBurn: "low" | "medium" | "high" | "extreme";
  matchScore: number;
};

const MODEL_LABELS: Record<keyof ModelMix, string> = {
  opus: "Opus",
  gpt: "GPT",
  gemini: "Gemini",
};

function dominantModel(mix: ModelMix): keyof ModelMix {
  return (Object.entries(mix) as [keyof ModelMix, number][]).sort(
    (a, b) => b[1] - a[1],
  )[0][0];
}

function modelChangeOptions(mix: ModelMix): {
  from: string;
  to: string;
  label: string;
}[] {
  const from = dominantModel(mix);
  return (Object.keys(MODEL_LABELS) as (keyof ModelMix)[])
    .filter((m) => m !== from)
    .map((to) => ({
      from: MODEL_LABELS[from],
      to: MODEL_LABELS[to],
      label: `Switch from ${MODEL_LABELS[from]} → ${MODEL_LABELS[to]}`,
    }));
}

export default function Discover() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const me = useQuery(api.users.current, isAuthenticated ? {} : "skip");
  const candidates = useQuery(
    api.matching.discover,
    isAuthenticated && me?.hasFingerprint ? {} : "skip",
  );
  const review = useMutation(api.matching.swipe);

  const [localPassed, setLocalPassed] = useState<Id<"users">[]>([]);
  const [exiting, setExiting] = useState<ExitDir | null>(null);
  const [exitOpacity, setExitOpacity] = useState(1);
  const [matchFlash, setMatchFlash] = useState<string | null>(null);
  const [changesFlash, setChangesFlash] = useState<string | null>(null);
  const [requestOpen, setRequestOpen] = useState(false);
  const [drag, setDrag] = useState({ x: 0, y: 0, rotate: 0, active: false });
  const dragRef = useRef({
    pointerId: null as number | null,
    startX: 0,
    startY: 0,
    x: 0,
    y: 0,
  });
  const busyRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const deck = useMemo(() => {
    if (!candidates) return [];
    return candidates.filter((c) => !localPassed.includes(c._id));
  }, [candidates, localPassed]);

  const profile = deck[0];

  const finishReview = useCallback(
    async (
      action: ReviewAction,
      target: PublicCandidate,
      extras?: {
        comment?: string;
        requestedChange?: { kind: "model"; from: string; to: string };
      },
    ) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setRequestOpen(false);

      const dir: ExitDir =
        action === "accept" ? "right" : action === "deny" ? "left" : "up";
      const fly = EXIT_TRANSFORM[dir];
      const fromX = dragRef.current.x;
      const fromY = dragRef.current.y;

      // Phase 1: lock the release pose with transitions armed (no snap-to-center).
      setExiting(dir);
      setDrag({
        x: fromX,
        y: fromY,
        rotate: fromX * 0.06,
        active: false,
      });
      dragRef.current.x = 0;
      dragRef.current.y = 0;

      // Phase 2: after paint, animate to the off-screen target.
      requestAnimationFrame(() => {
        setDrag({ x: fly.x, y: fly.y, rotate: fly.rotate, active: false });
        setExitOpacity(0);
      });

      // Advance the deck on the animation clock — don't stall on the network.
      window.setTimeout(() => {
        setLocalPassed((ids) => [...ids, target._id]);
        setExiting(null);
        setExitOpacity(1);
        setDrag({ x: 0, y: 0, rotate: 0, active: false });
        busyRef.current = false;
      }, FLY_MS);

      try {
        const result = await review({
          toUserId: target._id,
          action,
          comment: extras?.comment,
          requestedChange: extras?.requestedChange,
        });
        if (result.matched) {
          setMatchFlash(target.name);
          window.setTimeout(() => setMatchFlash(null), 1800);
        } else if (action === "request_changes") {
          setChangesFlash(target.name);
          window.setTimeout(() => setChangesFlash(null), 1800);
        }
      } catch {
        // keep card out of local deck even if network flakes; query will refresh
      }
    },
    [review],
  );

  const doReview = (action: ReviewAction) => {
    if (!profile || busyRef.current || exiting) return;
    if (action === "request_changes") {
      setRequestOpen(true);
      return;
    }
    void finishReview(action, profile);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (busyRef.current || exiting || requestOpen) return;
    if (e.button !== 0) return;
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      x: 0,
      y: 0,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ x: 0, y: 0, rotate: 0, active: true });
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current.pointerId !== e.pointerId) return;
    const x = e.clientX - dragRef.current.startX;
    const y = (e.clientY - dragRef.current.startY) * 0.55;
    dragRef.current.x = x;
    dragRef.current.y = y;

    // Coalesce pointer moves to one React update per frame.
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const { x: dx, y: dy } = dragRef.current;
      setDrag({ x: dx, y: dy, rotate: dx * 0.06, active: true });
    });
  };

  const endDrag = (pointerId: number) => {
    if (dragRef.current.pointerId !== pointerId || !profile) return;
    const { x, y } = dragRef.current;
    dragRef.current.pointerId = null;
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (y <= -UP_THRESHOLD && Math.abs(y) > Math.abs(x)) {
      dragRef.current.x = 0;
      dragRef.current.y = 0;
      setRequestOpen(true);
      setDrag({ x: 0, y: 0, rotate: 0, active: false });
      return;
    }
    if (Math.abs(x) >= SWIPE_THRESHOLD) {
      // leave dragRef x/y for finishReview to continue from release pose
      void finishReview(x > 0 ? "accept" : "deny", profile);
      return;
    }
    dragRef.current.x = 0;
    dragRef.current.y = 0;
    setDrag({ x: 0, y: 0, rotate: 0, active: false });
  };

  // Keyboard: ← deny, → accept, ↑ request changes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!profile || busyRef.current || exiting) return;
      if (requestOpen) {
        if (e.key === "Escape") setRequestOpen(false);
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        void finishReview("deny", profile);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        void finishReview("accept", profile);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setRequestOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [profile, exiting, finishReview, requestOpen]);

  if (authLoading || (isAuthenticated && me === undefined)) {
    return (
      <Shell>
        <p className="mt-20 text-center text-xs tracking-wide text-muted">
          Loading…
        </p>
      </Shell>
    );
  }

  if (!isAuthenticated) {
    return (
      <Shell>
        <Empty
          title="Sign in to review PRs"
          body="matching runs on your live AI coding fingerprint"
          href="/sign-in"
          cta="Sign in"
        />
      </Shell>
    );
  }

  if (!me?.hasFingerprint) {
    return (
      <Shell>
        <Empty
          title="Fingerprint required"
          body="finish onboarding so we can score pair-programming chemistry"
          href="/onboarding"
          cta="Build my twin"
        />
      </Shell>
    );
  }

  if (candidates === undefined) {
    return (
      <Shell>
        <p className="mt-20 text-center text-xs tracking-wide text-muted">
          Loading open PRs…
        </p>
      </Shell>
    );
  }

  if (!profile) {
    return (
      <Shell>
        <Empty
          title="Inbox zero"
          body="no open PRs in nearby burn bands — check merges or come back later"
          href="/matches"
          cta="View merges"
        />
      </Shell>
    );
  }

  const dragProgress = Math.min(
    Math.max(
      Math.abs(drag.x) / SWIPE_THRESHOLD,
      Math.abs(Math.min(drag.y, 0)) / UP_THRESHOLD,
    ),
    1,
  );
  const intent: ExitDir | null =
    exiting ??
    (drag.active
      ? drag.y < -28 && Math.abs(drag.y) > Math.abs(drag.x)
        ? "up"
        : Math.abs(drag.x) > 24
          ? drag.x > 0
            ? "right"
            : "left"
          : null
      : null);
  const cardStyle = {
    transform: `translate3d(${drag.x}px, ${drag.y}px, 0) rotate(${drag.rotate}deg)`,
    opacity: exitOpacity,
    transition: drag.active
      ? "none"
      : exiting
        ? `transform ${FLY_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${FLY_MS}ms ease-out`
        : "transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)",
    willChange: drag.active || exiting ? ("transform" as const) : undefined,
    pointerEvents: exiting ? ("none" as const) : undefined,
  };

  return (
    <Shell>
      {matchFlash && (
        <div className="fixed inset-x-0 top-8 z-20 mx-auto flex w-fit items-center gap-2 rounded-full bg-wine px-5 py-2 text-sm font-semibold text-ink shadow-[0_0_30px_rgba(124,29,49,0.5)] animate-[float-up_0.35s_ease-out]">
          <CheckIcon className="h-4 w-4" />
          Merged with {matchFlash}
        </div>
      )}
      {changesFlash && (
        <div className="fixed inset-x-0 top-8 z-20 mx-auto flex w-fit items-center gap-2 rounded-full border border-line-bright bg-card px-5 py-2 text-sm font-semibold text-ink animate-[float-up_0.35s_ease-out]">
          <StarIcon className="h-4 w-4 text-rose" />
          Changes requested · {changesFlash}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-rose">
            pull request
          </p>
          <h1 className="font-serif text-4xl text-ink">Review</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-line-bright px-3 py-1.5 font-mono text-[11px] text-rose">
            open · {Math.round(profile.matchScore * 100)}% fit
          </span>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line-bright text-rose transition hover:border-rose"
            aria-label="Filters"
          >
            <FilterIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative mt-5 flex flex-1">
        {/* Under-card first so React can promote it by key when the top flies off. */}
        {deck[1] && (
          <div
            key={deck[1]._id}
            className={`absolute inset-0 overflow-hidden rounded-3xl border border-line bg-gradient-to-b ${gradientForId(deck[1]._id)}`}
            style={{
              transform: `scale(${exiting ? 1 : 0.94 + dragProgress * 0.04})`,
              opacity: exiting ? 1 : 0.85 + dragProgress * 0.15,
              transition: drag.active
                ? "none"
                : `transform ${FLY_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${FLY_MS}ms ease-out`,
            }}
            aria-hidden
          >
            <CardFace profile={deck[1]} muted />
          </div>
        )}

        <div
          key={profile._id}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={(e) => endDrag(e.pointerId)}
          onPointerCancel={(e) => endDrag(e.pointerId)}
          className={`relative z-10 flex w-full flex-1 cursor-grab touch-none select-none flex-col overflow-hidden rounded-3xl border border-line bg-gradient-to-b ${gradientForId(profile._id)} active:cursor-grabbing`}
          style={cardStyle}
        >
          <div
            className="pointer-events-none absolute inset-0 z-20 flex items-start justify-between px-6 pt-14"
            aria-hidden
          >
            <Stamp
              label="ACCEPT"
              tone="accept"
              visible={intent === "right"}
              strength={exiting === "right" ? 1 : dragProgress}
            />
            <Stamp
              label="DENY"
              tone="deny"
              visible={intent === "left"}
              strength={exiting === "left" ? 1 : dragProgress}
            />
            <Stamp
              label="REQUEST CHANGES"
              tone="changes"
              visible={intent === "up"}
              strength={exiting === "up" ? 1 : dragProgress}
            />
          </div>

          <CardFace profile={profile} />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-5">
        <ActionButton
          label="Deny"
          pressed={intent === "left"}
          onClick={() => doReview("deny")}
        >
          <XIcon className="h-5 w-5" />
        </ActionButton>
        <ActionButton
          label="Request changes"
          pressed={intent === "up" || requestOpen}
          onClick={() => doReview("request_changes")}
        >
          <StarIcon className="h-5 w-5" />
        </ActionButton>
        <button
          type="button"
          aria-label="Accept"
          onClick={() => doReview("accept")}
          className={`flex h-18 w-18 items-center justify-center rounded-full bg-wine text-ink shadow-[0_0_30px_rgba(124,29,49,0.5)] transition hover:bg-wine-hover ${
            intent === "right" ? "scale-110 bg-wine-hover" : ""
          }`}
        >
          <CheckIcon className="h-7 w-7" />
        </button>
      </div>
      <p className="mt-3 text-center font-mono text-[10px] tracking-wide text-faint">
        ← deny · ↑ request changes · → accept
      </p>

      {requestOpen && (
        <RequestChangesModal
          profile={profile}
          onClose={() => setRequestOpen(false)}
          onSubmit={(payload) => void finishReview("request_changes", profile, payload)}
        />
      )}
    </Shell>
  );
}

function RequestChangesModal({
  profile,
  onClose,
  onSubmit,
}: {
  profile: PublicCandidate;
  onClose: () => void;
  onSubmit: (payload: {
    comment: string;
    requestedChange: { kind: "model"; from: string; to: string };
  }) => void;
}) {
  const options = modelChangeOptions(profile.modelMix);
  const [selected, setSelected] = useState(0);
  const [note, setNote] = useState("");

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/70 px-4 pb-8 pt-16 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-3xl border border-line bg-card p-5 shadow-2xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-rose">
          request changes
        </p>
        <h2 className="mt-2 font-serif text-3xl text-ink">
          Patch {profile.name}&apos;s PR
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          Interested — but not merge-ready. Ask them to change something concrete,
          like their model mix.
        </p>

        <div className="mt-5 space-y-2">
          {options.map((opt, i) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => setSelected(i)}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition ${
                selected === i
                  ? "border-rose bg-wine/30 text-ink"
                  : "border-line bg-black/20 text-muted hover:border-line-bright"
              }`}
            >
              <span>{opt.label}</span>
              {selected === i && <CheckIcon className="h-4 w-4 text-rose" />}
            </button>
          ))}
        </div>

        <label className="mt-4 block">
          <span className="text-[10px] uppercase tracking-[0.22em] text-faint">
            review comment
          </span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder={`e.g. try ${options[selected]?.to ?? "another model"} on your next ship and ping me`}
            className="mt-2 w-full resize-none rounded-xl border border-line bg-black/30 px-3 py-2.5 text-sm text-ink placeholder:text-faint focus:border-rose focus:outline-none"
          />
        </label>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-line-bright py-3 text-sm text-muted transition hover:border-rose hover:text-rose"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              const opt = options[selected];
              if (!opt) return;
              const comment =
                note.trim() ||
                `Requesting model change: ${opt.from} → ${opt.to}`;
              onSubmit({
                comment,
                requestedChange: {
                  kind: "model",
                  from: opt.from,
                  to: opt.to,
                },
              });
            }}
            className="flex-1 rounded-full bg-wine py-3 text-sm font-semibold text-ink transition hover:bg-wine-hover"
          >
            Submit review
          </button>
        </div>
      </div>
    </div>
  );
}

function Stamp({
  label,
  tone,
  visible,
  strength,
}: {
  label: string;
  tone: "accept" | "deny" | "changes";
  visible: boolean;
  strength: number;
}) {
  if (!visible) return null;
  const rot = tone === "accept" ? 12 : tone === "deny" ? -12 : 0;
  const position =
    tone === "accept"
      ? "ml-auto"
      : tone === "deny"
        ? "mr-auto"
        : "mx-auto mt-8";
  const color =
    tone === "accept"
      ? "border-rose text-rose"
      : tone === "deny"
        ? "border-faint text-faint"
        : "border-blush text-blush";
  return (
    <span
      className={`rounded-md border-2 px-3 py-1 text-sm font-bold tracking-[0.14em] ${position} ${color}`}
      style={{
        opacity: Math.max(0.35, strength),
        transform: `scale(${0.92 + strength * 0.08}) rotate(${rot}deg)`,
        transition: "opacity 0.12s ease-out, transform 0.12s ease-out",
      }}
    >
      {label}
    </span>
  );
}

function CardFace({
  profile,
  muted = false,
}: {
  profile: PublicCandidate;
  muted?: boolean;
}) {
  const persona = computePersona(profile);
  const chips = fingerprintChips(profile);
  const topModel = MODEL_LABELS[dominantModel(profile.modelMix)];

  return (
    <>
      <div className="relative z-10 flex items-center justify-between gap-2 px-4 pt-4">
        <span className="rounded-full border border-white/20 bg-black/40 px-2.5 py-1 font-mono text-[10px] text-blush">
          pr · fingerprint
        </span>
        <span className="rounded-full border border-white/15 bg-black/40 px-2.5 py-1 font-mono text-[10px] text-ink/80">
          model: {topModel}
        </span>
      </div>

      {profile.avatarUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20" />
          <div className="flex-1" />
        </>
      ) : (
        <div className="relative flex flex-1 items-center px-6 py-4">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(201,85,107,0.12),transparent_60%)]" />
          {!muted && (
            <CodePicture
              filename={snippetFilename(profile.name)}
              lines={snippetForProfile(profile)}
              className="relative w-full rotate-[-1.5deg]"
            />
          )}
        </div>
      )}

      <div className="relative z-10 space-y-3 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-5 pb-6 pt-8">
        <p className="flex flex-wrap items-center gap-x-2 font-serif text-4xl text-ink">
          {profile.name}
          <VerifiedBadge className="h-5 w-5 text-rose" />
          {profile.school && (
            <span className="w-full text-xs tracking-wide text-muted">
              {profile.school}
            </span>
          )}
        </p>
        <span className="inline-block rounded-full bg-wine px-3.5 py-1.5 text-[11px] font-medium tracking-wide text-ink">
          {persona.title}
        </span>
        {!muted && (
          <>
            <div className="flex flex-wrap gap-2">
              {chips.map((chip) => (
                <span
                  key={chip.label}
                  className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[11px] text-ink"
                >
                  <ChipIcon chip={chip} />
                  {chip.label}
                </span>
              ))}
            </div>
            {profile.bio && (
              <div className="rounded-xl border border-white/10 bg-black/50 px-4 py-3">
                <p className="text-[9px] uppercase tracking-[0.3em] text-rose">
                  commit message
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink/90">
                  &ldquo;{profile.bio}&rdquo;
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <main className="flex flex-1 flex-col px-5 pb-4 pt-6">{children}</main>
      <BottomNav />
    </div>
  );
}

function Empty({
  title,
  body,
  href,
  cta,
}: {
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="mt-16 flex flex-col items-center text-center">
      <h1 className="font-serif text-4xl text-ink">{title}</h1>
      <p className="mt-4 max-w-64 text-xs leading-relaxed tracking-wide text-muted">
        {body}
      </p>
      <Link
        href={href}
        className="mt-6 rounded-full bg-wine px-8 py-3 text-sm font-semibold tracking-wide text-ink transition hover:bg-wine-hover"
      >
        {cta}
      </Link>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  children,
  pressed = false,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex h-14 w-14 items-center justify-center rounded-full border border-line-bright text-muted transition hover:border-rose hover:text-rose ${
        pressed ? "scale-110 border-rose text-rose" : ""
      }`}
    >
      {children}
    </button>
  );
}
