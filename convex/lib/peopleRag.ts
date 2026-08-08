import { RAG } from "@convex-dev/rag";
import { components } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";
import { hasCompleteFingerprint } from "./fingerprint";
import { getEmbeddingModel } from "./llm";

/** Shared campus directory — every discoverable profile lives here. */
export const PEOPLE_NAMESPACE = "campus_people";

export type PersonFilters = {
  school: string;
  typicalTokenBurn: string;
};

export type PersonMetadata = {
  userId: Id<"users">;
  name: string;
  school?: string;
  typicalTokenBurn?: string;
};

export const peopleRag = new RAG<PersonFilters, PersonMetadata>(components.rag, {
  textEmbeddingModel: getEmbeddingModel(),
  embeddingDimension: 1536,
  filterNames: ["school", "typicalTokenBurn"],
});

type IndexableProfile = {
  name: string;
  school?: string;
  bio?: string;
  preferredAgents: string[];
  modelMix: NonNullable<Doc<"users">["modelMix"]>;
  typicalTokenBurn: NonNullable<Doc<"users">["typicalTokenBurn"]>;
};

/** Compact profile text optimized for embedding / retrieval. */
export function profileToRagText(user: IndexableProfile): string {
  const mix = user.modelMix;
  const mixLine = `opus ${Math.round(mix.opus * 100)}%, gpt ${Math.round(mix.gpt * 100)}%, gemini ${Math.round(mix.gemini * 100)}%`;
  const agents = user.preferredAgents.join(", ");
  const school = user.school?.trim() || "unknown school";
  const bio = user.bio?.trim() || "";

  return [
    `Name: ${user.name}`,
    `School: ${school}`,
    `Preferred AI coding agents: ${agents}`,
    `Model mix: ${mixLine}`,
    `Typical token burn: ${user.typicalTokenBurn}`,
    bio ? `Bio: ${bio}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function isIndexablePerson(
  user: Doc<"users">,
): user is Doc<"users"> & {
  preferredAgents: string[];
  modelMix: NonNullable<Doc<"users">["modelMix"]>;
  typicalTokenBurn: NonNullable<Doc<"users">["typicalTokenBurn"]>;
} {
  return user.hasFingerprint && hasCompleteFingerprint(user);
}
