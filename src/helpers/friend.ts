import { User } from "next-auth";
import { fetchRedis } from "./redis";

export async function isAlreadyAdded(idToAdd: string, userId: string) {
  return !!(await fetchRedis(
    "sismember",
    `user:${idToAdd}:incoming_friend_requests`,
    userId,
  ));
}

export async function isAlreadyFriends(idToAdd: string, userId: string) {
  return !!(await fetchRedis("sismember", `user:${userId}:friends`, idToAdd));
}

export async function getFriendsByUserId(userId: string) {
  const friendIds: string[] = await fetchRedis(
    "smembers",
    `user:${userId}:friends`,
  );

  const friends = await Promise.all(
    friendIds.map(async (id) => {
      const friend: User = JSON.parse(await fetchRedis("get", `user:${id}`));
      return friend;
    }),
  );

  return friends;
}
