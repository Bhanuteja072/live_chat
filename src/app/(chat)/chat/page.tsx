"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";

import { ChatArea } from "@/components/ChatArea";
import { ConversationList } from "@/components/ConversationList";
import { EmptyState } from "@/components/EmptyState";
import { Sidebar } from "@/components/Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";

export default function ChatPage() {
  const { user, isLoaded } = useUser();
  const clerkId = user?.id ?? null;

  const [selectedConversationId, setSelectedConversationId] = useState<
    Id<"conversations"> | null
  >(null);
  const [activeTab, setActiveTab] = useState<"chats" | "people">("chats");

  const users = useQuery(api.users.getAll, clerkId ? { clerkId } : "skip");
  const conversations = useQuery(api.conversations.getMyConversations);
  const getOrCreateConversation = useMutation(api.conversations.getOrCreate);

  const displayName = user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "";
  const imageUrl = user?.imageUrl ?? "";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

  const handleUserSelect = async (otherClerkId: string) => {
    const conversationId = await getOrCreateConversation({
      otherUserClerkId: otherClerkId,
    });
    setSelectedConversationId(conversationId);
    setActiveTab("chats");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={imageUrl} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{displayName || "Signed in"}</span>
            {isLoaded && user?.primaryEmailAddress?.emailAddress ? (
              <span className="text-xs text-muted-foreground">
                {user.primaryEmailAddress.emailAddress}
              </span>
            ) : null}
          </div>
        </div>
        <UserButton afterSignOutUrl="/" />
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="flex w-full flex-col border-b md:w-80 md:border-b-0 md:border-r">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "chats" | "people")}
            className="flex h-full flex-col"
          >
            <div className="border-b px-4 py-3">
              <TabsList className="w-full">
                <TabsTrigger value="chats" className="flex-1">
                  Chats
                </TabsTrigger>
                <TabsTrigger value="people" className="flex-1">
                  People
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="chats" className="flex-1">
              <ConversationList
                conversations={conversations}
                selectedId={selectedConversationId}
                onSelect={setSelectedConversationId}
              />
            </TabsContent>
            <TabsContent value="people" className="flex-1">
              <Sidebar users={users} onUserSelect={handleUserSelect} />
            </TabsContent>
          </Tabs>
        </aside>
        <main className="flex flex-1">
          {selectedConversationId && clerkId ? (
            <ChatArea
              conversationId={selectedConversationId}
              currentUserClerkId={clerkId}
            />
          ) : (
            <EmptyState
              icon={<MessageSquare size={48} />}
              title="Select a conversation"
              description="Choose a person from the sidebar to start chatting"
            />
          )}
        </main>
      </div>
    </div>
  );
}
