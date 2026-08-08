"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import {
  computePersona,
  IDES,
  loadAnswers,
  type OnboardingAnswers,
} from "@/lib/swender";

export default function Profile() {
  const [answers, setAnswers] = useState<OnboardingAnswers | null | undefined>(
    undefined,
  );

  useEffect(() => {
    setAnswers(loadAnswers());
  }, []);

  if (answers === undefined) {
    return null;
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <main className="flex-1 px-5 pt-6 pb-4">
        <h1 className="font-serif text-4xl text-ink">Profile</h1>

        {answers === null ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <p className="font-mono text-5xl text-line-bright">👤</p>
            <p className="mt-4 max-w-60 text-sm text-muted">
              404: profile not found. Run the onboarding quiz to init.
            </p>
            <Link
              href="/onboarding"
              className="mt-6 rounded-full bg-wine px-8 py-3 text-sm font-semibold text-ink transition hover:bg-wine-hover"
            >
              Get started
            </Link>
          </div>
        ) : (
          <ProfileCard answers={answers} />
        )}
      </main>
      <BottomNav />
    </div>
  );
}

function ProfileCard({ answers }: { answers: OnboardingAnswers }) {
  const persona = computePersona(answers);
  const ide = IDES.find((i) => i.id === answers.ide);

  return (
    <div className="float-up mt-6">
      <div className="flex flex-col items-center rounded-3xl border border-line bg-card px-6 py-8 text-center">
        <span className="flex h-24 w-24 items-center justify-center rounded-full border border-line-bright bg-gradient-to-b from-[#2a0f16] to-[#12060a] font-serif text-4xl text-blush">
          {answers.name.charAt(0).toUpperCase() || "?"}
        </span>
        <p className="mt-4 font-serif text-3xl text-ink">
          {answers.name} <span className="align-middle text-base text-rose">✔</span>
        </p>
        <span className="mt-3 rounded-full bg-wine px-4 py-1.5 text-xs font-medium text-ink">
          {persona.title}
        </span>
        <p className="mt-3 max-w-64 text-sm leading-relaxed text-muted">
          {persona.tagline}
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-card px-5 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          your stack
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[...answers.languages, ...(ide ? [ide.label] : [])].map((t) => (
            <span
              key={t}
              className="rounded-full border border-line-bright px-3 py-1 text-xs text-ink"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-card px-5 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-rose">
          ❝ hot take
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink/90">
          {answers.hotTake}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl border border-line bg-card px-5 py-4">
        <p className="font-mono text-xs text-muted">night-owl energy</p>
        <p className="font-mono text-lg text-blush">
          {"{"} {answers.nightOwl}% {"}"}
        </p>
      </div>

      <div className="mt-6 flex gap-3">
        <Link
          href="/onboarding"
          className="flex-1 rounded-full border border-line-bright py-3 text-center text-sm text-blush transition hover:border-rose"
        >
          Edit profile
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
