import { NextRequest, NextResponse } from 'next/server'
import { tmdbClient } from '@/lib/tmdb/client'
import { movieCache } from '@/lib/utils/cache'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const movieId = parseInt(params.id)
    
    if (isNaN(movieId)) {
      return NextResponse.json(
        { error: 'Invalid movie ID' },
        { status: 400 }
      )
    }

    // Сначала проверяем кэш
    let movie = await movieCache.getMovie(movieId)
    
    if (!movie) {
      // Если в кэше нет, получаем из TMDB
      movie = await tmdbClient.getMovieDetails(movieId)
      
      // Сохраняем в кэш
      await movieCache.setMovie(movie)
    }

    return NextResponse.json(movie)
  } catch (error) {
    console.error('Error fetching movie:', error)
    
    if (error instanceof Error && error.message.includes('404')) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch movie' },
      { status: 500 }
    )
  }
}