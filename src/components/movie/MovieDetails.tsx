'use client'

import Image from 'next/image'
import { Movie } from '@/types'
import { tmdbClient } from '@/lib/tmdb/client'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Calendar, Clock, Star } from 'lucide-react'

interface MovieDetailsProps {
  movie: Movie
}

export function MovieDetails({ movie }: MovieDetailsProps) {
  const posterUrl = tmdbClient.getImageURL(movie.poster_path, 'w500')
  const backdropUrl = tmdbClient.getImageURL(movie.backdrop_path, 'original')

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}ч ${mins}мин`
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Неизвестно'
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <div className="space-y-8">
      {/* Backdrop */}
      {backdropUrl && (
        <div className="relative w-full h-[400px] -mx-4 md:mx-0 md:rounded-lg overflow-hidden">
          <Image
            src={backdropUrl}
            alt={movie.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Poster */}
        <div className="md:col-span-1">
          {posterUrl ? (
            <Card className="overflow-hidden">
              <Image
                src={posterUrl}
                alt={movie.title}
                width={500}
                height={750}
                className="w-full h-auto"
                priority
              />
            </Card>
          ) : (
            <Card className="aspect-[2/3] flex items-center justify-center bg-muted">
              <span className="text-muted-foreground">Нет постера</span>
            </Card>
          )}
        </div>

        {/* Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Title */}
          <div>
            <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
            
            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              {movie.release_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(movie.release_date)}</span>
                </div>
              )}
              
              {movie.runtime > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatRuntime(movie.runtime)}</span>
                </div>
              )}
              
              {movie.vote_average > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{movie.vote_average.toFixed(1)}/10</span>
                </div>
              )}
            </div>
          </div>

          {/* Genres */}
          {movie.genres && movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {movie.genres.map((genre) => (
                <Badge key={genre.id} variant="secondary">
                  {genre.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Overview */}
          {movie.overview && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Описание</h2>
              <p className="text-muted-foreground leading-relaxed">
                {movie.overview}
              </p>
            </div>
          )}

          {/* Cast */}
          {movie.cast && movie.cast.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3">В ролях</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {movie.cast.slice(0, 8).map((actor) => (
                  <Card key={actor.id} className="p-3">
                    <div className="flex items-start gap-3">
                      {actor.profile_path ? (
                        <Image
                          src={tmdbClient.getImageURL(actor.profile_path, 'w185') || ''}
                          alt={actor.name}
                          width={60}
                          height={90}
                          className="rounded object-cover"
                        />
                      ) : (
                        <div className="w-[60px] h-[90px] bg-muted rounded flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">Нет фото</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{actor.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {actor.character}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Crew (Directors) */}
          {movie.crew && movie.crew.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Режиссёры</h2>
              <div className="flex flex-wrap gap-2">
                {movie.crew.map((person) => (
                  <Badge key={person.id} variant="outline">
                    {person.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
