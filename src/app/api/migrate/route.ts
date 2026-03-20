import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Одноразовый endpoint для создания таблицы user_movies
// После выполнения можно удалить
export async function GET() {
  const supabase = createAdminClient();

  const migrations = [
    `CREATE TABLE IF NOT EXISTS public.user_movies (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      movie_id TEXT NOT NULL,
      is_watched BOOLEAN NOT NULL DEFAULT false,
      is_favorite BOOLEAN NOT NULL DEFAULT false,
      rating NUMERIC(3,1) CHECK (rating >= 1 AND rating <= 10),
      watched_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(user_id, movie_id)
    )`,
    `ALTER TABLE public.user_movies ENABLE ROW LEVEL SECURITY`,
    `DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'user_movies' AND policyname = 'Users can manage own movies'
      ) THEN
        CREATE POLICY "Users can manage own movies" ON public.user_movies
          USING (auth.uid() = user_id)
          WITH CHECK (auth.uid() = user_id);
      END IF;
    END $$`,
    `CREATE INDEX IF NOT EXISTS idx_user_movies_user_id ON public.user_movies(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_user_movies_movie_id ON public.user_movies(movie_id)`,
  ];

  const results: { sql: string; ok: boolean; error?: string }[] = [];

  for (const sql of migrations) {
    const { error } = await supabase.rpc(
      "exec_sql" as never,
      {
        sql,
      } as never,
    );

    // Если RPC не существует — пробуем через прямой запрос
    if (error?.code === "PGRST202") {
      results.push({
        sql: sql.slice(0, 60),
        ok: false,
        error: "No exec_sql RPC",
      });
      continue;
    }

    results.push({ sql: sql.slice(0, 60), ok: !error, error: error?.message });
  }

  return NextResponse.json({ results });
}
