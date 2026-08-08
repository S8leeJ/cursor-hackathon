import { v } from "convex/values";
import { getCurrentUser, getCurrentUserOrNull } from "./lib/auth";
import { mutation, query } from "./_generated/server";
import {
  modelMixValidator,
  tokenBurnBandValidator,
} from "./schema";

const userReturnValidator = v.object({
  _id: v.id("users"),
  _creationTime: v.number(),
  clerkId: v.string(),
  name: v.string(),
  email: v.optional(v.string()),
  school: v.optional(v.string()),
  bio: v.optional(v.string()),
  avatarUrl: v.optional(v.string()),
  preferredAgents: v.optional(v.array(v.string())),
  modelMix: v.optional(modelMixValidator),
  typicalTokenBurn: v.optional(tokenBurnBandValidator),
  hasFingerprint: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
});

/** Get-or-create the app profile for the current Clerk user. */
export const store = mutation({
  args: {},
  returns: v.id("users"),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const clerkId = identity.subject;
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        name: identity.name ?? existingUser.name,
        email: identity.email ?? existingUser.email,
        avatarUrl: identity.pictureUrl ?? existingUser.avatarUrl,
        updatedAt: Date.now(),
      });
      return existingUser._id;
    }

    return await ctx.db.insert("users", {
      clerkId,
      name: identity.name ?? "Anonymous",
      email: identity.email,
      avatarUrl: identity.pictureUrl,
      hasFingerprint: false,
      createdAt: Date.now(),
    });
  },
});

export const current = query({
  args: {},
  returns: v.union(userReturnValidator, v.null()),
  handler: async (ctx) => {
    return await getCurrentUserOrNull(ctx);
  },
});

export const me = query({
  args: {},
  returns: userReturnValidator,
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});
