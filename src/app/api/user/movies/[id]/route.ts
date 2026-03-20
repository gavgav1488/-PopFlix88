import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userMovie, error } = await supabase
      .from("user_movies")
      .select("*")
      .eq("user_id", user.id)
      .eq("movie_id", id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching user movie:", error);
      return NextResponse.json(
        { error: "Failed to fetch user movie data" },
        { status: 500 },
      );
    }

    if (!userMovie) {
      return NextResponse.json({
        rating: null,
        is_favorite: false,
        is_watched: false,
      });
    }

    return NextResponse.json({
      rating: userMovie.rating,
      is_favorite: userMovie.is_favorite,
      is_watched: userMovie.is_watched,
    });
  } catch (error) {
    console.error("Error in user movie API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
