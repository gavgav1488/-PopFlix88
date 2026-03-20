import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { omdbClient } from "@/lib/omdb/client";
import { MovieDetails } from "./MovieDetails";

interface MoviePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: MoviePageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const movie = await omdbClient.getMovieDetails(id);
    const title = `${movie.title} | PopFlix`;
    const description = movie.overview || `Смотрите ${movie.title} на PopFlix`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "video.movie",
        images: movie.poster_path
          ? [{ url: movie.poster_path, alt: movie.title }]
          : [],
      },
    };
  } catch {
    return {
      title: "Фильм не найден | PopFlix",
      description: "Запрашиваемый фильм не найден.",
    };
  }
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;

  try {
    const movie = await omdbClient.getMovieDetails(id);
    return <MovieDetails movie={movie} />;
  } catch {
    notFound();
  }
}
