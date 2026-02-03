import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="mx-auto">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Загрузка...</h2>
          <p className="text-sm text-muted-foreground">
            Подготавливаем для вас лучшие фильмы
          </p>
        </div>
      </div>
    </div>
  )
}