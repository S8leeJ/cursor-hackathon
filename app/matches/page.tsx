"use client";

import { useConvexAuth, useQuery } from "convex/react";
import Link from "next/link";
import { AppShell, PageHeader } from "@/components/AppShell";
import { MergeIcon } from "@/components/icons";
import { Avatar } from "@/components/Identicon";
import { EmptyState, Loading, Panel } from "@/components/ui";
import { api } from "@/convex/_generated/api";
import {
  accentForId,
  computePersona,
  handleOf,
  prNumberFor,
  shortHashFor,
  stableAgo,
} from "@/lib/swender";

export default function Matches() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const me = useQuery(api.users.current, isAuthenticated ? {} : "skip");
  const matches = useQuery(
    api.matching.listMatches,
    isAuthenticated && me?.hasFingerprint ? {} : "skip",
  );

  const loading = authLoading || (isAuthenticated && me === undefined);

  return (
    <AppShell
      path="~/merges"
      status={
        matches?.length ? (
          <span className="flex items-center gap-1.5 text-kw">
            <MergeIcon className="h-3 w-3" />
            {matches.length} merged
          </span>
        ) : undefined
      }
    >
      <PageHeader
        crumb="swender / merges"
        title="Merged"
        meta={
          matches?.length
            ? `${matches.length} branch${matches.length === 1 ? "" : "es"} merged into main`
            : "mutual approvals land here"
        }
      />

      {loading ? (
        <Loading what="git log --merges" />
      ) : !isAuthenticated ? (
        <EmptyState
          glyph={<MergeIcon className="h-5 w-5" />}
          code="401 unauthorized"
          title="Sign in to see merges"
          body="a merge happens when you and someone else both hit approve."
          href="/sign-in"
          cta="Sign in"
        />
      ) : !me?.hasFingerprint ? (
        <EmptyState
          glyph={<MergeIcon className="h-5 w-5" />}
          code="412 precondition failed"
          title="Fingerprint first"
          body="write your fingerprint, then start reviewing the open queue."
          href="/onboarding"
          cta="Build my fingerprint"
        />
      ) : matches === undefined ? (
        <Loading what="git log --merges" />
      ) : matches.length === 0 ? (
        <EmptyState
          glyph={<MergeIcon className="h-5 w-5" />}
          code="0 commits ahead"
          title="Nothing merged yet"
          body="your matches array is empty. review a few open PRs and something will land."
          href="/discover"
          cta="Review open PRs"
        />
      ) : (
        <Panel
          filename="git log --merges --oneline"
          className="mt-5"
          bodyClassName="relative py-1.5"
        >
          {/* The trunk every merge lands on. */}
          <span
            aria-hidden
            className="absolute bottom-4 left-[27px] top-4 w-px bg-rule-strong"
          />
          {matches.map((p, i) => {
            const persona = computePersona(p);
            const accent = accentForId(p._id);
            return (
              <Link
                key={p._id}
                href="/messages"
                className="rise group relative flex items-center gap-3 px-3 py-2.5 transition-colors duration-150 hover:bg-raised"
                style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
              >
                {/* Merge commit node on the trunk. */}
                <span
                  aria-hidden
                  className="relative z-10 flex h-3 w-3 shrink-0 items-center justify-center rounded-full border-2 bg-panel transition-colors duration-150 group-hover:bg-raised"
                  style={{ borderColor: accent }}
                />
                <Avatar
                  id={p._id}
                  name={p.name}
                  src={p.avatarUrl}
                  size={36}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-2">
                    <span className="truncate text-[13.5px] font-semibold tracking-[-0.01em] text-ink">
                      {p.name}
                    </span>
                    <span className="ml-auto shrink-0 text-[10px] text-ink-4">
                      {stableAgo(p._id)}
                    </span>
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-[10.5px] text-ink-3">
                    <span className="text-cmt">{shortHashFor(p._id)}</span>
                    <span className="truncate">
                      merge: {handleOf(p.name)} → main
                    </span>
                  </span>
                  <span
                    className="mt-1 block truncate text-[10.5px]"
                    style={{ color: accent }}
                  >
                    {persona.title} · #{prNumberFor(p._id)}
                  </span>
                </span>
              </Link>
            );
          })}
        </Panel>
      )}
    </AppShell>
  );
}
