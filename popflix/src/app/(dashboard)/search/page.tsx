'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MovieGrid } from '@/components/movie/MovieGrid'
import { Movie } from '@/types'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    const initialQuery = searchParams.get('q')
    if (initialQuery) {
      setQuery(initialQuery)
      handleSearch(initialQuery)
    }
  }, [searchParams])

  const handleSearch = async (searchQuery?: string) => {
    const queryToSearch = searchQuery || query
    if (!queryToSearch.trim()) return

    try {
      setLoading(true)
      setHasSearched(true)
      
      const response = await fetch(`/api/movies/search?q=${encodeURIComponent(queryToSearch.trim())}`)
      const data = await response.json()
      
      if (response.ok) {
        setMovies(data.results || [])
      } else {
        console.error('Search error:', data.error)
        setMovies([])
      }
    } catch (error) {
      console.error('Error searching movies:', error)
      setMovies([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch()
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          Поиск фильмов 🔍
        </h1>
        <p className="text-xl text-muted-foreground">
          Найдите фильмы по названию, актёрам или режиссёрам
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="search"
              placeholder="Введите название фильма..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
          <Button type="submit" size="lg" disabled={loading || !query.trim()}>
            {loading ? 'Поиск...' : 'Найти'}
          </Button>
        </div>
      </form>

      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Ищем фильмы...</p>
        </div>
      )}

      {!loading && hasSearched && (
        <div>
          {movies.length > 0 ? (
            <div>
              <h2 className="text-2xl font-bold mb-6">
                Результаты поиска ({movies.length})
              </h2>
              <MovieGrid
                movies={movies}
                showActions={true}
                emptyMessage="По вашему запросу ничего не найдено"
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎬</div>
              <h3 className="text-lg font-semibold mb-2">Ничего не найдено</h3>
              <p className="text-muted-foreground">
                Попробуйте изменить поисковый запрос
              </p>
            </div>
          )}
        </div>
      )}

      {!hasSearched && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold mb-2">Начните поиск</h3>
          <p className="text-muted-foreground">
            Введите название фильма в поле выше
          </p>
        </div>
      )}
    </div>
  )
}