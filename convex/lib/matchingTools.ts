import { createTool } from "@convex-dev/agent";
import { tool } from "ai";
import { z } from "zod/v3";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { PEOPLE_NAMESPACE, peopleRag } from "../lib/peopleRag";

const questionnaireQuestionSchema = z.object({
  id: z.string().describe("Stable id for this question, e.g. 'burn'"),
  prompt: z.string().describe("The question shown to the user"),
  options: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
      }),
    )
    .min(2)
    .max(6)
    .describe("Multiple-choice options"),
  allowMultiple: z
    .boolean()
    .optional()
    .describe("If true, user may pick more than one option"),
});

/**
 * Human-in-the-loop questionnaire — no `execute`.
 * Generation pauses until the client submits answers via `submitQuestionnaire`.
 */
export const askQuestionnaire = tool({
  description:
    "Present a short multiple-choice questionnaire so the user can answer quickly with taps instead of free text. Use this whenever you need preferences (agents, school vibe, burn level, interests, dealbreakers) before searching for matches. Keep it to 1–4 questions.",
  inputSchema: z.object({
    title: z.string().describe("Short title for the questionnaire card"),
    questions: z
      .array(questionnaireQuestionSchema)
      .min(1)
      .max(4)
      .describe("Questions to show in the UI"),
  }),
});

export const searchPeople = createTool({
  description:
    "Semantically search the campus people directory for profiles that match a natural-language description (agents, school, bio vibe, token burn, interests). Returns ranked candidates with profile summaries. Always exclude the current user from recommendations.",
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        "What kind of person to find, e.g. 'Berkeley Cursor power users with extreme token burn who love building side projects'",
      ),
    school: z
      .string()
      .optional()
      .describe("Optional school filter, e.g. 'Berkeley'"),
    typicalTokenBurn: z
      .enum(["low", "medium", "high", "extreme"])
      .optional()
      .describe("Optional token-burn band filter"),
    limit: z
      .number()
      .min(1)
      .max(12)
      .optional()
      .describe("Max people to return (default 6)"),
  }),
  execute: async (ctx, input): Promise<string> => {
    const filters = [];
    if (input.school?.trim()) {
      filters.push({ name: "school" as const, value: input.school.trim() });
    }
    if (input.typicalTokenBurn) {
      filters.push({
        name: "typicalTokenBurn" as const,
        value: input.typicalTokenBurn,
      });
    }

    const { text, entries, results } = await peopleRag.search(ctx, {
      namespace: PEOPLE_NAMESPACE,
      query: input.query,
      limit: input.limit ?? 6,
      vectorScoreThreshold: 0.35,
      filters: filters.length > 0 ? filters : undefined,
    });

    const selfId = ctx.userId;
    const people = [];
    for (const entry of entries) {
      const userId = entry.metadata?.userId as Id<"users"> | undefined;
      if (!userId || (selfId && userId === selfId)) continue;

      const bestScore =
        results
          .filter((r) => r.entryId === entry.entryId)
          .reduce((max, r) => Math.max(max, r.score), 0) || undefined;

      const profile = await ctx.runQuery(internal.chatHelpers.getPublicPerson, {
        userId,
      });
      if (!profile) continue;

      people.push({
        userId: profile._id,
        name: profile.name,
        school: profile.school,
        bio: profile.bio,
        preferredAgents: profile.preferredAgents,
        modelMix: profile.modelMix,
        typicalTokenBurn: profile.typicalTokenBurn,
        similarityScore: bestScore,
      });
    }

    if (people.length === 0) {
      return (
        "No matching people found. Try broadening the query, dropping filters, " +
        "or ask the user a questionnaire to refine preferences.\n\n" +
        `Raw retrieval text (may include self):\n${text}`
      );
    }

    return JSON.stringify(
      {
        count: people.length,
        people,
        note: "Present these as match suggestions with a short why for each.",
      },
      null,
      2,
    );
  },
});

export const matchingTools = {
  askQuestionnaire,
  searchPeople,
};
