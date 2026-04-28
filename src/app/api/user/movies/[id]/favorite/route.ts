import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type UserMovieRow = Database["public"]["Tables"]["user_movies"]["Row"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { is_favorite } = await request.json();
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: existingMovie, error: fetchError } = await supabase
      .from("user_movies")
      .select("*")
      .eq("user_id", user.id)
      .eq("movie_id", id)
      .maybeSingle<UserMovieRow>();

    if (fetchError) {
      console.error("Error fetching existing favorite state:", fetchError);
      return NextResponse.json(
        { error: "Failed to update favorite status" },
        { status: 500 },
      );
    }

    const payload: Database["public"]["Tables"]["user_movies"]["Insert"] =
      existingMovie
        ? {
            ...existingMovie,
            is_favorite,
            updated_at: new Date().toISOString(),
          }
        : {
            user_id: user.id,
            movie_id: id,
            is_favorite,
            is_watched: false,
            rating: null,
            watched_at: null,
            updated_at: new Date().toISOString(),
          };

    const { data, error } = await supabase
      .from("user_movies")
      .upsert(payload, { onConflict: "user_id,movie_id" })
      .select()
      .single();

    if (error) {
      console.error("Error updating favorite status:", error);
      return NextResponse.json(
        { error: "Failed to update favorite status" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error in favorite API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
