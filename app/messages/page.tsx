"use client";

import { useConvexAuth, useQuery } from "convex/react";
import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { HeartIcon, MailIcon } from "@/components/icons";
import { api } from "@/convex/_generated/api";
import { agentLabel, gradientForId } from "@/lib/swender";

export default function Messages() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const me = useQuery(api.users.current, isAuthenticated ? {} : "skip");
  const matches = useQuery(
    api.matching.listMatches,
    isAuthenticated && me?.hasFingerprint ? {} : "skip",
  );

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <main className="flex-1 px-5 pb-4 pt-6">
        <h1 className="font-serif text-4xl text-ink">Messages</h1>

        {authLoading || (isAuthenticated && me === undefined) ? (
          <p className="mt-16 text-center text-xs tracking-wide text-muted">
            Loading…
          </p>
        ) : !isAuthenticated ? (
          <Empty
            body="sign in to open twin threads"
            href="/sign-in"
            cta="Sign in"
          />
        ) : matches === undefined ? (
          <p className="mt-16 text-center text-xs tracking-wide text-muted">
            Loading…
          </p>
        ) : matches.length === 0 ? (
          <Empty
            body="inbox zero — but not the good kind. match with someone first."
            href="/discover"
            cta="Find matches"
          />
        ) : (
          <div className="mt-6 flex flex-col gap-2">
            {matches.map((p, i) => {
              const agent = p.preferredAgents[0]
                ? agentLabel(p.preferredAgents[0])
                : "agent";
              return (
                <button
                  key={p._id}
                  type="button"
                  className="float-up flex items-center gap-4 rounded-2xl border border-line bg-card px-4 py-3.5 text-left transition hover:border-line-bright"
                >
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line-bright bg-gradient-to-b ${gradientForId(p._id)} font-serif text-xl text-blush`}
                  >
                    {p.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.avatarUrl}
                        alt={p.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      p.name.charAt(0).toUpperCase()
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate font-serif text-lg text-ink">
                        {p.name}
                      </span>
                      <span className="shrink-0 text-[10px] text-faint">
                        {i + 1}m
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted">
                      are you a {agent} enjoyer? because same
                    </span>
                  </span>
                  <span className="h-2 w-2 shrink-0 rounded-full bg-rose" />
                </button>
              );
            })}
          </div>
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
}: {
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="mt-16 flex flex-col items-center text-center">
      <MailIcon className="h-12 w-12 text-line-bright" />
      <p className="mt-5 max-w-64 text-xs leading-relaxed tracking-wide text-muted">
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
