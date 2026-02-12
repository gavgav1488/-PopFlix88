import { NextRequest, NextResponse } from 'next/server'
import { tmdbClient } from '@/lib/tmdb/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const movieId = searchParams.get('movieId')
    const region = searchParams.get('region') || 'RU'

    if (!movieId) {
      return NextResponse.json(
        { error: 'Movie ID is required' },
        { status: 400 }
      )
    }

    const providers = await tmdbClient.getWatchProviders(parseInt(movieId), region)
    
    return NextResponse.json({ providers })
  } catch (error) {
    console.error('Error fetching watch providers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch watch providers' },
      { status: 500 }
    )
  }
}