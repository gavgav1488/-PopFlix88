import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: preferences, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json(
        { error: "Failed to fetch preferences" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      preferences: preferences ?? {
        favorite_genres: [],
        favorite_actors: [],
        favorite_directors: [],
      },
    });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { favorite_genres, favorite_actors, favorite_directors } = body;

    const payload: Database["public"]["Tables"]["user_preferences"]["Insert"] =
      {
        user_id: user.id,
        favorite_genres: favorite_genres ?? [],
        favorite_actors: favorite_actors ?? [],
        favorite_directors: favorite_directors ?? [],
        updated_at: new Date().toISOString(),
      };

    const { data: preferences, error } = await supabase
      .from("user_preferences")
      .upsert(payload as never, { onConflict: "user_id" })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to update preferences" },
        { status: 500 },
      );
    }

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error("Error updating preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 },
    );
  }
}
