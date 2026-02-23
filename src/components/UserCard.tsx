"use client";

import { OnlineIndicator } from "@/components/OnlineIndicator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserCardProps {
  name: string;
  email: string;
  imageUrl?: string;
  isOnline?: boolean;
  className?: string;
}

export function UserCard({
  name,
  email,
  imageUrl,
  isOnline,
  className,
}: UserCardProps) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 transition-colors hover:border-border hover:bg-muted/50",
        className
      )}
      role="listitem"
    >
      <div className="relative">
        <Avatar>
          <AvatarImage src={imageUrl} alt={name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <span className="absolute bottom-0 right-0">
          <OnlineIndicator isOnline={isOnline} size="sm" />
        </span>
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{name}</p>
        <p className="truncate text-xs text-muted-foreground">{email}</p>
      </div>
    </div>
  );
}
