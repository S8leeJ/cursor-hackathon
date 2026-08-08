export type OnboardingAnswers = {
  name: string;
  age: string;
  languages: string[];
  ide: string;
  tabsOrSpaces: string;
  workStyle: string;
  nightOwl: number; // 0-100
  hotTake: string;
};

export type Persona = {
  title: string;
  tagline: string;
};

export const LANGUAGES = [
  "TypeScript",
  "Python",
  "Rust",
  "Go",
  "Swift",
  "C++",
  "Ruby",
  "Java",
];

export const IDES = [
  { id: "vscode", label: "VS Code", icon: "🟦" },
  { id: "neovim", label: "Neovim", icon: "🟩" },
  { id: "jetbrains", label: "JetBrains", icon: "🟧" },
  { id: "cursor", label: "Cursor", icon: "⬛" },
  { id: "xcode", label: "Xcode", icon: "🔨" },
];

export const DEFAULT_ANSWERS: OnboardingAnswers = {
  name: "",
  age: "",
  languages: [],
  ide: "",
  tabsOrSpaces: "",
  workStyle: "",
  nightOwl: 60,
  hotTake: "",
};

export function computePersona(a: OnboardingAnswers): Persona {
  if (a.ide === "neovim") {
    return {
      title: "Terminal Romantic",
      tagline:
        "You build in the dark, with a soft heart and love in every commit.",
    };
  }
  if (a.languages.includes("Python") && a.nightOwl >= 70) {
    return {
      title: "GPU Goblin",
      tagline: "You train models by moonlight and dream in CUDA kernels.",
    };
  }
  if (a.tabsOrSpaces === "tabs") {
    return {
      title: "Merge Conflict Menace",
      tagline: "Chaotic, decisive, and impossible to rebase onto.",
    };
  }
  if (a.workStyle === "remote") {
    return {
      title: "Async Admirer",
      tagline: "Slow to reply, quick to fall. Your love ships in batches.",
    };
  }
  if (a.nightOwl >= 70) {
    return {
      title: "Midnight Deployer",
      tagline: "You push to prod on Fridays and to hearts on weekends.",
    };
  }
  return {
    title: "Compile-Time Sweetheart",
    tagline: "Strictly typed, warmly hearted. No runtime surprises.",
  };
}

export type DemoProfile = {
  id: string;
  name: string;
  age: number;
  persona: string;
  personaEmoji: string;
  tags: string[];
  hotTake: string;
  gradient: string;
  initial: string;
};

export const DEMO_PROFILES: DemoProfile[] = [
  {
    id: "alex",
    name: "Alex",
    age: 24,
    persona: "GPU Goblin",
    personaEmoji: "👾",
    tags: ["Python", "PyTorch", "Remote"],
    hotTake: "Good code is poetry. Great code is a love letter to the future.",
    gradient: "from-[#2a0f16] via-[#3d1420] to-[#12060a]",
    initial: "A",
  },
  {
    id: "sam",
    name: "Sam",
    age: 27,
    persona: "Terminal Romantic",
    personaEmoji: "🖤",
    tags: ["Rust", "Neovim", "Night owl"],
    hotTake: "If it compiles on the first try, I don't trust it.",
    gradient: "from-[#1a0e20] via-[#2c1230] to-[#0d0610]",
    initial: "S",
  },
  {
    id: "riley",
    name: "Riley",
    age: 25,
    persona: "Merge Conflict Menace",
    personaEmoji: "⚡",
    tags: ["TypeScript", "React", "Hybrid"],
    hotTake: "Tabs. And I will die on this hill holding your hand.",
    gradient: "from-[#20130a] via-[#33200e] to-[#100a05]",
    initial: "R",
  },
  {
    id: "jordan",
    name: "Jordan",
    age: 29,
    persona: "Async Admirer",
    personaEmoji: "🌙",
    tags: ["Go", "Kubernetes", "Remote"],
    hotTake: "A monorepo is just a long-term relationship with extra steps.",
    gradient: "from-[#0e1a1c] via-[#132b2c] to-[#060f10]",
    initial: "J",
  },
  {
    id: "casey",
    name: "Casey",
    age: 26,
    persona: "Midnight Deployer",
    personaEmoji: "🚀",
    tags: ["Swift", "iOS", "Coffee-fueled"],
    hotTake: "Dark mode isn't a preference, it's a personality.",
    gradient: "from-[#1c0a14] via-[#2e1022] to-[#0e050a]",
    initial: "C",
  },
];

const ANSWERS_KEY = "swender.answers";
const LIKES_KEY = "swender.likes";

export function saveAnswers(a: OnboardingAnswers) {
  localStorage.setItem(ANSWERS_KEY, JSON.stringify(a));
}

export function loadAnswers(): OnboardingAnswers | null {
  try {
    const raw = localStorage.getItem(ANSWERS_KEY);
    return raw ? { ...DEFAULT_ANSWERS, ...JSON.parse(raw) } : null;
  } catch {
    return null;
  }
}

export function saveLike(id: string) {
  const likes = loadLikes();
  if (!likes.includes(id)) {
    likes.push(id);
    localStorage.setItem(LIKES_KEY, JSON.stringify(likes));
  }
}

export function loadLikes(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LIKES_KEY) ?? "[]");
  } catch {
    return [];
  }
}
