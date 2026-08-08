"use client";

import { useConvexAuth, useQuery } from "convex/react";
import Link from "next/link";
import { useState } from "react";
import { CodePicture } from "@/components/CodePicture";
import { ChipIcon, HeartIcon, ShareIcon } from "@/components/icons";
import { api } from "@/convex/_generated/api";
import {
  burnLabel,
  computePersona,
  dominantModel,
  fingerprintChips,
  snippetFilename,
  snippetForProfile,
} from "@/lib/swender";

export default function Wrapped() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const me = useQuery(api.users.current, isAuthenticated ? {} : "skip");
  const [copied, setCopied] = useState(false);

  if (authLoading || (isAuthenticated && me === undefined)) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <Gate title="Sign in to see your card" href="/sign-in" cta="Sign in" />
    );
  }

  if (
    !me?.hasFingerprint ||
    !me.preferredAgents ||
    !me.modelMix ||
    !me.typicalTokenBurn
  ) {
    return (
      <Gate
        title="No fingerprint yet"
        href="/onboarding"
        cta="Build my twin"
      />
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
  const chips = fingerprintChips({
    preferredAgents,
    modelMix,
    typicalTokenBurn,
  });

  const share = async () => {
    const text = `I'm a ${persona.title} on SWEnder — ${burnLabel(typicalTokenBurn)} burn, ${dominantModel(modelMix)}-forward. Find your compile-time match.`;
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <HeartIcon className="h-4 w-4 text-rose" />
        <p className="text-sm tracking-wide text-ink">
          SWEnder <span className="text-rose">Wrapped</span>
        </p>
        <span className="text-blush">✦</span>
      </div>

      <div className="float-up mt-8 text-center">
        <h1 className="font-serif text-[2.4rem] leading-[1.15] text-ink">
          You&apos;re a<br />
          <span className="italic text-rose">{persona.title}</span>
        </h1>
        <p className="mx-auto mt-4 max-w-72 text-xs leading-relaxed tracking-wide text-muted">
          {persona.tagline}
        </p>
      </div>

      {/* Persona card */}
      <div className="ornate-frame float-up mt-8 rounded-xl bg-card p-7 text-center">
        <p className="text-[9px] uppercase tracking-[0.35em] text-muted">
          twin persona
        </p>
        <h2 className="mt-3 font-serif text-3xl uppercase tracking-wide text-rose">
          {persona.title}
        </h2>

        {/* Your fingerprint, as source */}
        <CodePicture
          filename={snippetFilename(me.name)}
          lines={snippetForProfile({
            name: me.name,
            preferredAgents,
            modelMix,
            typicalTokenBurn,
          })}
          className="mt-6 text-left"
          textSize="text-[10px]"
        />

        <p className="mt-6 text-[9px] uppercase tracking-[0.35em] text-muted">
          your stack
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {chips.map((chip) => (
            <span
              key={chip.label}
              className="flex items-center gap-1.5 rounded-md border border-line bg-card-2 px-2.5 py-1.5 text-[10px] text-ink"
            >
              <ChipIcon chip={chip} />
              {chip.label}
            </span>
          ))}
        </div>

        <p className="mt-6 text-[9px] uppercase tracking-[0.35em] text-muted">
          token burn
        </p>
        <p className="mt-2 text-3xl text-blush">
          {"{"} <span className="text-ink">{burnLabel(typicalTokenBurn)}</span>{" "}
          {"}"}
        </p>
        <p className="mt-1 text-[11px] tracking-wide text-muted">
          intensity band
        </p>
      </div>

      <div className="mt-auto pt-8">
        <button
          type="button"
          onClick={() => void share()}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-wine py-4 text-sm font-semibold tracking-wide text-ink transition hover:bg-wine-hover"
        >
          <ShareIcon className="h-4 w-4" />
          {copied ? "Copied to clipboard" : "Share your card"}
        </button>
        <Link
          href="/discover"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-line-bright py-4 text-sm tracking-wide text-blush transition hover:border-rose"
        >
          <HeartIcon className="h-4 w-4" />
          Find matches
        </Link>
      </div>
    </main>
  );
}

function Gate({
  title,
  href,
  cta,
}: {
  title: string;
  href: string;
  cta: string;
}) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-8 text-center">
      <p className="font-serif text-3xl text-ink">{title}</p>
      <Link
        href={href}
        className="mt-8 w-full rounded-full bg-wine py-4 text-sm font-semibold tracking-wide text-ink transition hover:bg-wine-hover"
      >
        {cta}
      </Link>
    </main>
  );
}
