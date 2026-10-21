import { z } from "zod";

export const zodLoginSchema = z.object({
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

export const zodSigninSchema = zodLoginSchema;
