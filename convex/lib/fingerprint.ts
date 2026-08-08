import type { Doc } from "../_generated/dataModel";

export type ModelMix = {
  opus: number;
  gpt: number;
  gemini: number;
};

export type TokenBurnBand = "low" | "medium" | "high" | "extreme";

const BURN_ORDER: Record<TokenBurnBand, number> = {
  low: 0,
  medium: 1,
  high: 2,
  extreme: 3,
};

const NEARBY_BURNS: Record<TokenBurnBand, TokenBurnBand[]> = {
  low: ["low", "medium"],
  medium: ["low", "medium", "high"],
  high: ["medium", "high", "extreme"],
  extreme: ["high", "extreme"],
};

export function nearbyBurnBands(band: TokenBurnBand): TokenBurnBand[] {
  return NEARBY_BURNS[band];
}

/** Soft-normalize weights to sum ~1; clamp each to [0, 1]. */
export function normalizeModelMix(mix: ModelMix): ModelMix {
  const clamped = {
    opus: clamp01(mix.opus),
    gpt: clamp01(mix.gpt),
    gemini: clamp01(mix.gemini),
  };
  const sum = clamped.opus + clamped.gpt + clamped.gemini;
  if (sum <= 0) {
    return { opus: 1 / 3, gpt: 1 / 3, gemini: 1 / 3 };
  }
  return {
    opus: clamped.opus / sum,
    gpt: clamped.gpt / sum,
    gemini: clamped.gemini / sum,
  };
}

export function assertFingerprintComplete(
  preferredAgents: string[] | undefined,
  modelMix: ModelMix | undefined,
  typicalTokenBurn: TokenBurnBand | undefined,
): asserts preferredAgents is string[] {
  if (!preferredAgents || preferredAgents.length === 0) {
    throw new Error("Pick at least one preferred agent");
  }
  if (!modelMix) {
    throw new Error("Model mix is required");
  }
  if (!typicalTokenBurn) {
    throw new Error("Token burn band is required");
  }
  for (const key of ["opus", "gpt", "gemini"] as const) {
    if (!Number.isFinite(modelMix[key]) || modelMix[key] < 0) {
      throw new Error(`Invalid model mix weight: ${key}`);
    }
  }
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function jaccard(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  let intersection = 0;
  for (const x of setA) {
    if (setB.has(x)) intersection += 1;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/** 1 − L1/2 for weights that roughly form a distribution. */
function modelMixSimilarity(a: ModelMix, b: ModelMix): number {
  const l1 =
    Math.abs(a.opus - b.opus) +
    Math.abs(a.gpt - b.gpt) +
    Math.abs(a.gemini - b.gemini);
  return 1 - l1 / 2;
}

function burnSimilarity(a: TokenBurnBand, b: TokenBurnBand): number {
  const dist = Math.abs(BURN_ORDER[a] - BURN_ORDER[b]);
  return 1 - dist / 3;
}

export type FingerprintUser = Pick<
  Doc<"users">,
  "preferredAgents" | "modelMix" | "typicalTokenBurn"
>;

/** Weighted similarity in [0, 1]. Caller must ensure both fingerprints are complete. */
export function fingerprintScore(
  me: Required<FingerprintUser>,
  them: Required<FingerprintUser>,
): number {
  const agents = jaccard(me.preferredAgents, them.preferredAgents);
  const models = modelMixSimilarity(me.modelMix, them.modelMix);
  const burn = burnSimilarity(me.typicalTokenBurn, them.typicalTokenBurn);
  return 0.4 * agents + 0.4 * models + 0.2 * burn;
}

export function hasCompleteFingerprint(
  user: FingerprintUser,
): user is Required<FingerprintUser> {
  return (
    !!user.preferredAgents &&
    user.preferredAgents.length > 0 &&
    !!user.modelMix &&
    !!user.typicalTokenBurn
  );
}
