export function formatMessageTime(timestamp: number): string {
  const messageDate = new Date(timestamp);
  const now = new Date();

  const isToday = messageDate.toDateString() === now.toDateString();
  const isSameYear = messageDate.getFullYear() === now.getFullYear();

  if (isToday) {
    return messageDate.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  if (isSameYear) {
    return (
      messageDate.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      }) +
      ", " +
      messageDate.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })
    );
  }

  return (
    messageDate.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) +
    ", " +
    messageDate.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    })
  );
}
