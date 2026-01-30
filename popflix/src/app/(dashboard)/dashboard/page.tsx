import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Главная | PopFlix',
  description: 'Персональные рекомендации фильмов',
}

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">
          Добро пожаловать в PopFlix! 🍿
        </h1>
        <p className="text-xl text-muted-foreground">
          Ваши персональные рекомендации фильмов
        </p>
        <div className="mt-8 p-8 border rounded-lg">
          <p className="text-muted-foreground">
            Рекомендации будут добавлены в следующих этапах разработки
          </p>
        </div>
      </div>
    </div>
  )
}