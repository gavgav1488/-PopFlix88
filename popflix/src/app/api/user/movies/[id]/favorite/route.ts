import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { is_favorite } = await request.json()
    
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

    const movieId = parseInt(id)

    // Используем upsert для создания или обновления записи
    const { data, error } = await supabase
      .from('user_movies')
      .upsert({
        user_id: user.id,
        movie_id: movieId,
        is_favorite,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,movie_id'
      })
      .select()
      .single()

    if (error) {
      console.error('Error updating favorite status:', error)
      return NextResponse.json({ error: 'Failed to update favorite status' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('Error in favorite API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}