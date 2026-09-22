import { NextResponse } from "next/server";
import { CITY_ID, searchEvents } from "@/lib/api";

/**
 * Client-facing proxy for Typesense event search.
 * GET /api/events/search?q=...&cityId=...
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const cityId = searchParams.get("cityId")?.trim() || CITY_ID;
  const page = Number(searchParams.get("page") ?? "0") || 0;
  const perPage = Number(searchParams.get("perPage") ?? "50") || 50;

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results = await searchEvents(q, { cityId, page, perPage });
  return NextResponse.json({ results });
}
