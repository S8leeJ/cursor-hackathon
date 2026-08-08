"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { CommentIcon } from "@/components/icons";
import { Avatar } from "@/components/Identicon";
import { EmptyState, Loading, Panel } from "@/components/ui";
import { api } from "@/convex/_generated/api";
import { agentLabel, handleOf, stableAgo } from "@/lib/swender";

const MAX_OPEN = 3;

export default function Messages() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const me = useQuery(api.users.current, isAuthenticated ? {} : "skip");
  const matches = useQuery(
    api.matching.listMatches,
    isAuthenticated && me?.hasFingerprint ? {} : "skip",
  );

  const loading = authLoading || (isAuthenticated && me === undefined);
  const open = Math.min(matches?.length ?? 0, MAX_OPEN);

  return (
    <AppShell
      path="~/threads"
      status={
        matches?.length ? (
          <span>
            {open}/{MAX_OPEN} open
          </span>
        ) : undefined
      }
    >
      <PageHeader
        crumb="swender / threads"
        title="Threads"
        meta={
          matches?.length
            ? `${open} of ${MAX_OPEN} open — archive one to start another`
            : "conversations open after a merge"
        }
      />

      {loading ? (
        <Loading what="opening threads" />
      ) : !isAuthenticated ? (
        <EmptyState
          glyph={<CommentIcon className="h-5 w-5" />}
          code="401 unauthorized"
          title="Sign in to open threads"
          body="threads unlock between people who approved each other's PR."
          href="/sign-in"
          cta="Sign in"
        />
      ) : matches === undefined ? (
        <Loading what="opening threads" />
      ) : matches.length === 0 ? (
        <EmptyState
          glyph={<CommentIcon className="h-5 w-5" />}
          code="inbox zero"
          title="No threads open"
          body="inbox zero, but not the good kind. merge with someone first and a thread appears here."
          href="/discover"
          cta="Review open PRs"
        />
      ) : (
        <Panel
          filename="threads · 3 max"
          className="mt-5"
          bodyClassName="divide-y divide-rule"
        >
          {matches.map((p, i) => {
            const agent = p.preferredAgents[0]
              ? agentLabel(p.preferredAgents[0])
              : "your agent";
            const unread = i === 0;
            return (
              <button
                key={p._id}
                type="button"
                className="rise flex w-full items-center gap-3 px-3 py-3 text-left transition-colors duration-150 hover:bg-raised"
                style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
              >
                <Avatar
                  id={p._id}
                  name={p.name}
                  src={p.avatarUrl}
                  size={40}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-2">
                    <span className="truncate text-[13px] font-semibold tracking-[-0.01em] text-ink">
                      {p.name}
                    </span>
                    <span className="truncate text-[10px] text-ink-4">
                      @{handleOf(p.name)}
                    </span>
                    <span className="ml-auto shrink-0 text-[10px] text-ink-4">
                      {stableAgo(p._id)}
                    </span>
                  </span>
                  <span className="mt-1 flex items-center gap-2">
                    <span
                      className={`min-w-0 flex-1 truncate text-[11.5px] ${unread ? "text-ink-2" : "text-ink-3"}`}
                    >
                      are you a {agent} enjoyer? because same
                    </span>
                    {unread && (
                      <span className="shrink-0 rounded-full bg-added/14 px-1.5 py-0.5 text-[10px] font-semibold text-added">
                        +1
                      </span>
                    )}
                  </span>
                </span>
              </button>
            );
          })}
        </Panel>
      )}
    </AppShell>
  );
}
