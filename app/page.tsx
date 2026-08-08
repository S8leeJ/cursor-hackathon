import Link from "next/link";

const FLOATERS = [
  { symbol: "</>", top: "8%", left: "10%" },
  { symbol: "♥", top: "14%", left: "78%" },
  { symbol: "{ }", top: "34%", left: "6%" },
  { symbol: "♥", top: "28%", left: "48%" },
  { symbol: "=>", top: "12%", left: "42%" },
  { symbol: "♥", top: "44%", left: "86%" },
  { symbol: "git", top: "50%", left: "30%" },
  { symbol: "♥", top: "58%", left: "62%" },
];

export default function Landing() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-6 py-14 text-center">
      <p className="font-serif text-3xl tracking-wide text-ink">
        {"{"}
        <span className="mx-1 text-rose">♥</span>
        {"}"}
      </p>
      <h1 className="mt-2 font-serif text-5xl text-ink">SWEnder</h1>

      <h2 className="mt-10 font-serif text-4xl leading-tight text-ink float-up">
        Find your
        <br />
        compile-time <span className="italic text-rose">match</span>
      </h2>
      <p className="mt-3 text-sm text-muted">Dating for people who ship.</p>

      {/* Decorative hero: two devs, one glowing terminal */}
      <div className="relative mt-10 w-full flex-1 overflow-hidden rounded-3xl border border-line bg-gradient-to-b from-[#1d0b11] via-[#2a0f18] to-[#12060a]">
        {FLOATERS.map((f, i) => (
          <span
            key={i}
            className="absolute font-mono text-xs text-rose/40"
            style={{ top: f.top, left: f.left }}
          >
            {f.symbol}
          </span>
        ))}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-8">
          <div className="rounded-lg border border-line-bright bg-black/60 px-5 py-4 font-mono text-[11px] leading-relaxed text-blush shadow-[0_0_40px_rgba(201,85,107,0.25)]">
            <p className="text-faint">$ git commit -m</p>
            <p>&quot;feat: fell in love&quot;</p>
            <p className="mt-1 text-faint">2 hearts changed,</p>
            <p className="text-faint">0 regressions</p>
          </div>
          <p className="mt-5 font-serif text-lg italic text-blush/80">
            pair programming, but forever
          </p>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(124,29,49,0.35),transparent_60%)]" />
      </div>

      <Link
        href="/onboarding"
        className="mt-8 block w-full rounded-full bg-wine py-4 text-base font-semibold text-ink transition hover:bg-wine-hover"
      >
        Get started
      </Link>
      <Link
        href="/sign-in"
        className="mt-4 text-sm text-muted transition hover:text-blush"
      >
        I already have an account
      </Link>
    </main>
  );
}
