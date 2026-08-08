import {
  createThread,
  listUIMessages,
  saveMessage,
  syncStreams,
  vStreamArgs,
} from "@convex-dev/agent";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { components, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import {
  action,
  internalAction,
  internalMutation,
  mutation,
  query,
} from "./_generated/server";
import { getCurrentUser } from "./lib/auth";
import { matchingAgent } from "./lib/matchingAgent";

const questionnairePendingValidator = v.object({
  toolCallId: v.string(),
  title: v.string(),
  questions: v.array(
    v.object({
      id: v.string(),
      prompt: v.string(),
      options: v.array(
        v.object({
          id: v.string(),
          label: v.string(),
        }),
      ),
      allowMultiple: v.optional(v.boolean()),
    }),
  ),
});

type QuestionnairePending = {
  toolCallId: string;
  title: string;
  questions: Array<{
    id: string;
    prompt: string;
    options: Array<{ id: string; label: string }>;
    allowMultiple?: boolean;
  }>;
};

export const ensureThreadForUser = internalMutation({
  args: { userId: v.id("users") },
  returns: v.object({ threadId: v.string() }),
  handler: async (ctx, args): Promise<{ threadId: string }> => {
    const existing = await ctx.db
      .query("matchChats")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
    if (existing) {
      return { threadId: existing.threadId };
    }

    const threadId = await createThread(ctx, components.agent, {
      userId: args.userId,
      title: "Matchmaker",
    });

    await ctx.db.insert("matchChats", {
      userId: args.userId,
      threadId,
      title: "Matchmaker",
      updatedAt: Date.now(),
    });

    return { threadId };
  },
});

/** Start (or resume) the user's matchmaker thread. */
export const ensureThread = mutation({
  args: {},
  returns: v.object({ threadId: v.string() }),
  handler: async (ctx): Promise<{ threadId: string }> => {
    const user = await getCurrentUser(ctx);
    const result: { threadId: string } = await ctx.runMutation(
      internal.chat.ensureThreadForUser,
      { userId: user._id },
    );
    return result;
  },
});

export const listMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    streamArgs: v.optional(vStreamArgs),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const chat = await ctx.db
      .query("matchChats")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .unique();
    if (!chat || chat.userId !== user._id) {
      throw new Error("Unauthorized: not your match chat");
    }

    const paginated = await listUIMessages(ctx, components.agent, {
      threadId: args.threadId,
      paginationOpts: args.paginationOpts,
    });

    const streams = args.streamArgs
      ? await syncStreams(ctx, components.agent, {
          threadId: args.threadId,
          streamArgs: args.streamArgs,
        })
      : undefined;

    return { ...paginated, streams };
  },
});

/** Send a user message; agent replies asynchronously (supports questionnaire pause). */
export const sendMessage = mutation({
  args: {
    threadId: v.string(),
    prompt: v.string(),
  },
  returns: v.object({ messageId: v.string() }),
  handler: async (ctx, args): Promise<{ messageId: string }> => {
    const user = await getCurrentUser(ctx);
    const chat = await ctx.db
      .query("matchChats")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .unique();
    if (!chat || chat.userId !== user._id) {
      throw new Error("Unauthorized: not your match chat");
    }

    const prompt = args.prompt.trim();
    if (prompt.length < 1) {
      throw new Error("Message cannot be empty");
    }

    const { messageId } = await saveMessage(ctx, components.agent, {
      threadId: args.threadId,
      userId: user._id,
      prompt,
    });

    await ctx.db.patch(chat._id, { updatedAt: Date.now() });

    await ctx.scheduler.runAfter(0, internal.chat.generateReply, {
      threadId: args.threadId,
      promptMessageId: messageId,
      userId: user._id,
    });

    return { messageId };
  },
});

export const generateReply = internalAction({
  args: {
    threadId: v.string(),
    promptMessageId: v.string(),
    userId: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    await matchingAgent.generateText(
      ctx,
      {
        threadId: args.threadId,
        userId: args.userId,
      },
      {
        promptMessageId: args.promptMessageId,
      },
    );
    return null;
  },
});

/**
 * Submit answers for a pending askQuestionnaire tool call, then continue generation.
 */
export const submitQuestionnaire = mutation({
  args: {
    threadId: v.string(),
    promptMessageId: v.string(),
    toolCallId: v.string(),
    answers: v.array(
      v.object({
        questionId: v.string(),
        selectedOptionIds: v.array(v.string()),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    const user = await getCurrentUser(ctx);
    const chat = await ctx.db
      .query("matchChats")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .unique();
    if (!chat || chat.userId !== user._id) {
      throw new Error("Unauthorized: not your match chat");
    }

    const summary = args.answers
      .map(
        (a) =>
          `${a.questionId}: ${a.selectedOptionIds.join(", ") || "(skipped)"}`,
      )
      .join("\n");

    await saveMessage(ctx, components.agent, {
      threadId: args.threadId,
      userId: user._id,
      message: {
        role: "tool",
        content: [
          {
            type: "tool-result",
            toolCallId: args.toolCallId,
            toolName: "askQuestionnaire",
            output: {
              type: "json",
              value: {
                answers: args.answers,
                summary,
              },
            },
          },
        ],
      },
    });

    await ctx.db.patch(chat._id, { updatedAt: Date.now() });

    await ctx.scheduler.runAfter(0, internal.chat.generateReply, {
      threadId: args.threadId,
      promptMessageId: args.promptMessageId,
      userId: user._id,
    });

    return null;
  },
});

/** One-shot helper for demos / debugging without wiring the full chat UI. */
export const ask = action({
  args: {
    prompt: v.string(),
    threadId: v.optional(v.string()),
  },
  returns: v.object({
    threadId: v.string(),
    text: v.string(),
    promptMessageId: v.optional(v.string()),
    pendingQuestionnaire: v.union(questionnairePendingValidator, v.null()),
  }),
  handler: async (
    ctx,
    args,
  ): Promise<{
    threadId: string;
    text: string;
    promptMessageId?: string;
    pendingQuestionnaire: QuestionnairePending | null;
  }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user: {
      _id: Id<"users">;
      name: string;
      school?: string;
      hasFingerprint: boolean;
    } | null = await ctx.runQuery(internal.chatHelpers.getUserByClerkId, {
      clerkId: identity.subject,
    });
    if (!user) {
      throw new Error("User not found — call users.store first");
    }

    let threadId = args.threadId;
    if (threadId) {
      const chat = await ctx.runQuery(internal.chatHelpers.getThreadOwner, {
        threadId,
      });
      if (!chat || chat.userId !== user._id) {
        throw new Error("Unauthorized: not your match chat");
      }
    } else {
      const ensured: { threadId: string } = await ctx.runMutation(
        internal.chat.ensureThreadForUser,
        { userId: user._id },
      );
      threadId = ensured.threadId;
    }

    const result = await matchingAgent.generateText(
      ctx,
      { threadId, userId: user._id },
      { prompt: args.prompt.trim() },
    );

    const pending = result.toolCalls?.find(
      (tc: { toolName: string }) => tc.toolName === "askQuestionnaire",
    );
    let pendingQuestionnaire: QuestionnairePending | null = null;
    if (pending && "input" in pending) {
      const input = pending.input as {
        title: string;
        questions: QuestionnairePending["questions"];
      };
      pendingQuestionnaire = {
        toolCallId: pending.toolCallId,
        title: input.title,
        questions: input.questions,
      };
    }

    return {
      threadId,
      text: result.text,
      promptMessageId: result.promptMessageId,
      pendingQuestionnaire,
    };
  },
});
