"use client";

import { useConvexAuth, useQuery } from "convex/react";
import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { api } from "@/convex/_generated/api";
import {
  computePersona,
  gradientForId,
} from "@/lib/swender";

export default function Matches() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const me = useQuery(api.users.current, isAuthenticated ? {} : "skip");
  const matches = useQuery(
    api.matching.listMatches,
    isAuthenticated && me?.hasFingerprint ? {} : "skip",
  );

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <main className="flex-1 px-5 pt-6 pb-4">
        <h1 className="font-serif text-4xl text-ink">Matches</h1>

        {authLoading || (isAuthenticated && me === undefined) ? (
          <p className="mt-16 text-center text-sm text-muted">Loading…</p>
        ) : !isAuthenticated ? (
          <Empty
            body="Sign in to see mutual fingerprint matches."
            href="/sign-in"
            cta="Sign in"
          />
        ) : !me?.hasFingerprint ? (
          <Empty
            body="Finish your fingerprint first, then start swiping."
            href="/onboarding"
            cta="Get started"
          />
        ) : matches === undefined ? (
          <p className="mt-16 text-center text-sm text-muted">Loading…</p>
        ) : matches.length === 0 ? (
          <>
            <p className="mt-1 text-sm text-muted">No matches yet — go swipe.</p>
            <Empty
              body="Your matches array is empty. Time to iterate."
              href="/discover"
              cta="♥ Start swiping"
              glyph="{ }"
            />
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted">
              Merged without conflicts · {matches.length} twin
              {matches.length === 1 ? "" : "s"}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {matches.map((p) => {
                const persona = computePersona(p);
                return (
                  <Link
                    key={p._id}
                    href="/messages"
                    className={`float-up overflow-hidden rounded-2xl border border-line bg-gradient-to-b ${gradientForId(p._id)}`}
                  >
                    <div className="flex h-36 items-center justify-center">
                      <span className="flex h-16 w-16 items-center justify-center rounded-full border border-line-bright bg-black/30 font-serif text-3xl text-blush">
                        {p.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="bg-black/50 px-3 py-3">
                      <p className="font-serif text-lg text-ink">{p.name}</p>
                      <p className="mt-0.5 truncate font-mono text-[10px] text-rose">
                        {persona.emoji} {persona.title}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </main>
      <BottomNav />
    </div>
  );
}

function Empty({
  body,
  href,
  cta,
  glyph = "♥",
}: {
  body: string;
  href: string;
  cta: string;
  glyph?: string;
}) {
  return (
    <div className="mt-16 flex flex-col items-center text-center">
      <p className="font-mono text-5xl text-line-bright">{glyph}</p>
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
