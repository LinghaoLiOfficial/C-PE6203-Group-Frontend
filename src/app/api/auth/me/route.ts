import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME } from "@/lib/auth/session";

export async function GET() {
  const session = (await cookies()).get(AUTH_COOKIE_NAME)?.value;

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    return NextResponse.json(JSON.parse(session));
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
