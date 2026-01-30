import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SupabaseService } from '@/lib/supabase/service'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabaseService = new SupabaseService()
    const preferences = await supabaseService.getPreferences(user.id)

    return NextResponse.json({ preferences })
  } catch (error) {
    console.error('Error fetching preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { favorite_genres, favorite_actors, favorite_directors } = body

    const supabaseService = new SupabaseService()
    const preferences = await supabaseService.updatePreferences(user.id, {
      favorite_genres: favorite_genres || [],
      favorite_actors: favorite_actors || [],
      favorite_directors: favorite_directors || [],
    })

    return NextResponse.json({ preferences })
  } catch (error) {
    console.error('Error updating preferences:', error)
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}