import { createClient } from '@/lib/supabase/server'
import { Movie } from '@/types'

export class MovieCache {
  private supabase = createClient()

  // Получить фильм из кэша
  async getMovie(tmdbId: number): Promise<Movie | null> {
    try {
      const { data, error } = await this.supabase
        .from('movies_cache')
        .select('*')
        .eq('tmdb_id', tmdbId)
        .single()

      if (error || !data) return null

      // Проверяем, не устарел ли кэш (24 часа)
      const cacheAge = Date.now() - new Date(data.cached_at).getTime()
      const maxAge = 24 * 60 * 60 * 1000 // 24 часа в миллисекундах

      if (cacheAge > maxAge) {
        // Кэш устарел, удаляем запись
        await this.deleteMovie(tmdbId)
        return null
      }

      // Преобразуем данные из кэша в формат Movie
      return {
        id: data.tmdb_id,
        title: data.title,
        overview: data.overview || '',
        poster_path: data.poster_path,
        backdrop_path: data.backdrop_path,
        release_date: data.release_date || '',
        runtime: data.runtime || 0,
        genres: (data.genres as any) || [],
        vote_average: data.vote_average || 0,
        cast: (data.cast as any) || [],
        crew: (data.crew as any) || [],
      }
    } catch (error) {
      console.error('Error getting movie from cache:', error)
      return null
    }
  }

  // Сохранить фильм в кэш
  async setMovie(movie: Movie): Promise<void> {
    try {
      await this.supabase
        .from('movies_cache')
        .upsert({
          tmdb_id: movie.id,
          title: movie.title,
          overview: movie.overview,
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path,
          release_date: movie.release_date,
          runtime: movie.runtime,
          genres: movie.genres,
          cast: movie.cast,
          crew: movie.crew,
          vote_average: movie.vote_average,
          cached_at: new Date().toISOString(),
        })
    } catch (error) {
      console.error('Error caching movie:', error)
    }
  }

  // Удалить фильм из кэша
  async deleteMovie(tmdbId: number): Promise<void> {
    try {
      await this.supabase
        .from('movies_cache')
        .delete()
        .eq('tmdb_id', tmdbId)
    } catch (error) {
      console.error('Error deleting movie from cache:', error)
    }
  }

  // Очистить устаревший кэш
  async clearExpiredCache(): Promise<void> {
    try {
      const expiredDate = new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 часа назад
      
      await this.supabase
        .from('movies_cache')
        .delete()
        .lt('cached_at', expiredDate.toISOString())
    } catch (error) {
      console.error('Error clearing expired cache:', error)
    }
  }
}

export const movieCache = new MovieCache()

// Утилита для кэширования с TTL
export class MemoryCache<T> {
  private cache = new Map<string, { data: T; expires: number }>()

  set(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    const expires = Date.now() + ttlMs
    this.cache.set(key, { data, expires })
  }

  get(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) return null
    
    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Очистка устаревших записей
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key)
      }
    }
  }
}

// Глобальный кэш в памяти для быстрого доступа
export const memoryCache = new MemoryCache()

// Очистка кэша каждые 10 минут
if (typeof window === 'undefined') {
  setInterval(() => {
    memoryCache.cleanup()
  }, 10 * 60 * 1000)
}