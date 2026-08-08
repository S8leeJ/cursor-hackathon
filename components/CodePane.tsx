import type { CodeRow } from "@/lib/swender";

const TOKEN_COLORS: Record<string, string> = {
  kw: "var(--kw)",
  fn: "var(--fn)",
  str: "var(--str)",
  cmt: "var(--cmt)",
  num: "var(--num)",
  type: "var(--type)",
  plain: "var(--ink-2)",
};

const MARK_ROW: Record<string, string> = {
  add: "bg-added/8",
  del: "bg-deleted/8",
};

const MARK_GUTTER: Record<string, string> = {
  add: "bg-added/14 text-added",
  del: "bg-deleted/14 text-deleted",
};

/**
 * The core editor pane: a line-number gutter, diff markers, and syntax colors.
 * Everything in the product that shows a person shows one of these, because a
 * fingerprint is source code and reviewing a person is reading a hunk.
 */
export function CodePane({
  rows,
  startLine = 1,
  hunk,
  gutter = true,
  textSize = "text-[11px]",
  className = "",
}: {
  rows: CodeRow[];
  startLine?: number;
  hunk?: string;
  gutter?: boolean;
  textSize?: string;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden bg-inset ${className}`}>
      {hunk && (
        <p className="border-b border-rule bg-fn/8 px-3 py-1 text-[10px] text-fn">
          {hunk}
        </p>
      )}
      <div className={`${textSize} leading-[1.75]`}>
        {rows.map((row, i) => {
          const mark = row.mark;
          return (
            <div
              key={i}
              className={`flex ${mark ? MARK_ROW[mark] : ""}`}
            >
              {gutter && (
                <span
                  className={`w-7 shrink-0 select-none pr-2 text-right text-[10px] ${
                    mark ? MARK_GUTTER[mark] : "bg-gutter text-ink-4"
                  }`}
                >
                  {startLine + i}
                </span>
              )}
              <span
                className={`w-4 shrink-0 select-none text-center ${
                  mark === "add"
                    ? "text-added"
                    : mark === "del"
                      ? "text-deleted"
                      : "text-ink-4/40"
                }`}
              >
                {mark === "add" ? "+" : mark === "del" ? "-" : " "}
              </span>
              <span className="flex-1 truncate whitespace-pre pr-3">
                {row.tokens.map(([kind, text], j) => (
                  <span key={j} style={{ color: TOKEN_COLORS[kind] }}>
                    {text}
                  </span>
                ))}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
