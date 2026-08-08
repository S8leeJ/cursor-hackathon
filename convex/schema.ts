/**
 * SWEnder — data model
 *
 * Product: match college SEs by AI coding fingerprint (agents + model mix + token burn).
 *
 * Matching assumptions (MVP):
 * - Fingerprint lives on the user profile (1:1). A user is a match candidate only when
 *   `hasFingerprint` is true (all three dimensions set during onboarding).
 * - Similarity is scored in-query (not persisted):
 *     1) preferredAgents — Jaccard overlap of string sets
 *     2) modelMix — L1/cosine distance on {opus, gpt, gemini} weights (each 0..1, ~sum to 1)
 *     3) typicalTokenBurn — ordinal distance on intensity bands
 * - Candidate lookup: index `by_hasFingerprint_burn` lists discoverable users in a burn band
 *   (and nearby bands). Exclude self + already-reviewed via `swipes` (`by_from_to`).
 * - Reviews are Pull Request decisions: accept / deny / request_changes.
 *   Mutual accept ⇒ "merged" match (derived, no matches table yet).
 *
 * Auth: Clerk identity → `clerkId` (JWT `subject`). Get-or-create profiles by that index.
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/** Known agents; arrays also accept other strings for future tools. */
export const knownAgentValidator = v.union(
  v.literal("cursor"),
  v.literal("claude_code"),
  v.literal("copilot"),
);

/**
 * Relative share of coding work by model family. Values are 0..1 and should sum to ~1
 * (soft constraint enforced in mutations, not the schema).
 */
export const modelMixValidator = v.object({
  opus: v.number(),
  gpt: v.number(),
  gemini: v.number(),
});

/**
 * Typical token burn intensity (not raw counts).
 * Approximate scale for matching bands:
 *   low     — light / occasional agent use (~<50k tokens/day)
 *   medium  — regular daily use (~50k–200k)
 *   high    — heavy agent-native workflow (~200k–1M)
 *   extreme — very high burn (~>1M)
 */
export const tokenBurnBandValidator = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
  v.literal("extreme"),
);

/** PR-review outcomes on a candidate profile. */
export const swipeActionValidator = v.union(
  v.literal("accept"),
  v.literal("deny"),
  v.literal("request_changes"),
);

/** Optional structured ask when reviewing with request_changes. */
export const requestedChangeValidator = v.object({
  kind: v.literal("model"),
  from: v.string(),
  to: v.string(),
});

export default defineSchema({
  /**
   * App profile for a Clerk user, including optional AI coding fingerprint.
   * Fingerprint fields are optional until onboarding completes; then `hasFingerprint` is true.
   */
  users: defineTable({
    /** Clerk user id (`identity.subject`). */
    clerkId: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    school: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    /**
     * User-supplied LinkedIn profile URL (self-link only).
     * Used for display + optional consentful self-import — not for matching forage.
     */
    linkedinUrl: v.optional(v.string()),

    /** Multi-select agents; prefer "cursor" | "claude_code" | "copilot", allow other strings. */
    preferredAgents: v.optional(v.array(v.string())),
    modelMix: v.optional(modelMixValidator),
    typicalTokenBurn: v.optional(tokenBurnBandValidator),

    /** True when preferredAgents, modelMix, and typicalTokenBurn are all set. */
    hasFingerprint: v.boolean(),

    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_clerkId", ["clerkId"])
    /** All onboarded candidates (score in TS after take/paginate). */
    .index("by_hasFingerprint", ["hasFingerprint"])
    /** Cheap candidate lists: same (or nearby) burn band among fingerprint-ready users. */
    .index("by_hasFingerprint_burn", ["hasFingerprint", "typicalTokenBurn"]),

  /**
   * PR review from one user to another. Unique pair enforced in mutation via by_from_to.
   * Mutual accepts ⇒ merged match (computed at read time).
   */
  swipes: defineTable({
    fromUserId: v.id("users"),
    toUserId: v.id("users"),
    action: swipeActionValidator,
    /** Free-text review comment (required for request_changes in the mutation). */
    comment: v.optional(v.string()),
    requestedChange: v.optional(requestedChangeValidator),
    createdAt: v.number(),
  })
    .index("by_from", ["fromUserId"])
    .index("by_from_to", ["fromUserId", "toUserId"])
    .index("by_to_action", ["toUserId", "action"]),

  /**
   * One Matchmaker agent thread per user (RAG people-matching chatbot).
   * Message history lives in the @convex-dev/agent component; this table owns access.
   */
  matchChats: defineTable({
    userId: v.id("users"),
    threadId: v.string(),
    title: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_thread", ["threadId"]),
});
