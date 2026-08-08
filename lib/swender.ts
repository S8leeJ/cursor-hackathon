export type ModelMix = {
  opus: number;
  gpt: number;
  gemini: number;
};

export type TokenBurnBand = "low" | "medium" | "high" | "extreme";

export type OnboardingAnswers = {
  name: string;
  school: string;
  bio: string;
  preferredAgents: string[];
  modelMix: ModelMix;
  typicalTokenBurn: TokenBurnBand | "";
};

export type Persona = {
  title: string;
  tagline: string;
};

/** [tokenKind, text] — rendered with syntax colors by CodePane. */
export type CodeToken = [string, string];
export type CodeLine = CodeToken[];

/** A source line, optionally staged as an added/removed diff line. */
export type CodeRow = { tokens: CodeLine; mark?: "add" | "del" };

export type CheckStatus = "pass" | "pending" | "fail";
export type Check = { name: string; status: CheckStatus; detail: string };

export const AGENTS = [
  { id: "cursor", label: "Cursor" },
  { id: "claude_code", label: "Claude Code" },
  { id: "copilot", label: "Copilot" },
] as const;

export const TOKEN_BURNS: {
  id: TokenBurnBand;
  label: string;
  hint: string;
}[] = [
  { id: "low", label: "Low", hint: "light / occasional (~<50k/day)" },
  { id: "medium", label: "Medium", hint: "regular daily (~50–200k)" },
  { id: "high", label: "High", hint: "agent-native (~200k–1M)" },
  { id: "extreme", label: "Extreme", hint: "context-window athlete (~>1M)" },
];

export const MODEL_PRESETS: { id: string; label: string; mix: ModelMix }[] = [
  {
    id: "opus_heavy",
    label: "Opus-forward",
    mix: { opus: 0.7, gpt: 0.2, gemini: 0.1 },
  },
  {
    id: "balanced",
    label: "Balanced",
    mix: { opus: 0.34, gpt: 0.33, gemini: 0.33 },
  },
  {
    id: "gpt_heavy",
    label: "GPT-forward",
    mix: { opus: 0.2, gpt: 0.65, gemini: 0.15 },
  },
  {
    id: "gemini_heavy",
    label: "Gemini-curious",
    mix: { opus: 0.25, gpt: 0.25, gemini: 0.5 },
  },
];

export const DEFAULT_ANSWERS: OnboardingAnswers = {
  name: "",
  school: "",
  bio: "",
  preferredAgents: [],
  modelMix: { opus: 0.4, gpt: 0.35, gemini: 0.25 },
  typicalTokenBurn: "",
};

export function agentLabel(id: string): string {
  return AGENTS.find((a) => a.id === id)?.label ?? id;
}

export function burnLabel(band: TokenBurnBand): string {
  return TOKEN_BURNS.find((b) => b.id === band)?.label ?? band;
}

export function computePersona(a: {
  preferredAgents: string[];
  modelMix: ModelMix;
  typicalTokenBurn: TokenBurnBand;
}): Persona {
  if (a.typicalTokenBurn === "extreme") {
    return {
      title: "Context Window Athlete",
      tagline:
        "You burn tokens like it's cardio and still ask for one more turn.",
    };
  }
  if (a.preferredAgents.includes("claude_code") && a.modelMix.opus >= 0.5) {
    return {
      title: "Terminal Romantic",
      tagline:
        "You build in the dark, with Opus in one pane and love in every commit.",
    };
  }
  if (a.preferredAgents.includes("cursor") && a.typicalTokenBurn === "high") {
    return {
      title: "Agent-Native Sweetheart",
      tagline: "Tab, accept, ship. Your love language is a green diff.",
    };
  }
  if (a.modelMix.gpt >= 0.5) {
    return {
      title: "Merge Conflict Menace",
      tagline: "Decisive, autocomplete-fluent, and impossible to rebase onto.",
    };
  }
  if (a.typicalTokenBurn === "low") {
    return {
      title: "Async Admirer",
      tagline: "Slow to reply, quick to fall. Your prompts ship in batches.",
    };
  }
  return {
    title: "Compile-Time Twin",
    tagline: "Similar agents, similar burn — pair-programming chemistry unlocked.",
  };
}

/** Deterministic 32-bit hash — everything cosmetic keyed off an id uses this. */
function hash(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Identity colors come from the syntax palette, so a person's accent reads as
 * a token type rather than as decoration.
 */
const IDENTITY_COLORS = [
  "var(--fn)",
  "var(--type)",
  "var(--num)",
  "var(--str)",
  "var(--kw)",
  "var(--added)",
];

export function accentForId(id: string): string {
  return IDENTITY_COLORS[hash(id) % IDENTITY_COLORS.length]!;
}

/** A GitHub-style identicon: the native avatar of someone with no photo. */
export function identiconFor(id: string): boolean[][] {
  const h = hash(id);
  const grid: boolean[][] = [];
  for (let row = 0; row < 5; row++) {
    const cells: boolean[] = [];
    for (let col = 0; col < 3; col++) {
      cells.push(((h >>> (row * 3 + col)) & 1) === 1);
    }
    grid.push([cells[0]!, cells[1]!, cells[2]!, cells[1]!, cells[0]!]);
  }
  return grid;
}

/** Stable PR number so the same person is always the same pull request. */
export function prNumberFor(id: string): number {
  return (hash(id) % 900) + 100;
}

export function shortHashFor(id: string): string {
  return hash(id).toString(16).padStart(8, "0").slice(0, 7);
}

/** Deterministic relative time — keeps the log looking lived-in. */
export function stableAgo(id: string): string {
  const buckets = ["4m", "22m", "1h", "3h", "6h", "9h", "1d", "2d"];
  return buckets[hash(id) % buckets.length]!;
}

/**
 * Match confidence as a CI check run. A naked "87% fit" tells you nothing;
 * three named checks tell you *what* matched.
 */
export function checksForProfile(profile: {
  _id: string;
  matchScore: number;
  preferredAgents: string[];
  typicalTokenBurn: TokenBurnBand;
}): Check[] {
  const h = hash(profile._id);
  const fit = Math.round(profile.matchScore * 100);
  const overlapHours = 2 + (h % 5);
  const sharedAgents = profile.preferredAgents.length;

  return [
    {
      name: "fingerprint/similarity",
      status: fit >= 55 ? "pass" : "pending",
      detail: `${fit}%`,
    },
    {
      name: "schedule/overlap",
      status: overlapHours >= 3 ? "pass" : "pending",
      detail: `${overlapHours}h/wk`,
    },
    {
      name: "stack/compatible",
      status: sharedAgents > 0 ? "pass" : "fail",
      detail: sharedAgents > 1 ? `${sharedAgents} agents` : "1 agent",
    },
  ];
}

export function dominantModel(mix: ModelMix): string {
  const entries: [string, number][] = [
    ["Opus", mix.opus],
    ["GPT", mix.gpt],
    ["Gemini", mix.gemini],
  ];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0]![0];
}

export type Chip =
  | { kind: "agent"; label: string; agentId: string }
  | { kind: "model"; label: string }
  | { kind: "burn"; label: string }
  | { kind: "school"; label: string };

/** Fingerprint rendered as labelled chips so each can carry its own logo. */
export function fingerprintChips(profile: {
  preferredAgents: string[];
  modelMix: ModelMix;
  typicalTokenBurn: TokenBurnBand;
  school?: string;
}): Chip[] {
  const chips: Chip[] = profile.preferredAgents.map((id) => ({
    kind: "agent" as const,
    label: agentLabel(id),
    agentId: id,
  }));
  chips.push({ kind: "model", label: dominantModel(profile.modelMix) });
  chips.push({
    kind: "burn",
    label: `${burnLabel(profile.typicalTokenBurn)} burn`,
  });
  if (profile.school) {
    chips.push({ kind: "school", label: profile.school });
  }
  return chips;
}

function handleFor(name: string): string {
  const handle = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 12);
  return handle || "dev";
}

/**
 * A profile's fingerprint rendered as source code. Used as the card visual
 * when a profile has no avatar to show.
 */
export function handleOf(name: string): string {
  return handleFor(name);
}

/**
 * The fingerprint rendered as a staged diff — the two lines that actually
 * decide compatibility are the added ones, so the eye lands there first.
 */
export function snippetForProfile(profile: {
  name: string;
  preferredAgents: string[];
  modelMix: ModelMix;
  typicalTokenBurn: TokenBurnBand;
}): CodeRow[] {
  const handle = handleFor(profile.name);
  const model = dominantModel(profile.modelMix);
  const pct = Math.round(
    Math.max(profile.modelMix.opus, profile.modelMix.gpt, profile.modelMix.gemini) *
      100,
  );

  const agentTokens: CodeToken[] = [];
  profile.preferredAgents.slice(0, 2).forEach((id, i) => {
    if (i > 0) agentTokens.push(["plain", ", "]);
    agentTokens.push(["str", `"${id}"`]);
  });

  return [
    {
      tokens: [
        ["kw", "export const"],
        ["plain", " "],
        ["fn", handle],
        ["plain", " = {"],
      ],
    },
    { tokens: [["plain", "  agents: ["], ...agentTokens, ["plain", "],"]] },
    {
      mark: "add",
      tokens: [
        ["plain", "  model: "],
        ["str", `"${model.toLowerCase()}"`],
        ["plain", ", "],
        ["cmt", `// ${pct}%`],
      ],
    },
    {
      mark: "add",
      tokens: [
        ["plain", "  burn: "],
        ["str", `"${profile.typicalTokenBurn}"`],
        ["plain", ","],
      ],
    },
    {
      tokens: [
        ["plain", "} "],
        ["kw", "satisfies"],
        ["plain", " "],
        ["type", "Fingerprint"],
        ["plain", ";"],
      ],
    },
  ];
}

export function snippetFilename(name: string): string {
  return `${handleFor(name)}.fingerprint.ts`;
}

/** Live preview of the file onboarding is writing, answer by answer. */
export function draftFingerprint(a: OnboardingAnswers): CodeRow[] {
  const handle = handleFor(a.name) || "you";
  const model = dominantModel(a.modelMix);
  const agentTokens: CodeToken[] = [];
  a.preferredAgents.slice(0, 2).forEach((id, i) => {
    if (i > 0) agentTokens.push(["plain", ", "]);
    agentTokens.push(["str", `"${id}"`]);
  });

  return [
    {
      tokens: [
        ["kw", "export const"],
        ["plain", " "],
        ["fn", handle],
        ["plain", " = {"],
      ],
    },
    {
      mark: a.school ? "add" : undefined,
      tokens: a.school
        ? [["plain", "  campus: "], ["str", `"${a.school}"`], ["plain", ","]]
        : [["cmt", "  // campus: pending"]],
    },
    {
      mark: a.preferredAgents.length ? "add" : undefined,
      tokens: a.preferredAgents.length
        ? [["plain", "  agents: ["], ...agentTokens, ["plain", "],"]]
        : [["cmt", "  // agents: pending"]],
    },
    {
      mark: "add",
      tokens: [
        ["plain", "  model: "],
        ["str", `"${model.toLowerCase()}"`],
        ["plain", ","],
      ],
    },
    {
      mark: a.typicalTokenBurn ? "add" : undefined,
      tokens: a.typicalTokenBurn
        ? [["plain", "  burn: "], ["str", `"${a.typicalTokenBurn}"`], ["plain", ","]]
        : [["cmt", "  // burn: pending"]],
    },
    {
      tokens: [
        ["plain", "} "],
        ["kw", "satisfies"],
        ["plain", " "],
        ["type", "Fingerprint"],
        ["plain", ";"],
      ],
    },
  ];
}

/** The landing hero: a commit that actually says what the product does. */
export const HERO_SNIPPET: CodeRow[] = [
  {
    tokens: [
      ["cmt", "$ "],
      ["plain", "git checkout -b "],
      ["type", "feat/us"],
    ],
  },
  { tokens: [["cmt", "Switched to a new branch 'feat/us'"]] },
  { mark: "add", tokens: [["plain", "you"]] },
  { mark: "add", tokens: [["plain", "me"]] },
  { tokens: [["cmt", "2 files changed, 0 regressions"]] },
  {
    tokens: [
      ["cmt", "$ "],
      ["plain", "git push origin "],
      ["type", "forever"],
    ],
  },
];
