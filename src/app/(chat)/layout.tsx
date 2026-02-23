import type { ReactNode } from "react";

import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/nextjs";
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
        {children}
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
