"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

// Runs after sign-in to keep Clerk user data mirrored in Convex.
export function SyncUser() {
  const { isLoaded, isSignedIn, user } = useUser();
  const upsertUser = useMutation(api.users.upsertUser);
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) {
      return;
    }

    if (hasSyncedRef.current) {
      return;
    }

    hasSyncedRef.current = true;

    const email = user.primaryEmailAddress?.emailAddress ?? "";
    const name = user.fullName ?? email ?? "Anonymous";
    const imageUrl = user.imageUrl ?? "";

    void upsertUser({
      clerkId: user.id,
      name,
      email,
      imageUrl,
    });
  }, [isLoaded, isSignedIn, upsertUser, user]);

  return null;
}
