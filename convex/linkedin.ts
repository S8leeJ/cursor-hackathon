import { v } from "convex/values";
import { action } from "./_generated/server";
import {
  normalizeLinkedInUrl,
  suggestionsFromOpenGraph,
  suggestionsFromPaste,
} from "./lib/linkedin";

const linkedInSuggestionsValidator = v.object({
  name: v.optional(v.string()),
  school: v.optional(v.string()),
  bio: v.optional(v.string()),
  headline: v.optional(v.string()),
  avatarUrl: v.optional(v.string()),
  source: v.union(
    v.literal("open_graph"),
    v.literal("paste"),
    v.literal("none"),
  ),
  note: v.optional(v.string()),
  linkedinUrl: v.string(),
});

/**
 * Consentful self-import preview for the caller's own LinkedIn URL.
 * Best-effort public Open Graph tags only — no third-party scrape vendors.
 * Returns suggestions; client must apply. Never used for matching forage.
 */
export const previewImport = action({
  args: {
    linkedinUrl: v.string(),
  },
  returns: linkedInSuggestionsValidator,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const linkedinUrl = normalizeLinkedInUrl(args.linkedinUrl);
    const fromOg = await fetchViaOpenGraph(linkedinUrl);
    return { ...fromOg, linkedinUrl };
  },
});

/**
 * Parse pasted LinkedIn headline / About text into profile suggestions.
 * Reliable fallback when LinkedIn blocks anonymous page fetches.
 */
export const previewFromPaste = action({
  args: {
    linkedinUrl: v.string(),
    pastedText: v.string(),
  },
  returns: linkedInSuggestionsValidator,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const linkedinUrl = normalizeLinkedInUrl(args.linkedinUrl);
    const suggestions = suggestionsFromPaste(args.pastedText);
    return { ...suggestions, linkedinUrl };
  },
});

async function fetchViaOpenGraph(linkedinUrl: string) {
  try {
    const response = await fetch(linkedinUrl, {
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; SWEnderBot/1.0; +https://swender.app)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!response.ok) {
      return {
        source: "none" as const,
        note: `LinkedIn returned ${response.status}. Link can still be saved — paste your headline or About to fill fields.`,
      };
    }

    const html = await response.text();
    return suggestionsFromOpenGraph(html);
  } catch (error) {
    console.error("Open Graph LinkedIn fetch failed:", error);
    return {
      source: "none" as const,
      note: "Could not reach LinkedIn. Your link can still be saved — paste your headline or About to fill fields.",
    };
  }
}
