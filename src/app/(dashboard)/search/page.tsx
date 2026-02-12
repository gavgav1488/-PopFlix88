'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { MovieCard } from '@/components/movie/MovieCard'
import { MovieGrid } from '@/components/movie/MovieGrid'
import { Movie } from '@/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setQuery(q)
      handleSearch(q)
    }
  }, [searchParams])

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    try {
      setLoading(true)
      setSearched(true)
      
      const response = await fetch(`/api/movies/search?query=${encodeURIComponent(searchQuery)}`)
      
      if (!response.ok) {
        throw new Error('Failed to search movies')
      }

      const data = await response.json()
      setMovies(data.results || [])
    } catch (error) {
      console.error('Error searching movies:', error)
      setMovies([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      const url = new URL(window.location.href)
      url.searchParams.set('q', query)
      window.history.pushState({}, '', url)
      handleSearch(query)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Поиск фильмов</h1>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-2 max-w-2xl">
          <Input
            type="text"
            placeholder="Введите название фильма..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            <Search className="h-4 w-4 mr-2" />
            Искать
          </Button>
        </div>
      </form>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && searched && movies.length > 0 && (
        <div>
          <p className="text-muted-foreground mb-4">
            Найдено результатов: {movies.length}
          </p>
          <MovieGrid movies={movies} showActions={true} />
        </div>
      )}

      {/* No Results */}
      {!loading && searched && movies.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-semibold mb-2">Ничего не найдено</h2>
          <p className="text-muted-foreground">
            Попробуйте изменить поисковый запрос
          </p>
        </div>
      )}

      {/* Initial State */}
      {!loading && !searched && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-2xl font-semibold mb-2">Начните поиск</h2>
          <p className="text-muted-foreground">
            Введите название фильма в поле выше
          </p>
        </div>
      )}
    </div>
  )
}
