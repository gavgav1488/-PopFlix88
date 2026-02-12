'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@/lib/supabase/client'
import { SupabaseService } from '@/lib/supabase/service'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()
  const supabaseService = new SupabaseService()

  useEffect(() => {
    // Получаем текущего пользователя
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error('Error getting user:', error)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Подписываемся на изменения аутентификации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)
      
      const user = await supabaseService.signIn(email, password)
      return user
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка входа'
      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setError(null)
      setLoading(true)
      
      const user = await supabaseService.signUp(email, password, fullName)
      return user
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка регистрации'
      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      await supabaseService.signOut()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка выхода'
      setError(errorMessage)
      throw error
    }
  }

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
  }
}