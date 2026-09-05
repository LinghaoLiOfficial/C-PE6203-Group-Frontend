import { login, register, sendVerificationCode } from "@/lib/api";
import type { LoginValues, RegisterValues } from "@/features/auth/schema";

export async function signIn(payload: LoginValues) {
  return login(payload.email, payload.password);
}

export async function signUp(payload: RegisterValues) {
  return register(payload);
}

export async function requestVerificationCode(email: string) {
  return sendVerificationCode(email);
}
