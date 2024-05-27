import { cn, getChatHref } from "@/lib/utils";
import Image from "next/image";
import { type Toast, toast } from "react-hot-toast";

type UnseenChatToastProps = {
  t: Toast;
  sessionId: string;
  senderId: string;
  senderImg: string;
  senderName: string;
  senderMessage: string;
};

export default function UnseenChatToast({
  t,
  sessionId,
  senderId,
  senderImg,
  senderName,
  senderMessage,
}: UnseenChatToastProps) {
  return (
    <div
      className={cn(
        "max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5",
        t.visible ? "animate-enter" : "animate-leave",
      )}
    >
      <a
        onClick={() => toast.dismiss(t.id)}
        href={`/dashboard/chat/${getChatHref(sessionId, senderId)}`}
        className="flex-1 w-0 p-4"
      >
        <div className="flex items-start">
          <div className="shrink-0 pt-0.5">
            <div className="relative size-10">
              <Image
                fill
                referrerPolicy="no-referrer"
                src={senderImg}
                alt={`${senderName}'s profile picture`}
                className="rounded-full"
              />
            </div>
          </div>

          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">{senderName}</p>
            <p className="text-sm text-gray-500 mt-1">{senderMessage}</p>
          </div>
        </div>
      </a>

      <div className="flex border-l border-gray-200">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Close
        </button>
      </div>
    </div>
  );
}
