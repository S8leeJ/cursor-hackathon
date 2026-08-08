"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { DEMO_PROFILES, loadLikes, type DemoProfile } from "@/lib/swender";

export default function Matches() {
  const [matches, setMatches] = useState<DemoProfile[]>([]);

  useEffect(() => {
    const likes = loadLikes();
    setMatches(DEMO_PROFILES.filter((p) => likes.includes(p.id)));
  }, []);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <main className="flex-1 px-5 pt-6 pb-4">
        <h1 className="font-serif text-4xl text-ink">Matches</h1>
        <p className="mt-1 text-sm text-muted">
          {matches.length > 0
            ? "Merged without conflicts."
            : "No matches yet — go swipe."}
        </p>

        {matches.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <p className="font-mono text-5xl text-line-bright">{"{ }"}</p>
            <p className="mt-4 max-w-60 text-sm text-muted">
              Your matches array is empty. Time to iterate.
            </p>
            <Link
              href="/discover"
              className="mt-6 rounded-full bg-wine px-8 py-3 text-sm font-semibold text-ink transition hover:bg-wine-hover"
            >
              ♥ Start swiping
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4">
            {matches.map((p) => (
              <Link
                key={p.id}
                href="/messages"
                className={`float-up overflow-hidden rounded-2xl border border-line bg-gradient-to-b ${p.gradient}`}
              >
                <div className="flex h-36 items-center justify-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border border-line-bright bg-black/30 font-serif text-3xl text-blush">
                    {p.initial}
                  </span>
                </div>
                <div className="bg-black/50 px-3 py-3">
                  <p className="font-serif text-lg text-ink">
                    {p.name}, {p.age}
                  </p>
                  <p className="mt-0.5 truncate font-mono text-[10px] text-rose">
                    {p.personaEmoji} {p.persona}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
