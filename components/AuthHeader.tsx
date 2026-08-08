"use client";

import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
} from "convex/react";

export function AuthHeader() {
  return (
    <header className="flex items-center justify-end gap-3 border-b border-zinc-200 px-6 py-3 dark:border-zinc-800">
      <Unauthenticated>
        <SignInButton mode="modal">
          <button
            type="button"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Sign in
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button
            type="button"
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Sign up
          </button>
        </SignUpButton>
      </Unauthenticated>
      <Authenticated>
        <UserButton />
      </Authenticated>
      <AuthLoading>
        <span className="text-sm text-zinc-500">Loading…</span>
      </AuthLoading>
    </header>
  );
}
