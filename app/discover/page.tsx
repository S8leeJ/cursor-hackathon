"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useMemo, useState } from "react";
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

  const deck = useMemo(() => {
    if (!candidates) return [];
    return candidates.filter((c) => !localPassed.includes(c._id));
  }, [candidates, localPassed]);

  const profile = deck[0];

  const doSwipe = async (liked: boolean) => {
    if (!profile || exiting) return;
    setExiting(liked ? "right" : "left");
    try {
      const result = await swipe({
        toUserId: profile._id,
        action: liked ? "like" : "pass",
      });
      if (result.matched) {
        setMatchFlash(profile.name);
        setTimeout(() => setMatchFlash(null), 1800);
      }
    } catch {
      // keep card out of local deck even if network flakes; query will refresh
    }
    setTimeout(() => {
      setLocalPassed((ids) => [...ids, profile._id]);
      setExiting(null);
    }, 250);
  };

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

  const persona = computePersona(profile);
  const chips = fingerprintChips(profile);
  const scorePct = Math.round(profile.matchScore * 100);

  return (
    <Shell>
      {matchFlash && (
        <div className="fixed inset-x-0 top-8 z-20 mx-auto flex w-fit items-center gap-2 rounded-full bg-wine px-5 py-2 text-sm font-semibold text-ink shadow-[0_0_30px_rgba(124,29,49,0.5)]">
          <HeartIcon filled className="h-4 w-4" />
          It&apos;s a match with {matchFlash}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="font-serif text-4xl text-ink">Discover</h1>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-line-bright px-3 py-1.5 text-[11px] text-rose">
            {scorePct}% twin
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

      <div
        key={profile._id + String(exiting)}
        className={`relative mt-5 flex flex-1 flex-col overflow-hidden rounded-3xl border border-line bg-gradient-to-b ${gradientForId(profile._id)} transition-all duration-250 ${
          exiting === "left"
            ? "-translate-x-full rotate-[-8deg] opacity-0"
            : exiting === "right"
              ? "translate-x-full rotate-[8deg] opacity-0"
              : "float-up"
        }`}
      >
        {/* Story-style progress segments */}
        <div className="relative z-10 flex gap-1.5 px-4 pt-4">
          {deck.slice(0, 8).map((c, i) => (
            <span
              key={c._id}
              className={`h-1 flex-1 rounded-full ${
                i === 0 ? "bg-rose" : "bg-white/15"
              }`}
            />
          ))}
        </div>

        {/* Avatar when they have one, otherwise their fingerprint as code */}
        {profile.avatarUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20" />
            <div className="flex-1" />
          </>
        ) : (
          <div className="relative flex flex-1 items-center px-6 py-4">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(201,85,107,0.12),transparent_60%)]" />
            <CodePicture
              filename={snippetFilename(profile.name)}
              lines={snippetForProfile(profile)}
              className="relative w-full rotate-[-1.5deg]"
            />
          </div>
        )}

        {/* Info */}
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
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 flex items-center justify-center gap-6">
        <ActionButton label="Pass" onClick={() => void doSwipe(false)}>
          <XIcon className="h-5 w-5" />
        </ActionButton>
        <ActionButton label="Super like" onClick={() => void doSwipe(true)}>
          <StarIcon className="h-5 w-5" />
        </ActionButton>
        <button
          type="button"
          aria-label="Like"
          onClick={() => void doSwipe(true)}
          className="flex h-18 w-18 items-center justify-center rounded-full bg-wine text-ink shadow-[0_0_30px_rgba(124,29,49,0.5)] transition hover:bg-wine-hover"
        >
          <HeartIcon filled className="h-7 w-7" />
        </button>
      </div>
    </Shell>
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
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-14 w-14 items-center justify-center rounded-full border border-line-bright text-muted transition hover:border-rose hover:text-rose"
    >
      {children}
    </button>
  );
}
