import { Movie, Genre, WatchProvider } from '@/types'

export class TMDBClient {
  private apiKey: string
  private baseURL = 'https://api.themoviedb.org/3'
  private imageBaseURL = 'https://image.tmdb.org/t/p'

  constructor() {
    this.apiKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY || ''
    if (!this.apiKey) {
      throw new Error('TMDB API key is required')
    }
  }

  private async request<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`)
    url.searchParams.append('api_key', this.apiKey)
    url.searchParams.append('language', 'ru-RU')
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })

    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 }, // Кэш на 1 час
    })

    if (!response.ok) {
      if (response.status === 429) {
        // Rate limit - ждём и повторяем
        await new Promise(resolve => setTimeout(resolve, 1000))
        return this.request<T>(endpoint, params)
      }
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Получить URL изображения
  getImageURL(path: string | null, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string | null {
    if (!path) return null
    return `${this.imageBaseURL}/${size}${path}`
  }

  // Поиск фильмов
  async searchMovies(query: string, page: number = 1): Promise<{ results: Movie[], total_pages: number, total_results: number }> {
    const response = await this.request<any>('/search/movie', {
      query: encodeURIComponent(query),
      page: page.toString(),
    })

    return {
      results: response.results.map(this.transformMovie),
      total_pages: response.total_pages,
      total_results: response.total_results,
    }
  }

  // Популярные фильмы
  async getPopularMovies(page: number = 1): Promise<{ results: Movie[], total_pages: number }> {
    const response = await this.request<any>('/movie/popular', {
      page: page.toString(),
    })

    return {
      results: response.results.map(this.transformMovie),
      total_pages: response.total_pages,
    }
  }

  // Топ рейтинговые фильмы
  async getTopRatedMovies(page: number = 1): Promise<{ results: Movie[], total_pages: number }> {
    const response = await this.request<any>('/movie/top_rated', {
      page: page.toString(),
    })

    return {
      results: response.results.map(this.transformMovie),
      total_pages: response.total_pages,
    }
  }

  // Новинки
  async getNowPlayingMovies(page: number = 1): Promise<{ results: Movie[], total_pages: number }> {
    const response = await this.request<any>('/movie/now_playing', {
      page: page.toString(),
    })

    return {
      results: response.results.map(this.transformMovie),
      total_pages: response.total_pages,
    }
  }

  // Детали фильма
  async getMovieDetails(id: number): Promise<Movie> {
    const [movieResponse, creditsResponse] = await Promise.all([
      this.request<any>(`/movie/${id}`),
      this.request<any>(`/movie/${id}/credits`),
    ])

    return {
      ...this.transformMovie(movieResponse),
      runtime: movieResponse.runtime,
      cast: creditsResponse.cast?.slice(0, 10).map((person: any) => ({
        id: person.id,
        name: person.name,
        character: person.character,
        profile_path: person.profile_path,
      })) || [],
      crew: creditsResponse.crew?.filter((person: any) => person.job === 'Director').map((person: any) => ({
        id: person.id,
        name: person.name,
        job: person.job,
        department: person.department,
        profile_path: person.profile_path,
      })) || [],
    }
  }

  // Рекомендации по фильму
  async getMovieRecommendations(id: number, page: number = 1): Promise<{ results: Movie[], total_pages: number }> {
    const response = await this.request<any>(`/movie/${id}/recommendations`, {
      page: page.toString(),
    })

    return {
      results: response.results.map(this.transformMovie),
      total_pages: response.total_pages,
    }
  }

  // Похожие фильмы
  async getSimilarMovies(id: number, page: number = 1): Promise<{ results: Movie[], total_pages: number }> {
    const response = await this.request<any>(`/movie/${id}/similar`, {
      page: page.toString(),
    })

    return {
      results: response.results.map(this.transformMovie),
      total_pages: response.total_pages,
    }
  }

  // Фильмы по жанру
  async getMoviesByGenre(genreId: number, page: number = 1): Promise<{ results: Movie[], total_pages: number }> {
    const response = await this.request<any>('/discover/movie', {
      with_genres: genreId.toString(),
      page: page.toString(),
      sort_by: 'popularity.desc',
    })

    return {
      results: response.results.map(this.transformMovie),
      total_pages: response.total_pages,
    }
  }

  // Получить все жанры
  async getGenres(): Promise<Genre[]> {
    const response = await this.request<any>('/genre/movie/list')
    return response.genres
  }

  // Провайдеры просмотра
  async getWatchProviders(movieId: number, region: string = 'RU'): Promise<WatchProvider[]> {
    try {
      const response = await this.request<any>(`/movie/${movieId}/watch/providers`)
      const providers = response.results?.[region]
      
      if (!providers) return []
      
      const allProviders = [
        ...(providers.flatrate || []),
        ...(providers.rent || []),
        ...(providers.buy || []),
      ]
      
      // Убираем дубликаты
      const uniqueProviders = allProviders.filter((provider, index, self) => 
        index === self.findIndex(p => p.provider_id === provider.provider_id)
      )
      
      return uniqueProviders.map((provider: any) => ({
        provider_id: provider.provider_id,
        provider_name: provider.provider_name,
        logo_path: provider.logo_path,
        display_priority: provider.display_priority,
      }))
    } catch (error) {
      console.error('Error fetching watch providers:', error)
      return []
    }
  }

  // Поиск персон
  async searchPerson(query: string): Promise<any[]> {
    const response = await this.request<any>('/search/person', {
      query: encodeURIComponent(query),
    })
    
    return response.results.slice(0, 10) // Ограничиваем до 10 результатов
  }

  // Фильмы с участием персоны
  async getMoviesByPerson(personId: number): Promise<Movie[]> {
    const response = await this.request<any>(`/person/${personId}/movie_credits`)
    return response.cast?.slice(0, 20).map(this.transformMovie) || []
  }

  // Трансформация данных фильма из TMDB в наш формат
  private transformMovie = (tmdbMovie: any): Movie => ({
    id: tmdbMovie.id,
    title: tmdbMovie.title,
    overview: tmdbMovie.overview || '',
    poster_path: tmdbMovie.poster_path,
    backdrop_path: tmdbMovie.backdrop_path,
    release_date: tmdbMovie.release_date || '',
    runtime: tmdbMovie.runtime || 0,
    genres: tmdbMovie.genres || [],
    vote_average: tmdbMovie.vote_average || 0,
    cast: [],
    crew: [],
  })
}

// Экспортируем синглтон
export const tmdbClient = new TMDBClient()