"use client";

import { useQuery } from "convex/react";

import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface TypingIndicatorProps {
  conversationId: Id<"conversations">;
  currentUserClerkId: string;
}

export function TypingIndicator({
  conversationId,
  currentUserClerkId,
}: TypingIndicatorProps) {
  const typingUsers = useQuery(api.typing.getTypingUsers, { conversationId });

  if (!typingUsers) {
    return null;
  }

  const others = typingUsers.filter((user) => user.userId !== currentUserClerkId);
  if (others.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-4 py-1 text-sm text-muted-foreground">
      <div className="flex gap-1">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
      </div>
      <span>{others[0].userName} is typing...</span>
    </div>
  );
}
