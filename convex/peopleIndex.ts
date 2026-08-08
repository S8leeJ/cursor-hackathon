import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction, internalQuery } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import {
  PEOPLE_NAMESPACE,
  isIndexablePerson,
  peopleRag,
  profileToRagText,
} from "./lib/peopleRag";

export const getUserForIndex = internalQuery({
  args: { userId: v.id("users") },
  returns: v.union(
    v.object({
      _id: v.id("users"),
      name: v.string(),
      school: v.optional(v.string()),
      bio: v.optional(v.string()),
      preferredAgents: v.array(v.string()),
      modelMix: v.object({
        opus: v.number(),
        gpt: v.number(),
        gemini: v.number(),
      }),
      typicalTokenBurn: v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
        v.literal("extreme"),
      ),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || !isIndexablePerson(user)) {
      return null;
    }
    return {
      _id: user._id,
      name: user.name,
      school: user.school,
      bio: user.bio,
      preferredAgents: user.preferredAgents,
      modelMix: user.modelMix,
      typicalTokenBurn: user.typicalTokenBurn,
    };
  },
});

export const listIndexableUserIds = internalQuery({
  args: { limit: v.number() },
  returns: v.array(v.id("users")),
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("users")
      .withIndex("by_hasFingerprint", (q) => q.eq("hasFingerprint", true))
      .take(args.limit);
    return rows.filter(isIndexablePerson).map((u) => u._id);
  },
});

/** Embed (or replace) one person's profile in the shared people RAG namespace. */
export const indexPerson = internalAction({
  args: { userId: v.id("users") },
  returns: v.object({
    indexed: v.boolean(),
    entryId: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.peopleIndex.getUserForIndex, {
      userId: args.userId,
    });
    if (!user) {
      return { indexed: false };
    }

    const school = user.school?.trim() || "unknown";
    const text = profileToRagText({
      ...user,
      school: user.school,
      bio: user.bio,
    });

    const { entryId } = await peopleRag.add(ctx, {
      namespace: PEOPLE_NAMESPACE,
      key: user._id,
      title: `${user.name} (${school})`,
      text,
      filterValues: [
        { name: "school", value: school },
        { name: "typicalTokenBurn", value: user.typicalTokenBurn },
      ],
      metadata: {
        userId: user._id,
        name: user.name,
        school: user.school,
        typicalTokenBurn: user.typicalTokenBurn,
      },
    });

    return { indexed: true, entryId: entryId as string };
  },
});

/** Re-index every fingerprint-ready profile (e.g. after seed). */
export const reindexAll = internalAction({
  args: {},
  returns: v.object({
    attempted: v.number(),
    indexed: v.number(),
  }),
  handler: async (ctx) => {
    const userIds: Id<"users">[] = await ctx.runQuery(
      internal.peopleIndex.listIndexableUserIds,
      { limit: 500 },
    );

    let indexed = 0;
    for (const userId of userIds) {
      const result = await ctx.runAction(internal.peopleIndex.indexPerson, {
        userId,
      });
      if (result.indexed) indexed += 1;
    }

    return { attempted: userIds.length, indexed };
  },
});
