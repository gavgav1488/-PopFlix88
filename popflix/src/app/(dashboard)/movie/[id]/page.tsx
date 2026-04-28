import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MovieDetails } from '@/app/(dashboard)/movie/[id]/MovieDetails'

interface MoviePageProps {
  params: Promise<{ id: string }>
}

async function getMovieData(id: string) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.TMDB_API_KEY}&language=ru-RU&append_to_response=credits,videos,watch/providers`,
      { next: { revalidate: 3600 } } // Кэшируем на 1 час
    )

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching movie:', error)
    return null
  }
}

export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  const { id } = await params
  const movie = await getMovieData(id)

  if (!movie) {
    return {
      title: 'Фильм не найден | PopFlix',
      description: 'Запрашиваемый фильм не найден в нашей базе данных.',
    }
  }

  const title = `${movie.title} (${new Date(movie.release_date).getFullYear()}) | PopFlix`
  const description = movie.overview || `Смотрите ${movie.title} и получайте персональные рекомендации на PopFlix`
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'video.movie',
      images: posterUrl ? [
        {
          url: posterUrl,
          width: 500,
          height: 750,
          alt: movie.title,
        }
      ] : [],
      siteName: 'PopFlix',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: posterUrl ? [posterUrl] : [],
    },
    other: {
      'movie:release_date': movie.release_date,
      'movie:duration': movie.runtime?.toString(),
      'movie:director': movie.credits?.crew?.find((person: any) => person.job === 'Director')?.name,
    },
  }
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params
  const movie = await getMovieData(id)

  if (!movie) {
    notFound()
  }

  return <MovieDetails movie={movie} />
}