'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ExternalLink, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WatchProvider } from '@/types'
import { tmdbClient } from '@/lib/tmdb/client'

interface WatchProvidersProps {
  movieId: number
}

export function WatchProviders({ movieId }: WatchProvidersProps) {
  const [providers, setProviders] = useState<WatchProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/movies/providers?movieId=${movieId}`)
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch providers')
        }
        
        setProviders(data.providers || [])
      } catch (error) {
        console.error('Error fetching watch providers:', error)
        setError(error instanceof Error ? error.message : 'Ошибка загрузки')
      } finally {
        setLoading(false)
      }
    }

    fetchProviders()
  }, [movieId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Где посмотреть</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Где посмотреть</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Информация о доступности временно недоступна</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (providers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Где посмотреть</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-2">📺</div>
            <p>Фильм в данный момент недоступен для онлайн-просмотра</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Где посмотреть</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {providers.map((provider) => (
            <div
              key={provider.provider_id}
              className="flex flex-col items-center space-y-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              {provider.logo_path ? (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                  <Image
                    src={tmdbClient.getImageURL(provider.logo_path, 'w92') || ''}
                    alt={provider.provider_name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                  <ExternalLink className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              
              <div className="text-center">
                <p className="text-sm font-medium line-clamp-2">
                  {provider.provider_name}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Данные предоставлены JustWatch
          </p>
        </div>
      </CardContent>
    </Card>
  )
}