"use client";

import { useConvexAuth, useQuery } from "convex/react";
import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { CodePicture } from "@/components/CodePicture";
import { HeartIcon } from "@/components/icons";
import { api } from "@/convex/_generated/api";
import {
  computePersona,
  gradientForId,
  snippetFilename,
  snippetForProfile,
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
      <main className="flex-1 px-5 pb-4 pt-6">
        <h1 className="font-serif text-4xl text-ink">Merges</h1>

        {authLoading || (isAuthenticated && me === undefined) ? (
          <p className="mt-16 text-center text-xs tracking-wide text-muted">
            Loading…
          </p>
        ) : !isAuthenticated ? (
          <Empty
            body="sign in to see mutual accepts that merged"
            href="/sign-in"
            cta="Sign in"
          />
        ) : !me?.hasFingerprint ? (
          <Empty
            body="finish your fingerprint first, then review open PRs"
            href="/onboarding"
            cta="Get started"
          />
        ) : matches === undefined ? (
          <p className="mt-16 text-center text-xs tracking-wide text-muted">
            Loading…
          </p>
        ) : matches.length === 0 ? (
          <>
            <p className="mt-1.5 text-xs tracking-wide text-muted">
              no merges yet — review open PRs
            </p>
            <Empty
              body="your matches array is empty. time to iterate."
              href="/discover"
              cta="Review open PRs"
              glyph="{ }"
            />
          </>
        ) : (
          <>
            <p className="mt-1.5 text-xs tracking-wide text-muted">
              merged without conflicts · {matches.length} twin
              {matches.length === 1 ? "" : "s"}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {matches.map((p) => {
                const persona = computePersona(p);
                return (
                  <Link
                    key={p._id}
                    href="/messages"
                    className={`float-up overflow-hidden rounded-2xl border border-line bg-gradient-to-b ${gradientForId(p._id)} transition hover:border-line-bright`}
                  >
                    {p.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.avatarUrl}
                        alt={p.name}
                        className="h-36 w-full object-cover"
                      />
                    ) : (
                      <div className="px-3 pt-3">
                        <CodePicture
                          filename={snippetFilename(p.name)}
                          lines={snippetForProfile(p).slice(0, 4)}
                          textSize="text-[7px]"
                        />
                      </div>
                    )}
                    <div className="bg-black/50 px-3.5 py-3">
                      <p className="truncate font-serif text-lg text-ink">
                        {p.name}
                      </p>
                      <p className="mt-1 truncate text-[10px] tracking-wide text-rose">
                        {persona.title}
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
  glyph,
}: {
  body: string;
  href: string;
  cta: string;
  glyph?: string;
}) {
  return (
    <div className="mt-16 flex flex-col items-center text-center">
      {glyph ? (
        <p className="text-5xl text-line-bright">{glyph}</p>
      ) : (
        <HeartIcon className="h-12 w-12 text-line-bright" />
      )}
      <p className="mt-5 max-w-60 text-xs leading-relaxed tracking-wide text-muted">
        {body}
      </p>
      <Link
        href={href}
        className="mt-6 flex items-center gap-2 rounded-full bg-wine px-8 py-3 text-sm font-semibold tracking-wide text-ink transition hover:bg-wine-hover"
      >
        <HeartIcon filled className="h-4 w-4" />
        {cta}
      </Link>
    </div>
  );
}
