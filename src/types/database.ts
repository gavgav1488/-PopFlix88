export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          favorite_genres: string[];
          favorite_actors: string[];
          favorite_directors: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          favorite_genres?: string[];
          favorite_actors?: string[];
          favorite_directors?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          favorite_genres?: string[];
          favorite_actors?: string[];
          favorite_directors?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      user_movies: {
        Row: {
          id: string;
          user_id: string;
          movie_id: string;
          is_watched: boolean;
          is_favorite: boolean;
          rating: number | null;
          watched_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          movie_id: string;
          is_watched?: boolean;
          is_favorite?: boolean;
          rating?: number | null;
          watched_at?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          movie_id?: string;
          is_watched?: boolean;
          is_favorite?: boolean;
          rating?: number | null;
          watched_at?: string | null;
          updated_at?: string;
        };
      };
      movies_cache: {
        Row: {
          movie_id: string;
          title: string;
          overview: string | null;
          poster_path: string | null;
          release_date: string | null;
          runtime: number | null;
          genres: Json | null;
          vote_average: number | null;
          cached_at: string;
        };
        Insert: {
          movie_id: string;
          title: string;
          overview?: string | null;
          poster_path?: string | null;
          release_date?: string | null;
          runtime?: number | null;
          genres?: Json | null;
          vote_average?: number | null;
          cached_at?: string;
        };
        Update: {
          movie_id?: string;
          title?: string;
          overview?: string | null;
          poster_path?: string | null;
          release_date?: string | null;
          runtime?: number | null;
          genres?: Json | null;
          vote_average?: number | null;
          cached_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
