"use client";

import { useConvexAuth, useQuery } from "convex/react";
import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { api } from "@/convex/_generated/api";
import {
  agentLabel,
  burnLabel,
  computePersona,
  fingerprintTags,
} from "@/lib/swender";

export default function Profile() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const me = useQuery(api.users.current, isAuthenticated ? {} : "skip");

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <main className="flex-1 px-5 pt-6 pb-4">
        <h1 className="font-serif text-4xl text-ink">Profile</h1>

        {authLoading || (isAuthenticated && me === undefined) ? (
          <p className="mt-16 text-center text-sm text-muted">Loading…</p>
        ) : !isAuthenticated ? (
          <Empty
            body="Sign in to view your twin profile."
            href="/sign-in"
            cta="Sign in"
          />
        ) : !me?.hasFingerprint ||
          !me.preferredAgents ||
          !me.modelMix ||
          !me.typicalTokenBurn ? (
          <Empty
            body="404: fingerprint not found. Run onboarding to init."
            href="/onboarding"
            cta="Get started"
          />
        ) : (
          <ProfileCard
            name={me.name}
            school={me.school}
            bio={me.bio}
            preferredAgents={me.preferredAgents}
            modelMix={me.modelMix}
            typicalTokenBurn={me.typicalTokenBurn}
          />
        )}
      </main>
      <BottomNav />
    </div>
  );
}

function ProfileCard({
  name,
  school,
  bio,
  preferredAgents,
  modelMix,
  typicalTokenBurn,
}: {
  name: string;
  school?: string;
  bio?: string;
  preferredAgents: string[];
  modelMix: { opus: number; gpt: number; gemini: number };
  typicalTokenBurn: "low" | "medium" | "high" | "extreme";
}) {
  const persona = computePersona({
    preferredAgents,
    modelMix,
    typicalTokenBurn,
  });
  const tags = fingerprintTags({
    preferredAgents,
    modelMix,
    typicalTokenBurn,
    school,
  });

  return (
    <div className="float-up mt-6">
      <div className="flex flex-col items-center rounded-3xl border border-line bg-card px-6 py-8 text-center">
        <span className="flex h-24 w-24 items-center justify-center rounded-full border border-line-bright bg-gradient-to-b from-[#2a0f16] to-[#12060a] font-serif text-4xl text-blush">
          {name.charAt(0).toUpperCase() || "?"}
        </span>
        <p className="mt-4 font-serif text-3xl text-ink">
          {name}{" "}
          <span className="align-middle text-base text-rose">✔</span>
        </p>
        {school && <p className="mt-1 text-sm text-muted">{school}</p>}
        <span className="mt-3 rounded-full bg-wine px-4 py-1.5 text-xs font-medium text-ink">
          {persona.emoji} {persona.title}
        </span>
        <p className="mt-3 max-w-64 text-sm leading-relaxed text-muted">
          {persona.tagline}
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-card px-5 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          your fingerprint
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-line-bright px-3 py-1 text-xs text-ink"
            >
              {t}
            </span>
          ))}
        </div>
        <p className="mt-4 font-mono text-[10px] text-muted">
          agents: {preferredAgents.map(agentLabel).join(", ")}
          <br />
          mix: opus {Math.round(modelMix.opus * 100)}% · gpt{" "}
          {Math.round(modelMix.gpt * 100)}% · gemini{" "}
          {Math.round(modelMix.gemini * 100)}%
          <br />
          burn: {burnLabel(typicalTokenBurn)}
        </p>
      </div>

      {bio && (
        <div className="mt-4 rounded-2xl border border-line bg-card px-5 py-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-rose">
            ❝ hot take
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink/90">{bio}</p>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <Link
          href="/onboarding"
          className="flex-1 rounded-full border border-line-bright py-3 text-center text-sm text-blush transition hover:border-rose"
        >
          Edit fingerprint
        </Link>
        <Link
          href="/wrapped"
          className="flex-1 rounded-full bg-wine py-3 text-center text-sm font-semibold text-ink transition hover:bg-wine-hover"
        >
          View my card
        </Link>
      </div>
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
      <p className="font-mono text-5xl text-line-bright">👤</p>
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
