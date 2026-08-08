"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!me || hydrated) return;
    setAnswers({
      name: me.name && me.name !== "Anonymous" ? me.name : "",
      school: me.school ?? "",
      bio: me.bio ?? "",
      preferredAgents: me.preferredAgents ?? [],
      modelMix: me.modelMix ?? DEFAULT_ANSWERS.modelMix,
      typicalTokenBurn: me.typicalTokenBurn ?? "",
    });
    setHydrated(true);
  }, [me, hydrated]);

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
        <p className="font-serif text-3xl text-ink">Sign in to build your twin</p>
        <p className="mt-2 text-sm text-muted">
          Your AI coding fingerprint syncs once you&apos;re authenticated.
        </p>
        <Link
          href="/sign-in"
          className="mt-8 w-full rounded-full bg-wine py-4 text-base font-semibold text-ink transition hover:bg-wine-hover"
        >
          Sign in
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-8">
      <div className="flex items-center justify-center gap-2">
        <span className="text-rose">❤</span>
        <span className="font-serif text-2xl text-ink">Token Twin</span>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line/60">
          <div
            className="h-full rounded-full bg-gradient-to-r from-wine to-rose transition-all duration-300"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
        <span className="font-mono text-xs text-muted">
          Step {step} of {TOTAL_STEPS}
        </span>
      </div>

      <div className="mt-8 flex items-center justify-center gap-3 text-rose/60">
        <span className="h-px w-16 bg-line-bright" />
        <span className="text-sm">♡</span>
        <span className="h-px w-16 bg-line-bright" />
      </div>

      <div key={step} className="float-up mt-8 flex flex-1 flex-col">
        {step === 1 && (
          <StepShell title={<>What should we <Rose>call</Rose> you?</>}>
            <input
              autoFocus
              value={answers.name}
              onChange={(e) => set({ name: e.target.value })}
              placeholder="Your name"
              className="w-full rounded-2xl border border-line bg-card px-5 py-4 text-ink placeholder:text-faint focus:border-rose focus:outline-none"
            />
          </StepShell>
        )}

        {step === 2 && (
          <StepShell
            title={<>Where do you <Rose>ship</Rose> from?</>}
            subtitle="School or university — optional."
          >
            <input
              autoFocus
              value={answers.school}
              onChange={(e) => set({ school: e.target.value })}
              placeholder="e.g. Stanford, MIT, self-taught"
              className="w-full rounded-2xl border border-line bg-card px-5 py-4 text-ink placeholder:text-faint focus:border-rose focus:outline-none"
            />
          </StepShell>
        )}

        {step === 3 && (
          <StepShell
            title={<>Which <Rose>agents</Rose> do you vibe with?</>}
            subtitle="Pick every tool in your daily stack."
          >
            <div className="flex flex-col gap-3">
              {AGENTS.map((agent) => {
                const on = answers.preferredAgents.includes(agent.id);
                return (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() =>
                      set({
                        preferredAgents: on
                          ? answers.preferredAgents.filter((a) => a !== agent.id)
                          : [...answers.preferredAgents, agent.id],
                      })
                    }
                    className={`flex items-center gap-4 rounded-2xl border px-5 py-4 text-left transition ${
                      on
                        ? "border-rose bg-wine/25 shadow-[0_0_20px_rgba(124,29,49,0.35)]"
                        : "border-line bg-card hover:border-line-bright"
                    }`}
                  >
                    <span className="text-xl">{agent.icon}</span>
                    <span className="flex-1 text-ink">{agent.label}</span>
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
                        on ? "border-rose bg-rose text-background" : "border-faint"
                      }`}
                    >
                      {on ? "✓" : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          </StepShell>
        )}

        {step === 4 && (
          <StepShell
            title={<>What&apos;s your <Rose>model mix</Rose>?</>}
            subtitle="Rough share of coding work by family."
          >
            <OptionList
              options={MODEL_PRESETS.map((p) => ({
                id: p.id,
                label: p.label,
              }))}
              selected={
                MODEL_PRESETS.find(
                  (p) =>
                    Math.abs(p.mix.opus - answers.modelMix.opus) < 0.02 &&
                    Math.abs(p.mix.gpt - answers.modelMix.gpt) < 0.02 &&
                    Math.abs(p.mix.gemini - answers.modelMix.gemini) < 0.02,
                )?.id ?? ""
              }
              onSelect={(id) => {
                const preset = MODEL_PRESETS.find((p) => p.id === id);
                if (preset) set({ modelMix: preset.mix });
              }}
            />
            <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-muted">
              opus {Math.round(answers.modelMix.opus * 100)}% · gpt{" "}
              {Math.round(answers.modelMix.gpt * 100)}% · gemini{" "}
              {Math.round(answers.modelMix.gemini * 100)}%
            </p>
          </StepShell>
        )}

        {step === 5 && (
          <StepShell title={<>Typical <Rose>token burn</Rose>?</>}>
            <OptionList
              options={TOKEN_BURNS.map((b) => ({
                id: b.id,
                label: b.label,
                icon: undefined,
                hint: b.hint,
              }))}
              selected={answers.typicalTokenBurn}
              onSelect={(id) => set({ typicalTokenBurn: id as TokenBurnBand })}
            />
          </StepShell>
        )}

        {step === 6 && (
          <StepShell
            title={<>Drop your hottest <Rose>take</Rose>.</>}
            subtitle="This goes on your card as your bio."
          >
            <textarea
              autoFocus
              value={answers.bio}
              onChange={(e) => set({ bio: e.target.value })}
              placeholder="e.g. Good code is poetry. Great code is a love letter to the future."
              rows={4}
              className="w-full resize-none rounded-2xl border border-line bg-card px-5 py-4 text-ink placeholder:text-faint focus:border-rose focus:outline-none"
            />
          </StepShell>
        )}

        <div className="mt-auto pt-8">
          {error && (
            <p className="mb-3 text-center text-sm text-rose">{error}</p>
          )}
          <button
            type="button"
            onClick={() => void next()}
            disabled={!canContinue() || saving}
            className="w-full rounded-full bg-wine py-4 text-base font-semibold text-ink transition enabled:hover:bg-wine-hover disabled:opacity-40"
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
              className="mt-3 w-full py-1 text-sm text-muted hover:text-blush"
            >
              Back
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
      <h1 className="font-serif text-4xl leading-tight text-ink">{title}</h1>
      {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
      <div className="mt-8">{children}</div>
    </div>
  );
}

function OptionList({
  options,
  selected,
  onSelect,
}: {
  options: { id: string; label: string; icon?: string; hint?: string }[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {options.map((opt) => {
        const on = selected === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt.id)}
            className={`flex items-center gap-4 rounded-2xl border px-5 py-4 text-left transition ${
              on
                ? "border-rose bg-wine/25 shadow-[0_0_20px_rgba(124,29,49,0.35)]"
                : "border-line bg-card hover:border-line-bright"
            }`}
          >
            {opt.icon && <span className="text-xl">{opt.icon}</span>}
            <span className="flex-1">
              <span className="block text-ink">{opt.label}</span>
              {opt.hint && (
                <span className="mt-0.5 block font-mono text-[10px] text-muted">
                  {opt.hint}
                </span>
              )}
            </span>
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
                on ? "border-rose bg-rose text-background" : "border-faint"
              }`}
            >
              {on ? "✓" : ""}
            </span>
          </button>
        );
      })}
    </div>
  );
}
