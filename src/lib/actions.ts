"use server";

import { fetchRedis } from "@/helpers/redis";
import { auth } from "./auth";
import { addFriendValidator } from "./validations/add-friend";
import { db } from "./db";
import { z } from "zod";
import { type FormData } from "@/components/AddFriendButton";

export async function addFriend(formData: FormData) {
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
      throw new Error("Unauthorized");
    }
    if (!idToAdd) {
      throw new Error("This person does not exist.");
    }
    if (idToAdd === session.user.id) {
      throw new Error("Cannot add yourself as a friend.");
    }

    const isAlreadyAdded = await fetchRedis(
      "sismember",
      `user:${idToAdd}:incoming_friend_requests`,
      session.user.id,
    );
    if (!!isAlreadyAdded) {
      throw new Error("Already added this user.");
    }

    const isAlreadyFriend = await fetchRedis(
      "sismember",
      `user:${idToAdd}:friends`,
      idToAdd,
    );
    if (!!isAlreadyFriend) {
      throw new Error("Already friends with this user.");
    }

    // valid request, send friend request
    db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(error);
      throw new Error("Invalid request payload");
    }
    throw error;
  }
}
