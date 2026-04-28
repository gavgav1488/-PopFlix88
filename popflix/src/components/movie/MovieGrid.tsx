'use client'

import { Movie } from '@/types'
import { MovieCard } from './MovieCard'

interface MovieGridProps {
  movies: Movie[]
  title?: string
  showActions?: boolean
  emptyMessage?: string
  className?: string
  onToggleFavorite?: (movieId: number) => void
  onMarkAsWatched?: (movieId: number) => void
  getUserRating?: (movieId: number) => number | undefined
  isMovieFavorite?: (movieId: number) => boolean
  isMovieWatched?: (movieId: number) => boolean
}

export function MovieGrid({
  movies,
  title,
  showActions = true,
  emptyMessage = 'Фильмы не найдены',
  className = '',
  onToggleFavorite,
  onMarkAsWatched,
  getUserRating,
  isMovieFavorite,
  isMovieWatched,
}: MovieGridProps) {
  if (movies.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-6xl mb-4">🎬</div>
        <h3 className="text-lg font-semibold mb-2">Пусто</h3>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={className}>
      {title && (
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            showActions={showActions}
            userRating={getUserRating?.(movie.id)}
            isFavorite={isMovieFavorite?.(movie.id) || false}
            isWatched={isMovieWatched?.(movie.id) || false}
            onToggleFavorite={onToggleFavorite}
            onMarkAsWatched={onMarkAsWatched}
          />
        ))}
      </div>
    </div>
  )
}