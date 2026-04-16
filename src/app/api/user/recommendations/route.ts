import { type NextRequest, NextResponse } from "next/server";
import { omdbClient } from "@/lib/omdb/client";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

const FALLBACK_SEARCH_TERMS = [
  "Inception",
  "Interstellar",
  "The Matrix",
  "The Dark Knight",
  "The Prestige",
  "Gladiator",
  "The Departed",
  "Whiplash",
];

type UserPreferencesRow =
  Database["public"]["Tables"]["user_preferences"]["Row"];

function uniqueByMovieId<T extends { id: string | number }>(movies: T[]): T[] {
  const seen = new Set<string>();

  return movies.filter((movie) => {
    const key = String(movie.id);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "12", 10), 18);
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: preferences, error: preferencesError } = await supabase
      .from("user_preferences")
      .select("favorite_genres")
      .eq("user_id", user.id)
      .single();

    const userPreferences = preferences as Pick<
      UserPreferencesRow,
      "favorite_genres"
    > | null;

    if (preferencesError && preferencesError.code !== "PGRST116") {
      console.error("Error fetching user preferences:", preferencesError);
      return NextResponse.json(
        { error: "Failed to fetch recommendations" },
        { status: 500 },
      );
    }

    const genres = userPreferences?.favorite_genres ?? [];
    const searchTerms = genres.length > 0 ? genres : FALLBACK_SEARCH_TERMS;

    const recommendationLists = await Promise.all(
      searchTerms.slice(0, 4).map(async (term) => {
        try {
          const response = await omdbClient.searchMovies(term, 1);
          return response.results;
        } catch (error) {
          console.error(
            `Error fetching recommendations for term: ${term}`,
            error,
          );
          return [];
        }
      }),
    );

    const results = uniqueByMovieId(recommendationLists.flat()).slice(0, limit);

    return NextResponse.json({
      results,
      source: genres.length > 0 ? "preferences" : "fallback",
      basedOn: genres.slice(0, 4),
    });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 },
    );
  }
}
