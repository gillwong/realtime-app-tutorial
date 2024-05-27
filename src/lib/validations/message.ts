import { z } from "zod";

export const messageValidator = z.object({
  id: z.string(),
  senderId: z.string(),
  text: z.string().max(2000),
  timestamp: z.number(),
});

export const messageArrayValidator = messageValidator.array();

export type Message = z.infer<typeof messageValidator>;
