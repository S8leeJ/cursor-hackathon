"use client";

import { useClerk } from "@clerk/nextjs";
import { useConvexAuth, useQuery } from "convex/react";
import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { CodePicture } from "@/components/CodePicture";
import { ChipIcon, UserIcon, VerifiedBadge } from "@/components/icons";
import { api } from "@/convex/_generated/api";
import {
  computePersona,
  fingerprintChips,
  snippetFilename,
  snippetForProfile,
  type ModelMix,
  type TokenBurnBand,
} from "@/lib/swender";

export default function Profile() {
  const { signOut } = useClerk();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const me = useQuery(api.users.current, isAuthenticated ? {} : "skip");

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <main className="flex-1 px-5 pb-4 pt-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-serif text-4xl text-ink">Profile</h1>
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => void signOut({ redirectUrl: "/" })}
              className="rounded-full border border-line-bright px-3.5 py-1.5 text-[11px] tracking-wide text-muted transition hover:border-rose hover:text-rose"
            >
              Sign out
            </button>
          )}
        </div>

        {authLoading || (isAuthenticated && me === undefined) ? (
          <p className="mt-16 text-center text-xs tracking-wide text-muted">
            Loading…
          </p>
        ) : !isAuthenticated ? (
          <Empty
            body="sign in to view your twin profile"
            href="/sign-in"
            cta="Sign in"
          />
        ) : !me?.hasFingerprint ||
          !me.preferredAgents ||
          !me.modelMix ||
          !me.typicalTokenBurn ? (
          <Empty
            body="404: fingerprint not found. run onboarding to init."
            href="/onboarding"
            cta="Get started"
          />
        ) : (
          <ProfileCard
            name={me.name}
            school={me.school}
            bio={me.bio}
            avatarUrl={me.avatarUrl}
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
  avatarUrl,
  preferredAgents,
  modelMix,
  typicalTokenBurn,
}: {
  name: string;
  school?: string;
  bio?: string;
  avatarUrl?: string;
  preferredAgents: string[];
  modelMix: ModelMix;
  typicalTokenBurn: TokenBurnBand;
}) {
  const persona = computePersona({
    preferredAgents,
    modelMix,
    typicalTokenBurn,
  });
  const chips = fingerprintChips({
    preferredAgents,
    modelMix,
    typicalTokenBurn,
    school,
  });

  return (
    <div className="float-up mt-6">
      <div className="flex flex-col items-center rounded-3xl border border-line bg-card px-6 py-8 text-center">
        <span className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-line-bright bg-gradient-to-b from-[#2a0f16] to-[#12060a] font-serif text-4xl text-blush">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            name.charAt(0).toUpperCase() || "?"
          )}
        </span>
        <p className="mt-4 flex items-center gap-2 font-serif text-3xl text-ink">
          {name}
          <VerifiedBadge className="h-5 w-5 text-rose" />
        </p>
        {school && (
          <p className="mt-1 text-xs tracking-wide text-muted">{school}</p>
        )}
        <span className="mt-3 rounded-full bg-wine px-4 py-1.5 text-[11px] font-medium tracking-wide text-ink">
          {persona.title}
        </span>
        <p className="mt-3 max-w-64 text-xs leading-relaxed tracking-wide text-muted">
          {persona.tagline}
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-card px-5 py-4">
        <p className="text-[9px] uppercase tracking-[0.3em] text-muted">
          your fingerprint
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <span
              key={chip.label}
              className="flex items-center gap-1.5 rounded-full border border-line-bright px-3 py-1 text-[11px] text-ink"
            >
              <ChipIcon chip={chip} />
              {chip.label}
            </span>
          ))}
        </div>
        <CodePicture
          filename={snippetFilename(name)}
          lines={snippetForProfile({
            name,
            preferredAgents,
            modelMix,
            typicalTokenBurn,
          })}
          className="mt-4"
          textSize="text-[10px]"
        />
      </div>

      {bio && (
        <div className="mt-4 rounded-2xl border border-line bg-card px-5 py-4">
          <p className="text-[9px] uppercase tracking-[0.3em] text-rose">
            hot take
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-ink/90">
            &ldquo;{bio}&rdquo;
          </p>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <Link
          href="/onboarding"
          className="flex-1 rounded-full border border-line-bright py-3 text-center text-xs tracking-wide text-blush transition hover:border-rose"
        >
          Edit fingerprint
        </Link>
        <Link
          href="/wrapped"
          className="flex-1 rounded-full bg-wine py-3 text-center text-xs font-semibold tracking-wide text-ink transition hover:bg-wine-hover"
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
      <UserIcon className="h-12 w-12 text-line-bright" />
      <p className="mt-5 max-w-60 text-xs leading-relaxed tracking-wide text-muted">
        {body}
      </p>
      <Link
        href={href}
        className="mt-6 rounded-full bg-wine px-8 py-3 text-sm font-semibold tracking-wide text-ink transition hover:bg-wine-hover"
      >
        {cta}
      </Link>
    </div>
  );
}
