import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type AuthCtx = QueryCtx | MutationCtx;

function clerkIdFromIdentity(identity: { subject: string }): string {
  return identity.subject;
}

export async function getCurrentUser(ctx: AuthCtx): Promise<Doc<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) =>
      q.eq("clerkId", clerkIdFromIdentity(identity)),
    )
    .unique();

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export async function getCurrentUserOrNull(
  ctx: AuthCtx,
): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  return await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) =>
      q.eq("clerkId", clerkIdFromIdentity(identity)),
    )
    .unique();
}
