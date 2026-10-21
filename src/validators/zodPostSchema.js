import { z } from "zod";

export const zodPostSchema = z.object({
  caption: z
    .string({
      error: "Caption field is required",
    })
    .trim()
    .min(1, { error: "Caption cannot be empty." }),
});

