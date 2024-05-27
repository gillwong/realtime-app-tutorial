"use client";

import { cn } from "@/lib/utils";
import { type Message } from "@/lib/validations/message";
import { useRef, useState } from "react";

type MessagesProps = {
  sessionId: string;
  initialMessages: Message[];
};
export default function Messages({
  sessionId,
  initialMessages,
}: MessagesProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const scrollDownRef = useRef<HTMLDivElement | null>(null);
  return (
    <div
      id="messages"
      className="flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
    >
      <div ref={scrollDownRef} />
      {messages.map((message, index) => {
        const isCurrentUser = message.senderId === sessionId;
        const hasNextMessageFromSameUser =
          messages[index - 1]?.senderId === messages[index].senderId;

        return (
          <div
            key={`${message.id}-${message.timestamp}`}
            className="chat-message"
          >
            <div
              className={cn(
                "flex items-end",
                isCurrentUser ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "flex flex-col space-y-2 text-base max-w-xs mx-2",
                  isCurrentUser ? "order-1 items-end" : "order-2 items-start",
                )}
              >
                <span
                  className={cn("rounded-lg inline-block py-2 px-4", {
                    "bg-indigo-600 text-white": isCurrentUser,
                    "bg-gray-200 text-gray-900": !isCurrentUser,
                    "rounded-br-none":
                      !hasNextMessageFromSameUser && isCurrentUser,
                    "rounded-bl-none":
                      !hasNextMessageFromSameUser && !isCurrentUser,
                  })}
                >
                  {message.text}{" "}
                  <span className="ml-2 text-xs text-gray-400">
                    {message.timestamp}
                  </span>
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
