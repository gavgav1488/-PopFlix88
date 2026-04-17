"use client";

import { useEffect, useState } from "react";
import { MovieGrid } from "@/components/movie/MovieGrid";
import { fetchWithRetry } from "@/lib/fetch/client";
import type { Movie } from "@/types";

type MoviesResponse = {
  results?: Movie[];
  source?: "preferences" | "fallback" | null;
  basedOn?: string[];
};

export default function DashboardPage() {
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [recommendationSource, setRecommendationSource] = useState<
    "preferences" | "fallback" | null
  >(null);
  const [recommendationGenres, setRecommendationGenres] = useState<string[]>(
    [],
  );
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);

        const [
          recommendationsResponse,
          popularResponse,
          topRatedResponse,
          nowPlayingResponse,
        ] = await Promise.allSettled([
          fetchWithRetry("/api/user/recommendations?limit=12"),
          fetchWithRetry("/api/movies/popular"),
          fetchWithRetry("/api/movies/top-rated"),
          fetchWithRetry("/api/movies/now-playing"),
        ]);

        if (
          recommendationsResponse.status === "fulfilled" &&
          recommendationsResponse.value.ok
        ) {
          const recommendationsData =
            (await recommendationsResponse.value.json()) as MoviesResponse;
          setRecommendedMovies(recommendationsData.results?.slice(0, 12) || []);
          setRecommendationSource(recommendationsData.source || null);
          setRecommendationGenres(recommendationsData.basedOn || []);
        } else {
          console.error(
            "Recommendations request failed",
            recommendationsResponse.status === "fulfilled"
              ? recommendationsResponse.value.status
              : recommendationsResponse.reason,
          );
          setRecommendedMovies([]);
          setRecommendationSource(null);
          setRecommendationGenres([]);
        }

        if (
          popularResponse.status === "fulfilled" &&
          popularResponse.value.ok
        ) {
          const popularData =
            (await popularResponse.value.json()) as MoviesResponse;
          setPopularMovies(popularData.results?.slice(0, 12) || []);
        } else if (popularResponse.status !== "fulfilled") {
          console.error(
            "Popular movies request failed",
            popularResponse.reason,
          );
        }

        if (
          topRatedResponse.status === "fulfilled" &&
          topRatedResponse.value.ok
        ) {
          const topRatedData =
            (await topRatedResponse.value.json()) as MoviesResponse;
          setTopRatedMovies(topRatedData.results?.slice(0, 12) || []);
        } else if (topRatedResponse.status !== "fulfilled") {
          console.error(
            "Top rated movies request failed",
            topRatedResponse.reason,
          );
        }

        if (
          nowPlayingResponse.status === "fulfilled" &&
          nowPlayingResponse.value.ok
        ) {
          const nowPlayingData =
            (await nowPlayingResponse.value.json()) as MoviesResponse;
          setNowPlayingMovies(nowPlayingData.results?.slice(0, 12) || []);
        } else if (nowPlayingResponse.status !== "fulfilled") {
          console.error(
            "Now playing request failed",
            nowPlayingResponse.reason,
          );
        }
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            Добро пожаловать в PopFlix! 🍿
          </h1>
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-64 mx-auto"></div>
          </div>
        </div>

        <div className="space-y-8">
          {["popular", "top-rated", "now-playing"].map((section) => (
            <div key={section}>
              <div className="h-8 bg-muted rounded w-48 mb-6" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {["s1", "s2", "s3", "s4", "s5", "s6"].map((sk) => (
                  <div
                    key={sk}
                    className="aspect-[2/3] bg-muted rounded-lg animate-pulse"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          Добро пожаловать в PopFlix! 🍿
        </h1>
        <p className="text-xl text-muted-foreground">
          {recommendationSource === "preferences"
            ? "Подборка, собранная по вашим любимым жанрам"
            : "Откройте для себя новые фильмы"}
        </p>
      </div>

      <div className="space-y-12">
        {recommendedMovies.length > 0 && (
          <MovieGrid
            movies={recommendedMovies}
            title={
              recommendationSource === "preferences"
                ? `✨ Рекомендуем по жанрам: ${recommendationGenres.join(", ")}`
                : "✨ Рекомендуем посмотреть"
            }
            showActions={true}
          />
        )}

        {popularMovies.length > 0 && (
          <MovieGrid
            movies={popularMovies}
            title="🔥 Популярные фильмы"
            showActions={true}
          />
        )}

        {topRatedMovies.length > 0 && (
          <MovieGrid
            movies={topRatedMovies}
            title="⭐ Лучшие по рейтингу"
            showActions={true}
          />
        )}

        {nowPlayingMovies.length > 0 && (
          <MovieGrid
            movies={nowPlayingMovies}
            title="🎬 Сейчас в кино"
            showActions={true}
          />
        )}
      </div>
    </div>
  );
}
