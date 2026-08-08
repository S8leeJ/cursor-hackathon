"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { DEMO_PROFILES, loadLikes, type DemoProfile } from "@/lib/swender";

const OPENERS: Record<string, string> = {
  alex: "are you a segfault? because I can't stop thinking about you",
  sam: ":wq — that's me exiting every convo that isn't with you",
  riley: "I'd resolve merge conflicts with you any day",
  jordan: "my heart scales horizontally for you",
  casey: "force-pushed you straight to my main branch",
};

export default function Messages() {
  const [convos, setConvos] = useState<DemoProfile[]>([]);

  useEffect(() => {
    const likes = loadLikes();
    setConvos(DEMO_PROFILES.filter((p) => likes.includes(p.id)));
  }, []);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <main className="flex-1 px-5 pt-6 pb-4">
        <h1 className="font-serif text-4xl text-ink">Messages</h1>

        {convos.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <p className="font-mono text-5xl text-line-bright">✉</p>
            <p className="mt-4 max-w-60 text-sm text-muted">
              Inbox zero — but not the good kind. Match with someone first.
            </p>
            <Link
              href="/discover"
              className="mt-6 rounded-full bg-wine px-8 py-3 text-sm font-semibold text-ink transition hover:bg-wine-hover"
            >
              ♥ Find matches
            </Link>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-2">
            {convos.map((p, i) => (
              <button
                key={p.id}
                type="button"
                className="float-up flex items-center gap-4 rounded-2xl border border-line bg-card px-4 py-3.5 text-left transition hover:border-line-bright"
              >
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line-bright bg-gradient-to-b ${p.gradient} font-serif text-xl text-blush`}
                >
                  {p.initial}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between">
                    <span className="font-serif text-lg text-ink">
                      {p.name}
                    </span>
                    <span className="font-mono text-[10px] text-faint">
                      {i + 1}m
                    </span>
                  </span>
                  <span className="block truncate text-sm text-muted">
                    {OPENERS[p.id] ?? "hey :)"}
                  </span>
                </span>
                <span className="h-2 w-2 shrink-0 rounded-full bg-rose" />
              </button>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
