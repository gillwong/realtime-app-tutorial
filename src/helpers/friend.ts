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
