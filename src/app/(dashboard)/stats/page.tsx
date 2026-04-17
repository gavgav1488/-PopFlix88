"use client";

import { BarChart3, Calendar, Clock, Film, Star, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchWithRetry } from "@/lib/fetch/client";

interface UserStats {
  totalWatched: number;
  totalWatchTime: number;
  averageRating: number;
  favoriteGenres: Array<{ name: string; count: number }>;
  favoriteActors: Array<{ name: string; count: number }>;
  favoriteDirectors: Array<{ name: string; count: number }>;
  watchedByYear: Array<{ year: number; count: number }>;
  monthlyActivity: Array<{ month: string; count: number }>;
}

const SKELETON_ITEMS = ["a", "b", "c", "d"];

export default function StatsPage() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchWithRetry("/api/user/stats");
      const data = await response.json();
      if (response.ok) {
        setStats(data);
      } else {
        console.error("Error fetching stats:", data.error);
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserStats();
  }, [fetchUserStats]);

  const formatWatchTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days} дн. ${hours % 24} ч.`;
    if (hours > 0) return `${hours} ч. ${minutes % 60} мин.`;
    return `${minutes} мин.`;
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Статистика 📊</h1>
          <p className="text-xl text-muted-foreground">
            Загружаем ваши данные...
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SKELETON_ITEMS.map((key) => (
            <Card key={key} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2" />
                <div className="h-3 bg-muted rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-lg font-semibold mb-2">
          Нет данных для статистики
        </h3>
        <p className="text-muted-foreground">
          Начните смотреть фильмы, чтобы увидеть статистику
        </p>
      </div>
    );
  }

  const maxMonthlyCount = Math.max(
    ...stats.monthlyActivity.map((m) => m.count),
    1,
  );

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Ваша статистика 📊</h1>
        <p className="text-xl text-muted-foreground">
          Анализ ваших предпочтений и активности
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Просмотрено фильмов
            </CardTitle>
            <Film className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWatched}</div>
            <p className="text-xs text-muted-foreground">
              Всего фильмов в коллекции
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Время просмотра
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatWatchTime(stats.totalWatchTime)}
            </div>
            <p className="text-xs text-muted-foreground">
              Общее время просмотра
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Средняя оценка
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageRating.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Из 10 возможных</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активность</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.monthlyActivity.reduce((sum, m) => sum + m.count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Фильмов за последние 12 месяцев
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Film className="h-5 w-5" />
            Любимые жанры
          </CardTitle>
          <CardDescription>
            Топ-5 жанров по количеству просмотренных фильмов
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {stats.favoriteGenres.slice(0, 5).map((genre, index) => (
              <Badge
                key={genre.name}
                variant={index === 0 ? "default" : "secondary"}
              >
                {genre.name} ({genre.count})
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Любимые актёры
            </CardTitle>
            <CardDescription>
              Топ-5 актёров по количеству фильмов
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.favoriteActors.slice(0, 5).map((actor, index) => (
                <div
                  key={actor.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <span className="font-medium">{actor.name}</span>
                  </div>
                  <Badge variant="outline">{actor.count} фильмов</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Любимые режиссёры
            </CardTitle>
            <CardDescription>
              Топ-5 режиссёров по количеству фильмов
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.favoriteDirectors.slice(0, 5).map((director, index) => (
                <div
                  key={director.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <span className="font-medium">{director.name}</span>
                  </div>
                  <Badge variant="outline">{director.count} фильмов</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Любимые годы выпуска
          </CardTitle>
          <CardDescription>
            Распределение просмотренных фильмов по годам
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {stats.watchedByYear
              .sort((a, b) => b.count - a.count)
              .slice(0, 10)
              .map((year, index) => (
                <Badge
                  key={year.year}
                  variant={index < 3 ? "default" : "secondary"}
                >
                  {year.year} ({year.count})
                </Badge>
              ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Активность по месяцам
          </CardTitle>
          <CardDescription>
            Количество просмотренных фильмов за последние 12 месяцев
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.monthlyActivity.map((month) => (
              <div
                key={month.month}
                className="flex items-center justify-between"
              >
                <span className="font-medium">{month.month}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.max(5, (month.count / maxMonthlyCount) * 100)}%`,
                      }}
                    />
                  </div>
                  <Badge variant="outline">{month.count}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
