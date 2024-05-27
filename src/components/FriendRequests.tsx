"use client";

import { useState } from "react";
import { Icons } from "./Icons";
import { Check, X } from "lucide-react";

type FriendRequestsProps = {
  sessionId: string;
  incomingFriendRequests: IncomingFriendRequest[];
};

export default function FriendRequests({
  sessionId,
  incomingFriendRequests,
}: FriendRequestsProps) {
  const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(
    incomingFriendRequests,
  );

  if (friendRequests.length === 0) {
    return <p className="text-sm text-zinc-500">Nothing to show here...</p>;
  }

  return friendRequests.map((request) => (
    <div key={request.senderId} className="flex gap-4 items-center">
      <Icons.UserPlus className="text-black" />
      <p className="font-medium text-lg">{request.senderEmail}</p>
      <button
        aria-label="Accept friend request"
        className="size-8 bg-indigo-600 hover:bg-indigo-700 grid rounded-full place-items-center transition hover:shadow-md"
      >
        <Check className="font-semibold text-white size-3/4" />
      </button>
      <button
        aria-label="Decline friend request"
        className="size-8 bg-red-600 hover:bg-red-700 grid rounded-full place-items-center transition hover:shadow-md"
      >
        <X className="font-semibold text-white size-3/4" />
      </button>
    </div>
  ));
}
