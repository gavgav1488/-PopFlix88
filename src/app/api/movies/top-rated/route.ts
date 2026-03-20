import { type NextRequest, NextResponse } from "next/server";
import { omdbClient } from "@/lib/omdb/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);

    const results = await omdbClient.getTopRatedMovies(page);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching top rated movies:", error);
    return NextResponse.json(
      { error: "Failed to fetch top rated movies" },
      { status: 500 },
    );
  }
}
