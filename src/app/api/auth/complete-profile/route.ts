import { NextResponse, type NextRequest } from "next/server";
import { completeSignup } from "@/lib/auth-api";
import { getAccessToken, getSessionUser, setSessionUser } from "@/lib/auth-session";

export async function POST(request: NextRequest) {
  const [sessionUser, accessToken] = await Promise.all([
    getSessionUser(),
    getAccessToken(),
  ]);
  if (!sessionUser || !accessToken) {
    return NextResponse.json({ message: "Not logged in" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const { name, cityId, email, dateOfBirth, gender } =
    (body as {
      name?: unknown;
      cityId?: unknown;
      email?: unknown;
      dateOfBirth?: unknown;
      gender?: unknown;
    } | null) ?? {};

  if (typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json({ message: "Enter your name" }, { status: 400 });
  }
  if (typeof cityId !== "string" || cityId.trim().length === 0) {
    return NextResponse.json({ message: "Choose a city" }, { status: 400 });
  }

  try {
    // The id comes from our own session cookie, never from the request body —
    // the backend trusts whatever id it's given here, so a client-supplied id
    // would let one logged-in browser edit an arbitrary account.
    const user = await completeSignup(
      {
        id: sessionUser.id,
        name: name.trim(),
        phone: sessionUser.phone,
        cityId: cityId.trim(),
        email: typeof email === "string" && email.trim() ? email.trim() : undefined,
        dateOfBirth: typeof dateOfBirth === "string" && dateOfBirth ? dateOfBirth : undefined,
        gender: typeof gender === "string" && gender ? gender : undefined,
      },
      accessToken,
    );

    await setSessionUser(user);
    return NextResponse.json({ user });
  } catch (error) {
    const status = (error as { status?: number })?.status ?? 502;
    const message = error instanceof Error ? error.message : "Could not complete profile";
    return NextResponse.json({ message }, { status });
  }
}
