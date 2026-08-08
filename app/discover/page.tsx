"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { CodePane } from "@/components/CodePane";
import {
  ChipIcon,
  CheckIcon,
  FilterIcon,
  MergeIcon,
  PendingCircleIcon,
  PullRequestIcon,
  RequestChangesIcon,
  VerifiedBadge,
  XIcon,
} from "@/components/icons";
import { Avatar } from "@/components/Identicon";
import {
  Button,
  CheckRun,
  Chip,
  EmptyState,
  Key,
  Label,
  Loading,
  StateBadge,
} from "@/components/ui";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  checksForProfile,
  computePersona,
  fingerprintChips,
  handleOf,
  prNumberFor,
  snippetFilename,
  snippetForProfile,
  stableAgo,
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
  left: { x: -520, y: 90, rotate: -14 },
  right: { x: 520, y: 90, rotate: 14 },
  up: { x: 0, y: -560, rotate: -3 },
};

/** Drag direction maps to a diff marker, not to a romance verb. */
const INTENT: Record<
  ExitDir,
  { marker: string; label: string; color: string; text: string }
> = {
  right: {
    marker: "+",
    label: "approve",
    color: "var(--added)",
    text: "text-added",
  },
  left: {
    marker: "-",
    label: "close",
    color: "var(--deleted)",
    text: "text-deleted",
  },
  up: {
    marker: "~",
    label: "request changes",
    color: "var(--pending)",
    text: "text-pending",
  },
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
      label: `${MODEL_LABELS[from]} → ${MODEL_LABELS[to]}`,
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
  const [flyaway, setFlyaway] = useState<{
    profile: PublicCandidate;
    dir: ExitDir;
    fromX: number;
    fromY: number;
    fromRotate: number;
    flying: boolean;
  } | null>(null);
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
  const nextProfile = deck[1];
  const busy = flyaway !== null;

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
      const fromX = dragRef.current.x;
      const fromY = dragRef.current.y;
      const fromRotate = fromX * 0.05;

      // Ghost flies away; deck advances immediately underneath at rest —
      // avoids the old card + next card both animating transforms.
      setFlyaway({
        profile: target,
        dir,
        fromX,
        fromY,
        fromRotate,
        flying: false,
      });
      setLocalPassed((ids) => [...ids, target._id]);
      setDrag({ x: 0, y: 0, rotate: 0, active: false });
      dragRef.current.x = 0;
      dragRef.current.y = 0;

      window.setTimeout(() => {
        setFlyaway(null);
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
          window.setTimeout(() => setMatchFlash(null), 2200);
        } else if (action === "request_changes") {
          setChangesFlash(target.name);
          window.setTimeout(() => setChangesFlash(null), 2000);
        }
      } catch {
        // keep card out of local deck even if network flakes; query will refresh
      }
    },
    [review],
  );

  const doReview = (action: ReviewAction) => {
    if (!profile || busyRef.current || busy) return;
    if (action === "request_changes") {
      setRequestOpen(true);
      return;
    }
    void finishReview(action, profile);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (busyRef.current || busy || requestOpen) return;
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
      setDrag({ x: dx, y: dy, rotate: dx * 0.05, active: true });
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
      void finishReview(x > 0 ? "accept" : "deny", profile);
      return;
    }
    dragRef.current.x = 0;
    dragRef.current.y = 0;
    setDrag({ x: 0, y: 0, rotate: 0, active: false });
  };

  // After the ghost paints at the release pose, kick the fly-out transition.
  useEffect(() => {
    if (!flyaway || flyaway.flying) return;
    const id = requestAnimationFrame(() => {
      setFlyaway((prev) => (prev ? { ...prev, flying: true } : prev));
    });
    return () => cancelAnimationFrame(id);
  }, [flyaway]);

  // Keyboard: ← close, → approve, ↑ request changes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!profile || busyRef.current || busy) return;
      if (requestOpen) return;
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
  }, [profile, busy, finishReview, requestOpen]);

  if (authLoading || (isAuthenticated && me === undefined)) {
    return (
      <AppShell path="~/review">
        <Loading what="authenticating" />
      </AppShell>
    );
  }

  if (!isAuthenticated) {
    return (
      <AppShell path="~/review">
        <EmptyState
          glyph={<PullRequestIcon className="h-5 w-5" />}
          code="401 unauthorized"
          title="Sign in to review"
          body="matching runs on your live AI coding fingerprint, so we need to know whose queue this is."
          href="/sign-in"
          cta="Sign in"
        />
      </AppShell>
    );
  }

  if (!me?.hasFingerprint) {
    return (
      <AppShell path="~/review">
        <EmptyState
          glyph={<PullRequestIcon className="h-5 w-5" />}
          code="412 precondition failed"
          title="No fingerprint on file"
          body="finish onboarding so we can score pair-programming chemistry against the queue."
          href="/onboarding"
          cta="Build my fingerprint"
        />
      </AppShell>
    );
  }

  if (candidates === undefined) {
    return (
      <AppShell path="~/review">
        <Loading what="fetching open pull requests" />
      </AppShell>
    );
  }

  if (!profile && !flyaway) {
    return (
      <AppShell path="~/review" status={<span>0 open</span>}>
        <EmptyState
          glyph={<CheckIcon className="h-5 w-5 text-added" />}
          code="queue empty"
          title="Inbox zero"
          body="no open PRs in nearby burn bands. check your merges, or come back when the lab fills up tonight."
          href="/matches"
          cta="View merges"
          variant="ghost"
        />
      </AppShell>
    );
  }

  const shown = profile ?? flyaway?.profile;
  const dragProgress = Math.min(
    Math.max(
      Math.abs(drag.x) / SWIPE_THRESHOLD,
      Math.abs(Math.min(drag.y, 0)) / UP_THRESHOLD,
    ),
    1,
  );
  const intent: ExitDir | null =
    flyaway?.dir ??
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
    // No transition while a ghost is flying — prevents the promoted next card
    // from tweening scale→translate (the "double swipe" look).
    transition:
      drag.active || busy
        ? "none"
        : "transform 0.3s var(--ease-out)",
    willChange: drag.active ? ("transform" as const) : undefined,
  };
  const fly = flyaway ? EXIT_TRANSFORM[flyaway.dir] : null;
  const flyawayStyle =
    flyaway && fly
      ? {
          transform: flyaway.flying
            ? `translate3d(${fly.x}px, ${fly.y}px, 0) rotate(${fly.rotate}deg)`
            : `translate3d(${flyaway.fromX}px, ${flyaway.fromY}px, 0) rotate(${flyaway.fromRotate}deg)`,
          opacity: flyaway.flying ? 0 : 1,
          transition: flyaway.flying
            ? `transform ${FLY_MS}ms var(--ease-out), opacity ${FLY_MS}ms ease-out`
            : "none",
        }
      : undefined;

  return (
    <AppShell
      path="~/review"
      status={
        <>
          <span className="flex items-center gap-1.5 text-added">
            <PullRequestIcon className="h-3 w-3" />
            {deck.length} open
          </span>
          {shown && <span>{Math.round(shown.matchScore * 100)}% fit</span>}
        </>
      }
    >
      {matchFlash && <Toast kind="merged" name={matchFlash} />}
      {changesFlash && <Toast kind="changes" name={changesFlash} />}

      <PageHeader
        crumb="swender / pulls"
        title="Open PRs"
        meta={`${deck.length} awaiting your review`}
        actions={
          <Button variant="ghost" aria-label="Filters" className="h-9 w-9 px-0">
            <FilterIcon className="h-4 w-4" />
          </Button>
        }
      />

      <div className="relative mt-4 flex flex-1 overflow-hidden">
        {nextProfile && (
          <div
            key={nextProfile._id}
            className="absolute inset-0 overflow-hidden rounded-lg border border-rule bg-panel"
            style={{
              transform: `scale(${0.955 + dragProgress * 0.035})`,
              opacity: 0.6 + dragProgress * 0.4,
              transition: drag.active
                ? "none"
                : "transform 0.2s var(--ease-out), opacity 0.2s var(--ease-out)",
            }}
            aria-hidden
          >
            <CardFace profile={nextProfile} quiet />
          </div>
        )}

        {profile && (
          <div
            key={profile._id}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={(e) => endDrag(e.pointerId)}
            onPointerCancel={(e) => endDrag(e.pointerId)}
            className="relative z-10 w-full flex-1 cursor-grab touch-none select-none active:cursor-grabbing"
            style={cardStyle}
          >
            <CardFace
              profile={profile}
              intent={intent}
              strength={dragProgress}
            />
          </div>
        )}

        {flyaway && (
          <div
            className="pointer-events-none absolute inset-0 z-30"
            style={flyawayStyle}
            aria-hidden
          >
            <CardFace
              profile={flyaway.profile}
              intent={flyaway.dir}
              strength={1}
            />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-stretch gap-2">
        <Button
          variant="ghost"
          aria-label="Close pull request"
          onClick={() => doReview("deny")}
          className={`h-12 w-12 px-0 ${
            intent === "left"
              ? "border-deleted/70 bg-deleted/10 text-deleted"
              : "hover:border-deleted/60 hover:text-deleted"
          }`}
        >
          <XIcon className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          aria-label="Request changes"
          onClick={() => doReview("request_changes")}
          className={`h-12 w-12 px-0 ${
            intent === "up" || requestOpen
              ? "border-pending/70 bg-pending/10 text-pending"
              : "hover:border-pending/60 hover:text-pending"
          }`}
        >
          <RequestChangesIcon className="h-5 w-5" />
        </Button>
        <Button
          variant="approve"
          onClick={() => doReview("accept")}
          className={`h-12 flex-1 text-[13px] ${intent === "right" ? "brightness-110" : ""}`}
        >
          <CheckIcon className="h-4 w-4" />
          Approve
        </Button>
      </div>

      <p className="mt-3 flex items-center justify-center gap-2 text-[10px] text-ink-4">
        <Key>←</Key> close
        <span className="text-ink-4/50">·</span>
        <Key>↑</Key> changes
        <span className="text-ink-4/50">·</span>
        <Key>→</Key> approve
      </p>

      {requestOpen && profile && (
        <RequestChangesDialog
          profile={profile}
          onClose={() => setRequestOpen(false)}
          onSubmit={(payload) =>
            void finishReview("request_changes", profile, payload)
          }
        />
      )}
    </AppShell>
  );
}

/* ------------------------------- The PR card ------------------------------ */

function CardFace({
  profile,
  quiet = false,
  intent = null,
  strength = 0,
}: {
  profile: PublicCandidate;
  quiet?: boolean;
  intent?: ExitDir | null;
  strength?: number;
}) {
  const persona = computePersona(profile);
  const chips = fingerprintChips(profile);
  const checks = checksForProfile(profile);
  const handle = handleOf(profile.name);
  const pr = prNumberFor(profile._id);
  const marker = intent ? INTENT[intent] : null;

  return (
    <article
      className="relative flex h-full flex-col overflow-hidden rounded-lg border border-rule bg-panel"
      style={
        marker
          ? {
              boxShadow: `inset ${3 + strength * 4}px 0 0 0 ${marker.color}`,
              borderColor: `color-mix(in srgb, ${marker.color} ${Math.round(strength * 55)}%, var(--rule))`,
            }
          : undefined
      }
    >
      {/* Dragging paints the review marker over the hunk, the way staging does. */}
      {marker && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20"
          style={{
            background: marker.color,
            opacity: strength * 0.07,
          }}
        />
      )}

      <header className="flex h-9 shrink-0 items-center gap-2 border-b border-rule bg-raised px-3">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-kw" />
        <span className="truncate text-[11px] text-ink-2">
          {snippetFilename(profile.name)}
        </span>
        <span className="ml-auto shrink-0">
          {marker ? (
            <span
              className={`flex items-center gap-1.5 text-[10px] font-semibold ${marker.text}`}
              style={{ opacity: 0.45 + strength * 0.55 }}
            >
              <span className="text-[12px] leading-none">{marker.marker}</span>
              {marker.label}
            </span>
          ) : (
            <StateBadge state="open" />
          )}
        </span>
      </header>

      <div className="flex shrink-0 items-center gap-3 px-3.5 pt-3.5">
        <Avatar
          id={profile._id}
          name={profile.name}
          src={profile.avatarUrl}
          size={64}
        />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5">
            <span className="truncate text-[19px] font-semibold leading-tight tracking-[-0.02em] text-ink">
              {profile.name}
            </span>
            <VerifiedBadge className="h-4 w-4 shrink-0 text-kw" />
          </p>
          <p className="mt-1 truncate text-[11px] text-ink-3">
            @{handle}
            {profile.school ? ` · ${profile.school}` : ""}
          </p>
          <p className="mt-1.5 truncate text-[10.5px] text-ink-4">
            #{pr} opened {stableAgo(profile._id)} ago · 1 commit
          </p>
        </div>
      </div>

      <p className="mt-3 shrink-0 px-3.5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-kw/12 px-2.5 py-1 text-[10.5px] font-semibold text-kw">
          {persona.title}
        </span>
      </p>

      <div className="mt-3 min-h-0 flex-1 overflow-hidden border-y border-rule">
        <CodePane
          rows={snippetForProfile(profile)}
          hunk={`@@ -0,0 +1,5 @@ ${handle}`}
          className="h-full"
        />
      </div>

      {!quiet && (
        <div className="shrink-0 px-3.5 py-3">
          <CheckRun checks={checks} />

          <div className="mt-3 flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <Chip key={chip.label}>
                <ChipIcon chip={chip} />
                {chip.label}
              </Chip>
            ))}
          </div>

          {profile.bio && (
            <div className="mt-3 border-l-2 border-kw/50 pl-3">
              <Label>commit message</Label>
              <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-ink-2">
                {profile.bio}
              </p>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

/* --------------------------------- Toasts -------------------------------- */

function Toast({ kind, name }: { kind: "merged" | "changes"; name: string }) {
  const merged = kind === "merged";
  return (
    <div
      role="status"
      className="pop fixed inset-x-0 top-6 z-40 mx-auto flex w-fit max-w-[92%] items-center gap-2.5 rounded-sm border border-rule-strong bg-overlay px-3.5 py-2.5 shadow-[0_8px_28px_rgba(0,0,0,0.55)]"
      style={{
        boxShadow: `inset 3px 0 0 0 ${merged ? "var(--kw)" : "var(--pending)"}, 0 8px 28px rgba(0,0,0,0.55)`,
      }}
    >
      {merged ? (
        <MergeIcon className="h-4 w-4 shrink-0 text-kw" />
      ) : (
        <PendingCircleIcon className="h-4 w-4 shrink-0 text-pending" />
      )}
      <span className="text-[12px] text-ink">
        {merged ? (
          <>
            <span className="font-semibold text-kw">Merged</span> with {name}
          </>
        ) : (
          <>
            Changes requested on <span className="text-ink">{name}</span>
          </>
        )}
      </span>
    </div>
  );
}

/* --------------------------- Request changes flow ------------------------- */

function RequestChangesDialog({
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
  const ref = useRef<HTMLDialogElement>(null);
  const options = modelChangeOptions(profile.modelMix);
  const [selected, setSelected] = useState(0);
  const [note, setNote] = useState("");

  // Native <dialog> gives focus trapping, Escape, and scroll lock for free.
  useEffect(() => {
    ref.current?.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="pop m-auto w-[calc(100%-28px)] max-w-md rounded-lg border border-rule-strong bg-overlay p-0 text-ink shadow-[0_16px_50px_rgba(0,0,0,0.6)] backdrop:bg-black/70 backdrop:backdrop-blur-[2px]"
    >
      <header className="flex h-9 items-center gap-2 border-b border-rule bg-raised/70 px-3">
        <RequestChangesIcon className="h-3.5 w-3.5 text-pending" />
        <span className="text-[11px] text-ink-2">review · request changes</span>
      </header>

      <div className="p-4">
        <h2 className="text-[15px] font-semibold tracking-tight text-ink">
          Patch #{prNumberFor(profile._id)}
        </h2>
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-3">
          Interested, not merge-ready. Ask {profile.name.split(" ")[0]} to change
          one concrete thing.
        </p>

        <div className="mt-4">
          <Label>requested change · model</Label>
          <div className="mt-2 space-y-1.5">
            {options.map((opt, i) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => setSelected(i)}
                aria-pressed={selected === i}
                className={`flex w-full items-center gap-2.5 rounded-sm border px-3 py-2.5 text-left text-[12px] transition-colors duration-150 ${
                  selected === i
                    ? "border-pending/60 bg-pending/10 text-ink"
                    : "border-rule bg-inset text-ink-3 hover:border-rule-strong hover:text-ink-2"
                }`}
              >
                <span
                  className={`w-3 text-center text-[13px] leading-none ${selected === i ? "text-pending" : "text-ink-4"}`}
                >
                  {selected === i ? "~" : " "}
                </span>
                {opt.label}
                {selected === i && (
                  <CheckIcon className="ml-auto h-3.5 w-3.5 text-pending" />
                )}
              </button>
            ))}
          </div>
        </div>

        <label className="mt-4 block">
          <Label>review comment</Label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder={`try ${options[selected]?.to ?? "another model"} on your next ship and ping me`}
            className="mt-2 w-full resize-none rounded-sm border border-rule bg-inset px-3 py-2.5 text-[12px] leading-relaxed text-ink placeholder:text-ink-4 focus:border-fn/60"
          />
        </label>

        <div className="mt-4 flex gap-2">
          <Button variant="ghost" size="lg" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            size="lg"
            onClick={() => {
              const opt = options[selected];
              if (!opt) return;
              const comment =
                note.trim() || `Requesting model change: ${opt.from} → ${opt.to}`;
              onSubmit({
                comment,
                requestedChange: { kind: "model", from: opt.from, to: opt.to },
              });
            }}
            className="flex-[1.4]"
          >
            Submit review
          </Button>
        </div>
      </div>
    </dialog>
  );
}
