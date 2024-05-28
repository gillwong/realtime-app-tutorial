"use server";

import { auth } from "./auth";
import { addFriendValidator } from "./validations/add-friend";
import { db } from "./db";
import { z } from "zod";
import { type FormData } from "@/components/AddFriendButton";
import { isAlreadyAdded, isAlreadyFriends } from "@/helpers/friend";
import { fetchRedis } from "@/helpers/redis";
import { User } from "next-auth";
import { Message, messageValidator } from "./validations/message";
import { nanoid } from "nanoid";
import { pusherServer } from "./pusher";
import { toPusherKey } from "./utils";

export async function createFriendRequest(
  formData: FormData,
): Promise<{ error: string | null }> {
  try {
    const { email: emailToAdd } = addFriendValidator.parse(formData);

    // get user account id associated with the email
    const RESTResponse = await fetch(
      `${process.env.UPSTASH_REDIS_REST_URL}/get/user:email:${emailToAdd}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        },
        cache: "no-store",
      },
    );

    const data = (await RESTResponse.json()) as { result: string | null };
    const idToAdd = data.result;

    const session = await auth();

    if (!session || !session.user?.id) {
      return { error: "Unauthorized" };
    }
    if (!idToAdd) {
      return { error: "This person does not exist" };
    }
    if (idToAdd === session.user.id) {
      return { error: "Cannot add yourself as a friend" };
    }

    if (await isAlreadyAdded(idToAdd, session.user.id)) {
      return { error: "Already added this user" };
    }

    if (await isAlreadyFriends(idToAdd, session.user.id)) {
      return { error: "Already friends with this user" };
    }

    // valid request, send friend request
    await pusherServer.trigger(
      toPusherKey(`user:${idToAdd}:incoming_friend_requests`),
      "incoming_friend_requests",
      {
        senderId: session.user.id,
        senderEmail: session.user.email,
      },
    );
    db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id);

    return { error: null };
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return { error: "Invalid request payload" };
    }
    return { error: "An unknown error occurred" };
  }
}

export async function acceptFriendRequest(
  id: string,
): Promise<{ error: string | null }> {
  try {
    const idToAdd = z.string().parse(id);

    const session = await auth();
    if (!session || !session.user?.id) {
      return { error: "Unauthorized" };
    }

    if (await isAlreadyFriends(idToAdd, session.user.id)) {
      return { error: "Already friends with this user" };
    }

    const hasFriendRequest = await isAlreadyAdded(session.user.id, idToAdd);
    if (!hasFriendRequest) {
      return { error: "No friend request from this user" };
    }

    const [userRaw, friendRaw]: [string, string] = await Promise.all([
      fetchRedis("get", `user:${session.user.id}`),
      fetchRedis("get", `user:${idToAdd}`),
    ]);

    const [user, friend]: [User, User] = [
      JSON.parse(userRaw),
      JSON.parse(friendRaw),
    ];

    // notify added user
    await Promise.all([
      pusherServer.trigger(
        toPusherKey(`user:${idToAdd}:friends`),
        "new_friend",
        user,
      ),
      pusherServer.trigger(
        toPusherKey(`user:${session.user.id}:friends`),
        "new_friend",
        friend,
      ),
      db.sadd(`user:${session.user.id}:friends`, idToAdd),
      db.sadd(`user:${idToAdd}:friends`, session.user.id),
      db.srem(`user:${session.user.id}:incoming_friend_requests`, idToAdd),
    ]);

    return { error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: "Invalid request payload" };
    }
    return { error: "An unknown error occurred" };
  }
}

export async function denyFriendRequest(
  id: string,
): Promise<{ error: string | null }> {
  try {
    const idToAdd = z.string().parse(id);

    const session = await auth();
    if (!session || !session.user?.id) {
      return { error: "Unauthorized" };
    }

    const hasFriendRequest = await isAlreadyAdded(session.user.id, idToAdd);
    if (!hasFriendRequest) {
      return { error: "No friend request from this user" };
    }

    db.srem(`user:${session.user.id}:incoming_friend_requests`, idToAdd);

    return { error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: "Invalid request payload" };
    }
    return { error: "An unknown error occurred" };
  }
}

export async function sendMessage(
  text: string,
  chatId: string,
): Promise<{ error: string | null }> {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { error: "Unauthorized" };
    }

    const [userId1, userId2] = chatId.split("--");
    if (session.user.id !== userId1 && session.user.id !== userId2) {
      return { error: "Unauthorized" };
    }

    const friendId = session.user.id === userId1 ? userId2 : userId1;
    const friendsList: string[] = await fetchRedis(
      "smembers",
      `user:${session.user.id}:friends`,
    );

    const isFriend = friendsList.includes(friendId);
    if (!isFriend) {
      return { error: "Unauthorized" };
    }

    const sender: User = JSON.parse(
      await fetchRedis("get", `user:${session.user.id}`),
    );

    const messageData: Message = {
      id: nanoid(),
      senderId: session.user.id,
      text,
      timestamp: Date.now(),
    };

    const message = messageValidator.parse(messageData);

    // notify all connected chat room clients
    await pusherServer.trigger(
      toPusherKey(`chat:${chatId}`),
      "incoming_message",
      message,
    );
    await pusherServer.trigger(
      toPusherKey(`user:${friendId}:chats`),
      "new_message",
      {
        ...message,
        senderImg: sender.image ?? "",
        senderName: sender.name ?? "",
      },
    );

    // all valid, send the message
    await db.zadd(`chat:${chatId}:messages`, {
      score: message.timestamp,
      member: JSON.stringify(message),
    });

    return { error: null };
  } catch (error) {
    return { error: "An unknown error occurred" };
  }
}
