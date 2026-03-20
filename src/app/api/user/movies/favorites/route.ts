import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { omdbClient } from "@/lib/omdb/client";
import type { Database } from "@/types/database";

interface UserMovie {
  id: string;
  movie_id: string;
  rating: number | null;
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
      .eq("is_favorite", true)
      .order("updated_at", { ascending: false });

    if (dbError) {
      console.error("Error fetching favorites:", dbError);
      return NextResponse.json(
        { error: "Failed to fetch favorites" },
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
            updated_at: m.updated_at,
          };
        }
      }),
    );

    return NextResponse.json({ movies: moviesWithDetails });
  } catch (error) {
    console.error("Error in favorites API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
