'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Star, Heart, Eye, Calendar } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Movie } from '@/types'
import { tmdbClient } from '@/lib/tmdb/client'

interface MovieCardProps {
  movie: Movie
  showActions?: boolean
  userRating?: number
  isFavorite?: boolean
  isWatched?: boolean
  onToggleFavorite?: (movieId: number) => void
  onMarkAsWatched?: (movieId: number) => void
}

export function MovieCard({
  movie,
  showActions = true,
  userRating,
  isFavorite = false,
  isWatched = false,
  onToggleFavorite,
  onMarkAsWatched,
}: MovieCardProps) {
  const [imageError, setImageError] = useState(false)
  
  const posterUrl = movie.poster_path 
    ? tmdbClient.getImageURL(movie.poster_path, 'w342')
    : null

  const releaseYear = movie.release_date 
    ? new Date(movie.release_date).getFullYear()
    : null

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onToggleFavorite?.(movie.id)
  }

  const handleMarkAsWatched = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onMarkAsWatched?.(movie.id)
  }

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105">
      <Link href={`/movie/${movie.id}`}>
        <div className="relative aspect-[2/3] overflow-hidden">
          {posterUrl && !imageError ? (
            <Image
              src={posterUrl}
              alt={movie.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="text-4xl mb-2">🎬</div>
                <div className="text-sm">Нет постера</div>
              </div>
            </div>
          )}
          
          {/* Overlay with actions */}
          {showActions && (
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant={isFavorite ? "default" : "secondary"}
                  onClick={handleToggleFavorite}
                  className="h-8 w-8 p-0"
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  size="sm"
                  variant={isWatched ? "default" : "secondary"}
                  onClick={handleMarkAsWatched}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Rating badge */}
          {movie.vote_average > 0 && (
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="bg-black/70 text-white">
                <Star className="h-3 w-3 mr-1 fill-current text-yellow-400" />
                {movie.vote_average.toFixed(1)}
              </Badge>
            </div>
          )}

          {/* User rating */}
          {userRating && (
            <div className="absolute top-2 left-2">
              <Badge variant="default">
                {userRating}/10
              </Badge>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/movie/${movie.id}`}>
          <h3 className="font-semibold text-sm mb-2 line-clamp-2 hover:text-primary transition-colors">
            {movie.title}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          {releaseYear && (
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {releaseYear}
            </div>
          )}
          {movie.runtime > 0 && (
            <div>{movie.runtime} мин</div>
          )}
        </div>

        {movie.genres && movie.genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {movie.genres.slice(0, 2).map((genre) => (
              <Badge key={genre.id} variant="outline" className="text-xs">
                {genre.name}
              </Badge>
            ))}
            {movie.genres.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{movie.genres.length - 2}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}