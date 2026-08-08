"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  DEFAULT_ANSWERS,
  IDES,
  LANGUAGES,
  type OnboardingAnswers,
  saveAnswers,
} from "@/lib/swender";

const TOTAL_STEPS = 7;

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<OnboardingAnswers>(DEFAULT_ANSWERS);

  const set = (patch: Partial<OnboardingAnswers>) =>
    setAnswers((a) => ({ ...a, ...patch }));

  const canContinue = () => {
    switch (step) {
      case 1:
        return answers.name.trim().length > 0;
      case 2:
        return answers.age !== "";
      case 3:
        return answers.ide !== "";
      case 4:
        return answers.languages.length > 0;
      case 5:
        return answers.tabsOrSpaces !== "";
      case 6:
        return answers.workStyle !== "";
      case 7:
        return answers.hotTake.trim().length > 0;
      default:
        return false;
    }
  };

  const next = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      saveAnswers(answers);
      router.push("/wrapped");
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-rose">❤</span>
        <span className="font-serif text-2xl text-ink">SWEnder</span>
      </div>

      {/* Progress */}
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

      {/* Heart divider */}
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
          <StepShell title={<>How many <Rose>versions</Rose> old are you?</>}>
            <OptionList
              options={["18–22", "23–26", "27–30", "31+"].map((l) => ({
                id: l,
                label: l,
              }))}
              selected={answers.age}
              onSelect={(id) => set({ age: id })}
            />
          </StepShell>
        )}

        {step === 3 && (
          <StepShell title={<>What&apos;s your daily driver <Rose>IDE</Rose>?</>}>
            <OptionList
              options={IDES.map((i) => ({
                id: i.id,
                label: i.label,
                icon: i.icon,
              }))}
              selected={answers.ide}
              onSelect={(id) => set({ ide: id })}
            />
          </StepShell>
        )}

        {step === 4 && (
          <StepShell
            title={<>Which <Rose>languages</Rose> do you speak?</>}
            subtitle="Pick as many as you like."
          >
            <div className="flex flex-wrap gap-2.5">
              {LANGUAGES.map((lang) => {
                const on = answers.languages.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() =>
                      set({
                        languages: on
                          ? answers.languages.filter((l) => l !== lang)
                          : [...answers.languages, lang],
                      })
                    }
                    className={`rounded-full border px-4 py-2.5 text-sm transition ${
                      on
                        ? "border-rose bg-wine/40 text-ink"
                        : "border-line bg-card text-muted hover:border-line-bright"
                    }`}
                  >
                    {lang}
                  </button>
                );
              })}
            </div>
          </StepShell>
        )}

        {step === 5 && (
          <StepShell title={<><Rose>Tabs</Rose> or <Rose>spaces</Rose>?</>}>
            <OptionList
              options={[
                { id: "tabs", label: "Tabs", icon: "⇥" },
                { id: "spaces", label: "Spaces", icon: "␣" },
                { id: "prettier", label: "Whatever Prettier says", icon: "✨" },
              ]}
              selected={answers.tabsOrSpaces}
              onSelect={(id) => set({ tabsOrSpaces: id })}
            />
          </StepShell>
        )}

        {step === 6 && (
          <StepShell title={<>Where do you <Rose>ship</Rose> from?</>}>
            <OptionList
              options={[
                { id: "remote", label: "Fully remote", icon: "🌍" },
                { id: "hybrid", label: "Hybrid", icon: "🔀" },
                { id: "office", label: "In office", icon: "🏢" },
                { id: "cafe", label: "Coffee shop nomad", icon: "☕" },
              ]}
              selected={answers.workStyle}
              onSelect={(id) => set({ workStyle: id })}
            />
            <div className="mt-8">
              <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted">
                night-owl energy: {answers.nightOwl}%
              </p>
              <input
                type="range"
                min={0}
                max={100}
                value={answers.nightOwl}
                onChange={(e) => set({ nightOwl: Number(e.target.value) })}
                className="w-full accent-[#c9556b]"
              />
              <div className="mt-1 flex justify-between font-mono text-[10px] text-faint">
                <span>9-to-5</span>
                <span>3am pusher</span>
              </div>
            </div>
          </StepShell>
        )}

        {step === 7 && (
          <StepShell
            title={<>Drop your hottest <Rose>take</Rose>.</>}
            subtitle="This goes on your card. Make it count."
          >
            <textarea
              autoFocus
              value={answers.hotTake}
              onChange={(e) => set({ hotTake: e.target.value })}
              placeholder="e.g. Good code is poetry. Great code is a love letter to the future."
              rows={4}
              className="w-full resize-none rounded-2xl border border-line bg-card px-5 py-4 text-ink placeholder:text-faint focus:border-rose focus:outline-none"
            />
          </StepShell>
        )}

        <div className="mt-auto pt-8">
          <button
            type="button"
            onClick={next}
            disabled={!canContinue()}
            className="w-full rounded-full bg-wine py-4 text-base font-semibold text-ink transition enabled:hover:bg-wine-hover disabled:opacity-40"
          >
            {step === TOTAL_STEPS ? "Reveal my persona" : "Continue →"}
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
  options: { id: string; label: string; icon?: string }[];
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
            <span className="flex-1 text-ink">{opt.label}</span>
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
