"use client";

import { useConvexAuth, useQuery } from "convex/react";
import Link from "next/link";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import {
  agentLabel,
  burnLabel,
  computePersona,
  dominantModel,
} from "@/lib/swender";

const PIXEL_HEART = [
  "░█████░░█████░",
  "██████████████",
  "██████████████",
  "░████████████░",
  "░░██████████░░",
  "░░░░██████░░░░",
  "░░░░░░██░░░░░░",
];

export default function Wrapped() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const me = useQuery(api.users.current, isAuthenticated ? {} : "skip");
  const [copied, setCopied] = useState(false);

  if (authLoading || (isAuthenticated && me === undefined)) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-8 text-center">
        <p className="font-serif text-3xl text-ink">Sign in to see your card</p>
        <Link
          href="/sign-in"
          className="mt-8 w-full rounded-full bg-wine py-4 font-semibold text-ink"
        >
          Sign in
        </Link>
      </main>
    );
  }

  if (
    !me?.hasFingerprint ||
    !me.preferredAgents ||
    !me.modelMix ||
    !me.typicalTokenBurn
  ) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-8 text-center">
        <p className="font-serif text-3xl text-ink">No fingerprint yet</p>
        <Link
          href="/onboarding"
          className="mt-8 w-full rounded-full bg-wine py-4 font-semibold text-ink"
        >
          Build my twin
        </Link>
      </main>
    );
  }

  const preferredAgents = me.preferredAgents;
  const modelMix = me.modelMix;
  const typicalTokenBurn = me.typicalTokenBurn;

  const persona = computePersona({
    preferredAgents,
    modelMix,
    typicalTokenBurn,
  });
  const stack = [
    ...preferredAgents.slice(0, 2).map(agentLabel),
    dominantModel(modelMix),
    `${burnLabel(typicalTokenBurn)} burn`,
  ];

  const share = async () => {
    const text = `I'm a ${persona.title} on Token Twin — ${burnLabel(typicalTokenBurn)} burn, ${dominantModel(modelMix)}-forward. Find your compile-time match.`;
    if (navigator.share) {
      await navigator.share({ text }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-8">
      <div className="flex items-center justify-between">
        <span className="text-rose">♡</span>
        <p className="text-sm text-ink">
          Token Twin <span className="font-mono text-rose">Wrapped</span>
        </p>
        <span className="text-blush">✦</span>
      </div>

      <div className="float-up mt-8 text-center">
        <h1 className="font-serif text-4xl leading-tight text-ink">
          You&apos;re a<br />
          <span className="italic text-rose">{persona.title}</span>
        </h1>
        <p className="mx-auto mt-3 max-w-70 text-sm leading-relaxed text-muted">
          {persona.tagline} <span className="text-rose">♥</span>
        </p>
      </div>

      <div className="ornate-frame float-up mt-8 rounded-xl bg-card p-7 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
          twin persona
        </p>
        <h2 className="mt-3 font-serif text-3xl uppercase tracking-wide text-rose">
          {persona.title}
        </h2>

        <div className="mx-auto mt-6 w-fit rounded-lg border border-line-bright bg-black/50 px-6 py-4">
          <div className="mb-2 flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-wine" />
            <span className="h-2 w-2 rounded-full bg-line-bright" />
            <span className="h-2 w-2 rounded-full bg-line" />
          </div>
          <pre className="font-mono text-[8px] leading-[1.4] text-rose">
            {PIXEL_HEART.join("\n")}
          </pre>
        </div>

        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
          your stack
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {stack.map((s) => (
            <span
              key={s}
              className="rounded-md border border-line bg-card-2 px-2.5 py-1.5 font-mono text-[10px] text-ink"
            >
              {s}
            </span>
          ))}
        </div>

        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
          token burn
        </p>
        <p className="mt-2 font-mono text-3xl text-blush">
          {"{"} <span className="text-ink">{burnLabel(typicalTokenBurn)}</span>{" "}
          {"}"}
        </p>
        <p className="mt-1 font-mono text-xs text-muted">intensity band</p>
      </div>

      <div className="mt-auto pt-8">
        <button
          type="button"
          onClick={() => void share()}
          className="w-full rounded-full bg-wine py-4 font-mono text-sm font-semibold text-ink transition hover:bg-wine-hover"
        >
          {copied ? "Copied to clipboard ✓" : "⇧ Share your card"}
        </button>
        <Link
          href="/discover"
          className="mt-4 block w-full rounded-full border border-line-bright py-4 text-center font-mono text-sm text-blush transition hover:border-rose"
        >
          ♥ Find matches
        </Link>
      </div>
    </main>
  );
}
