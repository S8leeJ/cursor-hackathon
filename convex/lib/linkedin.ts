/** LinkedIn URL helpers + public-page parsing for consentful self-import. */

const LINKEDIN_HOSTS = new Set([
  "linkedin.com",
  "www.linkedin.com",
  "m.linkedin.com",
]);

export type LinkedInSuggestions = {
  name?: string;
  school?: string;
  bio?: string;
  headline?: string;
  avatarUrl?: string;
  source: "proxycurl" | "open_graph" | "none";
  note?: string;
};

/** Normalize to https://www.linkedin.com/in/<slug>/ or throw. */
export function normalizeLinkedInUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error("LinkedIn URL is required");
  }

  let url: URL;
  try {
    url = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
  } catch {
    throw new Error("Enter a valid LinkedIn profile URL");
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (host !== "linkedin.com") {
    throw new Error("URL must be a linkedin.com profile");
  }

  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length < 2 || parts[0]!.toLowerCase() !== "in") {
    throw new Error("Use a profile URL like linkedin.com/in/your-name");
  }

  const slug = parts[1]!;
  if (!/^[a-zA-Z0-9\-_%.]+$/.test(slug)) {
    throw new Error("LinkedIn profile slug looks invalid");
  }

  return `https://www.linkedin.com/in/${decodeURIComponent(slug)}/`;
}

export function isLinkedInHost(hostname: string): boolean {
  return LINKEDIN_HOSTS.has(hostname.toLowerCase());
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) =>
      String.fromCodePoint(parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, n: string) =>
      String.fromCodePoint(parseInt(n, 10)),
    );
}

function metaContent(html: string, property: string): string | undefined {
  const patterns = [
    new RegExp(
      `<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`,
      "i",
    ),
  ];
  for (const re of patterns) {
    const match = html.match(re);
    if (match?.[1]) {
      return decodeHtmlEntities(match[1]).trim();
    }
  }
  return undefined;
}

/** Parse name / headline from LinkedIn OG title formats. */
export function parseOgTitle(title: string): {
  name?: string;
  headline?: string;
} {
  const cleaned = title
    .replace(/\s*\|\s*LinkedIn\s*$/i, "")
    .replace(/\s+on\s+LinkedIn\s*$/i, "")
    .trim();
  if (!cleaned) return {};

  const dash = cleaned.split(/\s+[–—-]\s+/);
  if (dash.length >= 2) {
    return {
      name: dash[0]!.trim() || undefined,
      headline: dash.slice(1).join(" - ").trim() || undefined,
    };
  }
  return { name: cleaned };
}

export function suggestionsFromOpenGraph(html: string): LinkedInSuggestions {
  const title = metaContent(html, "og:title");
  const description = metaContent(html, "og:description");
  const image = metaContent(html, "og:image");
  const parsed = title ? parseOgTitle(title) : {};

  const bio =
    description &&
    !/sign in|join linkedin|log in to linkedin/i.test(description)
      ? description.slice(0, 280)
      : parsed.headline;

  if (!parsed.name && !bio && !image) {
    return {
      source: "none",
      note: "LinkedIn blocked the public preview. Your link is saved — fill name/bio manually or set PROXYCURL_API_KEY for richer import.",
    };
  }

  return {
    name: parsed.name,
    headline: parsed.headline,
    bio: bio || undefined,
    avatarUrl: image?.startsWith("http") ? image : undefined,
    source: "open_graph",
    note: "Pulled from the public LinkedIn preview. Review before applying.",
  };
}

type ProxycurlPerson = {
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  headline?: string | null;
  summary?: string | null;
  profile_pic_url?: string | null;
  education?: Array<{
    school?: string | null;
    degree_name?: string | null;
  }> | null;
};

export function suggestionsFromProxycurl(
  person: ProxycurlPerson,
): LinkedInSuggestions {
  const name =
    person.full_name?.trim() ||
    [person.first_name, person.last_name].filter(Boolean).join(" ").trim() ||
    undefined;
  const school = person.education?.[0]?.school?.trim() || undefined;
  const headline = person.headline?.trim() || undefined;
  const summary = person.summary?.trim() || undefined;
  const bio = (summary || headline)?.slice(0, 280) || undefined;

  return {
    name,
    school,
    headline,
    bio,
    avatarUrl: person.profile_pic_url?.startsWith("http")
      ? person.profile_pic_url
      : undefined,
    source: "proxycurl",
    note: "Imported via Proxycurl. Review before applying to your SWEnder profile.",
  };
}
