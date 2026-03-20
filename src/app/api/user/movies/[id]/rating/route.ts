import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { rating } = await request.json();

    if (rating !== null && (rating < 1 || rating > 10)) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 10" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("user_movies")
      .upsert(
        {
          user_id: user.id,
          movie_id: id,
          rating,
          is_watched: rating !== null ? true : undefined,
          watched_at: rating !== null ? new Date().toISOString() : undefined,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,movie_id" },
      )
      .select()
      .single();

    if (error) {
      console.error("Error updating rating:", error);
      return NextResponse.json(
        { error: "Failed to update rating" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error in rating API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
