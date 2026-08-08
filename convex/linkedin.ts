import { v } from "convex/values";
import { action } from "./_generated/server";
import {
  normalizeLinkedInUrl,
  suggestionsFromOpenGraph,
  suggestionsFromProxycurl,
  type LinkedInSuggestions,
} from "./lib/linkedin";

const linkedInSuggestionsValidator = v.object({
  name: v.optional(v.string()),
  school: v.optional(v.string()),
  bio: v.optional(v.string()),
  headline: v.optional(v.string()),
  avatarUrl: v.optional(v.string()),
  source: v.union(
    v.literal("proxycurl"),
    v.literal("open_graph"),
    v.literal("none"),
  ),
  note: v.optional(v.string()),
  linkedinUrl: v.string(),
});

/**
 * Consentful self-import preview for the caller's own LinkedIn URL.
 * Never used for matching forage — returns suggestions only; client must apply.
 *
 * Prefers Proxycurl when PROXYCURL_API_KEY is set; otherwise best-effort OG tags.
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
    const proxyKey = process.env.PROXYCURL_API_KEY?.trim();

    if (proxyKey) {
      try {
        const fromApi = await fetchViaProxycurl(linkedinUrl, proxyKey);
        return { ...fromApi, linkedinUrl };
      } catch (error) {
        console.error("Proxycurl LinkedIn import failed:", error);
        // Fall through to open-graph scrape.
      }
    }

    const fromOg = await fetchViaOpenGraph(linkedinUrl);
    return { ...fromOg, linkedinUrl };
  },
});

async function fetchViaProxycurl(
  linkedinUrl: string,
  apiKey: string,
): Promise<LinkedInSuggestions> {
  const endpoint = new URL("https://nubela.co/proxycurl/api/v2/linkedin");
  endpoint.searchParams.set("url", linkedinUrl);
  endpoint.searchParams.set("fallback_to_cache", "on-error");
  endpoint.searchParams.set("use_cache", "if-present");

  const response = await fetch(endpoint.toString(), {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Proxycurl error ${response.status}: ${body.slice(0, 200)}`);
  }

  const person: unknown = await response.json();
  if (!person || typeof person !== "object") {
    throw new Error("Proxycurl returned an unexpected payload");
  }

  return suggestionsFromProxycurl(person as Parameters<typeof suggestionsFromProxycurl>[0]);
}

async function fetchViaOpenGraph(
  linkedinUrl: string,
): Promise<LinkedInSuggestions> {
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
        source: "none",
        note: `LinkedIn returned ${response.status}. Link can still be saved — import needs PROXYCURL_API_KEY or a public preview.`,
      };
    }

    const html = await response.text();
    return suggestionsFromOpenGraph(html);
  } catch (error) {
    console.error("Open Graph LinkedIn fetch failed:", error);
    return {
      source: "none",
      note: "Could not reach LinkedIn. Your link can still be saved; set PROXYCURL_API_KEY for reliable import.",
    };
  }
}
