"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, MessageCircle } from "lucide-react";
import { useMutation, useQuery } from "convex/react";

import { OnlineIndicator } from "@/components/OnlineIndicator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { MessageBubble } from "@/components/MessageBubble";
import { MessageInput } from "@/components/MessageInput";
import { TypingIndicator } from "@/components/TypingIndicator";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface ChatAreaProps {
  conversationId: Id<"conversations">;
  currentUserClerkId: string;
  currentUserName: string;
  onBack?: () => void;
}

export function ChatArea({
  conversationId,
  currentUserClerkId,
  currentUserName,
  onBack,
}: ChatAreaProps) {
  const messages = useQuery(api.messages.getMessages, { conversationId });
  const conversations = useQuery(api.conversations.getMyConversations);
  const sendMessage = useMutation(api.messages.send);
  const markAsRead = useMutation(api.conversations.markAsRead);

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
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showNewMessages, setShowNewMessages] = useState(false);
  const prevMessageCountRef = useRef(0);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    const distanceFromBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight;
    const atBottom = distanceFromBottom < 50;
    setIsAtBottom(atBottom);
    if (atBottom) {
      setShowNewMessages(false);
    }
  };

  useEffect(() => {
    if (!messages || messages.length === 0) return;

    const previousCount = prevMessageCountRef.current;
    prevMessageCountRef.current = messages.length;

    if (messages.length <= previousCount) {
      return;
    }

    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setShowNewMessages(false);
    } else {
      setShowNewMessages(true);
    }
  }, [isAtBottom, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setIsAtBottom(true);
    setShowNewMessages(false);
  };

  useEffect(() => {
    setIsAtBottom(true);
    setShowNewMessages(false);
    prevMessageCountRef.current = messages?.length ?? 0;
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }, 100);
  }, [conversationId, messages?.length]);

  useEffect(() => {
    void markAsRead({ conversationId });
  }, [conversationId, markAsRead, messages]);

  const handleSend = async (content: string) => {
    await sendMessage({ conversationId, content });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b px-6 py-4">
        <button
          type="button"
          className="mr-2 rounded p-1 hover:bg-accent md:hidden"
          onClick={() => onBack?.()}
        >
          <ArrowLeft size={20} />
        </button>
        {otherUser ? (
          <>
            <div className="relative">
              <Avatar>
                <AvatarImage src={otherUser.imageUrl} alt={otherUser.name} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0">
                <OnlineIndicator isOnline={otherUser.isOnline} size="md" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">{otherUser.name}</p>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <OnlineIndicator isOnline={otherUser.isOnline} size="sm" />
                  {otherUser.isOnline ? "Online" : "Offline"}
                </span>
              </div>
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

      <div className="relative flex-1 overflow-hidden">
        <div
          ref={scrollAreaRef}
          className="flex-1 overflow-y-auto p-4"
          onScroll={handleScroll}
        >
          <div className="space-y-4">
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
        </div>
        {showNewMessages ? (
          <div className="absolute bottom-20 left-1/2 z-10 -translate-x-1/2">
            <button
              type="button"
              onClick={scrollToBottom}
              className="flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:bg-blue-600 animate-bounce"
            >
              <ArrowDown size={16} />
              New messages
            </button>
          </div>
        ) : null}
      </div>
      <TypingIndicator
        conversationId={conversationId}
        currentUserClerkId={currentUserClerkId}
      />
      <MessageInput
        onSend={handleSend}
        conversationId={conversationId}
        currentUserClerkId={currentUserClerkId}
        currentUserName={currentUserName}
        disabled={!conversationId}
      />
    </div>
  );
}
