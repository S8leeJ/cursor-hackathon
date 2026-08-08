"use client";

import { useClerk } from "@clerk/nextjs";
import { useConvexAuth, useQuery } from "convex/react";
import { AppShell } from "@/components/AppShell";
import { CodePane } from "@/components/CodePane";
import { ChipIcon, UserIcon, VerifiedBadge } from "@/components/icons";
import { Avatar } from "@/components/Identicon";
import {
  Button,
  ButtonLink,
  Chip,
  EmptyState,
  Loading,
  Panel,
} from "@/components/ui";
import { api } from "@/convex/_generated/api";
import {
  computePersona,
  fingerprintChips,
  handleOf,
  snippetFilename,
  snippetForProfile,
  type ModelMix,
  type TokenBurnBand,
} from "@/lib/swender";

export default function Profile() {
  const { signOut } = useClerk();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const me = useQuery(api.users.current, isAuthenticated ? {} : "skip");

  const ready =
    me?.hasFingerprint &&
    me.preferredAgents &&
    me.modelMix &&
    me.typicalTokenBurn;

  return (
    <AppShell
      path="~/profile"
      branch={ready ? `feat/${handleOf(me.name)}` : "main"}
      status={
        ready ? (
          <span className="text-added">fingerprint synced</span>
        ) : undefined
      }
    >
      {authLoading || (isAuthenticated && me === undefined) ? (
        <Loading what="reading profile" />
      ) : !isAuthenticated ? (
        <EmptyState
          glyph={<UserIcon className="h-5 w-5" />}
          code="401 unauthorized"
          title="Sign in to view your profile"
          body="your fingerprint lives on your account, so nothing shows until you're in."
          href="/sign-in"
          cta="Sign in"
        />
      ) : !ready ? (
        <EmptyState
          glyph={<UserIcon className="h-5 w-5" />}
          code="404 fingerprint not found"
          title="Nothing committed yet"
          body="run onboarding to write your fingerprint and join the campus index."
          href="/onboarding"
          cta="Build my fingerprint"
        />
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <Avatar
                id={me._id}
                name={me.name}
                src={me.avatarUrl}
                size={64}
              />
              <div className="min-w-0">
                <p className="flex items-center gap-1.5">
                  <span className="truncate text-[19px] font-semibold leading-tight tracking-[-0.02em] text-ink">
                    {me.name}
                  </span>
                  <VerifiedBadge className="h-4 w-4 shrink-0 text-kw" />
                </p>
                <p className="mt-1 truncate text-[11px] text-ink-3">
                  @{handleOf(me.name)}
                  {me.school ? ` · ${me.school}` : ""}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void signOut({ redirectUrl: "/" })}
            >
              sign out
            </Button>
          </div>

          <ProfileBody
            id={me._id}
            name={me.name}
            school={me.school}
            bio={me.bio}
            preferredAgents={me.preferredAgents}
            modelMix={me.modelMix}
            typicalTokenBurn={me.typicalTokenBurn}
          />
        </>
      )}
    </AppShell>
  );
}

function ProfileBody({
  id,
  name,
  school,
  bio,
  preferredAgents,
  modelMix,
  typicalTokenBurn,
}: {
  id: string;
  name: string;
  school?: string;
  bio?: string;
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
    <div className="rise mt-5 flex flex-col gap-3">
      <div className="border-l-2 border-kw/50 pl-3">
        <p className="text-[13px] font-semibold text-kw">{persona.title}</p>
        <p className="mt-1 text-[11.5px] leading-relaxed text-ink-3">
          {persona.tagline}
        </p>
      </div>

      <Panel filename={snippetFilename(name)} bodyClassName="pb-3">
        <CodePane
          rows={snippetForProfile({
            name,
            preferredAgents,
            modelMix,
            typicalTokenBurn,
          })}
          textSize="text-[10.5px]"
        />
        <div className="mt-3 flex flex-wrap gap-1.5 px-3">
          {chips.map((chip) => (
            <Chip key={chip.label}>
              <ChipIcon chip={chip} />
              {chip.label}
            </Chip>
          ))}
        </div>
      </Panel>

      {bio && (
        <Panel filename="README.md" bodyClassName="px-3.5 py-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-ink-4">
            # hot take
          </p>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-2">
            {bio}
          </p>
        </Panel>
      )}

      <div className="mt-1 flex gap-2">
        <ButtonLink href="/onboarding" variant="ghost" size="lg" className="flex-1">
          Edit fingerprint
        </ButtonLink>
        <ButtonLink href="/wrapped" size="lg" className="flex-1">
          Release card
        </ButtonLink>
      </div>
      <p className="text-center text-[10px] text-ink-4">
        id {id.slice(0, 8)} · indexed for RAG search
      </p>
    </div>
  );
}
