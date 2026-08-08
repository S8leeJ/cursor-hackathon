import type { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      // Set CLERK_JWT_ISSUER_DOMAIN on the Convex deployment
      // (Clerk Frontend API URL, e.g. https://verb-noun-00.clerk.accounts.dev)
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
