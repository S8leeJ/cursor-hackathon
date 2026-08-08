import type { CodeLine } from "@/lib/swender";

const TOKEN_COLORS: Record<string, string> = {
  kw: "#e05e78", // keywords — rose
  fn: "#82aaff", // functions — blue
  str: "#d4a373", // strings — amber
  cmt: "#6e5560", // comments — faint
  num: "#c792ea", // numbers — violet
  type: "#7fdbca", // types — teal
  plain: "#d6c6cb",
};

/**
 * Renders a fake editor screenshot — window chrome, line numbers, and a
 * syntax-highlighted snippet. Used as the "photo" filler on profile cards.
 */
export function CodePicture({
  filename,
  lines,
  className = "",
  textSize = "text-[11px]",
}: {
  filename: string;
  lines: CodeLine[];
  className?: string;
  textSize?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-lg border border-white/10 bg-[#120a10]/90 shadow-[0_16px_50px_rgba(0,0,0,0.5)] ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.04] px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 truncate font-mono text-[10px] text-white/40">
          {filename}
        </span>
      </div>
      <div className={`px-3 py-3 font-mono ${textSize} leading-[1.7]`}>
        {lines.map((line, i) => (
          <div key={i} className="flex whitespace-pre">
            <span className="mr-3 w-4 shrink-0 select-none text-right text-white/20">
              {i + 1}
            </span>
            <span className="truncate">
              {line.map(([kind, text], j) => (
                <span key={j} style={{ color: TOKEN_COLORS[kind] }}>
                  {text}
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
