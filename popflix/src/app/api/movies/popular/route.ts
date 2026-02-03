import { NextRequest, NextResponse } from 'next/server'
import { tmdbClient } from '@/lib/tmdb/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')

    const results = await tmdbClient.getPopularMovies(page)
    
    return NextResponse.json(results)
  } catch (error) {
    console.error('Error fetching popular movies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch popular movies' },
      { status: 500 }
    )
  }
}