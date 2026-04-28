export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          favorite_genres: number[]
          favorite_actors: string[]
          favorite_directors: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          favorite_genres?: number[]
          favorite_actors?: string[]
          favorite_directors?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          favorite_genres?: number[]
          favorite_actors?: string[]
          favorite_directors?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      watched_movies: {
        Row: {
          id: string
          user_id: string
          tmdb_id: number
          rating: number
          watched_at: string
          notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          tmdb_id: number
          rating: number
          watched_at?: string
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          tmdb_id?: number
          rating?: number
          watched_at?: string
          notes?: string | null
        }
      }
      favorite_movies: {
        Row: {
          id: string
          user_id: string
          tmdb_id: number
          added_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tmdb_id: number
          added_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tmdb_id?: number
          added_at?: string
        }
      }
      movies_cache: {
        Row: {
          tmdb_id: number
          title: string
          overview: string | null
          poster_path: string | null
          backdrop_path: string | null
          release_date: string | null
          runtime: number | null
          genres: Json | null
          cast: Json | null
          crew: Json | null
          vote_average: number | null
          cached_at: string
        }
        Insert: {
          tmdb_id: number
          title: string
          overview?: string | null
          poster_path?: string | null
          backdrop_path?: string | null
          release_date?: string | null
          runtime?: number | null
          genres?: Json | null
          cast?: Json | null
          crew?: Json | null
          vote_average?: number | null
          cached_at?: string
        }
        Update: {
          tmdb_id?: number
          title?: string
          overview?: string | null
          poster_path?: string | null
          backdrop_path?: string | null
          release_date?: string | null
          runtime?: number | null
          genres?: Json | null
          cast?: Json | null
          crew?: Json | null
          vote_average?: number | null
          cached_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}