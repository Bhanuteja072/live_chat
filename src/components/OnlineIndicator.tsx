import { cn } from "@/lib/utils";

interface OnlineIndicatorProps {
  isOnline?: boolean;
  size?: "sm" | "md";
}

export function OnlineIndicator({ isOnline, size = "sm" }: OnlineIndicatorProps) {
  return (
    <span
      className={cn(
        "rounded-full ring-2 ring-background",
        isOnline ? "bg-green-500" : "bg-gray-300",
        size === "sm" ? "h-2 w-2" : "h-3 w-3"
      )}
    />
  );
}
