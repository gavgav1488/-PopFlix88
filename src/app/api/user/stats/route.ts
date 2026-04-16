import { type NextRequest, NextResponse } from "next/server";
import { omdbClient } from "@/lib/omdb/client";
import { createClient } from "@/lib/supabase/server";

interface WatchedMovieEntry {
  movie_id: string;
  rating: number | null;
  watched_at: string | null;
  is_favorite: boolean;
}

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

    const { data: watchedMovies, error: watchedError } = await supabase
      .from("user_movies")
      .select("movie_id, rating, watched_at, is_favorite")
      .eq("user_id", user.id)
      .eq("is_watched", true);

    if (watchedError) {
      console.error("Error fetching watched movies:", watchedError);
      return NextResponse.json(
        { error: "Failed to fetch watched movies" },
        { status: 500 },
      );
    }

    const watchedEntries = (watchedMovies ?? []) as WatchedMovieEntry[];

    if (watchedEntries.length === 0) {
      return NextResponse.json({
        totalWatched: 0,
        totalWatchTime: 0,
        averageRating: 0,
        favoriteGenres: [],
        favoriteActors: [],
        favoriteDirectors: [],
        watchedByYear: [],
        monthlyActivity: [],
      });
    }

    // Получаем детали фильмов через OMDb
    const movieDetails = await Promise.all(
      watchedEntries.map(async (entry) => {
        try {
          return await omdbClient.getMovieDetails(String(entry.movie_id));
        } catch {
          return null;
        }
      }),
    );

    const validMovies = movieDetails.filter((m) => m !== null);

    const totalWatched = watchedEntries.length;
    const totalWatchTime = validMovies.reduce(
      (sum, movie) => sum + (movie.runtime || 0),
      0,
    );

    const ratings = watchedEntries
      .filter((m) => m.rating !== null)
      .map((m) => m.rating as number);
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 0;

    // Статистика по жанрам
    const genreCount: Record<string, number> = {};
    for (const movie of validMovies) {
      for (const genre of movie.genres) {
        genreCount[genre.name] = (genreCount[genre.name] ?? 0) + 1;
      }
    }
    const favoriteGenres = Object.entries(genreCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Статистика по актёрам
    const actorCount: Record<string, number> = {};
    for (const movie of validMovies) {
      for (const actor of movie.cast.slice(0, 5)) {
        actorCount[actor.name] = (actorCount[actor.name] ?? 0) + 1;
      }
    }
    const favoriteActors = Object.entries(actorCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Статистика по режиссёрам
    const directorCount: Record<string, number> = {};
    for (const movie of validMovies) {
      for (const person of movie.crew) {
        directorCount[person.name] = (directorCount[person.name] ?? 0) + 1;
      }
    }
    const favoriteDirectors = Object.entries(directorCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Статистика по годам
    const yearCount: Record<number, number> = {};
    for (const movie of validMovies) {
      if (movie.release_date) {
        const year = new Date(movie.release_date).getFullYear();
        if (!Number.isNaN(year)) {
          yearCount[year] = (yearCount[year] ?? 0) + 1;
        }
      }
    }
    const watchedByYear = Object.entries(yearCount)
      .map(([year, count]) => ({ year: Number(year), count }))
      .sort((a, b) => b.count - a.count);

    // Месячная активность (последние 12 месяцев)
    const now = new Date();
    const monthlyCount: Record<string, number> = {};
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = date.toLocaleDateString("ru-RU", {
        year: "numeric",
        month: "long",
      });
      monthlyCount[key] = 0;
    }
    for (const movie of watchedEntries) {
      if (movie.watched_at) {
        const key = new Date(movie.watched_at).toLocaleDateString("ru-RU", {
          year: "numeric",
          month: "long",
        });
        if (Object.hasOwn(monthlyCount, key)) {
          monthlyCount[key]++;
        }
      }
    }
    const monthlyActivity = Object.entries(monthlyCount).map(
      ([month, count]) => ({ month, count }),
    );

    return NextResponse.json({
      totalWatched,
      totalWatchTime,
      averageRating,
      favoriteGenres,
      favoriteActors,
      favoriteDirectors,
      watchedByYear,
      monthlyActivity,
    });
  } catch (error) {
    console.error("Error in stats API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
