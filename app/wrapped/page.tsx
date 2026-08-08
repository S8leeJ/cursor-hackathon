"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { useState } from "react";
import { CodePane } from "@/components/CodePane";
import { ChipIcon, ShareIcon, TagIcon } from "@/components/icons";
import { Button, ButtonLink, Chip, Label, Panel } from "@/components/ui";
import { api } from "@/convex/_generated/api";
import {
  burnLabel,
  computePersona,
  dominantModel,
  fingerprintChips,
  handleOf,
  shortHashFor,
  snippetForProfile,
  type TokenBurnBand,
} from "@/lib/swender";

const BURN_BANDS: TokenBurnBand[] = ["low", "medium", "high", "extreme"];
const BURN_COLOR: Record<TokenBurnBand, string> = {
  low: "var(--fn)",
  medium: "var(--type)",
  high: "var(--pending)",
  extreme: "var(--deleted)",
};

export default function Wrapped() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const me = useQuery(api.users.current, isAuthenticated ? {} : "skip");
  const [copied, setCopied] = useState(false);

  if (authLoading || (isAuthenticated && me === undefined)) {
    return null;
  }

  if (!isAuthenticated) {
    return <Gate title="Sign in to see your release" href="/sign-in" cta="Sign in" />;
  }

  if (
    !me?.hasFingerprint ||
    !me.preferredAgents ||
    !me.modelMix ||
    !me.typicalTokenBurn
  ) {
    return (
      <Gate
        title="No fingerprint tagged yet"
        href="/onboarding"
        cta="Build my fingerprint"
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
  const burnIndex = BURN_BANDS.indexOf(typicalTokenBurn);

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
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 py-7">
      <p className="text-[10px] text-ink-4">
        <span className="text-cmt">$ </span>git tag -a v1.0.0 -m
        <span className="text-str"> &quot;fingerprint&quot;</span>
      </p>

      <div className="rise mt-7">
        <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-kw">
          <TagIcon className="h-3.5 w-3.5" />
          release v1.0.0
        </p>
        <h1 className="mt-2.5 text-[30px] font-semibold leading-[1.08] tracking-[-0.035em] text-ink">
          {persona.title}
        </h1>
        <p className="mt-3 max-w-80 text-[12px] leading-relaxed text-ink-3">
          {persona.tagline}
        </p>
      </div>

      <Panel
        filename="RELEASE_NOTES.md"
        className="rise mt-7"
        right={
          <span className="text-[10px] text-cmt">{shortHashFor(me._id)}</span>
        }
        bodyClassName="pb-4"
      >
        <CodePane
          rows={snippetForProfile({
            name: me.name,
            preferredAgents,
            modelMix,
            typicalTokenBurn,
          })}
          textSize="text-[10.5px]"
        />

        <div className="px-3.5 pt-4">
          <Label>## stack</Label>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <Chip key={chip.label}>
                <ChipIcon chip={chip} />
                {chip.label}
              </Chip>
            ))}
          </div>
        </div>

        <div className="mt-5 px-3.5">
          <Label>## token burn</Label>
          <p
            className="mt-1.5 text-[26px] font-semibold leading-none tracking-[-0.02em]"
            style={{ color: BURN_COLOR[typicalTokenBurn] }}
          >
            {burnLabel(typicalTokenBurn).toLowerCase()}
          </p>
          <div className="mt-3 flex gap-1">
            {BURN_BANDS.map((band, i) => (
              <span
                key={band}
                className="h-1.5 flex-1 rounded-full"
                style={{
                  background:
                    i <= burnIndex
                      ? BURN_COLOR[typicalTokenBurn]
                      : "var(--rule-strong)",
                  opacity: i <= burnIndex ? 1 - (burnIndex - i) * 0.18 : 1,
                }}
              />
            ))}
          </div>
          <p className="mt-2 text-[10px] text-ink-4">
            intensity band {burnIndex + 1} of {BURN_BANDS.length} · @
            {handleOf(me.name)}
          </p>
        </div>
      </Panel>

      <div className="mt-auto pt-7">
        <Button size="lg" onClick={() => void share()} className="w-full">
          <ShareIcon className="h-4 w-4" />
          {copied ? "Copied to clipboard" : "Share your release"}
        </Button>
        <ButtonLink
          href="/discover"
          variant="ghost"
          size="lg"
          className="mt-2 w-full"
        >
          Review open PRs
        </ButtonLink>
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
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-10">
      <p className="text-[10px] text-ink-4">$ git describe --tags</p>
      <h1 className="mt-3 text-[20px] font-semibold tracking-[-0.02em] text-ink">
        {title}
      </h1>
      <ButtonLink href={href} size="lg" className="mt-7 w-full">
        {cta}
      </ButtonLink>
    </main>
  );
}
