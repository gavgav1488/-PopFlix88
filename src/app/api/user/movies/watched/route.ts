import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { omdbClient } from "@/lib/omdb/client";
import type { Database } from "@/types/database";

interface UserMovie {
  id: string;
  movie_id: string;
  rating: number | null;
  watched_at: string | null;
  updated_at: string;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
      },
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: movies, error: dbError } = await supabase
      .from("user_movies")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_watched", true)
      .order("watched_at", { ascending: false });

    if (dbError) {
      console.error("Error fetching watched:", dbError);
      return NextResponse.json(
        { error: "Failed to fetch watched" },
        { status: 500 },
      );
    }

    const userMovies = movies as unknown as UserMovie[];

    const moviesWithDetails = await Promise.all(
      userMovies.map(async (m) => {
        try {
          const details = await omdbClient.getMovieDetails(m.movie_id);
          return {
            id: m.id,
            movie_id: m.movie_id,
            rating: m.rating,
            watched_at: m.watched_at,
            updated_at: m.updated_at,
            title: details.title,
            poster_path: details.poster_path,
            release_date: details.release_date,
          };
        } catch {
          return {
            id: m.id,
            movie_id: m.movie_id,
            rating: m.rating,
            watched_at: m.watched_at,
            updated_at: m.updated_at,
          };
        }
      }),
    );

    return NextResponse.json({ movies: moviesWithDetails });
  } catch (error) {
    console.error("Error in watched API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
