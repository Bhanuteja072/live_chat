"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatMessageTime } from "@/lib/formatMessageTime";
import { cn } from "@/lib/utils";
import type { Id } from "../../convex/_generated/dataModel";

interface MessageBubbleProps {
  message: {
    _id: Id<"messages">;
    content: string;
    senderId: string;
    createdAt: number;
    senderName: string;
    senderImageUrl: string;
  };
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const initials = message.senderName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

  return (
    <div
      className={cn(
        "flex w-full gap-2",
        isOwn ? "justify-end" : "justify-start"
      )}
    >
      {!isOwn ? (
        <Avatar className="h-7 w-7">
          <AvatarImage src={message.senderImageUrl} alt={message.senderName} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      ) : null}
      <div className={cn("flex flex-col", isOwn ? "items-end" : "items-start")}>
        <div
          className={cn(
            "max-w-[70%] rounded-2xl px-4 py-2 text-sm",
            isOwn
              ? "rounded-br-sm bg-blue-500 text-white"
              : "rounded-bl-sm bg-muted text-foreground"
          )}
        >
          {message.content}
        </div>
        <span className="mt-1 text-xs text-muted-foreground">
          {formatMessageTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}
