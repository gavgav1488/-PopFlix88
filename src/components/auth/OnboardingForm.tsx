"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import type { Genre } from "@/types";

export function OnboardingForm() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGenres, setIsLoadingGenres] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch("/api/movies/genres");
        const data = await response.json();
        setGenres(data.genres || []);
      } catch (err) {
        console.error("Error fetching genres:", err);
      } finally {
        setIsLoadingGenres(false);
      }
    };

    fetchGenres();
  }, []);

  const handleGenreToggle = (genreId: number) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId],
    );
  };

  const handleSavePreferences = async () => {
    if (!user) {
      setError("Пользователь не авторизован. Попробуйте перезайти.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/user/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          favorite_genres: selectedGenres,
          favorite_actors: [],
          favorite_directors: [],
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Ошибка сохранения");
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Error saving preferences:", err);
      setError("Не удалось сохранить предпочтения. Попробуйте ещё раз.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.push("/dashboard");
  };

  if (isLoadingGenres || authLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          Добро пожаловать в PopFlix! 🍿
        </CardTitle>
        <CardDescription>
          Выберите ваши любимые жанры, чтобы мы могли предложить вам лучшие
          фильмы
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Какие жанры вам нравятся?
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {genres.map((genre) => (
              <Badge
                key={genre.id}
                variant={
                  selectedGenres.includes(genre.id) ? "default" : "outline"
                }
                className="cursor-pointer p-3 text-center justify-center hover:bg-primary/10 transition-colors"
                onClick={() => handleGenreToggle(genre.id)}
              >
                {genre.name}
              </Badge>
            ))}
          </div>
        </div>

        {selectedGenres.length > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            Выбрано жанров: {selectedGenres.length}
          </div>
        )}

        {error && (
          <div className="text-center text-sm text-destructive">{error}</div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleSkip}
            className="flex-1"
            disabled={isLoading}
          >
            Пропустить
          </Button>
          <Button
            onClick={handleSavePreferences}
            className="flex-1"
            disabled={isLoading || selectedGenres.length === 0 || !user}
          >
            {isLoading ? "Сохранение..." : "Продолжить"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
