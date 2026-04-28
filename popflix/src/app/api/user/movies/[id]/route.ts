import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )

    // Проверяем аутентификацию
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Получаем данные пользователя о фильме
    const { data: userMovie, error } = await supabase
      .from('user_movies')
      .select('*')
      .eq('user_id', user.id)
      .eq('movie_id', parseInt(id))
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching user movie:', error)
      return NextResponse.json({ error: 'Failed to fetch user movie data' }, { status: 500 })
    }

    // Если записи нет, возвращаем значения по умолчанию
    if (!userMovie) {
      return NextResponse.json({
        rating: null,
        is_favorite: false,
        is_watched: false
      })
    }

    return NextResponse.json({
      rating: userMovie.rating,
      is_favorite: userMovie.is_favorite,
      is_watched: userMovie.is_watched
    })

  } catch (error) {
    console.error('Error in user movie API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}