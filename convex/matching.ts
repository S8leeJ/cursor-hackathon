import { v } from "convex/values";
import { getCurrentUser } from "./lib/auth";
import {
  fingerprintScore,
  hasCompleteFingerprint,
  nearbyBurnBands,
} from "./lib/fingerprint";
import {
  candidateValidator,
  publicProfileValidator,
  toPublicProfile,
} from "./lib/validators";
import { mutation, query } from "./_generated/server";
import { requestedChangeValidator, swipeActionValidator } from "./schema";

const CANDIDATE_LIMIT = 40;

export const discover = query({
  args: {},
  returns: v.array(candidateValidator),
  handler: async (ctx) => {
    const me = await getCurrentUser(ctx);
    if (!me.hasFingerprint || !hasCompleteFingerprint(me)) {
      return [];
    }

    const myBurn = me.typicalTokenBurn;
    const reviewed = await ctx.db
      .query("swipes")
      .withIndex("by_from", (q) => q.eq("fromUserId", me._id))
      .take(500);
    const reviewedIds = new Set(reviewed.map((s) => s.toUserId));

    const bands = nearbyBurnBands(myBurn);
    const candidates = [];
    for (const band of bands) {
      const rows = await ctx.db
        .query("users")
        .withIndex("by_hasFingerprint_burn", (q) =>
          q.eq("hasFingerprint", true).eq("typicalTokenBurn", band),
        )
        .take(CANDIDATE_LIMIT);
      candidates.push(...rows);
    }

    const scored = [];
    for (const other of candidates) {
      if (other._id === me._id || reviewedIds.has(other._id)) continue;
      if (!hasCompleteFingerprint(other)) continue;
      scored.push({
        ...toPublicProfile(other),
        matchScore: fingerprintScore(me, other),
      });
    }

    scored.sort((a, b) => b.matchScore - a.matchScore);
    return scored.slice(0, 20);
  },
});

/**
 * Submit a PR review on a candidate: accept, deny, or request_changes.
 * Mutual accept ⇒ merged (matched: true).
 */
export const swipe = mutation({
  args: {
    toUserId: v.id("users"),
    action: swipeActionValidator,
    comment: v.optional(v.string()),
    requestedChange: v.optional(requestedChangeValidator),
  },
  returns: v.object({
    matched: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const me = await getCurrentUser(ctx);
    if (args.toUserId === me._id) {
      throw new Error("Cannot review yourself");
    }

    const target = await ctx.db.get(args.toUserId);
    if (!target) {
      throw new Error("User not found");
    }

    if (args.action === "request_changes") {
      const comment = args.comment?.trim() ?? "";
      if (!comment && !args.requestedChange) {
        throw new Error("Request changes needs a comment or a concrete ask");
      }
    }

    const review = {
      action: args.action,
      comment: args.comment?.trim() || undefined,
      requestedChange: args.requestedChange,
      createdAt: Date.now(),
    };

    const existing = await ctx.db
      .query("swipes")
      .withIndex("by_from_to", (q) =>
        q.eq("fromUserId", me._id).eq("toUserId", args.toUserId),
      )
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, review);
    } else {
      await ctx.db.insert("swipes", {
        fromUserId: me._id,
        toUserId: args.toUserId,
        ...review,
      });
    }

    if (args.action !== "accept") {
      return { matched: false };
    }

    // Seed profiles auto-reciprocate accepts so the demo merge flow works.
    if (target.clerkId.startsWith("seed_")) {
      const reverse = await ctx.db
        .query("swipes")
        .withIndex("by_from_to", (q) =>
          q.eq("fromUserId", args.toUserId).eq("toUserId", me._id),
        )
        .unique();
      if (!reverse) {
        await ctx.db.insert("swipes", {
          fromUserId: args.toUserId,
          toUserId: me._id,
          action: "accept",
          createdAt: Date.now(),
        });
      } else if (reverse.action !== "accept") {
        await ctx.db.patch(reverse._id, {
          action: "accept",
          createdAt: Date.now(),
        });
      }
      return { matched: true };
    }

    const theirSwipe = await ctx.db
      .query("swipes")
      .withIndex("by_from_to", (q) =>
        q.eq("fromUserId", args.toUserId).eq("toUserId", me._id),
      )
      .unique();

    return { matched: theirSwipe?.action === "accept" };
  },
});

export const listMatches = query({
  args: {},
  returns: v.array(publicProfileValidator),
  handler: async (ctx) => {
    const me = await getCurrentUser(ctx);

    const myReviews = await ctx.db
      .query("swipes")
      .withIndex("by_from", (q) => q.eq("fromUserId", me._id))
      .take(200);
    const acceptedIds = myReviews
      .filter((s) => s.action === "accept")
      .map((s) => s.toUserId);

    const matches = [];
    for (const otherId of acceptedIds) {
      const reverse = await ctx.db
        .query("swipes")
        .withIndex("by_from_to", (q) =>
          q.eq("fromUserId", otherId).eq("toUserId", me._id),
        )
        .unique();
      if (reverse?.action !== "accept") continue;

      const other = await ctx.db.get(otherId);
      if (!other || !hasCompleteFingerprint(other)) continue;
      matches.push(toPublicProfile(other));
    }

    return matches;
  },
});
