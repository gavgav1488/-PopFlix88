'use client'

import { useEffect, useState } from 'react'
import { WatchedMovie, Movie } from '@/types'
import { tmdbClient } from '@/lib/tmdb/client'
import { statsService, MovieStats } from '@/lib/services/statsService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Film, Clock, Star, TrendingUp } from 'lucide-react'

export default function StatsPage() {
  const [stats, setStats] = useState<MovieStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/watched')
      
      if (!response.ok) {
        throw new Error('Failed to fetch watched movies')
      }

      const data = await response.json()
      
      // Получаем детали фильмов
      const moviesWithDetails = await Promise.all(
        data.map(async (watched: WatchedMovie) => {
          try {
            const movie = await tmdbClient.getMovieDetails(watched.tmdb_id)
            return { ...watched, movie }
          } catch (error) {
            console.error(`Error fetching movie ${watched.tmdb_id}:`, error)
            return watched
          }
        })
      )

      const calculatedStats = statsService.calculateStats(moviesWithDetails)
      setStats(calculatedStats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Статистика</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!stats || stats.totalMovies === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Статистика</h1>
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-semibold mb-2">Нет данных</h2>
          <p className="text-muted-foreground mb-6">
            Начните смотреть фильмы, чтобы увидеть статистику
          </p>
          <Button asChild>
            <a href="/dashboard">Найти фильмы</a>
          </Button>
        </div>
      </div>
    )
  }

  const timeDetailed = statsService.formatTimeDetailed(stats.totalMinutes)

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold">Статистика просмотров</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего фильмов</CardTitle>
            <Film className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMovies}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Время просмотра</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timeDetailed.days > 0 && `${timeDetailed.days}д `}
              {timeDetailed.hours}ч
            </div>
            <p className="text-xs text-muted-foreground">
              {statsService.formatTime(stats.totalMinutes)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Средняя оценка</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'}/10
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активность</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.totalMovies / 30).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">фильмов в месяц</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Genres */}
      {stats.topGenres.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Любимые жанры</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topGenres.map((genre, index) => (
                <div key={genre.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{index + 1}</Badge>
                    <span className="font-medium">{genre.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${(genre.count / stats.totalMovies) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {genre.count} шт
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Actors */}
        {stats.topActors.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Любимые актёры</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.topActors.map((actor, index) => (
                  <div key={actor.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0">
                        {index + 1}
                      </Badge>
                      <span className="text-sm">{actor.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{actor.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Directors */}
        {stats.topDirectors.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Любимые режиссёры</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.topDirectors.map((director, index) => (
                  <div key={director.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0">
                        {index + 1}
                      </Badge>
                      <span className="text-sm">{director.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{director.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Rating Distribution */}
      {stats.ratingDistribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Распределение оценок</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.ratingDistribution.map((item) => (
                <div key={item.rating} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-8">{item.rating}/10</span>
                  <div className="flex-1 h-8 bg-muted rounded overflow-hidden">
                    <div
                      className="h-full bg-primary flex items-center justify-end pr-2"
                      style={{
                        width: `${(item.count / stats.totalMovies) * 100}%`,
                      }}
                    >
                      {item.count > 0 && (
                        <span className="text-xs text-primary-foreground font-medium">
                          {item.count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
