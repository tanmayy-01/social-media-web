import { z } from "zod";

export const zodSignupSchema = z.object({
  username: z
    .string({
      error: "Username field is required",
    })
    .trim()
    .min(5, {
      error: "Username must be at least 5 characters long",
    }),
  email: z
    .string({
      error: "Email field is required",
    })
    .trim()
    .email({
      error: "Invalid email format",
    }),
  password: z
    .string({
      error: "Password field is required",
    })
    .min(5, {
      error: "Password must be at least 5 characters long",
    }),
});
