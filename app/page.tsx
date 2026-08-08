import Link from "next/link";
import { CodePicture } from "@/components/CodePicture";
import { BracketHeart, HeartIcon } from "@/components/icons";
import { HERO_SNIPPET } from "@/lib/swender";

const FLOATERS = [
  { symbol: "</>", top: "10%", left: "12%" },
  { symbol: "<3", top: "16%", left: "76%" },
  { symbol: "{ }", top: "38%", left: "8%" },
  { symbol: "=>", top: "8%", left: "44%" },
  { symbol: "&&", top: "30%", left: "60%" },
  { symbol: "<3", top: "46%", left: "84%" },
  { symbol: "git", top: "52%", left: "26%" },
];

export default function Landing() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-6 py-12 text-center">
      <BracketHeart className="h-8 w-16 text-ink" />
      <h1 className="mt-3 font-serif text-5xl tracking-tight text-ink">
        Token Twin
      </h1>

      <h2 className="mt-10 font-serif text-[2.6rem] leading-[1.15] text-ink float-up">
        Find your
        <br />
        compile-time <span className="italic text-rose">match</span>
      </h2>
      <p className="mt-4 text-[13px] leading-relaxed tracking-wide text-muted">
        Match college SEs by AI coding fingerprint.
      </p>

      {/* Hero: terminal love letter */}
      <div className="relative mt-10 flex w-full flex-1 flex-col justify-end overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-[#1d0b11] via-[#160910] to-[#0e0509] px-6 pb-7 pt-16">
        {FLOATERS.map((f, i) => (
          <span
            key={i}
            className="absolute text-[11px] text-rose/35"
            style={{ top: f.top, left: f.left }}
          >
            {f.symbol}
          </span>
        ))}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_110%,rgba(124,29,49,0.4),transparent_65%)]" />

        <CodePicture
          filename="~/love — zsh"
          lines={HERO_SNIPPET}
          className="relative mx-auto w-full max-w-72"
        />
        <p className="relative mt-5 font-serif text-lg italic text-blush/80">
          pair programming, but forever
        </p>
      </div>

      <Link
        href="/onboarding"
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-wine py-4 text-sm font-semibold tracking-wide text-ink transition hover:bg-wine-hover"
      >
        <HeartIcon filled className="h-4 w-4" />
        Get started
      </Link>
      <Link
        href="/sign-in"
        className="mt-4 text-xs tracking-wide text-muted underline-offset-4 transition hover:text-blush hover:underline"
      >
        I already have an account
      </Link>
    </main>
  );
}
