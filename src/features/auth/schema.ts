import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerSchema = z
  .object({
    email: z.string().email(),
    username: z.string().min(3).max(100),
    password: z.string().min(8).max(128),
    verification_code: z.string().length(6),
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
