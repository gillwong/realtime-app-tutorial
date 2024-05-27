import FriendRequests from "@/components/FriendRequests";
import { fetchRedis } from "@/helpers/redis";
import { auth } from "@/lib/auth";
import { User } from "next-auth";
import { notFound } from "next/navigation";

export default async function FriendRequestsPage() {
  const session = await auth();
  if (!session || !session.user?.id) {
    notFound();
  }

  // ids of users who sent current logged in user friend requests
  const incomingSenderIds = (await fetchRedis(
    "smembers",
    `user:${session.user.id}:incoming_friend_requests`,
  )) as string[];

  const incomingFriendRequests = await Promise.all(
    incomingSenderIds.map(async (senderId) => {
      const sender = JSON.parse(await fetchRedis("get", `user:${senderId}`)) as User;
      return { senderId, senderEmail: sender.email };
    }),
  );

  return (
    <main className="pt-8">
      <h1 className="font-bold text-5xl mb-8">Add a friend</h1>
      <div className="flex flex-col gap-4">
        <FriendRequests
          sessionId={session.user.id}
          incomingFriendRequests={incomingFriendRequests}
        />
      </div>
    </main>
  );
}
