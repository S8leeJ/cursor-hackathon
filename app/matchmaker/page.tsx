"use client";

import {
  optimisticallySendMessage,
  useUIMessages,
} from "@convex-dev/agent/react";
import { useConvexAuth, useMutation } from "convex/react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import {
  CheckCircleIcon,
  SendIcon,
  TerminalIcon,
} from "@/components/icons";
import { Button, EmptyState, Key, Loading, Panel } from "@/components/ui";
import { api } from "@/convex/_generated/api";

const STARTERS = [
  "find extreme-burn Cursor builders at UT Austin",
  "who vibes with Claude Code + night-owl energy?",
  "friends-first — ask me a few questions first",
  "match me with someone opposite my stack",
];

type Question = {
  id: string;
  prompt: string;
  options: Array<{ id: string; label: string }>;
  allowMultiple?: boolean;
};

type PendingQuestionnaire = {
  toolCallId: string;
  promptMessageId: string;
  title: string;
  questions: Question[];
};

export default function MatchmakerPage() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const ensureThread = useMutation(api.chat.ensureThread);
  const clearHistory = useMutation(api.chat.clearHistory);
  const sendMessage = useMutation(api.chat.sendMessage).withOptimisticUpdate(
    (store, args) => {
      optimisticallySendMessage(api.chat.listMessages)(store, {
        threadId: args.threadId,
        prompt: args.prompt,
      });
    },
  );
  const submitQuestionnaire = useMutation(api.chat.submitQuestionnaire);

  const [threadId, setThreadId] = useState<string | null>(null);
  const [threadError, setThreadError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [clearing, setClearing] = useState(false);
  /** Show typing until a new visible assistant turn appears after this index. */
  const [awaitingAfterCount, setAwaitingAfterCount] = useState<number | null>(
    null,
  );
  const [lastPromptMessageId, setLastPromptMessageId] = useState<string | null>(
    null,
  );
  const [answeredToolIds, setAnsweredToolIds] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isAuthenticated || threadId) return;
    let cancelled = false;
    void (async () => {
      try {
        const { threadId: id } = await ensureThread({});
        if (!cancelled) setThreadId(id);
      } catch (e) {
        if (!cancelled) {
          setThreadError(
            e instanceof Error ? e.message : "Failed to start Matchmaker",
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, threadId, ensureThread]);

  const { results: messages, status } = useUIMessages(
    api.chat.listMessages,
    threadId ? { threadId } : "skip",
    { initialNumItems: 40, stream: true },
  );

  const pending = useMemo(
    () => findPendingQuestionnaire(messages ?? [], lastPromptMessageId),
    [messages, lastPromptMessageId],
  );

  const visiblePending =
    pending && !answeredToolIds.includes(pending.toolCallId) ? pending : null;

  // generateReply runs async after send — keep the indicator until a new
  // assistant turn (text / search summary) or a questionnaire appears.
  const showTyping =
    !visiblePending &&
    (sending ||
      (awaitingAfterCount !== null &&
        !hasNewAssistantSince(messages ?? [], awaitingAfterCount)));

  useEffect(() => {
    if (visiblePending) setAwaitingAfterCount(null);
  }, [visiblePending]);

  useEffect(() => {
    if (awaitingAfterCount === null) return;
    if (hasNewAssistantSince(messages ?? [], awaitingAfterCount)) {
      setAwaitingAfterCount(null);
    }
  }, [messages, awaitingAfterCount]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages?.length, visiblePending?.toolCallId, draft, showTyping]);

  const send = async (text: string) => {
    if (!threadId || sending) return;
    const prompt = text.trim();
    if (!prompt) return;
    setSending(true);
    setAwaitingAfterCount(messages?.length ?? 0);
    setDraft("");
    try {
      const { messageId } = await sendMessage({ threadId, prompt });
      setLastPromptMessageId(messageId);
    } catch (e) {
      setDraft(prompt);
      setAwaitingAfterCount(null);
      setThreadError(e instanceof Error ? e.message : "Send failed");
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(draft);
  };

  const onClearHistory = async () => {
    if (clearing || sending) return;
    setClearing(true);
    setThreadError(null);
    try {
      const { threadId: id } = await clearHistory({});
      setThreadId(id);
      setAnsweredToolIds([]);
      setAwaitingAfterCount(null);
      setLastPromptMessageId(null);
      setDraft("");
    } catch (e) {
      setThreadError(
        e instanceof Error ? e.message : "Failed to clear chat history",
      );
    } finally {
      setClearing(false);
      inputRef.current?.focus();
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(draft);
    }
  };

  const onSubmitAnswers = async (
    answers: Array<{ questionId: string; selectedOptionIds: string[] }>,
  ) => {
    if (!threadId || !visiblePending) return;
    setAnsweredToolIds((ids) => [...ids, visiblePending.toolCallId]);
    setAwaitingAfterCount(messages?.length ?? 0);
    try {
      await submitQuestionnaire({
        threadId,
        promptMessageId: visiblePending.promptMessageId,
        toolCallId: visiblePending.toolCallId,
        answers,
      });
    } catch (e) {
      setAnsweredToolIds((ids) =>
        ids.filter((id) => id !== visiblePending.toolCallId),
      );
      setAwaitingAfterCount(null);
      setThreadError(
        e instanceof Error ? e.message : "Failed to submit answers",
      );
    }
  };

  if (authLoading) {
    return (
      <AppShell path="~/matchmaker" fill>
        <Loading what="authenticating" />
      </AppShell>
    );
  }

  if (!isAuthenticated) {
    return (
      <AppShell path="~/matchmaker" fill>
        <EmptyState
          glyph={<TerminalIcon className="h-5 w-5" />}
          code="401 unauthorized"
          title="Sign in to Matchmaker"
          body="the agent searches real campus profiles, so it needs to know who's asking."
          href="/sign-in"
          cta="Sign in"
        />
      </AppShell>
    );
  }

  return (
    <AppShell
      path="~/matchmaker"
      fill
      status={
        <span className="flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${showTyping ? "bg-pending" : "bg-added"}`}
          />
          {showTyping ? "thinking" : "ready"}
        </span>
      }
    >
      <PageHeader
        crumb="swender / matchmaker"
        title="Matchmaker"
        meta="RAG over campus profiles · no invented people"
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void onClearHistory()}
            disabled={!threadId || clearing || sending}
          >
            {clearing ? "clearing…" : "clear"}
          </Button>
        }
      />

      {threadError && (
        <p
          role="alert"
          className="mt-3 rounded-sm border border-deleted/40 bg-deleted/10 px-3 py-2 text-[11px] text-deleted"
        >
          {threadError}
        </p>
      )}

      <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-2">
        {!threadId ? (
          <Loading what="spinning up thread" />
        ) : (messages?.length ?? 0) === 0 && !showTyping ? (
          <Welcome onPick={(t) => void send(t)} disabled={sending} />
        ) : (
          (messages ?? []).map((msg) => (
            <TranscriptEntry key={msg.key} message={msg} />
          ))
        )}

        {visiblePending && (
          <QuestionnaireCard
            pending={visiblePending}
            onSubmit={(answers) => void onSubmitAnswers(answers)}
          />
        )}

        {showTyping && <Thinking />}

        {status === "LoadingMore" && (
          <p className="text-center text-[10px] text-ink-4">loading earlier…</p>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={onSubmit} className="shrink-0 border-t border-rule pt-3">
        <div className="flex items-end gap-2 rounded-sm border border-rule bg-inset px-2.5 py-1.5 transition-colors duration-150 focus-within:border-fn/50">
          <span aria-hidden className="pb-2.5 text-[13px] leading-none text-kw">
            ❯
          </span>
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder={
              visiblePending
                ? "answer the questionnaire above…"
                : "who should you meet?"
            }
            disabled={!threadId || sending || !!visiblePending}
            className="max-h-28 min-h-9 flex-1 resize-none bg-transparent py-2 text-[12.5px] leading-relaxed text-ink placeholder:text-ink-4 focus:outline-none focus-visible:shadow-none disabled:opacity-50"
          />
          <Button
            type="submit"
            aria-label="Send"
            disabled={!threadId || sending || !!visiblePending || !draft.trim()}
            className="mb-0.5 h-8 w-8 px-0"
          >
            <SendIcon className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-ink-4">
          <Key>↵</Key> send
          <span className="text-ink-4/50">·</span>
          <Key>⇧↵</Key> newline
        </p>
      </form>
    </AppShell>
  );
}

/* ------------------------------- Transcript ------------------------------- */

function Welcome({
  onPick,
  disabled,
}: {
  onPick: (text: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="rise flex flex-1 flex-col justify-center">
      <div className="border-l-2 border-kw/40 pl-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-kw">
          matchmaker v1
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-ink">
          I ask a few quick questions, then search real campus profiles with RAG.
        </p>
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-3">
          No invented people, no vibes-only guesses — every name comes back with
          the fingerprint it matched on.
        </p>
      </div>

      <p className="mt-6 text-[10px] uppercase tracking-[0.2em] text-ink-4">
        try
      </p>
      <div className="mt-2 flex flex-col gap-1.5">
        {STARTERS.map((s) => (
          <button
            key={s}
            type="button"
            disabled={disabled}
            onClick={() => onPick(s)}
            className="group flex items-start gap-2 rounded-sm border border-rule bg-panel px-3 py-2.5 text-left transition-colors duration-150 hover:border-rule-strong hover:bg-raised disabled:opacity-50"
          >
            <span className="text-[12px] leading-relaxed text-ink-4 transition-colors group-hover:text-kw">
              ❯
            </span>
            <span className="text-[12px] leading-relaxed text-ink-2 transition-colors group-hover:text-ink">
              {s}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function messageText(message: {
  text?: string;
  parts: Array<{ type: string; text?: string; [k: string]: unknown }>;
}): string {
  if (message.text?.trim()) return message.text;
  return message.parts
    .filter((p) => p.type === "text" && typeof p.text === "string")
    .map((p) => p.text)
    .join("");
}

function isAssistantTurnVisible(message: {
  role: string;
  text?: string;
  status?: string;
  parts: Array<{ type: string; text?: string; [k: string]: unknown }>;
}): boolean {
  if (message.role !== "assistant") return false;
  return (
    messageText(message).trim().length > 0 ||
    hasVisibleToolSummary(message.parts)
  );
}

function hasNewAssistantSince(
  messages: Array<{
    role: string;
    text?: string;
    status?: string;
    parts: Array<{ type: string; text?: string; [k: string]: unknown }>;
  }>,
  afterCount: number,
): boolean {
  for (let i = afterCount; i < messages.length; i++) {
    if (isAssistantTurnVisible(messages[i]!)) return true;
  }
  return false;
}

function AgentLabel({ children }: { children?: React.ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 text-[9.5px] uppercase tracking-[0.2em] text-kw">
      <TerminalIcon className="h-3 w-3" />
      matchmaker
      {children}
    </p>
  );
}

function Thinking() {
  return (
    <div className="rise" aria-live="polite" aria-label="Matchmaker is thinking">
      <AgentLabel>
        <span className="ml-1 flex gap-1">
          <span className="blip h-1 w-1 rounded-full bg-kw" />
          <span className="blip h-1 w-1 rounded-full bg-kw" />
          <span className="blip h-1 w-1 rounded-full bg-kw" />
        </span>
      </AgentLabel>
    </div>
  );
}

/**
 * A transcript, not chat bubbles: your lines are shell prompts, the agent's
 * are output blocks, and tool calls read as the commands they are.
 */
function TranscriptEntry({
  message,
}: {
  message: {
    key: string;
    role: string;
    text: string;
    status: string;
    parts: Array<{ type: string; text?: string; [k: string]: unknown }>;
  };
}) {
  const isUser = message.role === "user";
  const text = messageText(message);

  if (!isUser && !text.trim() && !hasVisibleToolSummary(message.parts)) {
    return null;
  }

  if (isUser) {
    return (
      <div className="rise flex gap-2">
        <span aria-hidden className="text-[12.5px] leading-relaxed text-kw">
          ❯
        </span>
        <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed text-ink">
          {text}
        </p>
      </div>
    );
  }

  return (
    <div className="rise">
      <AgentLabel />
      <div className="mt-1.5 border-l-2 border-kw/30 pl-3">
        {text.trim() && (
          <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed text-ink-2">
            {text}
          </p>
        )}
        <ToolSummaries parts={message.parts} />
      </div>
    </div>
  );
}

function hasVisibleToolSummary(
  parts: Array<{ type: string; [k: string]: unknown }>,
) {
  return parts.some(
    (p) =>
      p.type === "tool-searchPeople" ||
      (p.type === "dynamic-tool" && p.toolName === "searchPeople"),
  );
}

function ToolSummaries({
  parts,
}: {
  parts: Array<{ type: string; [k: string]: unknown }>;
}) {
  const searches = parts.filter(
    (p) =>
      p.type === "tool-searchPeople" ||
      (p.type === "dynamic-tool" && p.toolName === "searchPeople"),
  );
  if (searches.length === 0) return null;
  return (
    <div className="mt-2 space-y-1">
      {searches.map((p, i) => {
        const input = p.input as { query?: string } | undefined;
        const done = (p.state as string | undefined) === "output-available";
        return (
          <p key={i} className="flex items-center gap-1.5 text-[10.5px]">
            <span className="text-ink-4">$</span>
            <span className="text-cmt">search --people</span>
            {input?.query && (
              <span className="truncate text-str">&quot;{input.query}&quot;</span>
            )}
            {done ? (
              <CheckCircleIcon className="h-3 w-3 shrink-0 text-added" />
            ) : (
              <span className="flex shrink-0 gap-0.5">
                <span className="blip h-1 w-1 rounded-full bg-pending" />
                <span className="blip h-1 w-1 rounded-full bg-pending" />
                <span className="blip h-1 w-1 rounded-full bg-pending" />
              </span>
            )}
          </p>
        );
      })}
    </div>
  );
}

/* ------------------------------ Questionnaire ----------------------------- */

function QuestionnaireCard({
  pending,
  onSubmit,
}: {
  pending: PendingQuestionnaire;
  onSubmit: (
    answers: Array<{ questionId: string; selectedOptionIds: string[] }>,
  ) => void;
}) {
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const toggle = (q: Question, optionId: string) => {
    setSelected((prev) => {
      const cur = prev[q.id] ?? [];
      if (q.allowMultiple) {
        return {
          ...prev,
          [q.id]: cur.includes(optionId)
            ? cur.filter((id) => id !== optionId)
            : [...cur, optionId],
        };
      }
      return { ...prev, [q.id]: [optionId] };
    });
  };

  const allAnswered = pending.questions.every(
    (q) => (selected[q.id]?.length ?? 0) > 0,
  );

  const submit = () => {
    if (!allAnswered || submitting) return;
    setSubmitting(true);
    onSubmit(
      pending.questions.map((q) => ({
        questionId: q.id,
        selectedOptionIds: selected[q.id] ?? [],
      })),
    );
  };

  return (
    <Panel
      filename="questionnaire.json"
      modified
      className="rise"
      bodyClassName="p-3.5"
    >
      <h2 className="text-[13.5px] font-semibold tracking-[-0.01em] text-ink">
        {pending.title}
      </h2>

      <div className="mt-4 space-y-4">
        {pending.questions.map((q) => (
          <fieldset key={q.id}>
            <legend className="text-[11.5px] leading-snug text-ink-2">
              {q.prompt}
            </legend>
            {q.allowMultiple && (
              <p className="mt-1 text-[10px] text-ink-4">pick any that apply</p>
            )}
            <div className="mt-2 flex flex-col gap-1">
              {q.options.map((opt) => {
                const on = (selected[q.id] ?? []).includes(opt.id);
                // Checkbox glyphs a CS student already reads: [x] and (o).
                const glyph = q.allowMultiple
                  ? on
                    ? "[x]"
                    : "[ ]"
                  : on
                    ? "(o)"
                    : "( )";
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggle(q, opt.id)}
                    aria-pressed={on}
                    className={`flex items-center gap-2 rounded-xs px-2 py-1.5 text-left text-[11.5px] transition-colors duration-150 ${
                      on
                        ? "bg-kw/10 text-ink"
                        : "text-ink-3 hover:bg-raised hover:text-ink-2"
                    }`}
                  >
                    <span className={on ? "text-kw" : "text-ink-4"}>
                      {glyph}
                    </span>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <Button
        size="lg"
        disabled={!allAnswered || submitting}
        onClick={submit}
        className="mt-4 w-full"
      >
        {submitting ? "sending…" : "Submit answers"}
      </Button>
    </Panel>
  );
}

function findPendingQuestionnaire(
  messages: Array<{
    id?: string;
    role: string;
    parts: Array<{ type: string; [k: string]: unknown }>;
  }>,
  fallbackPromptMessageId: string | null,
): PendingQuestionnaire | null {
  // Walk newest → oldest so we catch the latest unanswered questionnaire.
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i]!;
    for (const part of msg.parts) {
      const isAsk =
        part.type === "tool-askQuestionnaire" ||
        (part.type === "dynamic-tool" && part.toolName === "askQuestionnaire");
      if (!isAsk) continue;

      const state = part.state as string | undefined;
      // Waiting for the client to supply a tool result
      if (state !== "input-available") continue;

      const input = part.input as
        | { title?: string; questions?: Question[] }
        | undefined;
      const toolCallId = part.toolCallId as string | undefined;
      if (!toolCallId || !input?.title || !input.questions?.length) continue;

      // promptMessageId = nearest preceding user message id, else last send
      let promptMessageId = fallbackPromptMessageId;
      for (let j = i; j >= 0; j--) {
        const prev = messages[j]!;
        if (prev.role === "user" && typeof prev.id === "string") {
          promptMessageId = prev.id;
          break;
        }
      }
      if (!promptMessageId) continue;

      return {
        toolCallId,
        promptMessageId,
        title: input.title,
        questions: input.questions,
      };
    }
  }
  return null;
}
