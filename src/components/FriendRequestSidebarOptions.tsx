"use client";

import { User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type FriendRequestSidebarOptionsProps = {
  sessionId: string;
  initialUnseenRequestsCount: number;
};

export default function FriendRequestSidebarOptions({
  sessionId,
  initialUnseenRequestsCount,
}: FriendRequestSidebarOptionsProps) {
  const [unseenRequestsCount, setUnseenRequestsCount] = useState(
    initialUnseenRequestsCount,
  );
  return (
    <Link
      href="/dashboard/requests"
      className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 leading-6 text-sm font-semibold"
    >
      <div className="text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex size-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white">
        <User className="size-4" />
      </div>
      <p className="truncate">Friend requests</p>
      {unseenRequestsCount > 0 && (
        <div className="rounded-full size-5 text-xs flex items-center justify-center text-white bg-indigo-600">
          {unseenRequestsCount}
        </div>
      )}
    </Link>
  );
}
