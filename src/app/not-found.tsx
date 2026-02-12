import Link from 'next/link'
import { FileQuestion, Home, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <FileQuestion className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">404 - Страница не найдена</CardTitle>
          <CardDescription>
            К сожалению, запрашиваемая страница не существует или была перемещена.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-6xl mb-4">🎬</div>
          <p className="text-sm text-muted-foreground mb-6">
            Возможно, вы искали фильм, который еще не добавлен в нашу базу данных?
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Вернуться на главную
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/search">
                <Search className="mr-2 h-4 w-4" />
                Поиск фильмов
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}