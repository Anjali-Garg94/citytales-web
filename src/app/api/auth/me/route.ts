import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-session";

/** Read by AuthContext on mount — the only way client code learns who's logged in. */
export async function GET() {
  const user = await getSessionUser();
  return NextResponse.json({ user });
}
