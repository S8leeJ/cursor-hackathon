import { v } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import { modelMixValidator, tokenBurnBandValidator } from "../schema";

export const publicProfileValidator = v.object({
  _id: v.id("users"),
  name: v.string(),
  school: v.optional(v.string()),
  bio: v.optional(v.string()),
  avatarUrl: v.optional(v.string()),
  preferredAgents: v.array(v.string()),
  modelMix: modelMixValidator,
  typicalTokenBurn: tokenBurnBandValidator,
});

export const candidateValidator = v.object({
  _id: v.id("users"),
  name: v.string(),
  school: v.optional(v.string()),
  bio: v.optional(v.string()),
  avatarUrl: v.optional(v.string()),
  preferredAgents: v.array(v.string()),
  modelMix: modelMixValidator,
  typicalTokenBurn: tokenBurnBandValidator,
  matchScore: v.number(),
});

export const userDocValidator = v.object({
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

export function toPublicProfile(
  user: Doc<"users"> & {
    preferredAgents: string[];
    modelMix: NonNullable<Doc<"users">["modelMix"]>;
    typicalTokenBurn: NonNullable<Doc<"users">["typicalTokenBurn"]>;
  },
) {
  return {
    _id: user._id,
    name: user.name,
    school: user.school,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    preferredAgents: user.preferredAgents,
    modelMix: user.modelMix,
    typicalTokenBurn: user.typicalTokenBurn,
  };
}
