import { NextResponse } from "next/server";

// OMDb не имеет отдельного API для жанров — возвращаем статический список
const GENRES = [
  { id: 1, name: "Action" },
  { id: 2, name: "Adventure" },
  { id: 3, name: "Animation" },
  { id: 4, name: "Biography" },
  { id: 5, name: "Comedy" },
  { id: 6, name: "Crime" },
  { id: 7, name: "Documentary" },
  { id: 8, name: "Drama" },
  { id: 9, name: "Family" },
  { id: 10, name: "Fantasy" },
  { id: 11, name: "History" },
  { id: 12, name: "Horror" },
  { id: 13, name: "Music" },
  { id: 14, name: "Mystery" },
  { id: 15, name: "Romance" },
  { id: 16, name: "Sci-Fi" },
  { id: 17, name: "Sport" },
  { id: 18, name: "Thriller" },
  { id: 19, name: "War" },
  { id: 20, name: "Western" },
];

export async function GET() {
  return NextResponse.json({ genres: GENRES });
}
