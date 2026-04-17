import type { AuthResponse } from "@supabase/supabase-js";
import type {
  FavoriteMovie,
  User,
  UserPreferences,
  WatchedMovie,
} from "@/types";
import type { Database } from "@/types/database";
import { createClient } from "./client";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type UserPreferencesRow =
  Database["public"]["Tables"]["user_preferences"]["Row"];
type UserMovieRow = Database["public"]["Tables"]["user_movies"]["Row"];

export class SupabaseService {
  private supabase = createClient();

  // Аутентификация
  async signUp(
    email: string,
    password: string,
    fullName?: string,
  ): Promise<AuthResponse["data"]> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    return data;
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

    const profile = data as ProfileRow | null;

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    if (!profile) {
      return null;
    }

    return {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name ?? undefined,
      avatar_url: profile.avatar_url ?? undefined,
    };
  }

  async updateProfile(userId: string, updates: Partial<User>) {
    const payload: Database["public"]["Tables"]["profiles"]["Update"] = updates;

    const { data, error } = await this.supabase
      .from("profiles")
      .update(payload as never)
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

    const preferences = data as UserPreferencesRow | null;

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return preferences;
  }

  async updatePreferences(
    userId: string,
    preferences: Omit<UserPreferences, "id" | "user_id">,
  ) {
    const payload: Database["public"]["Tables"]["user_preferences"]["Insert"] =
      {
        user_id: userId,
        ...preferences,
      };

    const { data, error } = await this.supabase
      .from("user_preferences")
      .upsert(payload as never, { onConflict: "user_id" })
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
    const payload: Database["public"]["Tables"]["user_movies"]["Insert"] = {
      user_id: userId,
      movie_id: movieId,
      is_watched: true,
      rating,
      watched_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from("user_movies")
      .upsert(payload as never, { onConflict: "user_id,movie_id" })
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

    const rows = (data ?? []) as UserMovieRow[];

    return rows.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      movie_id: row.movie_id,
      rating: row.rating,
      watched_at: row.watched_at ?? row.updated_at,
    }));
  }

  async removeWatchedMovie(userId: string, movieId: string) {
    const payload: Database["public"]["Tables"]["user_movies"]["Update"] = {
      is_watched: false,
      watched_at: null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await this.supabase
      .from("user_movies")
      .update(payload as never)
      .eq("user_id", userId)
      .eq("movie_id", movieId);
    if (error) throw error;
  }

  // Избранное (через user_movies)
  async addToFavorites(userId: string, movieId: string) {
    const payload: Database["public"]["Tables"]["user_movies"]["Insert"] = {
      user_id: userId,
      movie_id: movieId,
      is_favorite: true,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from("user_movies")
      .upsert(payload as never, { onConflict: "user_id,movie_id" })
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

    const rows = (data ?? []) as UserMovieRow[];

    return rows.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      movie_id: row.movie_id,
      added_at: row.updated_at,
    }));
  }

  async removeFromFavorites(userId: string, movieId: string) {
    const payload: Database["public"]["Tables"]["user_movies"]["Update"] = {
      is_favorite: false,
      updated_at: new Date().toISOString(),
    };

    const { error } = await this.supabase
      .from("user_movies")
      .update(payload as never)
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

    const watchedMovie = data as UserMovieRow | null;

    if (error && error.code !== "PGRST116") throw error;
    if (!watchedMovie) return null;
    return {
      id: watchedMovie.id,
      user_id: watchedMovie.user_id,
      movie_id: watchedMovie.movie_id,
      rating: watchedMovie.rating,
      watched_at: watchedMovie.watched_at ?? watchedMovie.updated_at,
    };
  }
}
