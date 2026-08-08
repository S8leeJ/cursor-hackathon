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
  ChipIcon,
  FilterIcon,
  HeartIcon,
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
} from "@/lib/swender";

const SWIPE_THRESHOLD = 110;
const FLY_MS = 380;

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

export default function Discover() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const me = useQuery(api.users.current, isAuthenticated ? {} : "skip");
  const candidates = useQuery(
    api.matching.discover,
    isAuthenticated && me?.hasFingerprint ? {} : "skip",
  );
  const swipe = useMutation(api.matching.swipe);

  const [localPassed, setLocalPassed] = useState<Id<"users">[]>([]);
  const [exiting, setExiting] = useState<"left" | "right" | null>(null);
  const [matchFlash, setMatchFlash] = useState<string | null>(null);
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
  const dragRef = useRef({
    pointerId: null as number | null,
    startX: 0,
    startY: 0,
    x: 0,
    y: 0,
  });
  const busyRef = useRef(false);

  const deck = useMemo(() => {
    if (!candidates) return [];
    return candidates.filter((c) => !localPassed.includes(c._id));
  }, [candidates, localPassed]);

  const profile = deck[0];
  const nextProfile = deck[1];

  const finishSwipe = useCallback(
    async (liked: boolean, target: PublicCandidate) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setExiting(liked ? "right" : "left");
      setDrag({ x: 0, y: 0, active: false });

      try {
        const result = await swipe({
          toUserId: target._id,
          action: liked ? "like" : "pass",
        });
        if (result.matched) {
          setMatchFlash(target.name);
          window.setTimeout(() => setMatchFlash(null), 1800);
        }
      } catch {
        // keep card out of local deck even if network flakes; query will refresh
      }

      window.setTimeout(() => {
        setLocalPassed((ids) => [...ids, target._id]);
        setExiting(null);
        busyRef.current = false;
      }, FLY_MS);
    },
    [swipe],
  );

  const doSwipe = (liked: boolean) => {
    if (!profile || busyRef.current || exiting) return;
    void finishSwipe(liked, profile);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (busyRef.current || exiting) return;
    // Don't steal clicks from buttons inside the card chrome (none yet), but
    // ignore multi-touch / secondary buttons.
    if (e.button !== 0) return;
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      x: 0,
      y: 0,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ x: 0, y: 0, active: true });
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current.pointerId !== e.pointerId) return;
    const x = e.clientX - dragRef.current.startX;
    const y = (e.clientY - dragRef.current.startY) * 0.35;
    dragRef.current.x = x;
    dragRef.current.y = y;
    setDrag({ x, y, active: true });
  };

  const endDrag = (pointerId: number) => {
    if (dragRef.current.pointerId !== pointerId || !profile) return;
    const { x } = dragRef.current;
    dragRef.current.pointerId = null;

    if (Math.abs(x) >= SWIPE_THRESHOLD) {
      void finishSwipe(x > 0, profile);
      return;
    }
    setDrag({ x: 0, y: 0, active: false });
  };

  // Keyboard: ← pass, → like
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!profile || busyRef.current || exiting) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        void finishSwipe(false, profile);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        void finishSwipe(true, profile);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [profile, exiting, finishSwipe]);

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
          title="Sign in to discover twins"
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
          Finding twins…
        </p>
      </Shell>
    );
  }

  if (!profile) {
    return (
      <Shell>
        <Empty
          title="Deck empty"
          body="no more candidates in nearby burn bands — check matches or come back later"
          href="/matches"
          cta="View matches"
        />
      </Shell>
    );
  }

  const dragProgress = Math.min(Math.abs(drag.x) / SWIPE_THRESHOLD, 1);
  const intent: "left" | "right" | null =
    exiting ??
    (drag.active && Math.abs(drag.x) > 24
      ? drag.x > 0
        ? "right"
        : "left"
      : null);
  const rotate = exiting ? 0 : drag.x * 0.06;
  const cardStyle = exiting
    ? undefined
    : {
        transform: `translate(${drag.x}px, ${drag.y}px) rotate(${rotate}deg)`,
        transition: drag.active
          ? "none"
          : "transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)",
      };

  return (
    <Shell>
      {matchFlash && (
        <div className="fixed inset-x-0 top-8 z-20 mx-auto flex w-fit items-center gap-2 rounded-full bg-wine px-5 py-2 text-sm font-semibold text-ink shadow-[0_0_30px_rgba(124,29,49,0.5)] animate-[float-up_0.35s_ease-out]">
          <HeartIcon filled className="h-4 w-4" />
          It&apos;s a match with {matchFlash}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="font-serif text-4xl text-ink">Discover</h1>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-line-bright px-3 py-1.5 text-[11px] text-rose">
            {Math.round(profile.matchScore * 100)}% twin
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

      {/* Stack: next card peeks underneath while the top one flies */}
      <div className="relative mt-5 flex flex-1">
        {nextProfile && (
          <div
            className={`absolute inset-0 overflow-hidden rounded-3xl border border-line bg-gradient-to-b ${gradientForId(nextProfile._id)} transition-transform duration-300`}
            style={{
              transform: exiting
                ? "scale(1)"
                : `scale(${0.94 + dragProgress * 0.04})`,
              opacity: 0.85 + dragProgress * 0.15,
            }}
            aria-hidden
          >
            <CardFace profile={nextProfile} muted />
          </div>
        )}

        <div
          key={profile._id}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={(e) => endDrag(e.pointerId)}
          onPointerCancel={(e) => endDrag(e.pointerId)}
          className={`relative flex w-full flex-1 cursor-grab touch-none select-none flex-col overflow-hidden rounded-3xl border border-line bg-gradient-to-b ${gradientForId(profile._id)} active:cursor-grabbing ${
            exiting === "left"
              ? "swipe-fly-left"
              : exiting === "right"
                ? "swipe-fly-right"
                : "float-up"
          }`}
          style={cardStyle}
        >
          {/* LIKE / PASS stamps */}
          <div
            className="pointer-events-none absolute inset-0 z-20 flex items-start justify-between px-6 pt-14"
            aria-hidden
          >
            <Stamp
              label="LIKE"
              tone="like"
              visible={intent === "right"}
              strength={exiting === "right" ? 1 : dragProgress}
            />
            <Stamp
              label="PASS"
              tone="pass"
              visible={intent === "left"}
              strength={exiting === "left" ? 1 : dragProgress}
            />
          </div>

          <CardFace profile={profile} />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 flex items-center justify-center gap-6">
        <ActionButton
          label="Pass"
          pressed={intent === "left"}
          onClick={() => doSwipe(false)}
        >
          <XIcon className="h-5 w-5" />
        </ActionButton>
        <ActionButton label="Super like" onClick={() => doSwipe(true)}>
          <StarIcon className="h-5 w-5" />
        </ActionButton>
        <button
          type="button"
          aria-label="Like"
          onClick={() => doSwipe(true)}
          className={`flex h-18 w-18 items-center justify-center rounded-full bg-wine text-ink shadow-[0_0_30px_rgba(124,29,49,0.5)] transition hover:bg-wine-hover ${
            intent === "right" ? "scale-110 bg-wine-hover" : ""
          }`}
        >
          <HeartIcon filled className="h-7 w-7" />
        </button>
      </div>
      <p className="mt-3 text-center text-[10px] tracking-wide text-faint">
        drag · ← pass · → like
      </p>
    </Shell>
  );
}

function Stamp({
  label,
  tone,
  visible,
  strength,
}: {
  label: string;
  tone: "like" | "pass";
  visible: boolean;
  strength: number;
}) {
  if (!visible) return null;
  const isLike = tone === "like";
  const rot = isLike ? 12 : -12;
  return (
    <span
      className={`rounded-md border-2 px-3 py-1 text-sm font-bold tracking-[0.2em] ${
        isLike
          ? "ml-auto border-rose text-rose"
          : "mr-auto border-faint text-faint"
      }`}
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

  return (
    <>
      <div className="relative z-10 flex gap-1.5 px-4 pt-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full ${
              i === 0 ? "bg-rose" : "bg-white/15"
            }`}
          />
        ))}
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
                  hot take
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
