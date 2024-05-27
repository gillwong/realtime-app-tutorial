"use client";

import { getChatHref } from "@/lib/utils";
import { type User } from "next-auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SidebarChatListProps = {
  sessionId: string;
  friends: User[];
};

export default function SidebarChatList({
  sessionId,
  friends,
}: SidebarChatListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (pathname?.includes("chat")) {
      setUnseenMessages((prev) =>
        prev.filter((msg) => !pathname.includes(msg.senderId)),
      );
    }
  }, [pathname]);

  return (
    <ul role="list" className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
      {friends.toSorted().map((friend) => {
        const unseenMessagesCount = unseenMessages.filter(
          (unseenMessage) => unseenMessage.senderId === friend.id,
        ).length;

        return (
          <li key={friend.id}>
            {/* a tag forces refresh */}
            <a
              href={`/dashboard/chat/${getChatHref(sessionId, friend.id ?? "")}`}
              className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 flex items-center group gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
            >
              {friend.name}
              {unseenMessagesCount > 0 && (
                <div className="bg-indigo-600 rounded-full font-medium text-xs text-white size-4 grid place-items-center">
                  {unseenMessagesCount}
                </div>
              )}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
