import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
    
    // Проверяем аутентификацию
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Получаем просмотренные фильмы пользователя
    const { data: watchedMovies, error: watchedError } = await supabase
      .from('user_movies')
      .select(`
        *,
        movie_id,
        rating,
        watched_at,
        is_favorite
      `)
      .eq('user_id', user.id)
      .eq('is_watched', true)

    if (watchedError) {
      console.error('Error fetching watched movies:', watchedError)
      return NextResponse.json({ error: 'Failed to fetch watched movies' }, { status: 500 })
    }

    // Если нет просмотренных фильмов, возвращаем пустую статистику
    if (!watchedMovies || watchedMovies.length === 0) {
      return NextResponse.json({
        totalWatched: 0,
        totalWatchTime: 0,
        averageRating: 0,
        favoriteGenres: [],
        favoriteActors: [],
        favoriteDirectors: [],
        watchedByYear: [],
        monthlyActivity: []
      })
    }

    // Получаем детальную информацию о фильмах из TMDB
    const movieIds = watchedMovies.map((movie: any) => movie.movie_id)
    const movieDetails = await Promise.all(
      movieIds.map(async (movieId: number) => {
        try {
          const response = await fetch(
            `https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.TMDB_API_KEY}&language=ru-RU&append_to_response=credits`
          )
          if (response.ok) {
            return await response.json()
          }
          return null
        } catch (error) {
          console.error(`Error fetching movie ${movieId}:`, error)
          return null
        }
      })
    )

    const validMovieDetails = movieDetails.filter((movie: any) => movie !== null)

    // Вычисляем статистику
    const totalWatched = watchedMovies.length
    const totalWatchTime = validMovieDetails.reduce((sum: number, movie: any) => sum + (movie.runtime || 0), 0)
    
    const ratingsSum = watchedMovies
      .filter((movie: any) => movie.rating)
      .reduce((sum: number, movie: any) => sum + movie.rating, 0)
    const ratingsCount = watchedMovies.filter((movie: any) => movie.rating).length
    const averageRating = ratingsCount > 0 ? ratingsSum / ratingsCount : 0

    // Статистика по жанрам
    const genreCount: { [key: string]: number } = {}
    validMovieDetails.forEach((movie: any) => {
      movie.genres?.forEach((genre: any) => {
        genreCount[genre.name] = (genreCount[genre.name] || 0) + 1
      })
    })
    const favoriteGenres = Object.entries(genreCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    // Статистика по актёрам
    const actorCount: { [key: string]: number } = {}
    validMovieDetails.forEach((movie: any) => {
      movie.credits?.cast?.slice(0, 5).forEach((actor: any) => {
        actorCount[actor.name] = (actorCount[actor.name] || 0) + 1
      })
    })
    const favoriteActors = Object.entries(actorCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    // Статистика по режиссёрам
    const directorCount: { [key: string]: number } = {}
    validMovieDetails.forEach((movie: any) => {
      const directors = movie.credits?.crew?.filter((person: any) => person.job === 'Director') || []
      directors.forEach((director: any) => {
        directorCount[director.name] = (directorCount[director.name] || 0) + 1
      })
    })
    const favoriteDirectors = Object.entries(directorCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    // Статистика по годам выпуска
    const yearCount: { [key: number]: number } = {}
    validMovieDetails.forEach((movie: any) => {
      if (movie.release_date) {
        const year = new Date(movie.release_date).getFullYear()
        yearCount[year] = (yearCount[year] || 0) + 1
      }
    })
    const watchedByYear = Object.entries(yearCount)
      .map(([year, count]) => ({ year: parseInt(year), count }))
      .sort((a, b) => b.count - a.count)

    // Месячная активность (последние 12 месяцев)
    const monthlyCount: { [key: string]: number } = {}
    const now = new Date()
    
    // Инициализируем последние 12 месяцев
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = date.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' })
      monthlyCount[monthKey] = 0
    }

    // Подсчитываем фильмы по месяцам
    watchedMovies.forEach((movie: any) => {
      if (movie.watched_at) {
        const watchedDate = new Date(movie.watched_at)
        const monthKey = watchedDate.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' })
        if (monthlyCount.hasOwnProperty(monthKey)) {
          monthlyCount[monthKey]++
        }
      }
    })

    const monthlyActivity = Object.entries(monthlyCount)
      .map(([month, count]) => ({ month, count }))

    return NextResponse.json({
      totalWatched,
      totalWatchTime,
      averageRating,
      favoriteGenres,
      favoriteActors,
      favoriteDirectors,
      watchedByYear,
      monthlyActivity
    })

  } catch (error) {
    console.error('Error in stats API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}