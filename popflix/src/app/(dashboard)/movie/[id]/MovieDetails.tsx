'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Star, Heart, Eye, Clock, Calendar, Users, Play } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { MovieRating } from '@/components/movie/MovieRating'
import { WatchProviders } from '@/components/movie/WatchProviders'
import { useAuth } from '@/hooks/useAuth'

interface MovieDetailsProps {
  movie: any // Используем any для упрощения, в реальном проекте лучше создать точный тип
}

export function MovieDetails({ movie }: MovieDetailsProps) {
  const { user } = useAuth()
  const [userRating, setUserRating] = useState<number | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isWatched, setIsWatched] = useState(false)
  const [loading, setLoading] = useState(false)

  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : null

  const releaseYear = movie.release_date 
    ? new Date(movie.release_date).getFullYear()
    : null

  const director = movie.credits?.crew?.find((person: any) => person.job === 'Director')
  const mainCast = movie.credits?.cast?.slice(0, 6) || []
  const trailer = movie.videos?.results?.find((video: any) => 
    video.type === 'Trailer' && video.site === 'YouTube'
  )

  useEffect(() => {
    if (user) {
      fetchUserMovieData()
    }
  }, [user, movie.id])

  const fetchUserMovieData = async () => {
    try {
      const response = await fetch(`/api/user/movies/${movie.id}`)
      if (response.ok) {
        const data = await response.json()
        setUserRating(data.rating)
        setIsFavorite(data.is_favorite)
        setIsWatched(data.is_watched)
      }
    } catch (error) {
      console.error('Error fetching user movie data:', error)
    }
  }

  const handleToggleFavorite = async () => {
    if (!user) return

    try {
      setLoading(true)
      const response = await fetch(`/api/user/movies/${movie.id}/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: !isFavorite })
      })

      if (response.ok) {
        setIsFavorite(!isFavorite)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsWatched = async () => {
    if (!user) return

    try {
      setLoading(true)
      const response = await fetch(`/api/user/movies/${movie.id}/watched`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_watched: !isWatched })
      })

      if (response.ok) {
        setIsWatched(!isWatched)
      }
    } catch (error) {
      console.error('Error marking as watched:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRatingChange = async (rating: number) => {
    if (!user) return

    try {
      setLoading(true)
      const response = await fetch(`/api/user/movies/${movie.id}/rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating })
      })

      if (response.ok) {
        setUserRating(rating)
        if (!isWatched) {
          setIsWatched(true)
        }
      }
    } catch (error) {
      console.error('Error setting rating:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative">
        {backdropUrl && (
          <div className="absolute inset-0 -z-10">
            <Image
              src={backdropUrl}
              alt={movie.title}
              fill
              className="object-cover opacity-20"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </div>
        )}

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
                {movie.original_title !== movie.title && (
                  <p className="text-xl text-muted-foreground mb-4">
                    {movie.original_title}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 mb-6">
                  {releaseYear && (
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
                      <span className="font-medium">{movie.vote_average.toFixed(1)}</span>
                      <span className="text-muted-foreground ml-1">
                        ({movie.vote_count} оценок)
                      </span>
                    </div>
                  )}
                </div>

                {/* Genres */}
                {movie.genres && movie.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {movie.genres.map((genre: any) => (
                      <Badge key={genre.id} variant="secondary">
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Overview */}
                {movie.overview && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-3">Описание</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {movie.overview}
                    </p>
                  </div>
                )}

                {/* User Actions */}
                {user && (
                  <div className="space-y-4 mb-6">
                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={handleToggleFavorite}
                        disabled={loading}
                        variant={isFavorite ? "default" : "outline"}
                      >
                        <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                        {isFavorite ? 'В избранном' : 'Добавить в избранное'}
                      </Button>
                      
                      <Button
                        onClick={handleMarkAsWatched}
                        disabled={loading}
                        variant={isWatched ? "default" : "outline"}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {isWatched ? 'Просмотрено' : 'Отметить как просмотренное'}
                      </Button>

                      {trailer && (
                        <Button
                          asChild
                          variant="outline"
                        >
                          <a
                            href={`https://www.youtube.com/watch?v=${trailer.key}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Трейлер
                          </a>
                        </Button>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Ваша оценка</h3>
                      <MovieRating
                        rating={userRating || undefined}
                        onRatingChange={handleRatingChange}
                        readonly={loading}
                      />
                    </div>
                  </div>
                )}

                {/* Director */}
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
      </div>

      <div className="container mx-auto px-4 space-y-8">
        {/* Cast */}
        {mainCast.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                В главных ролях
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {mainCast.map((actor: any) => (
                  <div key={actor.id} className="text-center">
                    {actor.profile_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                        alt={actor.name}
                        width={185}
                        height={278}
                        className="w-full rounded-lg mb-2"
                      />
                    ) : (
                      <div className="aspect-[2/3] bg-muted rounded-lg flex items-center justify-center mb-2">
                        <Users className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <p className="font-medium text-sm">{actor.name}</p>
                    <p className="text-xs text-muted-foreground">{actor.character}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Watch Providers */}
        <WatchProviders movieId={movie.id} />

        {/* Additional Info */}
        <Card>
          <CardHeader>
            <CardTitle>Дополнительная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {movie.budget > 0 && (
              <div>
                <span className="font-medium">Бюджет: </span>
                <span className="text-muted-foreground">
                  ${movie.budget.toLocaleString()}
                </span>
              </div>
            )}
            {movie.revenue > 0 && (
              <div>
                <span className="font-medium">Сборы: </span>
                <span className="text-muted-foreground">
                  ${movie.revenue.toLocaleString()}
                </span>
              </div>
            )}
            {movie.production_companies && movie.production_companies.length > 0 && (
              <div>
                <span className="font-medium">Производство: </span>
                <span className="text-muted-foreground">
                  {movie.production_companies.map((company: any) => company.name).join(', ')}
                </span>
              </div>
            )}
            {movie.production_countries && movie.production_countries.length > 0 && (
              <div>
                <span className="font-medium">Страна: </span>
                <span className="text-muted-foreground">
                  {movie.production_countries.map((country: any) => country.name).join(', ')}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}