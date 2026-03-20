import { type NextRequest, NextResponse } from "next/server";
import { omdbClient } from "@/lib/omdb/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);

    // OMDb не имеет "сейчас в кино" — используем поиск по новым фильмам
    const results = await omdbClient.getNowPlayingMovies(page);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching now playing movies:", error);
    return NextResponse.json(
      { error: "Failed to fetch now playing movies" },
      { status: 500 },
    );
  }
}
