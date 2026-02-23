"use client";

import { useMemo, useState } from "react";
import { Search, UserX, Users } from "lucide-react";

import { EmptyState } from "@/components/EmptyState";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { UserCard } from "@/components/UserCard";
import type { Doc } from "../../convex/_generated/dataModel";

interface SidebarProps {
  users: Doc<"users">[] | undefined;
  onUserSelect: (clerkId: string) => void;
}

export function Sidebar({ users, onUserSelect }: SidebarProps) {
  const [search, setSearch] = useState("");
  const availableUsers = users ?? [];

  // Client-side filtering keeps the UI reactive without extra round-trips.
  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return availableUsers;
    return availableUsers.filter((user) => user.name.toLowerCase().includes(term));
  }, [search, availableUsers]);

  const hasNoUsers = users !== undefined && availableUsers.length === 0;
  const hasNoMatches = !hasNoUsers && filteredUsers.length === 0;

  return (
    <div className="flex h-full min-h-[60vh] flex-col bg-card">
      <div className="border-b px-4 py-3">
        <label className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 shadow-sm">
          <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search users"
            className="border-none p-0 shadow-none outline-none focus-visible:ring-0"
            aria-label="Search users"
          />
        </label>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-3" role="list">
          {users === undefined ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : hasNoUsers ? (
            <EmptyState
              icon={<Users size={48} />}
              title="No other users yet"
              description="Invite someone to join the chat!"
            />
          ) : hasNoMatches ? (
            <EmptyState
              icon={<UserX size={48} />}
              title="No users found"
              description="Try searching a different name"
            />
          ) : (
            filteredUsers.map((user) => (
              <button
                key={user._id}
                type="button"
                className="w-full text-left"
                onClick={() => onUserSelect(user.clerkId)}
              >
                <UserCard
                  name={user.name}
                  email={user.email}
                  imageUrl={user.imageUrl}
                  isOnline={user.isOnline}
                />
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
