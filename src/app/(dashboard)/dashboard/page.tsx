import { getFriendsByUserId } from "@/helpers/friend";
import { fetchRedis } from "@/helpers/redis";
import { auth } from "@/lib/auth";
import { getChatHref } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session || !session.user?.id) {
    notFound();
  }

  const friends = await getFriendsByUserId(session.user.id);

  const friendsWithLastMessage = await Promise.all(
    friends.map(async (friend) => {
      const [lastMessageRaw]: string[] = await fetchRedis(
        "zrange",
        `chat:${getChatHref(session.user!.id!, friend.id!)}:messages`,
        -1,
        -1,
      );
      return { ...friend, lastMessage: JSON.parse(lastMessageRaw) as Message };
    }),
  );

  return (
    <div className="container py-12">
      <h1 className="text-5xl font-bold mb-8">Recent chats</h1>
      {friendsWithLastMessage.length === 0 ? (
        <p className="text-sm text-zinc-500">Nothing to show here...</p>
      ) : (
        friendsWithLastMessage.map((friend) => (
          <div
            key={friend.id}
            className="relative bg-zinc-50 border border-zinc-200 p-3 rounded-md"
          >
            <div className="absolute right-4 inset-y-0 flex items-center">
              <ChevronRight className="size-7 text-zinc-400" />
            </div>
            <Link
              href={`/dashboard/chat/${getChatHref(session.user!.id!, friend.id!)}`}
              className="relative sm:flex as Message"
            >
              <div className="mb-4 shrink-0 sm:mb-0 sm:mr-4">
                <div className="relative size-6">
                  <Image
                    fill
                    referrerPolicy="no-referrer"
                    className="rounded-full"
                    alt={`${friend.name}'s profile picture`}
                    src={friend.image ?? ""}
                  />
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold">{friend.name}</h4>
                <p className="mt-1 max-w-md">
                  <span className="text-zinc-400">
                    {friend.lastMessage.senderId === session.user?.id
                      ? "You: "
                      : ""}
                  </span>
                  {friend.lastMessage.text}
                </p>
              </div>
            </Link>
          </div>
        ))
      )}
    </div>
  );
}
