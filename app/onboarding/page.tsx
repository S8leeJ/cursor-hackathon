"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CodePane } from "@/components/CodePane";
import { AgentLogo, ModelBadge } from "@/components/icons";
import { Button, ButtonLink, Label, Panel } from "@/components/ui";
import { api } from "@/convex/_generated/api";
import {
  AGENTS,
  DEFAULT_ANSWERS,
  MODEL_PRESETS,
  TOKEN_BURNS,
  draftFingerprint,
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
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-10">
        <p className="text-[10px] text-ink-4">$ swender init</p>
        <h1 className="mt-3 text-[20px] font-semibold tracking-[-0.02em] text-ink">
          Sign in to write your fingerprint
        </h1>
        <p className="mt-2 text-[11.5px] leading-relaxed text-ink-3">
          Your AI coding fingerprint syncs to the campus index once you&apos;re
          authenticated.
        </p>
        <ButtonLink href="/sign-in" size="lg" className="mt-7 w-full">
          Sign in
        </ButtonLink>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 py-7">
      <div className="flex items-baseline justify-between">
        <p className="text-[11px] text-ink-3">
          <span className="text-ink-4">$ </span>
          swender init
          <span className="text-cmt"> --interactive</span>
        </p>
        <p className="text-[10px] text-ink-4">
          step {step}/{TOTAL_STEPS}
        </p>
      </div>

      {/* Progress as a test-suite bar: segments pass as you go. */}
      <div className="mt-3 flex gap-1">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
              i + 1 < step
                ? "bg-added"
                : i + 1 === step
                  ? "bg-kw"
                  : "bg-rule-strong"
            }`}
          />
        ))}
      </div>

      <div key={step} className="rise mt-8 flex flex-1 flex-col">
        {step === 1 && (
          <Step title="What should we call you?" hint="shows on your PR">
            <Field
              token="name"
              value={answers.name}
              onChange={(v) => set({ name: v })}
              placeholder="ada lovelace"
              autoFocus
            />
          </Step>
        )}

        {step === 2 && (
          <Step
            title="Where do you ship from?"
            hint="school or campus — optional, but it unlocks local matches"
          >
            <Field
              token="campus"
              value={answers.school}
              onChange={(v) => set({ school: v })}
              placeholder="UT Austin"
              autoFocus
            />
          </Step>
        )}

        {step === 3 && (
          <Step
            title="Which agents are in your daily stack?"
            hint="pick every tool you actually open"
          >
            <div className="flex flex-col gap-1.5">
              {AGENTS.map((agent) => {
                const on = answers.preferredAgents.includes(agent.id);
                return (
                  <Choice
                    key={agent.id}
                    on={on}
                    multi
                    icon={<AgentLogo agentId={agent.id} className="h-5 w-5" />}
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
          </Step>
        )}

        {step === 4 && (
          <Step
            title="What's your model mix?"
            hint="rough share of coding work by family"
          >
            <div className="flex flex-col gap-1.5">
              {MODEL_PRESETS.map((preset) => {
                const on =
                  Math.abs(preset.mix.opus - answers.modelMix.opus) < 0.02 &&
                  Math.abs(preset.mix.gpt - answers.modelMix.gpt) < 0.02 &&
                  Math.abs(preset.mix.gemini - answers.modelMix.gemini) < 0.02;
                return (
                  <Choice
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
                    onClick={() => set({ modelMix: preset.mix })}
                  />
                );
              })}
            </div>
            <div className="mt-4 space-y-2">
              <MixBar label="opus" value={answers.modelMix.opus} color="#D97757" />
              <MixBar label="gpt" value={answers.modelMix.gpt} color="#10A37F" />
              <MixBar
                label="gemini"
                value={answers.modelMix.gemini}
                color="#4285F4"
              />
            </div>
          </Step>
        )}

        {step === 5 && (
          <Step title="Typical token burn?" hint="be honest, the index knows">
            <div className="flex flex-col gap-1.5">
              {TOKEN_BURNS.map((burn) => (
                <Choice
                  key={burn.id}
                  on={answers.typicalTokenBurn === burn.id}
                  icon={
                    <span className="flex h-5 w-8 items-center justify-center rounded-xs border border-rule-strong bg-inset text-[9px] text-ink-3">
                      {burn.id.slice(0, 3)}
                    </span>
                  }
                  label={burn.label}
                  hint={burn.hint}
                  onClick={() =>
                    set({ typicalTokenBurn: burn.id as TokenBurnBand })
                  }
                />
              ))}
            </div>
          </Step>
        )}

        {step === 6 && (
          <Step
            title="Drop your hottest take."
            hint="this ships as your commit message"
          >
            <div className="rounded-sm border border-rule bg-inset px-3 py-2.5 transition-colors duration-150 focus-within:border-fn/50">
              <Label>commit message</Label>
              <textarea
                autoFocus
                value={answers.bio}
                onChange={(e) => set({ bio: e.target.value })}
                placeholder="good code is poetry. great code is a love letter to the future."
                rows={3}
                className="mt-1.5 w-full resize-none bg-transparent text-[12.5px] leading-relaxed text-ink placeholder:text-ink-4 focus:outline-none focus-visible:shadow-none"
              />
            </div>
          </Step>
        )}

        <div className="mt-auto pt-8">
          {/* The file being authored, updating on every answer. */}
          <Panel filename="fingerprint.ts" modified className="mb-4">
            <CodePane
              rows={draftFingerprint(answers)}
              textSize="text-[10px]"
            />
          </Panel>

          {error && (
            <p role="alert" className="mb-3 text-[11px] text-deleted">
              {error}
            </p>
          )}
          <Button
            size="lg"
            onClick={() => void next()}
            disabled={!canContinue() || saving}
            className="w-full"
          >
            {step === TOTAL_STEPS
              ? saving
                ? "committing…"
                : "Commit fingerprint"
              : "Continue"}
          </Button>
          {step > 1 && (
            <Button
              variant="quiet"
              size="sm"
              onClick={() => setStep(step - 1)}
              className="mt-2 w-full"
            >
              ← back
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}

function Step({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="text-[19px] font-semibold leading-snug tracking-[-0.02em] text-ink">
        {title}
      </h1>
      {hint && <p className="mt-1.5 text-[11.5px] text-ink-3">{hint}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}

/** A text field that reads as the key it's setting in the file. */
function Field({
  token,
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  token: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoFocus?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-sm border border-rule bg-inset px-3 transition-colors duration-150 focus-within:border-fn/50">
      <span className="shrink-0 text-[12.5px] text-cmt">{token}:</span>
      <input
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent py-3 text-[12.5px] text-str placeholder:text-ink-4 focus:outline-none focus-visible:shadow-none"
      />
    </div>
  );
}

function Choice({
  on,
  multi = false,
  icon,
  label,
  hint,
  onClick,
}: {
  on: boolean;
  multi?: boolean;
  icon?: React.ReactNode;
  label: string;
  hint?: string;
  onClick: () => void;
}) {
  const glyph = multi ? (on ? "[x]" : "[ ]") : on ? "(o)" : "( )";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`flex items-center gap-3 rounded-sm border px-3 py-3 text-left transition-colors duration-150 ${
        on
          ? "border-kw/50 bg-kw/8"
          : "border-rule bg-panel hover:border-rule-strong hover:bg-raised"
      }`}
    >
      <span
        className={`shrink-0 text-[12px] ${on ? "text-kw" : "text-ink-4"}`}
      >
        {glyph}
      </span>
      {icon}
      <span className="min-w-0 flex-1">
        <span className="block text-[12.5px] text-ink">{label}</span>
        {hint && (
          <span className="mt-0.5 block text-[10px] text-ink-3">{hint}</span>
        )}
      </span>
    </button>
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
      <span className="w-12 text-[10px] text-cmt">{label}</span>
      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-inset">
        <span
          className="block h-full rounded-full transition-[width] duration-200 ease-[var(--ease-out)]"
          style={{ width: `${value * 100}%`, background: color }}
        />
      </span>
      <span className="w-8 text-right text-[10px] text-ink-3">
        {Math.round(value * 100)}%
      </span>
    </div>
  );
}
