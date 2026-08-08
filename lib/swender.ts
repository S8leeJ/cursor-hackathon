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

/** [tokenKind, text] — rendered with syntax colors by CodePicture. */
export type CodeToken = [string, string];
export type CodeLine = CodeToken[];

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

const GRADIENTS = [
  "from-[#2a0f16] via-[#1c0b12] to-[#0e050a]",
  "from-[#1a0e20] via-[#140a16] to-[#0d0610]",
  "from-[#20130a] via-[#180e08] to-[#0e0805]",
  "from-[#0e1a1c] via-[#0a1213] to-[#060c0d]",
  "from-[#1c0a14] via-[#150810] to-[#0e050a]",
  "from-[#12181f] via-[#0d1218] to-[#070a0e]",
];

export function gradientForId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash + id.charCodeAt(i) * (i + 1)) % GRADIENTS.length;
  }
  return GRADIENTS[hash] ?? GRADIENTS[0]!;
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
export function snippetForProfile(profile: {
  name: string;
  preferredAgents: string[];
  modelMix: ModelMix;
  typicalTokenBurn: TokenBurnBand;
}): CodeLine[] {
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
    [
      ["kw", "const"],
      ["plain", ` ${handle} = {`],
    ],
    [["plain", "  agents: ["], ...agentTokens, ["plain", "],"]],
    [
      ["plain", "  model: "],
      ["str", `"${model.toLowerCase()}"`],
      ["plain", ", "],
      ["cmt", `// ${pct}%`],
    ],
    [
      ["plain", "  burn: "],
      ["str", `"${profile.typicalTokenBurn}"`],
      ["plain", ","],
    ],
    [
      ["plain", "} "],
      ["kw", "satisfies"],
      ["plain", " "],
      ["type", "Fingerprint"],
      ["plain", ";"],
    ],
  ];
}

export function snippetFilename(name: string): string {
  return `${handleFor(name)}.fingerprint.ts`;
}

export const HERO_SNIPPET: CodeLine[] = [
  [
    ["cmt", "$ "],
    ["plain", "git commit -m "],
    ["str", '"feat: fell in love"'],
  ],
  [["cmt", "2 hearts changed, 0 regressions"]],
  [
    ["kw", "+ "],
    ["plain", "you"],
  ],
  [
    ["kw", "+ "],
    ["plain", "me"],
  ],
  [
    ["cmt", "$ "],
    ["plain", "git push origin "],
    ["type", "forever"],
  ],
];
