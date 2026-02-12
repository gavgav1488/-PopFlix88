'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Логируем критическую ошибку
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
          <div className="w-full max-w-md text-center space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Критическая ошибка</h1>
              <p className="text-muted-foreground">
                Произошла серьезная ошибка в приложении. Пожалуйста, обновите страницу.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="rounded-md bg-muted p-3 text-left">
                <p className="text-sm font-medium text-muted-foreground mb-2">Детали ошибки:</p>
                <p className="text-xs font-mono text-muted-foreground break-all">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs font-mono text-muted-foreground mt-2">
                    Digest: {error.digest}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Попробовать снова
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Перезагрузить приложение
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}