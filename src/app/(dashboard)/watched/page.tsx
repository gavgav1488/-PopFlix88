"use client";

import { Film, Star, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fetchWithRetry } from "@/lib/fetch/client";

interface WatchedMovie {
  id: string;
  movie_id: string;
  rating: number | null;
  watched_at: string;
  title?: string;
  poster_path?: string | null;
  release_date?: string;
}

export default function WatchedPage() {
  const [movies, setMovies] = useState<WatchedMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWatched = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchWithRetry("/api/user/movies/watched");
      const data = await res.json();
      if (res.ok) {
        setMovies(data.movies || []);
      } else {
        setError(data.error || "Ошибка загрузки");
      }
    } catch {
      setError("Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWatched();
  }, [fetchWatched]);

  const handleRemove = async (movieId: string) => {
    await fetchWithRetry(`/api/user/movies/${movieId}/watched`, {
      method: "DELETE",
    });
    setMovies((prev) => prev.filter((m) => m.movie_id !== movieId));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Просмотренные фильмы 🎬</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }, (_, i) => String(i)).map((k) => (
            <div
              key={k}
              className="aspect-[2/3] bg-muted rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚠️</div>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎬</div>
        <h3 className="text-lg font-semibold mb-2">Список пуст</h3>
        <p className="text-muted-foreground mb-4">
          Вы ещё не отметили ни одного фильма как просмотренный
        </p>
        <Button asChild>
          <Link href="/dashboard">Найти фильмы</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Просмотренные фильмы 🎬</h1>
        <Badge variant="secondary">{movies.length} фильмов</Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {movies.map((movie) => (
          <Card key={movie.id} className="group overflow-hidden">
            <div className="relative aspect-[2/3]">
              <Link href={`/movie/${movie.movie_id}`}>
                {movie.poster_path ? (
                  <Image
                    src={movie.poster_path}
                    alt={movie.title || movie.movie_id}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Film className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </Link>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemove(movie.movie_id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <CardContent className="p-2">
              <p className="text-xs font-medium truncate">
                {movie.title || movie.movie_id}
              </p>
              {movie.rating && (
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs text-muted-foreground">
                    {movie.rating}/10
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
