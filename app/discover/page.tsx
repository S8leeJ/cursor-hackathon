"use client";

import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { DEMO_PROFILES, saveLike } from "@/lib/swender";

export default function Discover() {
  const [index, setIndex] = useState(0);
  const [exiting, setExiting] = useState<"left" | "right" | null>(null);
  const profile = DEMO_PROFILES[index % DEMO_PROFILES.length];

  const swipe = (liked: boolean) => {
    if (exiting) return;
    if (liked) saveLike(profile.id);
    setExiting(liked ? "right" : "left");
    setTimeout(() => {
      setExiting(null);
      setIndex((i) => i + 1);
    }, 250);
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <main className="flex flex-1 flex-col px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-4xl text-ink">Discover</h1>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line-bright text-rose"
            aria-label="Filters"
          >
            ⚙
          </button>
        </div>

        {/* Profile card */}
        <div
          key={profile.id + index}
          className={`relative mt-5 flex flex-1 flex-col overflow-hidden rounded-3xl border border-line bg-gradient-to-b ${profile.gradient} transition-all duration-250 ${
            exiting === "left"
              ? "-translate-x-full rotate-[-8deg] opacity-0"
              : exiting === "right"
                ? "translate-x-full rotate-[8deg] opacity-0"
                : "float-up"
          }`}
        >
          {/* Story-style progress segments */}
          <div className="flex gap-1.5 px-4 pt-4">
            {DEMO_PROFILES.map((_, i) => (
              <span
                key={i}
                className={`h-1 flex-1 rounded-full ${
                  i === index % DEMO_PROFILES.length ? "bg-rose" : "bg-white/15"
                }`}
              />
            ))}
          </div>

          {/* Placeholder "photo" */}
          <div className="flex flex-1 items-center justify-center">
            <div className="flex h-32 w-32 items-center justify-center rounded-full border border-line-bright bg-black/30 font-serif text-6xl text-blush shadow-[0_0_60px_rgba(201,85,107,0.2)]">
              {profile.initial}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-5 pb-6 pt-10">
            <p className="font-serif text-4xl text-ink">
              {profile.name}, {profile.age}{" "}
              <span className="text-lg text-rose align-middle">✔</span>
            </p>
            <span className="inline-block rounded-full bg-wine px-3.5 py-1.5 text-xs font-medium text-ink">
              {profile.personaEmoji} {profile.persona}
            </span>
            <div className="flex flex-wrap gap-2">
              {profile.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs text-ink"
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="rounded-xl border border-white/10 bg-black/50 px-4 py-3">
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-rose">
                ❝ hot take
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink/90">
                {profile.hotTake}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-center gap-6">
          <ActionButton label="Pass" onClick={() => swipe(false)}>
            ✕
          </ActionButton>
          <ActionButton label="Super like" onClick={() => swipe(true)}>
            ✦
          </ActionButton>
          <button
            type="button"
            aria-label="Like"
            onClick={() => swipe(true)}
            className="flex h-18 w-18 items-center justify-center rounded-full bg-wine text-2xl text-ink shadow-[0_0_30px_rgba(124,29,49,0.5)] transition hover:bg-wine-hover"
          >
            ♥
          </button>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-14 w-14 items-center justify-center rounded-full border border-line-bright text-xl text-muted transition hover:border-rose hover:text-rose"
    >
      {children}
    </button>
  );
}
