"use client";

import { pusherClient } from "@/lib/pusher";
import { getChatHref, toPusherKey } from "@/lib/utils";
import { type User } from "next-auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import UnseenChatToast from "./UnseenChatToast";

type SidebarChatListProps = {
  sessionId: string;
  friends: User[];
};

type ExtendedMessage = Message & {
  senderImg: string;
  senderName: string;
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

  useEffect(() => {
    function chatHandler(message: ExtendedMessage) {
      const shouldNotify =
        pathname !==
        `/dashboard/chat/${getChatHref(sessionId, message.senderId)}`;
      if (!shouldNotify) return;
      // should be notified
      toast.custom((t) => (
        <UnseenChatToast
          t={t}
          sessionId={sessionId}
          senderId={message.senderId}
          senderImg={message.senderImg}
          senderName={message.senderName}
          senderMessage={message.text}
        />
      ));

      setUnseenMessages((prev) => [...prev, message]);
    }

    function newFriendHandler() {
      router.refresh();
    }

    pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`));
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`));
    pusherClient.bind("new_message", chatHandler);
    pusherClient.bind("new_friend", newFriendHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`));
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`));
      pusherClient.unbind("new_message", chatHandler);
      pusherClient.unbind("new_friend", newFriendHandler);
    };
  }, [pathname, sessionId, router]);

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
