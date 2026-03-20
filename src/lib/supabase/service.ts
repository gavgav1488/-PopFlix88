import type {
  FavoriteMovie,
  User,
  UserPreferences,
  WatchedMovie,
} from "@/types";
import { createClient } from "./client";

export class SupabaseService {
  private supabase = createClient();

  // Аутентификация
  async signUp(email: string, password: string, fullName?: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    return data.user;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data.user;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  // Профиль
  async getProfile(userId: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data;
  }

  async updateProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await this.supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Предпочтения
  async getPreferences(userId: string): Promise<UserPreferences | null> {
    const { data, error } = await this.supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data;
  }

  async updatePreferences(
    userId: string,
    preferences: Omit<UserPreferences, "id" | "user_id">,
  ) {
    const { data, error } = await this.supabase
      .from("user_preferences")
      .upsert({ user_id: userId, ...preferences })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Просмотренные фильмы (через user_movies)
  async addWatchedMovie(
    userId: string,
    movieId: string,
    rating: number | null,
  ) {
    const { data, error } = await this.supabase
      .from("user_movies")
      .upsert(
        {
          user_id: userId,
          movie_id: movieId,
          is_watched: true,
          rating,
          watched_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,movie_id" },
      )
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getWatchedMovies(userId: string): Promise<WatchedMovie[]> {
    const { data, error } = await this.supabase
      .from("user_movies")
      .select("*")
      .eq("user_id", userId)
      .eq("is_watched", true)
      .order("watched_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id,
      user_id: row.user_id,
      movie_id: row.movie_id,
      rating: row.rating,
      watched_at: row.watched_at ?? row.updated_at,
    }));
  }

  async removeWatchedMovie(userId: string, movieId: string) {
    const { error } = await this.supabase
      .from("user_movies")
      .update({
        is_watched: false,
        watched_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("movie_id", movieId);
    if (error) throw error;
  }

  // Избранное (через user_movies)
  async addToFavorites(userId: string, movieId: string) {
    const { data, error } = await this.supabase
      .from("user_movies")
      .upsert(
        {
          user_id: userId,
          movie_id: movieId,
          is_favorite: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,movie_id" },
      )
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getFavoriteMovies(userId: string): Promise<FavoriteMovie[]> {
    const { data, error } = await this.supabase
      .from("user_movies")
      .select("*")
      .eq("user_id", userId)
      .eq("is_favorite", true)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id,
      user_id: row.user_id,
      movie_id: row.movie_id,
      added_at: row.updated_at,
    }));
  }

  async removeFromFavorites(userId: string, movieId: string) {
    const { error } = await this.supabase
      .from("user_movies")
      .update({ is_favorite: false, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("movie_id", movieId);
    if (error) throw error;
  }

  async isMovieFavorite(userId: string, movieId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("user_movies")
      .select("id")
      .eq("user_id", userId)
      .eq("movie_id", movieId)
      .eq("is_favorite", true)
      .single();
    if (error && error.code !== "PGRST116") throw error;
    return !!data;
  }

  async isMovieWatched(
    userId: string,
    movieId: string,
  ): Promise<WatchedMovie | null> {
    const { data, error } = await this.supabase
      .from("user_movies")
      .select("*")
      .eq("user_id", userId)
      .eq("movie_id", movieId)
      .eq("is_watched", true)
      .single();
    if (error && error.code !== "PGRST116") throw error;
    if (!data) return null;
    return {
      id: data.id,
      user_id: data.user_id,
      movie_id: data.movie_id,
      rating: data.rating,
      watched_at: data.watched_at ?? data.updated_at,
    };
  }
}
