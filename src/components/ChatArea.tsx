"use client";

import { useEffect, useMemo, useRef } from "react";
import { MessageCircle } from "lucide-react";
import { useMutation, useQuery } from "convex/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { MessageBubble } from "@/components/MessageBubble";
import { MessageInput } from "@/components/MessageInput";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface ChatAreaProps {
  conversationId: Id<"conversations">;
  currentUserClerkId: string;
}

export function ChatArea({ conversationId, currentUserClerkId }: ChatAreaProps) {
  const messages = useQuery(api.messages.getMessages, { conversationId });
  const conversations = useQuery(api.conversations.getMyConversations);
  const sendMessage = useMutation(api.messages.send);

  const conversation = useMemo(
    () => conversations?.find((item) => item._id === conversationId),
    [conversationId, conversations]
  );

  const otherUser = conversation?.otherUser;
  const initials = otherUser?.name
    ? otherUser.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("")
    : "?";

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (content: string) => {
    await sendMessage({ conversationId, content });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b px-6 py-4">
        {otherUser ? (
          <>
            <Avatar>
              <AvatarImage src={otherUser.imageUrl} alt={otherUser.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">{otherUser.name}</p>
              <p className="text-xs text-muted-foreground">Direct message</p>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4 p-6">
          {messages ? (
            messages.length === 0 ? (
              <div className="flex h-full min-h-[300px] items-center justify-center">
                <EmptyState
                  icon={<MessageCircle size={48} />}
                  title="No messages yet"
                  description="Say hello! Be the first to send a message."
                />
              </div>
            ) : (
              messages.map((message) => (
                <MessageBubble
                  key={message._id}
                  message={message}
                  isOwn={message.senderId === currentUserClerkId}
                />
              ))
            )
          ) : (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-2/3" />
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <MessageInput onSend={handleSend} disabled={!conversationId} />
    </div>
  );
}
