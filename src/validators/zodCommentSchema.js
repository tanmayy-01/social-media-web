import { z } from "zod";

export const zodCommentSchema = z.object({
  content: z
    .string({
      error: "Content field is required",
    })
    .trim()
    .min(1, { error: "Comment content cannot be empty." }),
});

export const zodCreateCommentSchema = zodCommentSchema;
export const zodUpdateCommentSchema = zodCommentSchema;
