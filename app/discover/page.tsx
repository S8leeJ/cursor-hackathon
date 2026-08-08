"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  computePersona,
  fingerprintTags,
  gradientForId,
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
        <p className="mt-20 text-center text-sm text-muted">Loading…</p>
      </Shell>
    );
  }

  if (!isAuthenticated) {
    return (
      <Shell>
        <Empty
          title="Sign in to discover twins"
          body="Matching runs on your live AI coding fingerprint."
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
          body="Finish onboarding so we can score pair-programming chemistry."
          href="/onboarding"
          cta="Build my twin"
        />
      </Shell>
    );
  }

  if (candidates === undefined) {
    return (
      <Shell>
        <p className="mt-20 text-center text-sm text-muted">Finding twins…</p>
      </Shell>
    );
  }

  if (!profile) {
    return (
      <Shell>
        <Empty
          title="Deck empty"
          body="No more candidates in nearby burn bands. Check matches or come back later."
          href="/matches"
          cta="View matches"
        />
      </Shell>
    );
  }

  const persona = computePersona(profile);
  const tags = fingerprintTags(profile);
  const scorePct = Math.round(profile.matchScore * 100);

  return (
    <Shell>
      {matchFlash && (
        <div className="fixed inset-x-0 top-8 z-20 mx-auto w-fit rounded-full bg-wine px-5 py-2 text-sm font-semibold text-ink shadow-[0_0_30px_rgba(124,29,49,0.5)]">
          It&apos;s a match with {matchFlash} ♥
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="font-serif text-4xl text-ink">Discover</h1>
        <span className="font-mono text-xs text-rose">{scorePct}% twin</span>
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
        <div className="flex gap-1.5 px-4 pt-4">
          {deck.slice(0, 8).map((c, i) => (
            <span
              key={c._id}
              className={`h-1 flex-1 rounded-full ${
                i === 0 ? "bg-rose" : "bg-white/15"
              }`}
            />
          ))}
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="flex h-32 w-32 items-center justify-center rounded-full border border-line-bright bg-black/30 font-serif text-6xl text-blush shadow-[0_0_60px_rgba(201,85,107,0.2)]">
            {profile.name.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="space-y-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-5 pb-6 pt-10">
          <p className="font-serif text-4xl text-ink">
            {profile.name}
            {profile.school ? (
              <span className="text-lg text-muted"> · {profile.school}</span>
            ) : null}
          </p>
          <span className="inline-block rounded-full bg-wine px-3.5 py-1.5 text-xs font-medium text-ink">
            {persona.emoji} {persona.title}
          </span>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs text-ink"
              >
                {t}
              </span>
            ))}
          </div>
          {profile.bio && (
            <div className="rounded-xl border border-white/10 bg-black/50 px-4 py-3">
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-rose">
                ❝ hot take
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink/90">
                {profile.bio}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-6">
        <ActionButton label="Pass" onClick={() => void doSwipe(false)}>
          ✕
        </ActionButton>
        <ActionButton label="Super like" onClick={() => void doSwipe(true)}>
          ✦
        </ActionButton>
        <button
          type="button"
          aria-label="Like"
          onClick={() => void doSwipe(true)}
          className="flex h-18 w-18 items-center justify-center rounded-full bg-wine text-2xl text-ink shadow-[0_0_30px_rgba(124,29,49,0.5)] transition hover:bg-wine-hover"
        >
          ♥
        </button>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <main className="flex flex-1 flex-col px-5 pt-6 pb-4">{children}</main>
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
      <p className="mt-4 max-w-60 text-sm text-muted">{body}</p>
      <Link
        href={href}
        className="mt-6 rounded-full bg-wine px-8 py-3 text-sm font-semibold text-ink transition hover:bg-wine-hover"
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
      className="flex h-14 w-14 items-center justify-center rounded-full border border-line-bright text-xl text-muted transition hover:border-rose hover:text-rose"
    >
      {children}
    </button>
  );
}
