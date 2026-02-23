"use client";

import { useEffect } from "react";
import { useConvexAuth, useMutation } from "convex/react";

import { api } from "../../convex/_generated/api";

export function OnlineTracker() {
  const { isAuthenticated } = useConvexAuth();
  const setOnlineStatus = useMutation(api.users.setOnlineStatus);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const handleBeforeUnload = () => {
      void setOnlineStatus({ isOnline: false });
    };

    const handleVisibilityChange = () => {
      void setOnlineStatus({ isOnline: !document.hidden });
    };

    void setOnlineStatus({ isOnline: true });
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      void setOnlineStatus({ isOnline: false });
    };
  }, [isAuthenticated, setOnlineStatus]);

  return null;
}
