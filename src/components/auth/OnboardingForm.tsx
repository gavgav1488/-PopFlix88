'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { SupabaseService } from '@/lib/supabase/service'
import { Genre } from '@/types'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function OnboardingForm() {
  const [step, setStep] = useState(1)
  const [genres, setGenres] = useState<Genre[]>([])
  const [selectedGenres, setSelectedGenres] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingGenres, setIsLoadingGenres] = useState(true)
  
  const { user } = useAuth()
  const router = useRouter()
  const supabaseService = new SupabaseService()

  // Загружаем жанры при монтировании компонента
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch('/api/movies/genres')
        const data = await response.json()
        setGenres(data.genres || [])
      } catch (error) {
        console.error('Error fetching genres:', error)
      } finally {
        setIsLoadingGenres(false)
      }
    }

    fetchGenres()
  }, [])

  const handleGenreToggle = (genreId: number) => {
    setSelectedGenres(prev => 
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    )
  }

  const handleSavePreferences = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      
      await supabaseService.updatePreferences(user.id, {
        favorite_genres: selectedGenres,
        favorite_actors: [],
        favorite_directors: [],
      })

      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving preferences:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    router.push('/dashboard')
  }

  if (isLoadingGenres) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          Добро пожаловать в PopFlix! 🍿
        </CardTitle>
        <CardDescription>
          Выберите ваши любимые жанры, чтобы мы могли предложить вам лучшие фильмы
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Какие жанры вам нравятся?
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {genres.map((genre) => (
              <Badge
                key={genre.id}
                variant={selectedGenres.includes(genre.id) ? "default" : "outline"}
                className="cursor-pointer p-3 text-center justify-center hover:bg-primary/10 transition-colors"
                onClick={() => handleGenreToggle(genre.id)}
              >
                {genre.name}
              </Badge>
            ))}
          </div>
        </div>

        {selectedGenres.length > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            Выбрано жанров: {selectedGenres.length}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleSkip}
            className="flex-1"
            disabled={isLoading}
          >
            Пропустить
          </Button>
          <Button
            onClick={handleSavePreferences}
            className="flex-1"
            disabled={isLoading || selectedGenres.length === 0}
          >
            {isLoading ? 'Сохранение...' : 'Продолжить'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}