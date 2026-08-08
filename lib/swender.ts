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
  emoji: string;
};

export const AGENTS = [
  { id: "cursor", label: "Cursor", icon: "⬛" },
  { id: "claude_code", label: "Claude Code", icon: "🟠" },
  { id: "copilot", label: "Copilot", icon: "🟦" },
] as const;

export const TOKEN_BURNS: {
  id: TokenBurnBand;
  label: string;
  hint: string;
}[] = [
  { id: "low", label: "Low", hint: "Light / occasional (~<50k/day)" },
  { id: "medium", label: "Medium", hint: "Regular daily (~50–200k)" },
  { id: "high", label: "High", hint: "Agent-native (~200k–1M)" },
  { id: "extreme", label: "Extreme", hint: "Context-window athlete (~>1M)" },
];

export const MODEL_PRESETS: { id: string; label: string; mix: ModelMix }[] = [
  { id: "opus_heavy", label: "Opus-forward", mix: { opus: 0.7, gpt: 0.2, gemini: 0.1 } },
  { id: "balanced", label: "Balanced", mix: { opus: 0.34, gpt: 0.33, gemini: 0.33 } },
  { id: "gpt_heavy", label: "GPT-forward", mix: { opus: 0.2, gpt: 0.65, gemini: 0.15 } },
  { id: "gemini_heavy", label: "Gemini-curious", mix: { opus: 0.25, gpt: 0.25, gemini: 0.5 } },
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
      tagline: "You burn tokens like it's cardio and still ask for one more turn.",
      emoji: "🔥",
    };
  }
  if (a.preferredAgents.includes("claude_code") && a.modelMix.opus >= 0.5) {
    return {
      title: "Terminal Romantic",
      tagline: "You build in the dark, with Opus in one pane and love in every commit.",
      emoji: "🖤",
    };
  }
  if (a.preferredAgents.includes("cursor") && a.typicalTokenBurn === "high") {
    return {
      title: "Agent-Native Sweetheart",
      tagline: "Tab, accept, ship. Your love language is a green diff.",
      emoji: "✦",
    };
  }
  if (a.modelMix.gpt >= 0.5) {
    return {
      title: "Merge Conflict Menace",
      tagline: "Decisive, autocomplete-fluent, and impossible to rebase onto.",
      emoji: "⚡",
    };
  }
  if (a.typicalTokenBurn === "low") {
    return {
      title: "Async Admirer",
      tagline: "Slow to reply, quick to fall. Your prompts ship in batches.",
      emoji: "🌙",
    };
  }
  return {
    title: "Compile-Time Twin",
    tagline: "Similar agents, similar burn — pair-programming chemistry unlocked.",
    emoji: "♥",
  };
}

const GRADIENTS = [
  "from-[#2a0f16] via-[#3d1420] to-[#12060a]",
  "from-[#1a0e20] via-[#2c1230] to-[#0d0610]",
  "from-[#20130a] via-[#33200e] to-[#100a05]",
  "from-[#0e1a1c] via-[#132b2c] to-[#060f10]",
  "from-[#1c0a14] via-[#2e1022] to-[#0e050a]",
  "from-[#12181f] via-[#1c2833] to-[#0a0e12]",
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

export function fingerprintTags(profile: {
  preferredAgents: string[];
  modelMix: ModelMix;
  typicalTokenBurn: TokenBurnBand;
  school?: string;
}): string[] {
  const tags = [
    ...profile.preferredAgents.map(agentLabel),
    dominantModel(profile.modelMix),
    `${burnLabel(profile.typicalTokenBurn)} burn`,
  ];
  if (profile.school) tags.push(profile.school);
  return tags;
}
