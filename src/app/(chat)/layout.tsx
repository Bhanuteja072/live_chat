import type { ReactNode } from "react";

import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/nextjs";
import { OnlineTracker } from "@/components/OnlineTracker";
import { SyncUser } from "@/components/SyncUser";

export default function ChatLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <SignedIn>
        <SyncUser />
        <OnlineTracker />
        {children}
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
