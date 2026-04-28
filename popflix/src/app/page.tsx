import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="text-center space-y-8 p-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-primary">
            🍿 PopFlix
          </h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            Персональные рекомендации фильмов на основе ваших предпочтений
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/register">
                Начать бесплатно
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">
                Войти
              </Link>
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Откройте для себя новые фильмы с помощью ИИ
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <div className="text-2xl">🎯</div>
            <h3 className="font-semibold">Персональные рекомендации</h3>
            <p className="text-sm text-muted-foreground">
              Алгоритм изучает ваши предпочтения и предлагает идеальные фильмы
            </p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="text-2xl">📊</div>
            <h3 className="font-semibold">Статистика просмотров</h3>
            <p className="text-sm text-muted-foreground">
              Отслеживайте время просмотра и любимых актёров
            </p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="text-2xl">🔍</div>
            <h3 className="font-semibold">Поиск и фильтры</h3>
            <p className="text-sm text-muted-foreground">
              Находите фильмы по жанрам, актёрам и режиссёрам
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}