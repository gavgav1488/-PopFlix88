import { WatchedMovie, Movie } from '@/types'

export interface MovieStats {
  totalMovies: number
  totalMinutes: number
  averageRating: number
  topGenres: { name: string; count: number }[]
  topActors: { name: string; count: number }[]
  topDirectors: { name: string; count: number }[]
  ratingDistribution: { rating: number; count: number }[]
}

export class StatsService {
  calculateStats(watchedMovies: (WatchedMovie & { movie?: Movie })[]): MovieStats {
    const moviesWithDetails = watchedMovies.filter(w => w.movie)

    // Общее количество
    const totalMovies = moviesWithDetails.length

    // Общее время
    const totalMinutes = moviesWithDetails.reduce((sum, w) => {
      return sum + (w.movie?.runtime || 0)
    }, 0)

    // Средняя оценка
    const ratingsSum = watchedMovies
      .filter(w => w.rating)
      .reduce((sum, w) => sum + (w.rating || 0), 0)
    const ratingsCount = watchedMovies.filter(w => w.rating).length
    const averageRating = ratingsCount > 0 ? ratingsSum / ratingsCount : 0

    // Топ жанров
    const genresMap = new Map<string, number>()
    moviesWithDetails.forEach(w => {
      w.movie?.genres?.forEach(genre => {
        genresMap.set(genre.name, (genresMap.get(genre.name) || 0) + 1)
      })
    })
    const topGenres = Array.from(genresMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Топ актёров
    const actorsMap = new Map<string, number>()
    moviesWithDetails.forEach(w => {
      w.movie?.cast?.slice(0, 5).forEach(actor => {
        actorsMap.set(actor.name, (actorsMap.get(actor.name) || 0) + 1)
      })
    })
    const topActors = Array.from(actorsMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Топ режиссёров
    const directorsMap = new Map<string, number>()
    moviesWithDetails.forEach(w => {
      w.movie?.crew?.forEach(person => {
        directorsMap.set(person.name, (directorsMap.get(person.name) || 0) + 1)
      })
    })
    const topDirectors = Array.from(directorsMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Распределение оценок
    const ratingDistMap = new Map<number, number>()
    watchedMovies
      .filter(w => w.rating)
      .forEach(w => {
        const rating = w.rating!
        ratingDistMap.set(rating, (ratingDistMap.get(rating) || 0) + 1)
      })
    const ratingDistribution = Array.from(ratingDistMap.entries())
      .map(([rating, count]) => ({ rating, count }))
      .sort((a, b) => a.rating - b.rating)

    return {
      totalMovies,
      totalMinutes,
      averageRating,
      topGenres,
      topActors,
      topDirectors,
      ratingDistribution,
    }
  }

  formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    
    if (hours === 0) {
      return `${mins} мин`
    }
    
    return `${hours} ч ${mins} мин`
  }

  formatTimeDetailed(minutes: number): { days: number; hours: number; minutes: number } {
    const days = Math.floor(minutes / (60 * 24))
    const hours = Math.floor((minutes % (60 * 24)) / 60)
    const mins = minutes % 60
    
    return { days, hours, minutes: mins }
  }
}

export const statsService = new StatsService()
