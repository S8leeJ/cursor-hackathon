import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

type SeedUser = {
  clerkId: string;
  name: string;
  school: string;
  bio: string;
  preferredAgents: string[];
  modelMix: { opus: number; gpt: number; gemini: number };
  typicalTokenBurn: "low" | "medium" | "high" | "extreme";
};

const SEED_USERS: SeedUser[] = [
  {
    clerkId: "seed_alex",
    name: "Alex Chen",
    school: "Stanford",
    bio: "Good code is poetry. Great code is a love letter to the future.",
    preferredAgents: ["cursor", "claude_code"],
    modelMix: { opus: 0.55, gpt: 0.25, gemini: 0.2 },
    typicalTokenBurn: "high",
  },
  {
    clerkId: "seed_sam",
    name: "Sam Okonkwo",
    school: "MIT",
    bio: "If it compiles on the first try, I don't trust it.",
    preferredAgents: ["claude_code"],
    modelMix: { opus: 0.7, gpt: 0.2, gemini: 0.1 },
    typicalTokenBurn: "extreme",
  },
  {
    clerkId: "seed_riley",
    name: "Riley Park",
    school: "Berkeley",
    bio: "Tabs. And I will die on this hill holding your hand.",
    preferredAgents: ["cursor", "copilot"],
    modelMix: { opus: 0.3, gpt: 0.5, gemini: 0.2 },
    typicalTokenBurn: "medium",
  },
  {
    clerkId: "seed_jordan",
    name: "Jordan Lee",
    school: "CMU",
    bio: "A monorepo is just a long-term relationship with extra steps.",
    preferredAgents: ["copilot", "cursor"],
    modelMix: { opus: 0.2, gpt: 0.55, gemini: 0.25 },
    typicalTokenBurn: "medium",
  },
  {
    clerkId: "seed_casey",
    name: "Casey Nguyen",
    school: "UW",
    bio: "Dark mode isn't a preference, it's a personality.",
    preferredAgents: ["cursor"],
    modelMix: { opus: 0.4, gpt: 0.35, gemini: 0.25 },
    typicalTokenBurn: "high",
  },
  {
    clerkId: "seed_morgan",
    name: "Morgan Diaz",
    school: "Georgia Tech",
    bio: "I pair with agents the way some people pair with coffee.",
    preferredAgents: ["claude_code", "copilot"],
    modelMix: { opus: 0.45, gpt: 0.15, gemini: 0.4 },
    typicalTokenBurn: "low",
  },
  {
    clerkId: "seed_quinn",
    name: "Quinn Patel",
    school: "UIUC",
    bio: "My context window has room for you and a failing CI log.",
    preferredAgents: ["cursor", "claude_code", "copilot"],
    modelMix: { opus: 0.35, gpt: 0.35, gemini: 0.3 },
    typicalTokenBurn: "extreme",
  },
  {
    clerkId: "seed_harper",
    name: "Harper Kim",
    school: "UCLA",
    bio: "Ship small PRs. Fall hard.",
    preferredAgents: ["copilot"],
    modelMix: { opus: 0.15, gpt: 0.7, gemini: 0.15 },
    typicalTokenBurn: "low",
  },
];

/**
 * Idempotent seed: clears prior seed_* users (+ their swipes), then inserts fixtures.
 * Run: `npx convex run seed:seedDemo`
 */
export const seedDemo = internalMutation({
  args: {},
  returns: v.object({
    usersInserted: v.number(),
    usersRemoved: v.number(),
    swipesRemoved: v.number(),
  }),
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").take(500);
    const seedUsers = allUsers.filter((u) => u.clerkId.startsWith("seed_"));

    let swipesRemoved = 0;
    for (const user of seedUsers) {
      const fromSwipes = await ctx.db
        .query("swipes")
        .withIndex("by_from", (q) => q.eq("fromUserId", user._id))
        .take(200);
      for (const swipe of fromSwipes) {
        await ctx.db.delete(swipe._id);
        swipesRemoved += 1;
      }

      for (const action of ["like", "pass"] as const) {
        const toSwipes = await ctx.db
          .query("swipes")
          .withIndex("by_to_action", (q) =>
            q.eq("toUserId", user._id).eq("action", action),
          )
          .take(200);
        for (const swipe of toSwipes) {
          await ctx.db.delete(swipe._id);
          swipesRemoved += 1;
        }
      }

      await ctx.db.delete(user._id);
    }

    const now = Date.now();
    const insertedIds: Id<"users">[] = [];
    for (const seed of SEED_USERS) {
      const id = await ctx.db.insert("users", {
        clerkId: seed.clerkId,
        name: seed.name,
        school: seed.school,
        bio: seed.bio,
        preferredAgents: seed.preferredAgents,
        modelMix: seed.modelMix,
        typicalTokenBurn: seed.typicalTokenBurn,
        hasFingerprint: true,
        createdAt: now,
        updatedAt: now,
      });
      insertedIds.push(id);
    }

    return {
      usersInserted: insertedIds.length,
      usersRemoved: seedUsers.length,
      swipesRemoved,
    };
  },
});
