import type { Movie } from "@/types";

export class OMDbClient {
  private apiKey: string;
  private baseURL = "http://www.omdbapi.com";

  constructor() {
    this.apiKey =
      process.env.OMDB_API_KEY || process.env.NEXT_PUBLIC_OMDB_API_KEY || "";
    if (!this.apiKey) {
      console.warn("OMDb API key is missing");
    }
  }

  private async request(params: Record<string, string>): Promise<any> {
    const url = new URL(this.baseURL);
    url.searchParams.append("apikey", this.apiKey);

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 }, // Кэш на 1 час
    });

    if (!response.ok) {
      throw new Error(
        `OMDb API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    if (data.Response === "False") {
      throw new Error(data.Error || "OMDb API error");
    }

    return data;
  }

  // Поиск фильмов
  async searchMovies(
    query: string,
    page: number = 1,
  ): Promise<{ results: Movie[]; total_pages: number; total_results: number }> {
    const response = await this.request({
      s: query,
      type: "movie",
      page: page.toString(),
    });

    const results =
      response.Search?.map((item: any) => this.transformSearchResult(item)) ||
      [];
    const totalResults = parseInt(response.totalResults || "0", 10);
    const totalPages = Math.ceil(totalResults / 10);

    return {
      results,
      total_pages: totalPages,
      total_results: totalResults,
    };
  }

  // Детали фильма по ID (IMDb ID)
  async getMovieDetails(imdbId: string): Promise<Movie> {
    const response = await this.request({
      i: imdbId,
      plot: "full",
    });

    return this.transformMovie(response);
  }

  // Детали фильма по названию
  async getMovieByTitle(title: string, year?: string): Promise<Movie> {
    const params: Record<string, string> = {
      t: title,
      plot: "full",
    };

    if (year) {
      params.y = year;
    }

    const response = await this.request(params);
    return this.transformMovie(response);
  }

  // Популярные фильмы (эмуляция через поиск популярных названий)
  async getPopularMovies(
    page: number = 1,
  ): Promise<{ results: Movie[]; total_pages: number }> {
    const popularSearches = [
      "Avengers",
      "Star Wars",
      "Harry Potter",
      "Lord of the Rings",
      "Batman",
      "Spider-Man",
      "Inception",
      "Interstellar",
    ];

    const searchTerm =
      popularSearches[Math.floor(Math.random() * popularSearches.length)];
    const response = await this.searchMovies(searchTerm, page);

    return {
      results: response.results,
      total_pages: response.total_pages,
    };
  }

  // Трансформация результата поиска
  private transformSearchResult(omdbMovie: any): Movie {
    return {
      id: omdbMovie.imdbID,
      title: omdbMovie.Title,
      overview: "",
      poster_path: omdbMovie.Poster !== "N/A" ? omdbMovie.Poster : null,
      backdrop_path: null,
      release_date: omdbMovie.Year,
      runtime: 0,
      genres: [],
      vote_average: 0,
      cast: [],
      crew: [],
    };
  }

  // Трансформация полных данных фильма
  private transformMovie(omdbMovie: any): Movie {
    const genres =
      omdbMovie.Genre?.split(", ").map((name: string, index: number) => ({
        id: index,
        name,
      })) || [];

    const cast =
      omdbMovie.Actors?.split(", ").map((name: string, index: number) => ({
        id: index,
        name,
        character: "",
        profile_path: null,
      })) || [];

    const crew =
      omdbMovie.Director?.split(", ").map((name: string, index: number) => ({
        id: index,
        name,
        job: "Director",
        department: "Directing",
        profile_path: null,
      })) || [];

    return {
      id: omdbMovie.imdbID,
      title: omdbMovie.Title,
      overview: omdbMovie.Plot !== "N/A" ? omdbMovie.Plot : "",
      poster_path: omdbMovie.Poster !== "N/A" ? omdbMovie.Poster : null,
      backdrop_path: null,
      release_date:
        omdbMovie.Released !== "N/A" ? omdbMovie.Released : omdbMovie.Year,
      runtime:
        omdbMovie.Runtime !== "N/A" ? parseInt(omdbMovie.Runtime, 10) : 0,
      genres,
      vote_average:
        omdbMovie.imdbRating !== "N/A" ? parseFloat(omdbMovie.imdbRating) : 0,
      cast,
      crew,
    };
  }

  // Получить URL изображения (OMDb возвращает полные URL)
  getImageURL(path: string | null): string | null {
    return path;
  }
}

// Экспортируем синглтон
export const omdbClient = new OMDbClient();
