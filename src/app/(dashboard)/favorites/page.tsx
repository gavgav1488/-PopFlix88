'use client'

import { useEffect, useState } from 'react'
import { MovieCard } from '@/components/movie/MovieCard'
import { Movie, FavoriteMovie } from '@/types'
import { tmdbClient } from '@/lib/tmdb/client'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

export default function FavoritesPage() {
  const [favoriteMovies, setFavoriteMovies] = useState<(FavoriteMovie & { movie?: Movie })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFavoriteMovies()
  }, [])

  const fetchFavoriteMovies = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/favorites')
      
      if (!response.ok) {
        throw new Error('Failed to fetch favorite movies')
      }

      const data = await response.json()
      
      // Получаем детали фильмов из TMDB
      const moviesWithDetails = await Promise.all(
        data.map(async (favorite: FavoriteMovie) => {
          try {
            const movie = await tmdbClient.getMovieDetails(favorite.tmdb_id)
            return { ...favorite, movie }
          } catch (error) {
            console.error(`Error fetching movie ${favorite.tmdb_id}:`, error)
            return favorite
          }
        })
      )

      setFavoriteMovies(moviesWithDetails)
    } catch (error) {
      console.error('Error fetching favorite movies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (movieId: number) => {
    try {
      const response = await fetch(`/api/user/movies/${movieId}/favorite`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to remove movie')
      }

      setFavoriteMovies(prev => prev.filter(f => f.tmdb_id !== movieId))
    } catch (error) {
      console.error('Error removing movie:', error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Избранное</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (favoriteMovies.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Избранное</h1>
        <div className="text-center py-16">
          <div className="text-6xl mb-4">❤️</div>
          <h2 className="text-2xl font-semibold mb-2">Список пуст</h2>
          <p className="text-muted-foreground mb-6">
            Вы ещё не добавили ни одного фильма в избранное
          </p>
          <Button asChild>
            <a href="/dashboard">Найти фильмы</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Избранное</h1>
        <div className="text-muted-foreground">
          Всего: {favoriteMovies.length}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {favoriteMovies.map((favorite) => (
          favorite.movie && (
            <div key={favorite.id} className="relative group">
              <MovieCard
                movie={favorite.movie}
                showActions={false}
                isFavorite={true}
              />
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                onClick={() => handleRemove(favorite.tmdb_id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )
        ))}
      </div>
    </div>
  )
}
