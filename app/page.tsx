"use client";

import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  useQuery,
} from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Cursor Hackathon
      </h1>
      <p className="text-lg text-zinc-600 dark:text-zinc-400">
        Next.js + Convex + Clerk authentication.
      </p>

      <AuthLoading>
        <p className="text-sm text-zinc-500">Checking auth…</p>
      </AuthLoading>

      <Unauthenticated>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Continue with GitHub to sync your identity with Convex.
        </p>
      </Unauthenticated>

      <Authenticated>
        <CurrentUserCard />
      </Authenticated>
    </main>
  );
}

function CurrentUserCard() {
  const user = useQuery(api.users.current);

  if (user === undefined) {
    return <p className="text-sm text-zinc-500">Loading profile…</p>;
  }

  if (user === null) {
    return (
      <p className="text-sm text-zinc-500">
        Authenticated with Clerk — creating your Convex user…
      </p>
    );
  }

  return (
    <div className="space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
      <p>
        Signed in as <span className="font-medium">{user.name}</span>
      </p>
      <p className="text-zinc-500">{user.email}</p>
    </div>
  );
}
