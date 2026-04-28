import { createClient } from './client'
import { User, UserPreferences, WatchedMovie, FavoriteMovie } from '@/types'

export class SupabaseService {
  private supabase = createClient()

  // Аутентификация
  async signUp(email: string, password: string, fullName?: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    
    if (error) throw error
    return data.user
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    return data.user
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut()
    if (error) throw error
  }

  async getCurrentUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser()
    if (error) throw error
    return user
  }

  // Профиль
  async getProfile(userId: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // Не найден
      throw error
    }
    
    return data
  }

  async updateProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await this.supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Предпочтения
  async getPreferences(userId: string): Promise<UserPreferences | null> {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // Не найден
      throw error
    }
    
    return data
  }

  async updatePreferences(userId: string, preferences: Omit<UserPreferences, 'id' | 'user_id'>) {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Просмотренные фильмы
  async addWatchedMovie(userId: string, movieId: number, rating: number, notes?: string) {
    const { data, error } = await this.supabase
      .from('watched_movies')
      .upsert({
        user_id: userId,
        tmdb_id: movieId,
        rating,
        notes,
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async getWatchedMovies(userId: string): Promise<WatchedMovie[]> {
    const { data, error } = await this.supabase
      .from('watched_movies')
      .select('*')
      .eq('user_id', userId)
      .order('watched_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  async removeWatchedMovie(userId: string, movieId: number) {
    const { error } = await this.supabase
      .from('watched_movies')
      .delete()
      .eq('user_id', userId)
      .eq('tmdb_id', movieId)
    
    if (error) throw error
  }

  // Избранное
  async addToFavorites(userId: string, movieId: number) {
    const { data, error } = await this.supabase
      .from('favorite_movies')
      .insert({
        user_id: userId,
        tmdb_id: movieId,
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async getFavoriteMovies(userId: string): Promise<FavoriteMovie[]> {
    const { data, error } = await this.supabase
      .from('favorite_movies')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  async removeFromFavorites(userId: string, movieId: number) {
    const { error } = await this.supabase
      .from('favorite_movies')
      .delete()
      .eq('user_id', userId)
      .eq('tmdb_id', movieId)
    
    if (error) throw error
  }

  async isMovieFavorite(userId: string, movieId: number): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('favorite_movies')
      .select('id')
      .eq('user_id', userId)
      .eq('tmdb_id', movieId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return !!data
  }

  async isMovieWatched(userId: string, movieId: number): Promise<WatchedMovie | null> {
    const { data, error } = await this.supabase
      .from('watched_movies')
      .select('*')
      .eq('user_id', userId)
      .eq('tmdb_id', movieId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data || null
  }
}