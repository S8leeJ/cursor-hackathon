"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AgentLogo, CheckIcon, HeartIcon, ModelBadge } from "@/components/icons";
import { api } from "@/convex/_generated/api";
import {
  AGENTS,
  DEFAULT_ANSWERS,
  MODEL_PRESETS,
  TOKEN_BURNS,
  type OnboardingAnswers,
  type TokenBurnBand,
} from "@/lib/swender";

const TOTAL_STEPS = 6;

export default function Onboarding() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const me = useQuery(api.users.current, isAuthenticated ? {} : "skip");
  const completeOnboarding = useMutation(api.users.completeOnboarding);

  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<OnboardingAnswers>(DEFAULT_ANSWERS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Prefill from the saved profile the first time it arrives.
  if (me && !hydrated) {
    setHydrated(true);
    setAnswers({
      name: me.name && me.name !== "Anonymous" ? me.name : "",
      school: me.school ?? "",
      bio: me.bio ?? "",
      preferredAgents: me.preferredAgents ?? [],
      modelMix: me.modelMix ?? DEFAULT_ANSWERS.modelMix,
      typicalTokenBurn: me.typicalTokenBurn ?? "",
    });
  }

  const set = (patch: Partial<OnboardingAnswers>) =>
    setAnswers((a) => ({ ...a, ...patch }));

  const canContinue = () => {
    switch (step) {
      case 1:
        return answers.name.trim().length > 0;
      case 2:
        return true;
      case 3:
        return answers.preferredAgents.length > 0;
      case 4:
        return true;
      case 5:
        return answers.typicalTokenBurn !== "";
      case 6:
        return answers.bio.trim().length > 0;
      default:
        return false;
    }
  };

  const next = async () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      return;
    }

    if (!isAuthenticated) {
      router.push("/sign-in");
      return;
    }

    if (!me) {
      setError("Still setting up your profile — try again in a moment.");
      return;
    }

    if (answers.typicalTokenBurn === "") return;

    setSaving(true);
    setError(null);
    try {
      await completeOnboarding({
        name: answers.name.trim(),
        school: answers.school.trim() || undefined,
        bio: answers.bio.trim(),
        preferredAgents: answers.preferredAgents,
        modelMix: answers.modelMix,
        typicalTokenBurn: answers.typicalTokenBurn,
      });
      router.push("/wrapped");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-8 text-center">
        <p className="font-serif text-3xl text-ink">
          Sign in to build your twin
        </p>
        <p className="mt-3 text-xs leading-relaxed tracking-wide text-muted">
          Your AI coding fingerprint syncs once you&apos;re authenticated.
        </p>
        <Link
          href="/sign-in"
          className="mt-8 w-full rounded-full bg-wine py-4 text-sm font-semibold tracking-wide text-ink transition hover:bg-wine-hover"
        >
          Sign in
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-center gap-2.5">
        <HeartIcon filled className="h-4 w-4 text-rose" />
        <span className="font-serif text-2xl text-ink">Token Twin</span>
      </div>

      {/* Progress */}
      <div className="mt-7 flex items-center gap-3">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-line/60">
          <div
            className="h-full rounded-full bg-gradient-to-r from-wine to-rose transition-all duration-300"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
        <span className="text-[11px] tracking-wide text-muted">
          {step}/{TOTAL_STEPS}
        </span>
      </div>

      {/* Heart divider */}
      <div className="mt-8 flex items-center justify-center gap-3 text-rose/70">
        <span className="h-px w-16 bg-line-bright" />
        <HeartIcon className="h-3.5 w-3.5" />
        <span className="h-px w-16 bg-line-bright" />
      </div>

      <div key={step} className="float-up mt-8 flex flex-1 flex-col">
        {step === 1 && (
          <StepShell title={<>What should we <Rose>call</Rose> you?</>}>
            <input
              autoFocus
              value={answers.name}
              onChange={(e) => set({ name: e.target.value })}
              placeholder="your_name"
              className="w-full rounded-xl border border-line bg-card px-5 py-4 text-sm text-ink placeholder:text-faint focus:border-rose focus:outline-none"
            />
          </StepShell>
        )}

        {step === 2 && (
          <StepShell
            title={<>Where do you <Rose>ship</Rose> from?</>}
            subtitle="school or university — optional"
          >
            <input
              autoFocus
              value={answers.school}
              onChange={(e) => set({ school: e.target.value })}
              placeholder="e.g. UT Austin, MIT, self-taught"
              className="w-full rounded-xl border border-line bg-card px-5 py-4 text-sm text-ink placeholder:text-faint focus:border-rose focus:outline-none"
            />
          </StepShell>
        )}

        {step === 3 && (
          <StepShell
            title={<>Which <Rose>agents</Rose> do you vibe with?</>}
            subtitle="pick every tool in your daily stack"
          >
            <div className="flex flex-col gap-3">
              {AGENTS.map((agent) => {
                const on = answers.preferredAgents.includes(agent.id);
                return (
                  <Row
                    key={agent.id}
                    on={on}
                    icon={<AgentLogo agentId={agent.id} className="h-6 w-6" />}
                    label={agent.label}
                    onClick={() =>
                      set({
                        preferredAgents: on
                          ? answers.preferredAgents.filter(
                              (a) => a !== agent.id,
                            )
                          : [...answers.preferredAgents, agent.id],
                      })
                    }
                  />
                );
              })}
            </div>
          </StepShell>
        )}

        {step === 4 && (
          <StepShell
            title={<>What&apos;s your <Rose>model mix</Rose>?</>}
            subtitle="rough share of coding work by family"
          >
            <div className="flex flex-col gap-3">
              {MODEL_PRESETS.map((preset) => {
                const on =
                  Math.abs(preset.mix.opus - answers.modelMix.opus) < 0.02 &&
                  Math.abs(preset.mix.gpt - answers.modelMix.gpt) < 0.02 &&
                  Math.abs(preset.mix.gemini - answers.modelMix.gemini) < 0.02;
                return (
                  <Row
                    key={preset.id}
                    on={on}
                    icon={
                      <span className="flex gap-1">
                        <ModelBadge model="Opus" />
                        <ModelBadge model="GPT" />
                        <ModelBadge model="Gemini" />
                      </span>
                    }
                    label={preset.label}
                    hint={`opus ${Math.round(preset.mix.opus * 100)}% · gpt ${Math.round(
                      preset.mix.gpt * 100,
                    )}% · gemini ${Math.round(preset.mix.gemini * 100)}%`}
                    onClick={() => set({ modelMix: preset.mix })}
                  />
                );
              })}
            </div>
            <div className="mt-5 space-y-2">
              <MixBar label="opus" value={answers.modelMix.opus} color="#D97757" />
              <MixBar label="gpt" value={answers.modelMix.gpt} color="#10A37F" />
              <MixBar
                label="gemini"
                value={answers.modelMix.gemini}
                color="#4285F4"
              />
            </div>
          </StepShell>
        )}

        {step === 5 && (
          <StepShell title={<>Typical <Rose>token burn</Rose>?</>}>
            <div className="flex flex-col gap-3">
              {TOKEN_BURNS.map((burn) => (
                <Row
                  key={burn.id}
                  on={answers.typicalTokenBurn === burn.id}
                  icon={<Glyph>{burn.id.slice(0, 3)}</Glyph>}
                  label={burn.label}
                  hint={burn.hint}
                  onClick={() =>
                    set({ typicalTokenBurn: burn.id as TokenBurnBand })
                  }
                />
              ))}
            </div>
          </StepShell>
        )}

        {step === 6 && (
          <StepShell
            title={<>Drop your hottest <Rose>take</Rose>.</>}
            subtitle="this goes on your card as your bio"
          >
            <textarea
              autoFocus
              value={answers.bio}
              onChange={(e) => set({ bio: e.target.value })}
              placeholder='e.g. "Good code is poetry. Great code is a love letter to the future."'
              rows={4}
              className="w-full resize-none rounded-xl border border-line bg-card px-5 py-4 text-sm leading-relaxed text-ink placeholder:text-faint focus:border-rose focus:outline-none"
            />
          </StepShell>
        )}

        <div className="mt-auto pt-8">
          {error && (
            <p className="mb-3 text-center text-xs text-rose">{error}</p>
          )}
          <button
            type="button"
            onClick={() => void next()}
            disabled={!canContinue() || saving}
            className="w-full rounded-full bg-wine py-4 text-sm font-semibold tracking-wide text-ink transition enabled:hover:bg-wine-hover disabled:opacity-40"
          >
            {step === TOTAL_STEPS
              ? saving
                ? "Saving…"
                : "Reveal my twin"
              : "Continue →"}
          </button>
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="mt-3 w-full py-1 text-xs tracking-wide text-muted hover:text-blush"
            >
              ← back
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

function Rose({ children }: { children: React.ReactNode }) {
  return <span className="italic text-rose">{children}</span>;
}

function Glyph({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-6 min-w-6 items-center justify-center rounded border border-line-bright bg-black/30 px-1 text-[10px] text-blush">
      {children}
    </span>
  );
}

function MixBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-12 text-[10px] tracking-wide text-muted">{label}</span>
      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-line/60">
        <span
          className="block h-full rounded-full transition-all duration-300"
          style={{ width: `${value * 100}%`, background: color }}
        />
      </span>
      <span className="w-8 text-right text-[10px] text-faint">
        {Math.round(value * 100)}%
      </span>
    </div>
  );
}

function StepShell({
  title,
  subtitle,
  children,
}: {
  title: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="font-serif text-[2.1rem] leading-tight text-ink">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-xs tracking-wide text-muted">{subtitle}</p>
      )}
      <div className="mt-8">{children}</div>
    </div>
  );
}

function Row({
  on,
  icon,
  label,
  hint,
  onClick,
}: {
  on: boolean;
  icon?: React.ReactNode;
  label: string;
  hint?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-4 rounded-xl border px-5 py-4 text-left transition ${
        on
          ? "border-rose bg-wine/25 shadow-[0_0_24px_rgba(124,29,49,0.35)]"
          : "border-line bg-card hover:border-line-bright"
      }`}
    >
      {icon}
      <span className="flex-1">
        <span className="block text-sm text-ink">{label}</span>
        {hint && (
          <span className="mt-0.5 block text-[10px] text-muted">{hint}</span>
        )}
      </span>
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
          on ? "border-rose bg-rose text-background" : "border-faint"
        }`}
      >
        {on && <CheckIcon className="h-3 w-3" />}
      </span>
    </button>
  );
}
