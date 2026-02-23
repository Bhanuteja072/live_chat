"use client";

import { OnlineIndicator } from "@/components/OnlineIndicator";
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
    isOnline?: boolean;
  };
  lastMessagePreview?: string;
  lastMessageTime?: number;
  unreadCount: number;
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
          const hasUnread = conversation.unreadCount > 0;
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
              <div className="relative">
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={conversation.otherUser.imageUrl}
                    alt={conversation.otherUser.name}
                  />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0">
                  <OnlineIndicator isOnline={conversation.otherUser.isOnline} size="sm" />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={cn(
                      "truncate text-sm",
                      hasUnread ? "font-semibold" : "font-normal"
                    )}
                  >
                    {conversation.otherUser.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {timeLabel}
                    </span>
                    {hasUnread ? (
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-500 px-1 text-xs font-bold text-white">
                        {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </div>
                <p
                  className={cn(
                    "truncate text-xs",
                    hasUnread ? "text-foreground" : "text-muted-foreground"
                  )}
                >
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
