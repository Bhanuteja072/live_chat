"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { formatMessageTime } from "@/lib/formatMessageTime";
import { cn } from "@/lib/utils";
import type { Id } from "../../convex/_generated/dataModel";
import { MessageSquare } from "lucide-react";

interface ConversationItem {
  _id: Id<"conversations">;
  otherUser: {
    clerkId: string;
    name: string;
    imageUrl: string;
  };
  lastMessagePreview?: string;
  lastMessageTime?: number;
}

interface ConversationListProps {
  conversations: ConversationItem[] | undefined;
  selectedId: Id<"conversations"> | null;
  onSelect: (id: Id<"conversations">) => void;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: ConversationListProps) {
  if (!conversations) {
    return (
      <div className="flex h-full flex-col gap-3 p-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquare size={48} />}
        title="No conversations yet"
        description="Go to People tab and start a conversation"
      />
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 p-3" role="list">
        {conversations.map((conversation) => {
          const isSelected = conversation._id === selectedId;
          const preview = conversation.lastMessagePreview?.slice(0, 40) ?? "";
          const timeLabel = conversation.lastMessageTime
            ? formatMessageTime(conversation.lastMessageTime)
            : "";
          const initials = conversation.otherUser.name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("") || "?";

          return (
            <button
              key={conversation._id}
              type="button"
              onClick={() => onSelect(conversation._id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                isSelected ? "bg-accent" : "hover:bg-muted/60"
              )}
            >
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={conversation.otherUser.imageUrl}
                  alt={conversation.otherUser.name}
                />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold">
                    {conversation.otherUser.name}
                  </p>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {timeLabel}
                  </span>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {preview}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
