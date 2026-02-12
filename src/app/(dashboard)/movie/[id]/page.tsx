import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { tmdbClient } from '@/lib/tmdb/client'
import { MovieDetails } from '@/components/movie/MovieDetails'
import { WatchProviders } from '@/components/movie/WatchProviders'
import { MovieRating } from '@/components/movie/MovieRating'
import { Separator } from '@/components/ui/separator'

interface MoviePageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  try {
    const movie = await tmdbClient.getMovieDetails(Number(params.id))
    
    return {
      title: `${movie.title} | PopFlix`,
      description: movie.overview || `Смотрите ${movie.title} на PopFlix`,
    }
  } catch {
    return {
      title: 'Фильм не найден | PopFlix',
    }
  }
}

export default async function MoviePage({ params }: MoviePageProps) {
  try {
    const movieId = Number(params.id)
    
    if (isNaN(movieId)) {
      notFound()
    }

    const movie = await tmdbClient.getMovieDetails(movieId)
    
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <MovieDetails movie={movie} />
        
        <Separator />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Watch Providers */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Где посмотреть</h2>
            <WatchProviders movieId={movieId} />
          </div>
          
          {/* Rating */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Ваша оценка</h2>
            <MovieRating movieId={movieId} />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading movie:', error)
    notFound()
  }
}
