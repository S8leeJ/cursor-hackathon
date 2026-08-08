import { v } from "convex/values";
import { internal } from "./_generated/api";
import { getCurrentUser, getCurrentUserOrNull } from "./lib/auth";
import {
  assertFingerprintComplete,
  normalizeModelMix,
} from "./lib/fingerprint";
import { userDocValidator } from "./lib/validators";
import { mutation, query } from "./_generated/server";
import {
  modelMixValidator,
  tokenBurnBandValidator,
} from "./schema";

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
  returns: v.union(userDocValidator, v.null()),
  handler: async (ctx) => {
    return await getCurrentUserOrNull(ctx);
  },
});

export const me = query({
  args: {},
  returns: userDocValidator,
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

/** Save profile + AI coding fingerprint (completes onboarding). */
export const completeOnboarding = mutation({
  args: {
    name: v.string(),
    school: v.optional(v.string()),
    bio: v.optional(v.string()),
    preferredAgents: v.array(v.string()),
    modelMix: modelMixValidator,
    typicalTokenBurn: tokenBurnBandValidator,
  },
  returns: userDocValidator,
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const name = args.name.trim();
    if (name.length < 1) {
      throw new Error("Name is required");
    }

    assertFingerprintComplete(
      args.preferredAgents,
      args.modelMix,
      args.typicalTokenBurn,
    );

    const preferredAgents = [
      ...new Set(args.preferredAgents.map((a) => a.trim()).filter(Boolean)),
    ];
    if (preferredAgents.length === 0) {
      throw new Error("Pick at least one preferred agent");
    }

    const modelMix = normalizeModelMix(args.modelMix);
    const school = args.school?.trim() || undefined;
    const bio = args.bio?.trim() || undefined;

    await ctx.db.patch(user._id, {
      name,
      school,
      bio,
      preferredAgents,
      modelMix,
      typicalTokenBurn: args.typicalTokenBurn,
      hasFingerprint: true,
      updatedAt: Date.now(),
    });

    await ctx.scheduler.runAfter(0, internal.peopleIndex.indexPerson, {
      userId: user._id,
    });

    const updated = await ctx.db.get(user._id);
    if (!updated) {
      throw new Error("User not found after update");
    }
    return updated;
  },
});
