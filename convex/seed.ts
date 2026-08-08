import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

type SeedUser = {
  clerkId: string;
  name: string;
  school: string;
  bio: string;
  avatarUrl: string;
  preferredAgents: string[];
  modelMix: { opus: number; gpt: number; gemini: number };
  typicalTokenBurn: "low" | "medium" | "high" | "extreme";
};

/**
 * Real GitHub users with "UT Austin" (or equivalent) in their bio.
 * Fingerprint fields are varied placeholders — not from GitHub.
 */
const SEED_USERS: SeedUser[] = [
  {
    clerkId: "seed_williamgilpin",
    name: "William Gilpin",
    school: "UT Austin",
    bio: "@GilpinLab at UT Austin.",
    avatarUrl: "https://avatars.githubusercontent.com/u/8154246?v=4",
    preferredAgents: ["claude_code"],
    modelMix: { opus: 0.35, gpt: 0.35, gemini: 0.3 },
    typicalTokenBurn: "low",
  },
  {
    clerkId: "seed_johnboiles",
    name: "John Boiles",
    school: "UT Austin",
    bio: "CTO Sol Reader. Previously MyMaskMovement, Twitter/Periscope, Peer, Penny, Yelp, UT Austin",
    avatarUrl: "https://avatars.githubusercontent.com/u/218876?v=4",
    preferredAgents: ["cursor", "claude_code", "copilot"],
    modelMix: { opus: 0.55, gpt: 0.25, gemini: 0.2 },
    typicalTokenBurn: "high",
  },
  {
    clerkId: "seed_bdhu",
    name: "Edward Hu",
    school: "UT Austin",
    bio: "Software Engineer @Google. PhD student in @utnslab @ UT Austin.",
    avatarUrl: "https://avatars.githubusercontent.com/u/9762261?v=4",
    preferredAgents: ["cursor", "copilot"],
    modelMix: { opus: 0.4, gpt: 0.35, gemini: 0.25 },
    typicalTokenBurn: "high",
  },
  {
    clerkId: "seed_isshikihugh",
    name: "Yan Xia",
    school: "UT Austin",
    bio: "CS PhD student @ UT Austin; B.Eng @ ZJU.",
    avatarUrl: "https://avatars.githubusercontent.com/u/48550237?v=4",
    preferredAgents: ["claude_code", "copilot"],
    modelMix: { opus: 0.2, gpt: 0.55, gemini: 0.25 },
    typicalTokenBurn: "extreme",
  },
  {
    clerkId: "seed_nklayman",
    name: "Noah Klayman",
    school: "UT Austin",
    bio: "UT Austin CS '25",
    avatarUrl: "https://avatars.githubusercontent.com/u/12448243?v=4",
    preferredAgents: ["cursor", "claude_code", "copilot"],
    modelMix: { opus: 0.2, gpt: 0.55, gemini: 0.25 },
    typicalTokenBurn: "extreme",
  },
  {
    clerkId: "seed_mdbartos",
    name: "Matt Bartos",
    school: "UT Austin",
    bio: "Assistant Professor of Civil Engineering at UT Austin",
    avatarUrl: "https://avatars.githubusercontent.com/u/8175317?v=4",
    preferredAgents: ["cursor"],
    modelMix: { opus: 0.3, gpt: 0.5, gemini: 0.2 },
    typicalTokenBurn: "low",
  },
  {
    clerkId: "seed_gnobitab",
    name: "XCL",
    school: "UT Austin",
    bio: "Researcher at DeepSeek AI | PhD from UT Austin",
    avatarUrl: "https://avatars.githubusercontent.com/u/1157982?v=4",
    preferredAgents: ["claude_code", "copilot"],
    modelMix: { opus: 0.25, gpt: 0.4, gemini: 0.35 },
    typicalTokenBurn: "medium",
  },
  {
    clerkId: "seed_nathanrs",
    name: "Nathan Barry",
    school: "UT Austin",
    bio: "CS + Math @ UT Austin",
    avatarUrl: "https://avatars.githubusercontent.com/u/38043930?v=4",
    preferredAgents: ["claude_code"],
    modelMix: { opus: 0.3, gpt: 0.5, gemini: 0.2 },
    typicalTokenBurn: "high",
  },
  {
    clerkId: "seed_bzsinger",
    name: "Benny Singer",
    school: "UT Austin",
    bio: "Meta, UT Austin '19",
    avatarUrl: "https://avatars.githubusercontent.com/u/14189730?v=4",
    preferredAgents: ["cursor", "claude_code", "copilot"],
    modelMix: { opus: 0.4, gpt: 0.35, gemini: 0.25 },
    typicalTokenBurn: "low",
  },
  {
    clerkId: "seed_gaotongxiao",
    name: "Tong Gao",
    school: "UT Austin",
    bio: "Previously @ OpenMMLab | UT Austin | HKUST",
    avatarUrl: "https://avatars.githubusercontent.com/u/22607038?v=4",
    preferredAgents: ["claude_code"],
    modelMix: { opus: 0.15, gpt: 0.7, gemini: 0.15 },
    typicalTokenBurn: "extreme",
  },
  {
    clerkId: "seed_snasiriany",
    name: "Soroush Nasiriany",
    school: "UT Austin",
    bio: "CS PhD student at UT Austin",
    avatarUrl: "https://avatars.githubusercontent.com/u/11937650?v=4",
    preferredAgents: ["claude_code"],
    modelMix: { opus: 0.7, gpt: 0.2, gemini: 0.1 },
    typicalTokenBurn: "extreme",
  },
  {
    clerkId: "seed_peihaowang",
    name: "Peter",
    school: "UT Austin",
    bio: "ECE PhD Student at UT Austin.",
    avatarUrl: "https://avatars.githubusercontent.com/u/13286856?v=4",
    preferredAgents: ["claude_code"],
    modelMix: { opus: 0.5, gpt: 0.3, gemini: 0.2 },
    typicalTokenBurn: "high",
  },
  {
    clerkId: "seed_iammayankthakur",
    name: "Mayank Thakur",
    school: "UT Austin",
    bio: "MSCS @ UT Austin | Senior Software Engineer @ Akamai",
    avatarUrl: "https://avatars.githubusercontent.com/u/24970283?v=4",
    preferredAgents: ["copilot"],
    modelMix: { opus: 0.7, gpt: 0.2, gemini: 0.1 },
    typicalTokenBurn: "extreme",
  },
  {
    clerkId: "seed_jakegrigsby",
    name: "Jake Grigsby",
    school: "UT Austin",
    bio: "UT Austin ML/RL PhD student",
    avatarUrl: "https://avatars.githubusercontent.com/u/33582737?v=4",
    preferredAgents: ["cursor", "claude_code", "copilot"],
    modelMix: { opus: 0.35, gpt: 0.35, gemini: 0.3 },
    typicalTokenBurn: "low",
  },
  {
    clerkId: "seed_gongxinyuu",
    name: "Xinyu Gong",
    school: "UT Austin",
    bio: "ECE Ph.D. student @ UT Austin",
    avatarUrl: "https://avatars.githubusercontent.com/u/20336084?v=4",
    preferredAgents: ["claude_code", "copilot"],
    modelMix: { opus: 0.2, gpt: 0.55, gemini: 0.25 },
    typicalTokenBurn: "extreme",
  },
  {
    clerkId: "seed_sghsri",
    name: "Sriram Hariharan",
    school: "UT Austin",
    bio: "CS @ UT Austin '21 🤘",
    avatarUrl: "https://avatars.githubusercontent.com/u/13592854?v=4",
    preferredAgents: ["cursor"],
    modelMix: { opus: 0.2, gpt: 0.55, gemini: 0.25 },
    typicalTokenBurn: "medium",
  },
  {
    clerkId: "seed_janghyuncho",
    name: "Jang Hyun Cho",
    school: "UT Austin",
    bio: "PhD student at UT Austin",
    avatarUrl: "https://avatars.githubusercontent.com/u/77150595?v=4",
    preferredAgents: ["cursor"],
    modelMix: { opus: 0.15, gpt: 0.7, gemini: 0.15 },
    typicalTokenBurn: "extreme",
  },
  {
    clerkId: "seed_jozhang97",
    name: "Jeffrey Ouyang-Zhang",
    school: "UT Austin",
    bio: "PhD student at UT Austin",
    avatarUrl: "https://avatars.githubusercontent.com/u/13291669?v=4",
    preferredAgents: ["cursor", "copilot"],
    modelMix: { opus: 0.35, gpt: 0.35, gemini: 0.3 },
    typicalTokenBurn: "high",
  },
  {
    clerkId: "seed_adelavega",
    name: "Alejandro de la Vega",
    school: "UT Austin",
    bio: "Research Professor @ UT Austin.",
    avatarUrl: "https://avatars.githubusercontent.com/u/2774448?v=4",
    preferredAgents: ["cursor", "copilot"],
    modelMix: { opus: 0.3, gpt: 0.5, gemini: 0.2 },
    typicalTokenBurn: "high",
  },
  {
    clerkId: "seed_cosmoquester",
    name: "Sangjun Park",
    school: "UT Austin",
    bio: "CS Ph.D. Student @ UT Austin",
    avatarUrl: "https://avatars.githubusercontent.com/u/30718444?v=4",
    preferredAgents: ["claude_code"],
    modelMix: { opus: 0.25, gpt: 0.4, gemini: 0.35 },
    typicalTokenBurn: "extreme",
  },
  {
    clerkId: "seed_nwtnni",
    name: "Newton Ni",
    school: "UT Austin",
    bio: "PhD student at UT Austin.",
    avatarUrl: "https://avatars.githubusercontent.com/u/26678918?v=4",
    preferredAgents: ["claude_code"],
    modelMix: { opus: 0.7, gpt: 0.2, gemini: 0.1 },
    typicalTokenBurn: "medium",
  },
  {
    clerkId: "seed_venkatarun95",
    name: "Venkat Arun",
    school: "UT Austin",
    bio: "Assistant Prof at UT Austin",
    avatarUrl: "https://avatars.githubusercontent.com/u/6639378?v=4",
    preferredAgents: ["cursor", "claude_code", "copilot"],
    modelMix: { opus: 0.7, gpt: 0.2, gemini: 0.1 },
    typicalTokenBurn: "extreme",
  },
  {
    clerkId: "seed_saarthdeshpande",
    name: "Saarth Deshpande",
    school: "UT Austin",
    bio: "PhD Student at UT Austin",
    avatarUrl: "https://avatars.githubusercontent.com/u/42336020?v=4",
    preferredAgents: ["copilot"],
    modelMix: { opus: 0.2, gpt: 0.55, gemini: 0.25 },
    typicalTokenBurn: "extreme",
  },
  {
    clerkId: "seed_pyrito",
    name: "Karthik Velayutham",
    school: "UT Austin",
    bio: "Software Engineer, UT Austin alum",
    avatarUrl: "https://avatars.githubusercontent.com/u/8106509?v=4",
    preferredAgents: ["claude_code", "copilot"],
    modelMix: { opus: 0.55, gpt: 0.25, gemini: 0.2 },
    typicalTokenBurn: "high",
  },
  {
    clerkId: "seed_prathyusha_guduru",
    name: "Prathyusha Guduru",
    school: "UT Austin",
    bio: "MS UT Austin",
    avatarUrl: "https://avatars.githubusercontent.com/u/59722558?v=4",
    preferredAgents: ["cursor", "claude_code", "copilot"],
    modelMix: { opus: 0.25, gpt: 0.4, gemini: 0.35 },
    typicalTokenBurn: "medium",
  },
  {
    clerkId: "seed_huizezhang_sherry",
    name: "Sherry Zhang",
    school: "UT Austin",
    bio: "Postdoc @ UT Austin | Statistics and Data Science",
    avatarUrl: "https://avatars.githubusercontent.com/u/36781502?v=4",
    preferredAgents: ["cursor", "claude_code", "copilot"],
    modelMix: { opus: 0.45, gpt: 0.15, gemini: 0.4 },
    typicalTokenBurn: "medium",
  },
  {
    clerkId: "seed_tushaargvs",
    name: "Tushaar Gangavarapu",
    school: "UT Austin",
    bio: "PhD, UT Austin",
    avatarUrl: "https://avatars.githubusercontent.com/u/22180632?v=4",
    preferredAgents: ["cursor", "claude_code"],
    modelMix: { opus: 0.3, gpt: 0.5, gemini: 0.2 },
    typicalTokenBurn: "low",
  },
  {
    clerkId: "seed_cypher30",
    name: "Boyuan Yao",
    school: "UT Austin",
    bio: "Ph.D. at UT Austin",
    avatarUrl: "https://avatars.githubusercontent.com/u/70263930?v=4",
    preferredAgents: ["cursor", "claude_code"],
    modelMix: { opus: 0.35, gpt: 0.35, gemini: 0.3 },
    typicalTokenBurn: "high",
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
        avatarUrl: seed.avatarUrl,
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
