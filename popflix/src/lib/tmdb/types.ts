// TMDB API Response типы

export interface TMDBMovieResponse {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  runtime?: number
  genres: TMDBGenre[]
  vote_average: number
  vote_count: number
  popularity: number
  adult: boolean
  original_language: string
  original_title: string
  video: boolean
}

export interface TMDBGenre {
  id: number
  name: string
}

export interface TMDBCreditsResponse {
  id: number
  cast: TMDBCastMember[]
  crew: TMDBCrewMember[]
}

export interface TMDBCastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
  order: number
  cast_id: number
  credit_id: string
  adult: boolean
  gender: number
  known_for_department: string
  original_name: string
  popularity: number
}

export interface TMDBCrewMember {
  id: number
  name: string
  job: string
  department: string
  profile_path: string | null
  credit_id: string
  adult: boolean
  gender: number
  known_for_department: string
  original_name: string
  popularity: number
}

export interface TMDBSearchResponse<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

export interface TMDBWatchProvidersResponse {
  id: number
  results: {
    [countryCode: string]: {
      link?: string
      flatrate?: TMDBWatchProvider[]
      rent?: TMDBWatchProvider[]
      buy?: TMDBWatchProvider[]
    }
  }
}

export interface TMDBWatchProvider {
  provider_id: number
  provider_name: string
  logo_path: string
  display_priority: number
}

export interface TMDBPersonResponse {
  id: number
  name: string
  profile_path: string | null
  adult: boolean
  known_for: TMDBMovieResponse[]
  known_for_department: string
  popularity: number
}

export interface TMDBPersonCreditsResponse {
  id: number
  cast: TMDBMovieResponse[]
  crew: TMDBMovieResponse[]
}

export interface TMDBGenreListResponse {
  genres: TMDBGenre[]
}

// Константы
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p'

export const IMAGE_SIZES = {
  poster: ['w92', 'w154', 'w185', 'w342', 'w500', 'w780', 'original'] as const,
  backdrop: ['w300', 'w780', 'w1280', 'original'] as const,
  profile: ['w45', 'w185', 'h632', 'original'] as const,
  logo: ['w45', 'w92', 'w154', 'w185', 'w300', 'w500', 'original'] as const,
} as const

export type PosterSize = typeof IMAGE_SIZES.poster[number]
export type BackdropSize = typeof IMAGE_SIZES.backdrop[number]
export type ProfileSize = typeof IMAGE_SIZES.profile[number]
export type LogoSize = typeof IMAGE_SIZES.logo[number]