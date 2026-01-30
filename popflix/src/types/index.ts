// Пользователь
export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
}

// Предпочтения пользователя
export interface UserPreferences {
  id: string
  user_id: string
  favorite_genres: number[]
  favorite_actors: string[]
  favorite_directors: string[]
}

// Фильм из TMDB
export interface Movie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  runtime: number
  genres: Genre[]
  vote_average: number
  cast: CastMember[]
  crew: CrewMember[]
}

// Жанр
export interface Genre {
  id: number
  name: string
}

// Актёр
export interface CastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
}

// Член съёмочной группы
export interface CrewMember {
  id: number
  name: string
  job: string
  department: string
  profile_path: string | null
}

// Просмотренный фильм
export interface WatchedMovie {
  id: string
  user_id: string
  tmdb_id: number
  rating: number
  watched_at: string
  notes?: string
  movie?: Movie
}

// Избранный фильм
export interface FavoriteMovie {
  id: string
  user_id: string
  tmdb_id: number
  added_at: string
  movie?: Movie
}

// Провайдер просмотра
export interface WatchProvider {
  provider_id: number
  provider_name: string
  logo_path: string
  display_priority: number
}