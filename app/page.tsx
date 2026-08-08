import { CodePane } from "@/components/CodePane";
import { BracketHeart, CheckCircleIcon } from "@/components/icons";
import { ButtonLink } from "@/components/ui";
import { HERO_SNIPPET } from "@/lib/swender";

/** Promises worth making on a landing screen: the ones from features.md. */
const GUARANTEES = [
  ".edu verified before any match",
  "three open threads, hard cap",
  "no public scores, no who-viewed-you",
];

export default function Landing() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-10">
      <div className="flex items-center gap-2.5">
        <BracketHeart className="h-5 w-10 text-ink-3" />
        <p className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
          SWEnder<span className="caret ml-0.5 h-[15px] align-[-2px]" />
        </p>
      </div>

      <h1 className="rise mt-12 text-[30px] font-semibold leading-[1.12] tracking-[-0.035em] text-ink">
        find your
        <br />
        compile-time <span className="text-kw">match</span>
      </h1>
      <p className="mt-3.5 max-w-72 text-[12px] leading-relaxed text-ink-3">
        Dating for CS students, matched on the thing you actually spend your
        nights with: your AI coding fingerprint.
      </p>

      <section className="rise mt-9 overflow-hidden rounded-md border border-rule bg-panel">
        <header className="flex h-9 items-center gap-2 border-b border-rule bg-raised px-3">
          <span className="h-1.5 w-1.5 rounded-full bg-added" />
          <span className="text-[11px] text-ink-2">zsh — ~/swender</span>
        </header>
        <CodePane rows={HERO_SNIPPET} gutter={false} className="py-2" />
      </section>

      <ul className="mt-7 space-y-2">
        {GUARANTEES.map((g) => (
          <li key={g} className="flex items-center gap-2 text-[11px] text-ink-3">
            <CheckCircleIcon className="h-3.5 w-3.5 shrink-0 text-added" />
            {g}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-9">
        <ButtonLink href="/onboarding" size="lg" className="w-full">
          Get started
        </ButtonLink>
        <ButtonLink
          href="/sign-in"
          variant="quiet"
          size="md"
          className="mt-1.5 w-full"
        >
          I already have an account
        </ButtonLink>
      </div>
    </main>
  );
}
