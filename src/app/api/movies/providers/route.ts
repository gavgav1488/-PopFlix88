import { NextResponse } from "next/server";

// OMDb не предоставляет данные о провайдерах просмотра
export async function GET() {
  return NextResponse.json({ providers: [] });
}
