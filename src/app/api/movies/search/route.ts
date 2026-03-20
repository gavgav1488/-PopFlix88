import { type NextRequest, NextResponse } from "next/server";
import { omdbClient } from "@/lib/omdb/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const page = parseInt(searchParams.get("page") || "1", 10);

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 },
      );
    }

    const results = await omdbClient.searchMovies(query, page);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error searching movies:", error);
    return NextResponse.json(
      { error: "Failed to search movies" },
      { status: 500 },
    );
  }
}
