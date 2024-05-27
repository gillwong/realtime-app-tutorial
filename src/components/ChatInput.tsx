"use client";

import { type User } from "next-auth";
import { useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import Button from "./ui/Button";
import { toast } from "react-hot-toast";
import { sendMessage as sendMessageAction } from "@/lib/actions";

type ChatInputProps = {
  chatPartner: User;
  chatId: string;
};

export default function ChatInput({ chatPartner, chatId }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");

  async function sendMessage() {
    if (!input) return;
    setIsLoading(true);
    try {
      await sendMessageAction(input, chatId);
      setInput("");
    } catch (error) {
      toast.error("Somthing went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="border-t border-gray-200 p-4 mb-2 sm:mb-0">
      <div className="relative flex-1 overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
        <TextareaAutosize
          ref={textareaRef}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          rows={1}
          value={input}
          onChange={({ target }) => setInput(target.value)}
          placeholder={`Message ${chatPartner.name}`}
          className="block w-full resize-none border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:py-1.5 sm:text-sm sm:leading-6"
        />

        <div
          className="py-2"
          aria-hidden="true"
          onClick={() => textareaRef.current?.focus()}
        >
          <div className="py-px">
            <div className="h-9" />
          </div>
        </div>

        <div className="absolute right-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
          <div className="shrink-0">
            <Button onClick={sendMessage} type="submit" isLoading={isLoading}>
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
