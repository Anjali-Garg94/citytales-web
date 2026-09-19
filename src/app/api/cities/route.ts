import { NextResponse } from "next/server";
import { getCities } from "@/lib/api";

/** Backs the sign-up modal's city picker — client components can't call getCities() directly. */
export async function GET() {
  const cities = await getCities();
  return NextResponse.json({ cities });
}
