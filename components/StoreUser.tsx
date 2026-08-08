"use client";

import { useConvexAuth, useMutation } from "convex/react";
import { useEffect } from "react";
import { api } from "@/convex/_generated/api";

/** Ensures a Convex users row exists once Clerk + Convex auth are ready. */
export function StoreUser() {
  const { isAuthenticated } = useConvexAuth();
  const storeUser = useMutation(api.users.store);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    void storeUser();
  }, [isAuthenticated, storeUser]);

  return null;
}
