import ChatInput from "@/components/ChatInput";
import Messages from "@/components/Messages";
import { fetchRedis } from "@/helpers/redis";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { messageArrayValidator } from "@/lib/validations/message";
import { type User } from "next-auth";
import Image from "next/image";
import { notFound } from "next/navigation";

type ChatPageProps = {
  params: {
    chatId: string;
  };
};

async function getChatMessages(chatId: string) {
  try {
    const results: string[] = await fetchRedis(
      "zrange",
      `chat:${chatId}:messages`,
      0,
      -1,
    );

    const dbMessages = results.map((result) => JSON.parse(result) as Message);
    const reverseDbMessages = dbMessages.reverse();

    const messages = messageArrayValidator.parse(reverseDbMessages);
    return messages;
  } catch (error) {
    notFound();
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { chatId } = params;
  const session = await auth();
  if (!session || !session.user?.id) {
    notFound();
  }
  const { user } = session;
  const [userId1, userId2] = chatId.split("--");

  if (user.id !== userId1 && user.id !== userId2) {
    notFound();
  }

  const chatPartnerId = user.id === userId1 ? userId1 : userId2;
  const chatPartner = (await db.get(`user:${chatPartnerId}`)) as User;
  const initialMessages = await getChatMessages(chatId);

  return (
    <div className="flex-1 justify-between flex flex-col h-full max-h-[calc(100vh-6rem)]">
      <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200">
        <div className="relative flex items-center space-x-4">
          <div className="relative">
            <div className="relative size-8 sm:size-12">
              <Image
                fill
                referrerPolicy="no-referrer"
                src={chatPartner.image!}
                alt={`${chatPartner.name}'s profile picture`}
                className="rounded-full"
              />
            </div>
          </div>

          <div className="flex flex-col leading-tight">
            <div className="text-xl flex items-center">
              <span className="text-gray-700 mr-3 font-semibold">
                {chatPartner.name}
              </span>

              <span className="text-gray-600 text-sm">{chatPartner.email}</span>
            </div>
          </div>
        </div>
      </div>

      <Messages sessionId={session.user.id} initialMessages={initialMessages} />
      <ChatInput chatPartner={chatPartner} chatId={chatId} />
    </div>
  );
}
