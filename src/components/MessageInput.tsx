"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface MessageInputProps {
  onSend: (content: string) => void;
  conversationId: Id<"conversations">;
  currentUserClerkId: string;
  currentUserName: string;
  disabled?: boolean;
}

export function MessageInput({
  onSend,
  conversationId,
  currentUserClerkId,
  currentUserName,
  disabled,
}: MessageInputProps) {
  const [value, setValue] = useState("");
  const isDisabled = disabled || value.trim().length === 0;
  const setTyping = useMutation(api.typing.setTyping);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      void setTyping({ conversationId, isTyping: false, userName: currentUserName });
    };
  }, [conversationId, currentUserName, setTyping]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    void setTyping({ conversationId, isTyping: false, userName: currentUserName });
    onSend(trimmed);
    setValue("");
  };

  return (
    <div className="flex items-center gap-2 border-t p-4">
      <Input
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value;
          setValue(nextValue);
          if (disabled) {
            return;
          }

          void setTyping({
            conversationId,
            isTyping: true,
            userName: currentUserName,
          });

          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }

          typingTimeoutRef.current = setTimeout(() => {
            void setTyping({
              conversationId,
              isTyping: false,
              userName: currentUserName,
            });
          }, 2000);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSend();
          }
        }}
        placeholder="Type a message"
        disabled={disabled}
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={isDisabled}
        className={cn(
          "inline-flex h-10 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors",
          isDisabled && "cursor-not-allowed opacity-60"
        )}
        aria-label="Send message"
      >
        <Send className="h-4 w-4" />
      </button>
    </div>
  );
}
