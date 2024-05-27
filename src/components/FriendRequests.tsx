"use client";

import { useEffect, useState } from "react";
import { Icons } from "./Icons";
import { Check, X } from "lucide-react";
import { acceptFriendRequest, denyFriendRequest } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";

type FriendRequestsProps = {
  sessionId: string;
  incomingFriendRequests: IncomingFriendRequest[];
};

export default function FriendRequests({
  sessionId,
  incomingFriendRequests,
}: FriendRequestsProps) {
  const router = useRouter();
  const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(
    incomingFriendRequests,
  );

  useEffect(() => {
    function friendRequestHandler({
      senderId,
      senderEmail,
    }: IncomingFriendRequest) {
      setFriendRequests((prev) => [...prev, { senderId, senderEmail }]);
    }

    pusherClient.subscribe(
      toPusherKey(`user:${sessionId}:incoming_friend_requests`),
    );
    pusherClient.bind("incoming_friend_requests", friendRequestHandler);

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`user:${sessionId}:incoming_friend_requests`),
      );
      pusherClient.unbind("incoming_friend_requests", friendRequestHandler);
    };
  }, [sessionId]);

  async function acceptFriend(senderId: string) {
    try {
      await acceptFriendRequest(senderId);

      setFriendRequests((prev) =>
        prev.filter((request) => request.senderId !== senderId),
      );
    } catch (error) {
      toast.error("There was a problem accepting friend request.");
    } finally {
      router.refresh();
    }
  }

  async function denyFriend(senderId: string) {
    try {
      await denyFriendRequest(senderId);

      setFriendRequests((prev) =>
        prev.filter((request) => request.senderId !== senderId),
      );
    } catch (error) {
      toast.error("There was a problem denying friend request.");
    } finally {
      router.refresh();
    }
  }

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
        onClick={() => acceptFriend(request.senderId)}
      >
        <Check className="font-semibold text-white size-3/4" />
      </button>
      <button
        aria-label="Deny friend request"
        className="size-8 bg-red-600 hover:bg-red-700 grid rounded-full place-items-center transition hover:shadow-md"
        onClick={() => denyFriend(request.senderId)}
      >
        <X className="font-semibold text-white size-3/4" />
      </button>
    </div>
  ));
}
