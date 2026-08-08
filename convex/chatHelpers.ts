import { v } from "convex/values";
import { internalQuery } from "./_generated/server";
import { hasCompleteFingerprint } from "./lib/fingerprint";
import {
  publicProfileValidator,
  toPublicProfile,
} from "./lib/validators";

export const getPublicPerson = internalQuery({
  args: { userId: v.id("users") },
  returns: v.union(publicProfileValidator, v.null()),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || !hasCompleteFingerprint(user)) {
      return null;
    }
    return toPublicProfile(user);
  },
});

export const getUserByClerkId = internalQuery({
  args: { clerkId: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("users"),
      name: v.string(),
      school: v.optional(v.string()),
      hasFingerprint: v.boolean(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    if (!user) return null;
    return {
      _id: user._id,
      name: user.name,
      school: user.school,
      hasFingerprint: user.hasFingerprint,
    };
  },
});

export const getThreadOwner = internalQuery({
  args: { threadId: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("matchChats"),
      userId: v.id("users"),
      threadId: v.string(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const chat = await ctx.db
      .query("matchChats")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .unique();
    if (!chat) return null;
    return {
      _id: chat._id,
      userId: chat.userId,
      threadId: chat.threadId,
    };
  },
});
