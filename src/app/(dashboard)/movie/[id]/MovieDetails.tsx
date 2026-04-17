"use client";

import { Calendar, Clock, Eye, Heart, Star, Users } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { MovieRating } from "@/components/movie/MovieRating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { fetchWithRetry } from "@/lib/fetch/client";
import type { Movie } from "@/types";

interface MovieDetailsProps {
  movie: Movie;
}

export function MovieDetails({ movie }: MovieDetailsProps) {
  const { user } = useAuth();
  const [userRating, setUserRating] = useState<number | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [loading, setLoading] = useState(false);

  // OMDb возвращает полные URL для постеров
  const posterUrl = movie.poster_path ?? null;

  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : null;

  const director = movie.crew.find((p) => p.job === "Director");
  const mainCast = movie.cast.slice(0, 6);

  const fetchUserMovieData = useCallback(async () => {
    try {
      const response = await fetchWithRetry(`/api/user/movies/${movie.id}`);
      if (response.ok) {
        const data = await response.json();
        setUserRating(data.rating);
        setIsFavorite(data.is_favorite);
        setIsWatched(data.is_watched);
      }
    } catch (error) {
      console.error("Error fetching user movie data:", error);
    }
  }, [movie.id]);

  useEffect(() => {
    if (user) {
      fetchUserMovieData();
    }
  }, [user, fetchUserMovieData]);

  const handleToggleFavorite = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await fetchWithRetry(
        `/api/user/movies/${movie.id}/favorite`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_favorite: !isFavorite }),
        },
      );
      if (response.ok) setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsWatched = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await fetchWithRetry(
        `/api/user/movies/${movie.id}/watched`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_watched: !isWatched }),
        },
      );
      if (response.ok) setIsWatched(!isWatched);
    } catch (error) {
      console.error("Error marking as watched:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = async (rating: number) => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await fetchWithRetry(
        `/api/user/movies/${movie.id}/rating`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating }),
        },
      );
      if (response.ok) {
        setUserRating(rating);
        if (!isWatched) setIsWatched(true);
      }
    } catch (error) {
      console.error("Error setting rating:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Poster */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {posterUrl ? (
                <Image
                  src={posterUrl}
                  alt={movie.title}
                  width={500}
                  height={750}
                  className="w-full rounded-lg shadow-lg"
                  priority
                  unoptimized
                />
              ) : (
                <div className="aspect-[2/3] bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <div className="text-6xl mb-4">🎬</div>
                    <div>Нет постера</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Movie Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                {releaseYear && !Number.isNaN(releaseYear) && (
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    {releaseYear}
                  </div>
                )}
                {movie.runtime > 0 && (
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    {movie.runtime} мин
                  </div>
                )}
                {movie.vote_average > 0 && (
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 fill-current text-yellow-400" />
                    <span className="font-medium">
                      {movie.vote_average.toFixed(1)}
                    </span>
                    <span className="text-muted-foreground ml-1">IMDb</span>
                  </div>
                )}
              </div>

              {movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {movie.genres.map((genre) => (
                    <Badge key={genre.id} variant="secondary">
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              )}

              {movie.overview && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Описание</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {movie.overview}
                  </p>
                </div>
              )}

              {user && (
                <div className="space-y-4 mb-6">
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={handleToggleFavorite}
                      disabled={loading}
                      variant={isFavorite ? "default" : "outline"}
                    >
                      <Heart
                        className={`h-4 w-4 mr-2 ${isFavorite ? "fill-current" : ""}`}
                      />
                      {isFavorite ? "В избранном" : "Добавить в избранное"}
                    </Button>

                    <Button
                      onClick={handleMarkAsWatched}
                      disabled={loading}
                      variant={isWatched ? "default" : "outline"}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {isWatched ? "Просмотрено" : "Отметить как просмотренное"}
                    </Button>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Ваша оценка</h3>
                    <MovieRating
                      rating={userRating ?? undefined}
                      onRatingChange={handleRatingChange}
                      readonly={loading}
                    />
                  </div>
                </div>
              )}

              {director && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Режиссёр</h3>
                  <p className="text-muted-foreground">{director.name}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 space-y-8">
        {mainCast.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />В главных ролях
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {mainCast.map((actor) => (
                  <div key={actor.id} className="text-center">
                    <div className="aspect-[2/3] bg-muted rounded-lg flex items-center justify-center mb-2">
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="font-medium text-sm">{actor.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
