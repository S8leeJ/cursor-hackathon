"use client";

import {
  optimisticallySendMessage,
  useUIMessages,
} from "@convex-dev/agent/react";
import { useConvexAuth, useMutation } from "convex/react";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { BottomNav } from "@/components/BottomNav";
import { BotIcon, HeartIcon, CheckIcon } from "@/components/icons";
import { api } from "@/convex/_generated/api";

const STARTERS = [
  "Find me extreme-burn Cursor builders at UT Austin",
  "Who vibes with Claude Code + night-owl energy?",
  "I want friends-first — ask me a few questions first",
  "Match me with someone opposite my stack",
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

  // generateReply runs async after send — keep iMessage dots until a new
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
      <Shell>
        <p className="mt-20 text-center text-xs tracking-wide text-muted">
          Loading…
        </p>
      </Shell>
    );
  }

  if (!isAuthenticated) {
    return (
      <Shell>
        <Empty
          title="Sign in to Matchmaker"
          body="the campus matching assistant needs your identity to search real profiles"
          href="/sign-in"
          cta="Sign in"
        />
      </Shell>
    );
  }

  return (
    <Shell>
      <header className="flex items-center justify-between border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <BotIcon className="h-5 w-5 text-rose" />
            <h1 className="font-serif text-3xl text-ink">Matchmaker</h1>
          </div>
          <p className="mt-1 text-[11px] tracking-wide text-muted">
            RAG over campus profiles · ask, pick, get matched
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void onClearHistory()}
            disabled={!threadId || clearing || sending}
            className="rounded-full border border-line-bright px-3 py-1.5 text-[10px] tracking-wide text-muted transition hover:border-rose hover:text-rose disabled:opacity-40"
          >
            {clearing ? "Clearing…" : "Clear chat"}
          </button>
          <span className="rounded-full border border-line-bright px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-rose">
            agent
          </span>
        </div>
      </header>

      {threadError && (
        <p className="mt-3 rounded-xl border border-line-bright bg-wine/20 px-3 py-2 text-xs text-blush">
          {threadError}
        </p>
      )}

      <div className="mt-4 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-3">
        {!threadId ? (
          <p className="mt-10 text-center text-xs tracking-wide text-muted">
            Spinning up your thread…
          </p>
        ) : (messages?.length ?? 0) === 0 && !showTyping ? (
          <Welcome onPick={(t) => void send(t)} disabled={sending} />
        ) : (
          (messages ?? []).map((msg) => (
            <MessageBubble key={msg.key} message={msg} />
          ))
        )}

        {visiblePending && (
          <QuestionnaireCard
            pending={visiblePending}
            onSubmit={(answers) => void onSubmitAnswers(answers)}
          />
        )}

        {showTyping && <TypingBubble />}

        {status === "LoadingMore" && (
          <p className="text-center text-[10px] text-faint">Loading earlier…</p>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={onSubmit}
        className="border-t border-line bg-background/95 pt-3"
      >
        <div className="flex items-end gap-2 rounded-2xl border border-line bg-card px-3 py-2 focus-within:border-line-bright">
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder={
              visiblePending
                ? "answer the questionnaire above…"
                : "ask Matchmaker who to meet…"
            }
            disabled={!threadId || sending || !!visiblePending}
            className="max-h-28 min-h-[40px] flex-1 resize-none bg-transparent py-2 text-sm leading-relaxed text-ink placeholder:text-faint focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={
              !threadId || sending || !!visiblePending || !draft.trim()
            }
            className="mb-1 rounded-full bg-wine px-4 py-2 text-xs font-semibold tracking-wide text-ink transition enabled:hover:bg-wine-hover disabled:opacity-40"
          >
            {sending ? "…" : "Send"}
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] tracking-wide text-faint">
          enter to send · shift+enter for newline
        </p>
      </form>
    </Shell>
  );
}

function Welcome({
  onPick,
  disabled,
}: {
  onPick: (text: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="float-up flex flex-1 flex-col items-center justify-center px-2 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-line-bright bg-card text-rose">
        <BotIcon className="h-8 w-8" />
      </div>
      <p className="mt-5 font-serif text-2xl text-ink">Who should you meet?</p>
      <p className="mt-2 max-w-64 text-xs leading-relaxed tracking-wide text-muted">
        I&apos;ll ask a few quick questions, then search real campus profiles
        with RAG — no invented people.
      </p>
      <div className="mt-8 flex w-full flex-col gap-2">
        {STARTERS.map((s) => (
          <button
            key={s}
            type="button"
            disabled={disabled}
            onClick={() => onPick(s)}
            className="rounded-xl border border-line bg-card px-4 py-3 text-left text-[12px] leading-snug text-ink transition hover:border-line-bright disabled:opacity-50"
          >
            {s}
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

function TypingBubble() {
  return (
    <div
      className="float-up flex justify-start"
      aria-live="polite"
      aria-label="Matchmaker is typing"
    >
      <div className="rounded-2xl rounded-bl-md border border-line bg-card px-4 py-3">
        <p className="mb-2 flex items-center gap-1.5 text-[9px] uppercase tracking-[0.25em] text-rose">
          <BotIcon className="h-3 w-3" />
          matchmaker
        </p>
        <div className="flex h-4 items-center gap-1.5 px-0.5">
          <span className="typing-dot h-1.5 w-1.5 rounded-full bg-rose" />
          <span className="typing-dot h-1.5 w-1.5 rounded-full bg-rose" />
          <span className="typing-dot h-1.5 w-1.5 rounded-full bg-rose" />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
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

  // Hide pure tool-result / empty assistant shells
  if (!isUser && !text.trim() && !hasVisibleToolSummary(message.parts)) {
    return null;
  }

  return (
    <div
      className={`float-up flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[88%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
          isUser
            ? "rounded-br-md bg-wine text-ink"
            : "rounded-bl-md border border-line bg-card text-ink"
        }`}
      >
        {!isUser && (
          <p className="mb-1.5 flex items-center gap-1.5 text-[9px] uppercase tracking-[0.25em] text-rose">
            <BotIcon className="h-3 w-3" />
            matchmaker
          </p>
        )}
        {text.trim() ? (
          <p className="whitespace-pre-wrap">{text}</p>
        ) : (
          <ToolSummaries parts={message.parts} />
        )}
        {text.trim() && <ToolSummaries parts={message.parts} />}
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
        const state = p.state as string | undefined;
        return (
          <p
            key={i}
            className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-1.5 font-mono text-[10px] text-muted"
          >
            {state === "output-available" ? "searched" : "searching"} people
            {input?.query ? `: “${input.query}”` : ""}
          </p>
        );
      })}
    </div>
  );
}

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
    <div className="float-up rounded-2xl border border-line-bright bg-gradient-to-b from-[#1d0b11] to-card p-4 shadow-[0_0_30px_rgba(124,29,49,0.25)]">
      <p className="text-[9px] uppercase tracking-[0.3em] text-rose">
        questionnaire
      </p>
      <h2 className="mt-1 font-serif text-xl text-ink">{pending.title}</h2>

      <div className="mt-4 space-y-5">
        {pending.questions.map((q) => (
          <div key={q.id}>
            <p className="text-[12px] leading-snug text-ink">{q.prompt}</p>
            {q.allowMultiple && (
              <p className="mt-1 text-[10px] text-faint">pick any that apply</p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              {q.options.map((opt) => {
                const on = (selected[q.id] ?? []).includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggle(q, opt.id)}
                    className={`rounded-lg border px-3 py-2 text-[11px] transition ${
                      on
                        ? "border-rose bg-wine/40 text-ink"
                        : "border-line bg-black/30 text-muted hover:border-line-bright"
                    }`}
                  >
                    {on && (
                      <CheckIcon className="mr-1 inline h-3 w-3 text-rose" />
                    )}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled={!allAnswered || submitting}
        onClick={submit}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-wine py-3 text-sm font-semibold tracking-wide text-ink transition enabled:hover:bg-wine-hover disabled:opacity-40"
      >
        <HeartIcon filled className="h-4 w-4" />
        {submitting ? "Sending…" : "Submit answers"}
      </button>
    </div>
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

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex h-dvh w-full max-w-md flex-col">
      <main className="flex min-h-0 flex-1 flex-col px-5 pb-3 pt-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

function Empty({
  title,
  body,
  href,
  cta,
}: {
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="mt-16 flex flex-col items-center text-center">
      <BotIcon className="h-12 w-12 text-line-bright" />
      <h1 className="mt-5 font-serif text-3xl text-ink">{title}</h1>
      <p className="mt-3 max-w-64 text-xs leading-relaxed tracking-wide text-muted">
        {body}
      </p>
      <Link
        href={href}
        className="mt-6 rounded-full bg-wine px-8 py-3 text-sm font-semibold tracking-wide text-ink transition hover:bg-wine-hover"
      >
        {cta}
      </Link>
    </div>
  );
}
