import type { ReactNode } from "react";
import { BottomNav } from "@/components/BottomNav";
import { BranchIcon } from "@/components/icons";

/**
 * Every signed-in screen is an editor window: content pane, status bar, tabs.
 * The status bar is the thread that ties the app together — it's always there,
 * always quiet, and always tells you where you are and what state you're in.
 */
export function AppShell({
  branch = "main",
  status,
  path,
  fill = false,
  children,
}: {
  branch?: string;
  status?: ReactNode;
  path?: string;
  fill?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`mx-auto flex w-full max-w-md flex-col ${fill ? "h-dvh" : "min-h-dvh"}`}
    >
      <main
        className={`flex flex-1 flex-col px-4 pb-4 pt-5 ${fill ? "min-h-0" : ""}`}
      >
        {children}
      </main>
      <div className="flex h-6 shrink-0 items-center gap-3 border-t border-rule bg-raised px-3 text-[10px] text-ink-4">
        <span className="flex items-center gap-1.5 text-ink-3">
          <BranchIcon className="h-3 w-3" />
          {branch}
        </span>
        {status}
        {path && <span className="ml-auto truncate">{path}</span>}
      </div>
      <BottomNav />
    </div>
  );
}

/** A page's title block: breadcrumb path, then the heading, then actions. */
export function PageHeader({
  crumb,
  title,
  meta,
  actions,
}: {
  crumb: string;
  title: string;
  meta?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-[10px] tracking-[0.02em] text-ink-4">
          {crumb}
        </p>
        <h1 className="mt-1 text-[22px] font-semibold leading-none tracking-[-0.02em] text-ink">
          {title}
        </h1>
        {meta && <p className="mt-2 text-[11px] text-ink-3">{meta}</p>}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2 pt-1">{actions}</div>
      )}
    </div>
  );
}
